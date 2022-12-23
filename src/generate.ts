import '@infinite-debugger/rmk-js-extensions/RegExp';
import '@infinite-debugger/rmk-js-extensions/String';

import { dirname, normalize } from 'path';

import {
  ensureDirSync,
  existsSync,
  readFileSync,
  removeSync,
  writeFileSync,
} from 'fs-extra';
import globby from 'globby';
import prettier from 'prettier';

import {
  findAllTablesByBaseId,
  getAirtableAPIGeneratorTemplateFileInterpolationBlocks,
  getAirtableAPIGeneratorTemplateFileInterpolationLabels,
  getCamelCaseFieldPropertyName,
} from './api';
import { findAllAirtableBases } from './api/Metadata/Bases';
import {
  AirtableFieldType,
  Config,
  ConfigColumnNameToObjectPropertyMapper,
} from './models';

const args = process.argv;

const generateAllTables = args.includes('--all');

const config: Config<string> = (() => {
  const config = require('./airtable-api.config');
  if (config.default) {
    return config.default;
  }
  return config;
})();

const configBases = [
  config.defaultBase,
  ...(config.tables || [])
    .filter(({ base }) => {
      return base;
    })
    .map(({ base }) => {
      return base!;
    }),
  ...(config.bases || []).map(({ id, name }) => {
    return { id, name };
  }),
];

const configTables = [
  ...(config.tables || []).map((table) => {
    return {
      ...table,
      base: table.base || config.defaultBase,
    };
  }),
  ...(config.bases || [])
    .map((base) => {
      return (base.tables || []).map((table) => {
        return {
          ...table,
          base,
        };
      });
    })
    .flat(),
];

/****************** PATHS *********************/
const airtableAPIFolderName = 'airtable';
const outputRootPath = `${__dirname}/__sandbox`; // TODO: Get this from command otherwise fallback to process.cwd()
const outputFolderPath = normalize(
  `${outputRootPath}/${airtableAPIFolderName}`
);
const templatesFolderPath = normalize(`${__dirname}/template-files`);
const templateFilePaths = globby
  .sync(`src/template-files`, {
    absolute: true,
  })
  .map((filePath) => normalize(filePath));

