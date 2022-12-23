import {
  AirtableBase,
  AirtableField,
  AirtableView,
  ConfigColumnNameToObjectPropertyMapper,
  Table,
} from '../models';

export const getCamelCaseFieldPropertyName = ({ name }: AirtableField) => {
  const camelCasePropertyName = name.toCamelCase();

  if (camelCasePropertyName.match(/^\d/g)) {
    return `_${camelCasePropertyName}`;
  }

  return camelCasePropertyName;
};

export const getRootAirtableColumn = (
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
                  return getRootAirtableColumn(
                    linkedField,
                    tables,
                    linkedTable
                  );
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
  const rootField = getRootAirtableColumn(field, tables, currentTable);

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
      return `z.array(AirtableAttachmentValidationSchema)`;

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
      return `z.array(${validationString}.nullish())`;

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

export const getObjectPropertyTypeString = (
  field: AirtableField,
  options: GetAirtableResponseTypeValidationStringOptions
): string => {
  const { tables, currentTable } = options;
  const rootField = getRootAirtableColumn(field, tables, currentTable);

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
      return `AirtableAttachment[]`;

    case 'button':
      return `AirtableButton`;

    case 'formula':
      return `${getObjectPropertyTypeString(
        {
          ...field,
          type: field.options?.result?.type,
        },
        {
          ...options,
        }
      )} | AirtableFormulaColumnError`;

    // Lists
    case 'multipleRecordLinks':
      if (field.options?.prefersSingleRecordLink) {
        return `string`;
      }
      return `string[]`;
    case 'lookup':
    case 'multipleLookupValues':
      const propertyTypeString = (() => {
        if (rootField !== field) {
          if (rootField.type === 'multipleRecordLinks') {
            return `string`;
          }
          return getObjectPropertyTypeString(rootField, {
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
      return `${propertyTypeString}${
        propertyTypeString.match(/\[\]$/g) ? '' : '[]'
      }`;

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
};

export const getRequestObjectValidationString = (
  field: AirtableField,
  options: GetAirtableResponseTypeValidationStringOptions
): string => {
  const { tables, currentTable } = options;
  const rootField = getRootAirtableColumn(field, tables, currentTable);

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

    // Lists
    case 'multipleRecordLinks':
      if (field.options?.prefersSingleRecordLink) {
        return `z.string()`;
      }
      return `z.array(z.string())`;
    case 'lookup':
    case 'multipleLookupValues':
      const propertyTypeString = (() => {
        if (rootField !== field) {
          if (rootField.type === 'multipleRecordLinks') {
            return `z.string()`;
          }
          return getObjectPropertyTypeString(rootField, {
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
      return `${propertyTypeString}${
        propertyTypeString.match(/\[\]$/g) ? '' : '[]'
      }`;

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
      return `z.string()`;
  }
  return 'z.any()';
};

export type GetAirtableAPIGeneratorTemplateFileInterpolationOptions = {
  base: AirtableBase;
  currentTable: Table;
  filteredTableColumns: AirtableField[];
  editableTableColumns: AirtableField[];
  tables: Table[];
  columnToPropertyMapper: Record<string, string>;
  modelImportsCollector: string[];
  columnNameToObjectPropertyMapper?: ConfigColumnNameToObjectPropertyMapper<string>;
};

export const getAirtableAPIGeneratorTemplateFileInterpolationBlocks = ({
  base,
  currentTable,
  filteredTableColumns,
  editableTableColumns,
  tables,
  columnToPropertyMapper,
  modelImportsCollector,
  columnNameToObjectPropertyMapper = {},
}: GetAirtableAPIGeneratorTemplateFileInterpolationOptions) => {
  const { id: baseId } = base;
  return {
    ['/* AIRTABLE_BASE_ID */']: `"${baseId}"`,
    ['/* AIRTABLE_ENTITY_COLUMNS */']: filteredTableColumns
      .map(({ name }) => `"${name}"`)
      .join(', '),

    ['/* AIRTABLE_ENTITY_FIELD_TO_PROPERTY_MAPPINGS */']: filteredTableColumns
      .map((field) => {
        const { name } = field;
        const rootColumn = getRootAirtableColumn(field, tables, currentTable);
        const camelCasePropertyName = columnToPropertyMapper[name];
        const columnNameToObjectPropertyMapperConfig =
          columnNameToObjectPropertyMapper[name];

        return `["${name}"]: ${(() => {
          const obj = {
            propertyName: (() => {
              if (columnNameToObjectPropertyMapperConfig) {
                if (
                  typeof columnNameToObjectPropertyMapperConfig === 'string'
                ) {
                  return columnNameToObjectPropertyMapperConfig;
                }
                if (columnNameToObjectPropertyMapperConfig.propertyName) {
                  return columnNameToObjectPropertyMapperConfig.propertyName;
                }
              }
              return camelCasePropertyName;
            })(),
            ...(() => {
              if (
                (rootColumn && rootColumn.options?.prefersSingleRecordLink) ||
                (columnNameToObjectPropertyMapperConfig &&
                  typeof columnNameToObjectPropertyMapperConfig !== 'string' &&
                  columnNameToObjectPropertyMapperConfig.prefersSingleRecordLink)
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
      .map(({ name }) => `'${columnToPropertyMapper[name]}'`)
      .join(' | '),

    ['/* REQUEST_ENTITY_PROPERTIES */']: editableTableColumns
      .map(
        (field) =>
          `"${
            columnToPropertyMapper[field.name]
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
  columnToPropertyMapper,
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

  const CAMEL_CASE_ENTITIES_LABEL = labelPlural.toCamelCase();
  const CAMEL_CASE_ENTITY_LABEL = labelSingular.toCamelCase();

  const PASCAL_CASE_ENTITIES_LABEL = labelPlural.toPascalCase();
  const PASCAL_CASE_ENTITY_LABEL = labelSingular.toPascalCase();

  const KEBAB_CASE_ENTITIES_LABEL =
    LOWER_CASE_ENTITIES_LABEL_WITH_SPACES.replace(/\s/g, '-');
  const KEBAB_CASE_ENTITY_LABEL = LOWER_CASE_ENTITY_LABEL_WITH_SPACES.replace(
    /\s/g,
    '-'
  );

  return {
    ['/* AIRTABLE_VIEWS */']: views
      .map(({ name }) => {
        return `"${RegExp.escape(name)}"`;
      })
      .join(', '),

    ['/* ENTITY_INTERFACE_FIELDS */']: filteredTableColumns
      .map((field) => {
        const camelCasePropertyName = columnToPropertyMapper[field.name];
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
        return `"${columnToPropertyMapper[columnName]}"`;
      })
      .join(', '),

    ['/* MODEL_IMPORTS */']: [...new Set(modelImportsCollector)].join('\n'),

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
  } as Record<string, string>;
};
