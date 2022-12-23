import {
  AirtableBase,
  AirtableField,
  AirtableView,
  ConfigColumnNameToObjectPropertyMapper,
  Table,
} from '../../models';
import {
  getAirtableResponseTypeValidationString,
  getObjectPropertyTypeString,
  getRequestObjectValidationString,
  getRootAirtableColumn,
} from './TypeGenerator';

export type GetAirtableAPIGeneratorTemplateFileInterpolationOptions = {
  base: AirtableBase;
  currentTable: Table;
  filteredTableColumns: AirtableField[];
  lookupTableColumns: AirtableField[];
  editableTableColumns: AirtableField[];
  tables: Table[];
  columnNameToObjectPropertyMapper: Record<string, string>;
  lookupColumnNameToObjectPropertyMapper: Record<string, string>;
  modelImportsCollector: string[];
  configColumnNameToObjectPropertyMapper?: ConfigColumnNameToObjectPropertyMapper<string>;
};

export const getAirtableAPIGeneratorTemplateFileInterpolationBlocks = ({
  base,
  currentTable,
  filteredTableColumns,
  lookupTableColumns,
  editableTableColumns,
  tables,
  columnNameToObjectPropertyMapper,
  lookupColumnNameToObjectPropertyMapper,
  modelImportsCollector,
  configColumnNameToObjectPropertyMapper = {},
}: GetAirtableAPIGeneratorTemplateFileInterpolationOptions) => {
  const { id: baseId } = base;
  return {
    ['/* AIRTABLE_BASE_ID */']: `"${baseId}"`,

    ['/* AIRTABLE_ENTITY_COLUMNS */']: filteredTableColumns
      .map(({ name }) => `"${name}"`)
      .join(', '),

    ['/* AIRTABLE_ENTITY_LOOKUP_COLUMNS */']: lookupTableColumns
      .map(({ name }) => `"${name}"`)
      .join(', '),

    ['/* AIRTABLE_ENTITY_FIELD_TO_PROPERTY_MAPPINGS */']: filteredTableColumns
      .map((tableColumn) => {
        const { id: tableColumnId, name, type } = tableColumn;
        const rootColumn = getRootAirtableColumn(
          tableColumn,
          tables,
          currentTable
        );
        const camelCasePropertyName = columnNameToObjectPropertyMapper[name];
        const configColumnNameToObjectPropertyMapperConfig =
          configColumnNameToObjectPropertyMapper[name];

        return `["${name}"]: ${(() => {
          const obj: any = {
            propertyName: (() => {
              if (configColumnNameToObjectPropertyMapperConfig) {
                if (
                  typeof configColumnNameToObjectPropertyMapperConfig ===
                  'string'
                ) {
                  return configColumnNameToObjectPropertyMapperConfig;
                }
                if (configColumnNameToObjectPropertyMapperConfig.propertyName) {
                  return configColumnNameToObjectPropertyMapperConfig.propertyName;
                }
              }
              return camelCasePropertyName;
            })(),
            ...(() => {
              if (
                (rootColumn && rootColumn.options?.prefersSingleRecordLink) ||
                (configColumnNameToObjectPropertyMapperConfig &&
                  typeof configColumnNameToObjectPropertyMapperConfig !==
                    'string' &&
                  configColumnNameToObjectPropertyMapperConfig.prefersSingleRecordLink)
              ) {
                return {
                  prefersSingleRecordLink: true,
                };
              }
            })(),
          };

          if (type === 'multipleRecordLinks') {
            const lookups = currentTable.fields
              .filter(({ options, type }) => {
                return (
                  type === 'multipleLookupValues' &&
                  tableColumnId === options?.recordLinkFieldId
                );
              })
              .map(({ name }) => {
                return name;
              });

            if (lookups.length > 0) {
              obj.lookups = lookups;
            }
          }

          if (Object.keys(obj).length > 1 || type === 'multipleRecordLinks') {
            return JSON.stringify(obj);
          }

          return `"${obj.propertyName}"`;
        })()}`;
      })
      .join(',\n'),

    ['/* AIRTABLE_LOOKUP_COLUMN_TO_OBJECT_PROPERTY_MAPPINGS */']:
      lookupTableColumns
        .map((tableColumn) => {
          const { name } = tableColumn;
          return `["${name}"]: "${lookupColumnNameToObjectPropertyMapper[name]}"`;
        })
        .join(',\n'),

    ['/* AIRTABLE_ENTITY_FIELDS */']: filteredTableColumns
      .map((field) => {
        const { name } = field;
        const rootColumn = getRootAirtableColumn(field, tables, currentTable);
        switch (rootColumn.type) {
          case 'multipleAttachments':
            modelImportsCollector.push(
              `import {AirtableAttachmentValidationSchema} from './__Utils';`
            );
            break;
          case 'button':
            modelImportsCollector.push(
              `import {AirtableButtonValidationSchema} from './__Utils';`
            );
            break;
          case 'formula':
            modelImportsCollector.push(
              `import {AirtableFormulaColumnErrorValidationSchema} from './__Utils';`
            );
        }
        return `["${name}"]: ${getAirtableResponseTypeValidationString(field, {
          currentTable,
          tables,
        })}.nullish()`;
      })
      .join(',\n'),

    ['/* AIRTABLE_ENTITY_EDITABLE_FIELD_TYPE */']: editableTableColumns
      .map(({ name }) => `'${columnNameToObjectPropertyMapper[name]}'`)
      .join(' | '),

    ['/* REQUEST_ENTITY_PROPERTIES */']: editableTableColumns
      .map(
        (field) =>
          `"${
            columnNameToObjectPropertyMapper[field.name]
          }": ${getRequestObjectValidationString(field, {
            currentTable,
            tables,
          })}.nullish()`
      )
      .join(',\n'),
  } as Record<string, string>;
};

