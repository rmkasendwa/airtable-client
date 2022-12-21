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

import { findAllTablesByBaseId } from './api';
import { findAllAirtableBases } from './api/Metadata/Bases';
import { AirtableField, Table } from './models';

const prettierConfig = require('../.prettierrc.js');

const outputFolderPath = normalize(`${__dirname}/__sandbox`);
const templatesFolderPath = normalize(`${__dirname}/template-files`);
const templateFilePaths = globby
  .sync(`src/template-files`, {
    absolute: true,
  })
  .map((filePath) => normalize(filePath));

const getCamelCaseFieldPropertyName = (
  field: AirtableField,
  tables: Table[],
  currentTable: Table
) => {
  const { name } = field;
  const camelCasePropertyName = name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s/g, '_')
    .toUpperCase()
    .toCamelCase('UPPER_CASE');

  const rootField = getRootAirtableField(field, tables, currentTable);

  if (
    rootField.type === 'multipleRecordLinks' &&
    !camelCasePropertyName.match(/Ids?$/gi)
  ) {
    const linkedTableId = rootField.options?.linkedTableId;
    const inverseLinkFieldId = rootField.options?.inverseLinkFieldId;
    if (linkedTableId && inverseLinkFieldId) {
      const linkedTable = tables.find(({ id }) => id === linkedTableId);
      if (linkedTable) {
        const linkedField = linkedTable.fields.find(
          ({ id }) => id === inverseLinkFieldId
        );
        if (linkedField) {
          return (
            camelCasePropertyName +
            linkedTable.name
              .replace(/[^a-zA-Z0-9\s]/g, '')
              .replace(/\s/g, '_')
              .toUpperCase()
              .toCamelCase('UPPER_CASE')
              .replace(/^\w/g, (character) => {
                return character.toUpperCase();
              }) +
            linkedField.name
              .replace(/[^a-zA-Z0-9\s]/g, '')
              .replace(/\s/g, '_')
              .toUpperCase()
              .toCamelCase('UPPER_CASE')
              .replace(/^\w/g, (character) => {
                return character.toUpperCase();
              }) +
            'Id' +
            (linkedField.options?.prefersSingleRecordLink ? '' : 's')
          );
        }
      }
    }
  }

  return camelCasePropertyName;
};

export const getRootAirtableField = (
  field: AirtableField,
  tables: Table[],
  currentTable: Table
): AirtableField => {
  const { type } = field;
  switch (type) {
    case 'multipleLookupValues':
      {
        const recordLinkFieldId = field.options?.recordLinkFieldId;
        const fieldIdInLinkedTable = field.options?.fieldIdInLinkedTable;
        if (recordLinkFieldId) {
          const recordLinkField = currentTable.fields.find(
            ({ id }) => id === recordLinkFieldId
          );
          if (recordLinkField) {
            const linkedTableId = recordLinkField.options?.linkedTableId;
            if (linkedTableId) {
              const linkedTable = tables.find(({ id }) => id === linkedTableId);
              if (linkedTable) {
                const linkedField = linkedTable.fields.find(
                  ({ id }) => id === fieldIdInLinkedTable
                );
                if (linkedField) {
                  return getRootAirtableField(linkedField, tables, linkedTable);
                }
              }
            }
          }
        }
      }
      break;
  }
  return field;
};

export type GetAirtableResponseTypeValidationStringOptions = {
  currentTable: Table;
  tables: Table[];
};

export const getAirtableResponseTypeValidationString = (
  field: AirtableField,
  options: GetAirtableResponseTypeValidationStringOptions
): string => {
  const { tables, currentTable } = options;
  const rootField = getRootAirtableField(field, tables, currentTable);

  const { type } = field;

  switch (type) {
    case 'multipleSelects':
    case 'singleCollaborator':
    case 'multipleCollaborators':
    case 'rollup':
    case 'barcode':
    case 'duration':
    case 'createdBy':
    case 'lastModifiedBy':
    case 'externalSyncSource':
      break;

    case 'multipleAttachments':
      return `AirtableAttachmentValidationSchema`;

    case 'button':
      return `AirtableButtonValidationSchema`;

    case 'formula':
      return `z.union([${getAirtableResponseTypeValidationString(
        {
          ...field,
          type: field.options?.result?.type,
        },
        {
          ...options,
        }
      )}, AirtableFormulaColumnErrorValidationSchema])`;

    // Dates
    case 'date':
    case 'dateTime':
    case 'lastModifiedTime':
    case 'createdTime':
      // return `z.string().datetime()`;
      return `z.string()`;

    // Lists
    case 'multipleRecordLinks':
      return `z.array(z.string())`;
    case 'lookup':
    case 'multipleLookupValues':
      const validationString = (() => {
        if (rootField !== field) {
          if (rootField.type === 'multipleRecordLinks') {
            return `z.string()`;
          }
          return getAirtableResponseTypeValidationString(rootField, {
            ...options,
          });
        }
        return getAirtableResponseTypeValidationString(
          {
            ...field,
            type: field.options?.result?.type,
          },
          {
            ...options,
          }
        );
      })();
      return `z.array(${validationString})`;

    // Numbers
    case 'number':
    case 'percent':
    case 'currency':
    case 'count':
    case 'autoNumber':
    case 'rating':
      return `z.number()`;

    // Booleans
    case 'checkbox':
      return `z.boolean()`;

    // Special text
    case 'email':
      return `z.string().email()`;
    case 'url':
      return `z.string().url()`;

    // Regular text
    case 'singleLineText':
    case 'multilineText':
    case 'richText':
    case 'phoneNumber':
    case 'singleSelect':
    default:
      return `z.string()`;
  }
  return `z.any()`;
};

