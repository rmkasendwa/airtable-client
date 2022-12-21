import '@infinite-debugger/rmk-js-extensions/RegExp';
import '@infinite-debugger/rmk-js-extensions/String';

import { dirname, normalize } from 'path';

import {
  ensureDirSync,
  existsSync,
  readFileSync,
  readdirSync,
  removeSync,
  writeFileSync,
} from 'fs-extra';
import globby from 'globby';
import prettier from 'prettier';

import {
  findAllTablesByBaseId,
  getAirtableResponseTypeValidationString,
  getCamelCaseFieldPropertyName,
  getRootAirtableColumn,
} from './api';
import { findAllAirtableBases } from './api/Metadata/Bases';
import { Config } from './models';

const config: Config = (() => {
  const config = require('./api.config');
  if (config.default) {
    return config.default;
  }
  return config;
})();

const prettierConfig = require('../.prettierrc.js');

const configBases = [
  config.defaultBase,
  ...config.tables
    .filter(({ base }) => {
      return base;
    })
    .map(({ base }) => {
      return base!;
    }),
];

const outputFolderPath = normalize(`${__dirname}/__sandbox`);
const templatesFolderPath = normalize(`${__dirname}/template-files`);
const templateFilePaths = globby
  .sync(`src/template-files`, {
    absolute: true,
  })
  .map((filePath) => normalize(filePath));