export const getAirtableAPIGeneratorTemplateFileInterpolationLabels = ({
  currentTable,
  filteredTableColumns,
  columnNameToObjectPropertyMapper,
  modelImportsCollector,
  views,
  labelSingular,
  labelPlural,
  focusColumnNames,
  tables,
}: Omit<
  GetAirtableAPIGeneratorTemplateFileInterpolationOptions,
  'base' | 'editableTableColumns'
> & {
  views: AirtableView[];
  labelSingular: string;
  labelPlural: string;
  focusColumnNames: string[];
}) => {
  const { name: tableName } = currentTable;

  return {
    ['/* AIRTABLE_VIEWS */']: views
      .map(({ name }) => {
        return `"${RegExp.escape(name)}"`;
      })
      .join(', '),

    ['/* ENTITY_INTERFACE_FIELDS */']: filteredTableColumns
      .map((field) => {
        const camelCasePropertyName =
          columnNameToObjectPropertyMapper[field.name];
        const rootColumn = getRootAirtableColumn(field, tables, currentTable);
        switch (rootColumn.type) {
          case 'multipleAttachments':
            modelImportsCollector.push(
              `import {AirtableAttachment} from './__Utils';`
            );
            break;
          case 'button':
            modelImportsCollector.push(
              `import {AirtableButton} from './__Utils';`
            );
            break;
          case 'formula':
            modelImportsCollector.push(
              `import {AirtableFormulaColumnError} from './__Utils';`
            );
        }
        return [
          `${camelCasePropertyName}?: ${getObjectPropertyTypeString(field, {
            currentTable,
            tables,
          })}`,
        ];
      })
      .flat()
      .join(';\n'),

    ['/* ENTITY_FOCUS_FIELDS */']: focusColumnNames
      .map((columnName) => {
        return `"${columnNameToObjectPropertyMapper[columnName]}"`;
      })
      .join(', '),

    ['/* MODEL_IMPORTS */']: [...new Set(modelImportsCollector)].join('\n'),

    ['Entities Table']: tableName,
    ['Entities Label']: labelPlural,
    ['Entity Label']: labelSingular,

    ['entities label']: labelPlural.toLowerCase(),
    ['entity label']: labelSingular.toLowerCase(),

    ['ENTITIES']: labelPlural.replace(/\s/g, '_').toUpperCase(),
    ['ENTITY']: labelSingular.replace(/\s/g, '_').toUpperCase(),

    ['camelCaseEntities']: labelPlural.toCamelCase(),
    ['camelCaseEntity']: labelSingular.toCamelCase(),

    ['PascalCaseEntities']: labelPlural.toPascalCase(),
    ['PascalCaseEntity']: labelSingular.toPascalCase(),

    ['kebab-case-entities']: labelPlural.toKebabCase(),
    ['kebab-case-entity']: labelSingular.toKebabCase(),
  } as Record<string, string>;
};