(async () => {
  const { bases } = await findAllAirtableBases();
  const talentBase = bases.find(({ name }) => name.trim().match(/^Talent$/g));
  if (talentBase) {
    const { tables } = await findAllTablesByBaseId(talentBase.id);

    if (tables.length > 0) {
      if (existsSync(outputFolderPath)) {
        readdirSync(outputFolderPath).forEach((path) => {
          if (!path.match(/test/gi)) {
            removeSync(`${outputFolderPath}/${path}`);
          }
        });
      }

      ensureDirSync(outputFolderPath);

      const moduleFiles: string[] = [];

      tables.forEach((table) => {
        const { name: tableName, fields, views } = table;

        const filteredFields = fields.filter(({ name }) => {
          return !name.match(/^id$/gi);
        });

        const editableFields = filteredFields.filter(({ type }) => {
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

        console.log(`Processing ${tableName} table...`);

        const sanitisedTableName = tableName
          .trim()
          .replace(/[^a-zA-Z0-9\s]/g, '');
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

        const LOWER_CASE_ENTITIES_LABEL_WITH_SPACES = labelPlural.toLowerCase();
        const LOWER_CASE_ENTITY_LABEL_WITH_SPACES = labelSingular.toLowerCase();

        const UPPER_CASE_ENTITIES_LABEL = labelPlural
          .replace(/\s/g, '_')
          .toUpperCase();
        const UPPER_CASE_ENTITY_LABEL = labelSingular
          .replace(/\s/g, '_')
          .toUpperCase();

        const CAMEL_CASE_ENTITIES_LABEL =
          UPPER_CASE_ENTITIES_LABEL.toCamelCase('UPPER_CASE');
        const CAMEL_CASE_ENTITY_LABEL =
          UPPER_CASE_ENTITY_LABEL.toCamelCase('UPPER_CASE');

        const PASCAL_CASE_ENTITIES_LABEL = CAMEL_CASE_ENTITIES_LABEL.replace(
          /^\w/g,
          (character) => {
            return character.toUpperCase();
          }
        );
        const PASCAL_CASE_ENTITY_LABEL = CAMEL_CASE_ENTITY_LABEL.replace(
          /^\w/g,
          (character) => {
            return character.toUpperCase();
          }
        );

        const KEBAB_CASE_ENTITIES_LABEL =
          LOWER_CASE_ENTITIES_LABEL_WITH_SPACES.replace(/\s/g, '-');
        const KEBAB_CASE_ENTITY_LABEL =
          LOWER_CASE_ENTITY_LABEL_WITH_SPACES.replace(/\s/g, '-');

        const columnToPropertyMapper = filteredFields.reduce(
          (accumulator, field) => {
            accumulator[field.name] = getCamelCaseFieldPropertyName(
              field,
              tables,
              table
            );
            return accumulator;
          },
          {} as Record<string, string>
        );

        const interpolationBlocks: Record<string, string> = {
          ['/* AIRTABLE_ENTITY_FIELD_TO_PROPERTY_MAPPINGS */']: filteredFields
            .map((field) => {
              const { name } = field;
              const rootField = getRootAirtableField(field, tables, table);
              const camelCasePropertyName = columnToPropertyMapper[name];
              return `["${name}"]: ${(() => {
                const obj = {
                  propertyName: camelCasePropertyName,
                  ...(() => {
                    if (
                      rootField &&
                      rootField.options?.prefersSingleRecordLink
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
          ['/* AIRTABLE_ENTITY_FIELDS */']: filteredFields
            .map((field) => {
              const { name } = field;
              const rootField = getRootAirtableField(field, tables, table);
              switch (rootField.type) {
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

          ['/* AIRTABLE_ENTITY_EDITABLE_FIELD_TYPE */']: editableFields
            .map(({ name }) => `'${columnToPropertyMapper[name]}'`)
            .join(' | '),

          ['/* REQUEST_ENTITY_PROPERTIES */']: editableFields
            .map(({ name }) => `"${columnToPropertyMapper[name]}": z.any()`)
            .join(',\n'),
        };

        const interpolationLabels: Record<string, string> = {
          ['/* AIRTABLE_VIEWS */']: views
            .map(({ name }) => {
              return `"${RegExp.escape(name)}"`;
            })
            .join(', '),

          ['/* ENTITY_INTERFACE_FIELDS */']: filteredFields
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
          const templateFileContents = readFileSync(templateFilePath, 'utf-8');
          const filePath = getInterpolatedString(
            `${outputFolderPath}${templateFilePath.replace(
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
        `${outputFolderPath}/index.ts`,
        moduleFiles
          .map((filePath) => {
            return `export * from '${filePath}'`;
          })
          .join('\n')
      );

      console.log(`Airtable API has been generated here: ${outputFolderPath}`);
    }
  }
})();