(async () => {
  const { bases } = await findAllAirtableBases();
  const workingBases = bases.filter(({ name, id }) => {
    return configBases.some(({ id: configBaseId, name: configBaseName }) => {
      return (
        (configBaseId && configBaseId === id) ||
        (configBaseName && configBaseName.trim() === name.trim())
      );
    });
  });
  if (workingBases.length > 0) {
    if (existsSync(outputFolderPath)) {
      readdirSync(outputFolderPath).forEach((path) => {
        if (!path.match(/test/gi)) {
          removeSync(`${outputFolderPath}/${path}`);
        }
      });
    }
    ensureDirSync(outputFolderPath);

    workingBases.forEach(async ({ id: baseId, name: baseName }) => {
      const { tables } = await findAllTablesByBaseId(baseId);
      if (tables.length > 0) {
        console.log(`\nProcessing \x1b[34m${baseName.trim()}\x1b[0m base...`);

        const pascalCaseBaseName = baseName.toPascalCase();
        const baseAPIOutputFolderPath = normalize(
          `${outputFolderPath}/bases/${pascalCaseBaseName}`
        );

        const moduleFiles: string[] = [];

        tables.forEach((table) => {
          const { name: tableName, fields: columns, views } = table;

          // Filter id, emoji, any field we don't understand
          const filteredColumns = columns
            .filter(({ name }) => {
              return (
                !name.match(/^id$/gi) && name.replace(/[^\w\s]/g, '').length > 0
              );
            })
            .reduce((accumulator, field) => {
              // Filtering columns with similar names.
              if (!accumulator.find(({ name }) => name === field.name)) {
                accumulator.push(field);
              }
              return accumulator;
            }, [] as typeof columns);

          const editableColumns = filteredColumns.filter(({ type }) => {
            switch (type) {
              case 'singleLineText':
              case 'multilineText':
              case 'richText':
              case 'phoneNumber':
              case 'singleSelect':
              case 'url':
              case 'email':
              case 'number':
              case 'percent':
              case 'currency':
              case 'count':
              case 'autoNumber':
              case 'rating':
              case 'checkbox':
              case 'multipleRecordLinks':
              case 'date':
              case 'dateTime':
              case 'lastModifiedTime':
              case 'createdTime':
              case 'multipleSelects':
                return true;
            }
            return false;
          });

          const moduleImports: string[] = [];

          console.log(
            ` -> Processing \x1b[34m${baseName.trim()}/${tableName.trim()}\x1b[0m table...`
          );

          const sanitisedTableName = tableName.trim().replace(/[^\w\s]/g, '');
          const labelPlural = (() => {
            if (!sanitisedTableName.match(/s$/g)) {
              return sanitisedTableName + 's';
            }
            return sanitisedTableName;
          })();
          const labelSingular = (() => {
            if (labelPlural.match(/ies$/)) {
              return labelPlural.replace(/ies$/, 'y');
            }
            return labelPlural.replace(/s$/g, '');
          })();

          const TITLE_CASE_ENTITIES_LABEL_WITH_SPACES = labelPlural;
          const TITLE_CASE_ENTITY_LABEL_WITH_SPACES = labelSingular;

          const LOWER_CASE_ENTITIES_LABEL_WITH_SPACES =
            labelPlural.toLowerCase();
          const LOWER_CASE_ENTITY_LABEL_WITH_SPACES =
            labelSingular.toLowerCase();

          const UPPER_CASE_ENTITIES_LABEL = labelPlural
            .replace(/\s/g, '_')
            .toUpperCase();
          const UPPER_CASE_ENTITY_LABEL = labelSingular
            .replace(/\s/g, '_')
            .toUpperCase();

          const CAMEL_CASE_ENTITIES_LABEL = labelPlural.toCamelCase();
          const CAMEL_CASE_ENTITY_LABEL = labelSingular.toCamelCase();

          const PASCAL_CASE_ENTITIES_LABEL = labelPlural.toPascalCase();
          const PASCAL_CASE_ENTITY_LABEL = labelSingular.toPascalCase();

          const KEBAB_CASE_ENTITIES_LABEL =
            LOWER_CASE_ENTITIES_LABEL_WITH_SPACES.replace(/\s/g, '-');
          const KEBAB_CASE_ENTITY_LABEL =
            LOWER_CASE_ENTITY_LABEL_WITH_SPACES.replace(/\s/g, '-');

          const columnToPropertyMapper = filteredColumns.reduce(
            (accumulator, field) => {
              accumulator[field.name] = getCamelCaseFieldPropertyName(field);
              return accumulator;
            },
            {} as Record<string, string>
          );

          const interpolationBlocks: Record<string, string> = {
            ['/* AIRTABLE_ENTITY_COLUMNS */']: filteredColumns
              .map(({ name }) => `"${name}"`)
              .join(', '),

            ['/* AIRTABLE_ENTITY_FIELD_TO_PROPERTY_MAPPINGS */']:
              filteredColumns
                .map((field) => {
                  const { name } = field;
                  const rootColumn = getRootAirtableColumn(
                    field,
                    tables,
                    table
                  );
                  const camelCasePropertyName = columnToPropertyMapper[name];
                  return `["${name}"]: ${(() => {
                    const obj = {
                      propertyName: camelCasePropertyName,
                      ...(() => {
                        if (
                          rootColumn &&
                          rootColumn.options?.prefersSingleRecordLink
                        ) {
                          return {
                            prefersSingleRecordLink: true,
                          };
                        }
                      })(),
                    };

                    if (Object.keys(obj).length > 1) {
                      return JSON.stringify(obj);
                    }

                    return `"${obj.propertyName}"`;
                  })()}`;
                })
                .join(',\n'),
            ['/* AIRTABLE_ENTITY_FIELDS */']: filteredColumns
              .map((field) => {
                const { name } = field;
                const rootColumn = getRootAirtableColumn(field, tables, table);
                switch (rootColumn.type) {
                  case 'multipleAttachments':
                    moduleImports.push(
                      `import {AirtableAttachmentValidationSchema} from './__Utils';`
                    );
                    break;
                  case 'button':
                    moduleImports.push(
                      `import {AirtableButtonValidationSchema} from './__Utils';`
                    );
                    break;
                  case 'formula':
                    moduleImports.push(
                      `import {AirtableFormulaColumnErrorValidationSchema} from './__Utils';`
                    );
                }
                return `["${name}"]: ${getAirtableResponseTypeValidationString(
                  field,
                  { currentTable: table, tables }
                )}.nullish()`;
              })
              .join(',\n'),

            ['/* AIRTABLE_ENTITY_EDITABLE_FIELD_TYPE */']: editableColumns
              .map(({ name }) => `'${columnToPropertyMapper[name]}'`)
              .join(' | '),

            ['/* REQUEST_ENTITY_PROPERTIES */']: editableColumns
              .map(
                ({ name }) =>
                  `"${columnToPropertyMapper[name]}": z.any().nullish()`
              )
              .join(',\n'),
          };

          const interpolationLabels: Record<string, string> = {
            ['/* AIRTABLE_VIEWS */']: views
              .map(({ name }) => {
                return `"${RegExp.escape(name)}"`;
              })
              .join(', '),

            ['/* ENTITY_INTERFACE_FIELDS */']: filteredColumns
              .map(({ name, type, options }) => {
                const camelCasePropertyName = (() => {
                  const propertyName = columnToPropertyMapper[name];
                  if (propertyName.match(/^\d/)) {
                    return `_${propertyName}`;
                  }
                  return propertyName;
                })();

                if (camelCasePropertyName.length > 0) {
                  const propertyType = (() => {
                    switch (type) {
                      case 'multipleSelects':
                      case 'singleCollaborator':
                      case 'multipleCollaborators':
                      case 'multipleAttachments':
                      case 'formula':
                      case 'rollup':
                      case 'barcode':
                      case 'duration':
                      case 'button':
                      case 'createdBy':
                      case 'lastModifiedBy':
                      case 'externalSyncSource':
                        break;

                      // Lists
                      case 'multipleRecordLinks':
                        if (options?.prefersSingleRecordLink) {
                          return `string`;
                        }
                        return `string[]`;
                      case 'lookup':
                      case 'multipleLookupValues':
                        return `string[]`;

                      // Numbers
                      case 'number':
                      case 'percent':
                      case 'currency':
                      case 'count':
                      case 'autoNumber':
                      case 'rating':
                        return `number`;

                      // Booleans
                      case 'checkbox':
                        return `boolean`;

                      // Strings
                      case 'date':
                      case 'dateTime':
                      case 'lastModifiedTime':
                      case 'createdTime':
                      case 'email':
                      case 'url':
                      case 'singleLineText':
                      case 'multilineText':
                      case 'richText':
                      case 'phoneNumber':
                      case 'singleSelect':
                      default:
                        return `string`;
                    }
                    return 'any';
                  })();

                  return [`${camelCasePropertyName}?: ${propertyType}`];
                }
                return [];
              })
              .flat()
              .join(';\n'),

            ['/* MODEL_IMPORTS */']: [...new Set(moduleImports)].join('\n'),

            ['Entities Table']: tableName,
            ['Entities Label']: TITLE_CASE_ENTITIES_LABEL_WITH_SPACES,
            ['Entity Label']: TITLE_CASE_ENTITY_LABEL_WITH_SPACES,

            ['entities label']: LOWER_CASE_ENTITIES_LABEL_WITH_SPACES,
            ['entity label']: LOWER_CASE_ENTITY_LABEL_WITH_SPACES,

            ['ENTITIES']: UPPER_CASE_ENTITIES_LABEL,
            ['ENTITY']: UPPER_CASE_ENTITY_LABEL,

            ['camelCaseEntities']: CAMEL_CASE_ENTITIES_LABEL,
            ['camelCaseEntity']: CAMEL_CASE_ENTITY_LABEL,

            ['PascalCaseEntities']: PASCAL_CASE_ENTITIES_LABEL,
            ['PascalCaseEntity']: PASCAL_CASE_ENTITY_LABEL,

            ['kebab-case-entities']: KEBAB_CASE_ENTITIES_LABEL,
            ['kebab-case-entity']: KEBAB_CASE_ENTITY_LABEL,
          };

          const getInterpolatedString = (templateFileContents: string) => {
            return Object.keys(interpolationLabels).reduce(
              (fileContents, key) => {
                return fileContents.replaceAll(
                  key,
                  (interpolationLabels as any)[key]
                );
              },
              Object.keys(interpolationBlocks).reduce((fileContents, key) => {
                const escapedKey = RegExp.escape(key);
                return fileContents.replace(
                  new RegExp(`${escapedKey}[\\s\\S]*${escapedKey}`, 'g'),
                  (interpolationBlocks as any)[key]
                );
              }, templateFileContents)
            );
          };

          moduleFiles.push(`./api/${PASCAL_CASE_ENTITIES_LABEL}`);

          templateFilePaths.forEach((templateFilePath) => {
            const templateFileContents = readFileSync(
              templateFilePath,
              'utf-8'
            );
            const filePath = getInterpolatedString(
              `${baseAPIOutputFolderPath}${templateFilePath.replace(
                templatesFolderPath,
                ''
              )}`
            );

            ensureDirSync(dirname(filePath));
            writeFileSync(
              filePath,
              prettier.format(getInterpolatedString(templateFileContents), {
                filepath: filePath,
                ...prettierConfig,
              })
            );
          });
        });

        writeFileSync(
          `${baseAPIOutputFolderPath}/index.ts`,
          moduleFiles
            .map((filePath) => {
              return `export * from '${filePath}'`;
            })
            .join('\n')
        );

        console.log(
          `\n\x1b[32mAirtable [${baseName.trim()}] base API generated here: ${baseAPIOutputFolderPath}\x1b[0m`
        );
      }
    });
  }
})();
