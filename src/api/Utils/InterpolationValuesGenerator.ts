import { pick } from 'lodash';

import {
  AirtableBase,
  AirtableField,
  AirtableView,
  ConfigColumnNameToObjectPropertyMapper,
  DetailedColumnNameToObjectPropertyMapping,
  Table,
} from '../../models';
import { TableColumnValidationSchemaTypeStringGroup } from './TypeGenerator';

export type GetAirtableAPIGeneratorTemplateFileInterpolationOptions = {
  base: AirtableBase;
  currentTable: Table;
  nonLookupTableColumns: AirtableField[];
  lookupTableColumns: AirtableField[];
  editableTableColumns: AirtableField[];
  tables: Table[];
  columnNameToObjectPropertyMapper: Record<
    string,
    DetailedColumnNameToObjectPropertyMapping
  >;
  lookupColumnNameToObjectPropertyMapper: Record<
    string,
    DetailedColumnNameToObjectPropertyMapping
  >;
  airtableAPIModelImportsCollector: string[];
  restAPIModelImportsCollector: string[];
  restAPIModelExtrasCollector: string[];
  configColumnNameToObjectPropertyMapper?: ConfigColumnNameToObjectPropertyMapper<string>;
  queryableNonLookupFields: string[];
  queryableLookupFields: string[];
  columnNameToValidationSchemaTypeStringGroupMapper: Record<
    string,
    TableColumnValidationSchemaTypeStringGroup
  >;
};

export const getAirtableAPIGeneratorTemplateFileInterpolationBlocks = ({
  base,
  nonLookupTableColumns,
  lookupTableColumns,
  editableTableColumns,
  columnNameToObjectPropertyMapper,
  lookupColumnNameToObjectPropertyMapper,
  configColumnNameToObjectPropertyMapper = {},
  queryableLookupFields,
  columnNameToValidationSchemaTypeStringGroupMapper,
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
        const camelCasePropertyName =
          columnNameToObjectPropertyMapper[name].propertyName;
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
              return pick(
                columnNameToObjectPropertyMapper[name],
                'prefersSingleRecordLink',
                'type'
              );
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
            return `["${name}"]:  ${(() => {
              const obj: any = {
                propertyName: (() => {
                  return `${
                    columnNameToObjectPropertyMapper[parentColumn.name]
                      .propertyName
                  }.${
                    lookupColumnNameToObjectPropertyMapper[name].propertyName
                  }`;
                })(),
                ...(() => {
                  return pick(
                    lookupColumnNameToObjectPropertyMapper[name],
                    'prefersSingleRecordLink',
                    'type'
                  );
                })(),
              };
              if (Object.keys(obj).length > 1) {
                return JSON.stringify(obj);
              }
              return `"${obj.propertyName}"`;
            })()}`;
          }
        })
        .filter((lookupColumnMapping) => lookupColumnMapping)
        .join(',\n'),

    ['/* AIRTABLE_RESPONSE_VALIDATION_SCHEMA_FIELDS */']: [
      ...nonLookupTableColumns,
      ...lookupTableColumns,
    ]
      .map((field) => {
        return `["${field.name}"]: ${
          columnNameToValidationSchemaTypeStringGroupMapper[field.name]
            .airtableResponseValidationString
        }.nullish()`;
      })
      .join(',\n'),

    ['/* REQUEST_ENTITY_PROPERTIES */']: editableTableColumns
      .filter((tableColumn) => {
        return columnNameToValidationSchemaTypeStringGroupMapper[
          tableColumn.name
        ].requestObjectPropertyTypeValidationString;
      })
      .map((tableColumn) => {
        return `"${
          columnNameToObjectPropertyMapper[tableColumn.name].propertyName
        }": ${
          columnNameToValidationSchemaTypeStringGroupMapper[tableColumn.name]
            .requestObjectPropertyTypeValidationString
        }.nullish()`;
      })
      .join(',\n'),

    ['/* QUERYABLE_FIELD_TYPE */']: (() => {
      if (queryableLookupFields.length > 0) {
        return `| ${queryableLookupFields.join(' | ')}`;
      }
      return '';
    })(),

    ['/* ENTITY_MODEL_FIELDS */']: nonLookupTableColumns
      .map((field) => {
        return [
          columnNameToValidationSchemaTypeStringGroupMapper[field.name]
            .objectModelPropertyTypeString,
        ];
      })
      .flat()
      .join(';\n\n'),
  } as Record<string, string>;
};

export const getAirtableAPIGeneratorTemplateFileInterpolationLabels = ({
  currentTable,
  nonLookupTableColumns,
  columnNameToObjectPropertyMapper,
  airtableAPIModelImportsCollector,
  restAPIModelImportsCollector,
  restAPIModelExtrasCollector,
  views,
  labelSingular,
  labelPlural,
  queryableNonLookupFields,
  queryableLookupFields,
  columnNameToValidationSchemaTypeStringGroupMapper,
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
        return [
          `${columnNameToObjectPropertyMapper[field.name].propertyName}?: ${
            columnNameToValidationSchemaTypeStringGroupMapper[field.name]
              .objectPropetyTypeString
          }`,
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