// Constants
const LOOKUP_TABLE_COLUMN_TYPES: AirtableFieldType[] = [
  'lookup',
  'multipleLookupValues',
];

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
      removeSync(outputFolderPath);
    }
    ensureDirSync(outputFolderPath);

    workingBases.forEach(async (workingBase) => {
      const { id: workingBaseId, name: workingBaseName } = workingBase;
      const { tables } = await findAllTablesByBaseId(workingBaseId);
      const filteredTables = tables.filter(({ name }) => {
        return (
          generateAllTables ||
          configTables.length <= 0 ||
          configTables.some(({ name: configTableName, base }) => {
            return (
              configTableName &&
              configTableName.trim() === name.trim() &&
              ((base.id && base.id === workingBaseId) ||
                (base.name && base.name.trim() === workingBaseName.trim()))
            );
          })
        );
      });

      if (filteredTables.length > 0) {
        console.log(
          `\nProcessing \x1b[34m${workingBaseName.trim()}\x1b[0m base...`
        );

        const pascalCaseBaseName = workingBaseName.toPascalCase();
        const baseAPIOutputFolderPath = normalize(
          `${outputFolderPath}/${pascalCaseBaseName}`
        );

        const moduleFiles: string[] = [];

        filteredTables.forEach((table) => {
          const { name: tableName, fields: columns, views } = table;

          // Table Configuration.
          const {
            labelPlural,
            labelSingular,
            focusColumns: focusColumnNames,
            configColumnNameToObjectPropertyMapper,
          } = (() => {
            const outputConfig: {
              labelPlural: string;
              labelSingular: string;
              focusColumns?: string[];
              configColumnNameToObjectPropertyMapper?: ConfigColumnNameToObjectPropertyMapper<string>;
            } = { labelPlural: '', labelSingular: '' };

            const configTable = configTables.find(({ name, base }) => {
              return (
                name.trim() === tableName.trim() &&
                ((base.id && base.id === workingBaseId) ||
                  (base.name && base.name.trim() === workingBaseName.trim()))
              );
            });

            if (configTable) {
              const {
                alias: configTableAlias,
                name: configTableName,
                focusColumns,
                columnNameToObjectPropertyMapper:
                  configColumnNameToObjectPropertyMapper,
              } = configTable;
              if (configTable.labelPlural) {
                outputConfig.labelPlural = configTable.labelPlural;
              } else {
                const sanitisedTableName = (configTableAlias || configTableName)
                  .trim()
                  .replace(/[^\w\s]/g, '');
                outputConfig.labelPlural = (() => {
                  if (!sanitisedTableName.match(/s$/g)) {
                    return sanitisedTableName + 's';
                  }
                  return sanitisedTableName;
                })();
              }
              if (configTable.labelSingular) {
                outputConfig.labelSingular = configTable.labelSingular;
              } else {
                const labelPlural = outputConfig.labelPlural!;
                outputConfig.labelSingular = (() => {
                  if (labelPlural.match(/ies$/)) {
                    return labelPlural.replace(/ies$/, 'y');
                  }
                  return labelPlural.replace(/s$/g, '');
                })();
              }
              focusColumns && (outputConfig.focusColumns = focusColumns);
              configColumnNameToObjectPropertyMapper &&
                (outputConfig.configColumnNameToObjectPropertyMapper =
                  configColumnNameToObjectPropertyMapper);
            } else {
              const sanitisedTableName = tableName
                .trim()
                .replace(/[^\w\s]/g, '');
              outputConfig.labelPlural = (() => {
                if (!sanitisedTableName.match(/s$/g)) {
                  return sanitisedTableName + 's';
                }
                return sanitisedTableName;
              })();
              outputConfig.labelSingular = (() => {
                if (outputConfig.labelPlural.match(/ies$/)) {
                  return outputConfig.labelPlural.replace(/ies$/, 'y');
                }
                return outputConfig.labelPlural.replace(/s$/g, '');
              })();
            }

            return outputConfig;
          })();

          const filteredTableColumns = columns
            .sort((a, b) => {
              return a.name.localeCompare(b.name);
            })
            .filter(({ name }) => {
              return (
                !name.match(/^id$/gi) &&
                name.replace(/[^\w\s]/g, '').length > 0 &&
                (!focusColumnNames || focusColumnNames.includes(name))
              );
            })
            .filter(({ type }) => {
              return !type || !LOOKUP_TABLE_COLUMN_TYPES.includes(type);
            })
            .reduce((accumulator, field) => {
              // Filtering columns with similar names.
              if (!accumulator.find(({ name }) => name === field.name)) {
                accumulator.push(field);
              }
              return accumulator;
            }, [] as typeof columns);

          const lookupTableColumns = columns
            .filter(({ type }) => {
              return type === 'multipleLookupValues';
            })
            .reduce((accumulator, field) => {
              // Filtering lookup columns with similar references.
              if (
                !accumulator.find(({ options }) => {
                  return (
                    options?.recordLinkFieldId &&
                    options?.fieldIdInLinkedTable &&
                    field.options?.recordLinkFieldId &&
                    field.options?.fieldIdInLinkedTable &&
                    field.options.recordLinkFieldId ===
                      field.options.recordLinkFieldId &&
                    options.fieldIdInLinkedTable ===
                      field.options.fieldIdInLinkedTable
                  );
                })
              ) {
                accumulator.push(field);
              }
              return accumulator;
            }, [] as typeof columns);

          const editableTableColumns = filteredTableColumns.filter(
            ({ type }) => {
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
            }
          );

          const modelImportsCollector: string[] = [];

          console.log(
            `  -> Processing \x1b[34m${workingBaseName.trim()}/${tableName.trim()}\x1b[0m table...`
          );

          const columnNameToObjectPropertyMapper = filteredTableColumns.reduce(
            (accumulator, field) => {
              accumulator[field.name] = getCamelCaseFieldPropertyName(field);
              return accumulator;
            },
            {} as Record<string, string>
          );

          const lookupColumnNameToObjectPropertyMapper =
            lookupTableColumns.reduce((accumulator, field) => {
              const parentField = (() => {
                const recordLinkFieldId = field.options?.recordLinkFieldId;
                if (recordLinkFieldId) {
                  const recordLinkField = table.fields.find(
                    ({ id }) => id === recordLinkFieldId
                  );
                  if (recordLinkField) {
                    const linkedTableId =
                      recordLinkField.options?.linkedTableId;
                    const fieldIdInLinkedTable =
                      field.options?.fieldIdInLinkedTable;
                    if (linkedTableId && fieldIdInLinkedTable) {
                      const linkedTable = tables.find(
                        ({ id }) => id === linkedTableId
                      );
                      if (linkedTable) {
                        const linkedField = linkedTable.fields.find(
                          ({ id }) => id === fieldIdInLinkedTable
                        );
                        if (linkedField) {
                          return linkedField;
                        }
                      }
                    }
                  }
                }
                return field;
              })();
              accumulator[field.name] =
                getCamelCaseFieldPropertyName(parentField);
              return accumulator;
            }, {} as Record<string, string>);

          const interpolationBlocks =
            getAirtableAPIGeneratorTemplateFileInterpolationBlocks({
              base: workingBase,
              currentTable: table,
              filteredTableColumns,
              lookupTableColumns,
              editableTableColumns,
              tables,
              columnNameToObjectPropertyMapper,
              lookupColumnNameToObjectPropertyMapper,
              modelImportsCollector,
              configColumnNameToObjectPropertyMapper,
            });

          const interpolationLabels =
            getAirtableAPIGeneratorTemplateFileInterpolationLabels({
              currentTable: table,
              filteredTableColumns,
              lookupTableColumns,
              tables,
              columnNameToObjectPropertyMapper,
              lookupColumnNameToObjectPropertyMapper,
              modelImportsCollector,
              views,
              labelPlural,
              labelSingular,
              focusColumnNames: focusColumnNames || [],
              configColumnNameToObjectPropertyMapper,
            });

          const getInterpolatedString = (templateFileContents: string) => {
            return Object.keys(interpolationLabels).reduce(
              (fileContents, key) => {
                return fileContents.replaceAll(key, interpolationLabels[key]);
              },
              Object.keys(interpolationBlocks).reduce((fileContents, key) => {
                const escapedKey = RegExp.escape(key);
                return fileContents.replace(
                  new RegExp(`${escapedKey}[\\s\\S]*${escapedKey}`, 'g'),
                  interpolationBlocks[key]
                );
              }, templateFileContents)
            );
          };

          moduleFiles.push(`./api/${labelPlural.toPascalCase()}`);

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
                semi: true,
                trailingComma: 'es5',
                singleQuote: true,
                printWidth: 80,
                tabWidth: 2,
                endOfLine: 'auto',
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
          `\n\x1b[32mAirtable [${workingBaseName.trim()}] base API generated here: ${baseAPIOutputFolderPath}\x1b[0m`
        );
      }
    });
  }
})();
