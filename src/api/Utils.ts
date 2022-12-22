import { AirtableBase, AirtableField, Table } from '../models';

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

export type GetAirtableAPIGeneratorTemplateFileInterpolationBlocksOptions = {
  base: AirtableBase;
  currentTable: Table;
  filteredTableColumns: AirtableField[];
  editableTableColumns: AirtableField[];
  tables: Table[];
  columnToPropertyMapper: Record<string, string>;
  moduleImportCollector: string[];
};

export const getAirtableAPIGeneratorTemplateFileInterpolationBlocks = ({
  base,
  currentTable,
  filteredTableColumns,
  editableTableColumns,
  tables,
  columnToPropertyMapper,
  moduleImportCollector,
}: GetAirtableAPIGeneratorTemplateFileInterpolationBlocksOptions) => {
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
        return `["${name}"]: ${(() => {
          const obj = {
            propertyName: camelCasePropertyName,
            ...(() => {
              if (rootColumn && rootColumn.options?.prefersSingleRecordLink) {
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
            moduleImportCollector.push(
              `import {AirtableAttachmentValidationSchema} from './__Utils';`
            );
            break;
          case 'button':
            moduleImportCollector.push(
              `import {AirtableButtonValidationSchema} from './__Utils';`
            );
            break;
          case 'formula':
            moduleImportCollector.push(
              `import {AirtableFormulaColumnErrorValidationSchema} from './__Utils';`
            );
        }
        return `["${name}"]: ${getAirtableResponseTypeValidationString(field, {
          currentTable: currentTable,
          tables,
        })}.nullish()`;
      })
      .join(',\n'),

    ['/* AIRTABLE_ENTITY_EDITABLE_FIELD_TYPE */']: editableTableColumns
      .map(({ name }) => `'${columnToPropertyMapper[name]}'`)
      .join(' | '),

    ['/* REQUEST_ENTITY_PROPERTIES */']: editableTableColumns
      .map(({ name }) => `"${columnToPropertyMapper[name]}": z.any().nullish()`)
      .join(',\n'),
  } as Record<string, string>;
};
