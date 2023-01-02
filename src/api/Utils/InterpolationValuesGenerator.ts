import {
  AirtableBase,
  AirtableField,
  AirtableView,
  ConfigColumnNameToObjectPropertyMapper,
  Table,
} from '../../models';
import {
  getAirtableResponseTypeValidationString,
  getObjectModelPropertyTypeString,
  getObjectPropertyTypeString,
  getRequestObjectValidationString,
  getRootAirtableColumn,
} from './TypeGenerator';

export type GetAirtableAPIGeneratorTemplateFileInterpolationOptions = {
  base: AirtableBase;
  currentTable: Table;
  nonLookupTableColumns: AirtableField[];
  lookupTableColumns: AirtableField[];
  editableTableColumns: AirtableField[];
  tables: Table[];
  columnNameToObjectPropertyMapper: Record<string, string>;
  lookupColumnNameToObjectPropertyMapper: Record<string, string>;
  airtableAPIModelImportsCollector: string[];
  restAPIModelImportsCollector: string[];
  restAPIModelExtrasCollector: string[];
  configColumnNameToObjectPropertyMapper?: ConfigColumnNameToObjectPropertyMapper<string>;
  queryableNonLookupFields: string[];
  queryableLookupFields: string[];
};

export const getAirtableAPIGeneratorTemplateFileInterpolationBlocks = ({
  base,
  currentTable,
  nonLookupTableColumns,
  lookupTableColumns,
  editableTableColumns,
  tables,
  columnNameToObjectPropertyMapper,
  lookupColumnNameToObjectPropertyMapper,
  airtableAPIModelImportsCollector,
  restAPIModelImportsCollector,
  restAPIModelExtrasCollector,
  configColumnNameToObjectPropertyMapper = {},
  queryableLookupFields,
}: GetAirtableAPIGeneratorTemplateFileInterpolationOptions) => {
  const { id: baseId } = base;
  return {
    ['/* AIRTABLE_BASE_ID */']: `"${baseId}"`,

    ['/* AIRTABLE_ENTITY_COLUMNS */']: nonLookupTableColumns
      .map(({ name }) => `"${name}"`)
      .join(', '),

    ['/* AIRTABLE_ENTITY_LOOKUP_COLUMNS */']: lookupTableColumns
      .map(({ name }) => `"${name}"`)
      .join(', '),

    ['/* AIRTABLE_ENTITY_FIELD_TO_PROPERTY_MAPPINGS */']: nonLookupTableColumns
      .map((tableColumn) => {
        const { name, type } = tableColumn;
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
            obj.isMultipleRecordLinksField = true;
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
        .map(({ name, options }) => {
          const parentColumn = nonLookupTableColumns.find(
            ({ id }) => id === options?.recordLinkFieldId
          );
          if (parentColumn) {
            return `["${name}"]: "${
              columnNameToObjectPropertyMapper[parentColumn.name]
            }.${lookupColumnNameToObjectPropertyMapper[name]}"`;
          }
        })
        .filter((lookupColumnMapping) => lookupColumnMapping)
        .join(',\n'),

    ['/* AIRTABLE_RESPONSE_VALIDATION_SCHEMA_FIELDS */']: [
      ...nonLookupTableColumns,
      ...lookupTableColumns,
    ]
      .map((field) => {
        const { name } = field;
        const rootColumn = getRootAirtableColumn(field, tables, currentTable);
        switch (rootColumn.type) {
          case 'multipleAttachments':
            airtableAPIModelImportsCollector.push(
              `import {AirtableAttachmentValidationSchema} from '../__Utils';`
            );
            break;
          case 'button':
            airtableAPIModelImportsCollector.push(
              `import {AirtableButtonValidationSchema} from '../__Utils';`
            );
            break;
          case 'formula':
            airtableAPIModelImportsCollector.push(
              `import {AirtableFormulaColumnErrorValidationSchema} from '../__Utils';`
            );
        }
        return `["${name}"]: ${getAirtableResponseTypeValidationString(field, {
          currentTable,
          tables,
        })}.nullish()`;
      })
      .join(',\n'),

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

    ['/* QUERYABLE_FIELD_TYPE */']: (() => {
      if (queryableLookupFields.length > 0) {
        return `| ${queryableLookupFields.join(' | ')}`;
      }
      return '';
    })(),

    ['/* ENTITY_MODEL_FIELDS */']: nonLookupTableColumns
      .map((field) => {
        const camelCasePropertyName =
          columnNameToObjectPropertyMapper[field.name];
        return [
          getObjectModelPropertyTypeString(field, {
            currentTable,
            tables,
            lookupColumnNameToObjectPropertyMapper,
            lookupTableColumns,
            restAPIModelImportsCollector,
            restAPIModelExtrasCollector,
            camelCasePropertyName,
          }),
        ];
      })
      .flat()
      .join(';\n\n'),
  } as Record<string, string>;
};

export const getAirtableAPIGeneratorTemplateFileInterpolationLabels = ({
  currentTable,
  nonLookupTableColumns,
  lookupTableColumns,
  columnNameToObjectPropertyMapper,
  airtableAPIModelImportsCollector,
  restAPIModelImportsCollector,
  restAPIModelExtrasCollector,
  lookupColumnNameToObjectPropertyMapper,
  views,
  labelSingular,
  labelPlural,
  queryableNonLookupFields,
  queryableLookupFields,
  tables,
}: Omit<
  GetAirtableAPIGeneratorTemplateFileInterpolationOptions,
  'base' | 'editableTableColumns'
> & {
  views: AirtableView[];
  labelSingular: string;
  labelPlural: string;
}) => {
  const { name: tableName } = currentTable;

  return {
    ['/* AIRTABLE_VIEWS */']: views
      .map(({ name }) => {
        return `"${RegExp.escape(name)}"`;
      })
      .join(', '),

    ['/* ENTITY_INTERFACE_FIELDS */']: nonLookupTableColumns
      .map((field) => {
        const camelCasePropertyName =
          columnNameToObjectPropertyMapper[field.name];
        return [
          `${camelCasePropertyName}?: ${getObjectPropertyTypeString(field, {
            currentTable,
            tables,
            lookupColumnNameToObjectPropertyMapper,
            lookupTableColumns,
            airtableAPIModelImportsCollector,
          })}`,
        ];
      })
      .flat()
      .join(';\n'),

    ['/* QUERYABLE_FIELDS */']: [
      ...queryableNonLookupFields,
      ...queryableLookupFields,
    ].join(', '),

    ['/* AIRTABLE_API_MODEL_IMPORTS */']: [
      ...new Set(airtableAPIModelImportsCollector),
    ].join('\n'),

    ['/* REST_API_MODEL_IMPORTS */']: [
      ...new Set(restAPIModelImportsCollector),
    ].join('\n'),

    ['/* REST_API_MODEL_EXTRAS */']: [
      ...new Set(restAPIModelExtrasCollector),
    ].join('\n\n'),

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
