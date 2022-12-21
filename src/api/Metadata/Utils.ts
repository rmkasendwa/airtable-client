import { AirtableField, Table } from '../../models';

export const getCamelCaseFieldPropertyName = (
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
