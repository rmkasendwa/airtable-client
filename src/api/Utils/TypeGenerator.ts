import { AirtableField, Table } from '../../models';

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
    case 'barcode':
    case 'duration':
    case 'createdBy':
    case 'lastModifiedBy':
    case 'externalSyncSource':
    case 'rollup':
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

    // case 'rollup':
    //   return getAirtableResponseTypeValidationString( // This is problematic, sometimes airtable lies about the result type
    //     {
    //       ...field,
    //       type: field.options?.result?.type,
    //     },
    //     {
    //       ...options,
    //     }
    //   );

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
  tableColumn: AirtableField,
  options: GetAirtableResponseTypeValidationStringOptions & {
    lookupColumnNameToObjectPropertyMapper: Record<string, string>;
    lookupTableColumns: AirtableField[];
    airtableAPIModelImportsCollector: string[];
  }
): string => {
  const {
    tables,
    currentTable,
    lookupTableColumns,
    lookupColumnNameToObjectPropertyMapper,
    airtableAPIModelImportsCollector,
  } = options;
  const rootField = getRootAirtableColumn(tableColumn, tables, currentTable);
  const { type } = tableColumn;
  switch (type) {
    case 'multipleSelects':
    case 'singleCollaborator':
    case 'multipleCollaborators':
    case 'barcode':
    case 'duration':
    case 'createdBy':
    case 'lastModifiedBy':
    case 'externalSyncSource':
      break;

    case 'multipleAttachments':
      airtableAPIModelImportsCollector.push(
        `import {AirtableAttachment} from '../__Utils';`
      );
      return `AirtableAttachment[]`;

    case 'button':
      airtableAPIModelImportsCollector.push(
        `import {AirtableButton} from '../__Utils';`
      );
      return `AirtableButton`;

    case 'formula':
      airtableAPIModelImportsCollector.push(
        `import {AirtableFormulaColumnError} from '../__Utils';`
      );
      return `${getObjectPropertyTypeString(
        {
          ...tableColumn,
          type: tableColumn.options?.result?.type,
        },
        options
      )} | AirtableFormulaColumnError`;

    case 'rollup':
      return getObjectPropertyTypeString(
        {
          ...tableColumn,
          type: tableColumn.options?.result?.type,
        },
        options
      );

    // Lists
    case 'multipleRecordLinks': {
      const typeString = `{
        id: string;
        ${lookupTableColumns
          .filter((lookupTableColumn) => {
            return (
              lookupTableColumn.options?.recordLinkFieldId === tableColumn.id
            );
          })
          .map((lookupTableColumn) => {
            return `${
              lookupColumnNameToObjectPropertyMapper[lookupTableColumn.name]
            }: ${getObjectPropertyTypeString(lookupTableColumn, options)}`;
          })
          .join(';')}
      }`;
      if (tableColumn.options?.prefersSingleRecordLink) {
        return typeString;
      }
      return `${typeString}[]`;
    }
    case 'lookup':
    case 'multipleLookupValues':
      const propertyTypeString = (() => {
        if (rootField !== tableColumn) {
          if (rootField.type === 'multipleRecordLinks') {
            return `string`;
          }
          return getObjectPropertyTypeString(rootField, options);
        }
        return getObjectPropertyTypeString(
          {
            ...tableColumn,
            type: tableColumn.options?.result?.type,
          },
          options
        );
      })();
      const parentTableColumn = currentTable.fields.find(
        ({ id }) => id === tableColumn.options?.recordLinkFieldId
      );
      return `${propertyTypeString}${
        !propertyTypeString.match(/\[\]$/g) &&
        !parentTableColumn?.options?.prefersSingleRecordLink
          ? '[]'
          : ''
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

export const getObjectModelPropertyTypeString = (
  tableColumn: AirtableField,
  options: GetAirtableResponseTypeValidationStringOptions & {
    lookupColumnNameToObjectPropertyMapper: Record<string, string>;
    lookupTableColumns: AirtableField[];
    restAPIModelImportsCollector: string[];
    restAPIModelExtrasCollector: string[];
    camelCasePropertyName: string;
  }
): string => {
  const {
    tables,
    currentTable,
    lookupTableColumns,
    restAPIModelImportsCollector,
    restAPIModelExtrasCollector,
    camelCasePropertyName,
  } = options;

  const rootField = getRootAirtableColumn(tableColumn, tables, currentTable);
  const { type } = tableColumn;
  const modelFieldDecorators = `
    @Title('${camelCasePropertyName}')
    @Property()
    @Optional()
  `.trimIndent();

  switch (type) {
    case 'multipleSelects':
    case 'singleCollaborator':
    case 'multipleCollaborators':
    case 'barcode':
    case 'duration':
    case 'createdBy':
    case 'lastModifiedBy':
    case 'externalSyncSource':
    case 'rollup':
      break;

    case 'multipleAttachments':
      restAPIModelImportsCollector.push(
        `import {AirtableAttachmentModel} from '../__Utils/RestAPIModels';`
      );
      return `
        ${modelFieldDecorators}
        public ${camelCasePropertyName}?: AirtableAttachmentModel[]
      `.trimIndent();

    case 'button':
      restAPIModelImportsCollector.push(
        `import {AirtableButtonModel} from '../__Utils/RestAPIModels';`
      );
      return `
        ${modelFieldDecorators}
        public ${camelCasePropertyName}?: AirtableButtonModel
      `.trimIndent();

    case 'formula':
      restAPIModelImportsCollector.push(
        `import {AirtableFormulaColumnErrorModel} from '../__Utils/RestAPIModels';`
      );
      return `${getObjectModelPropertyTypeString(
        {
          ...tableColumn,
          type: tableColumn.options?.result?.type,
        },
        options
      )} | AirtableFormulaColumnErrorModel`;

    // case 'rollup':
    //   return getObjectModelPropertyTypeString( // This is problematic, sometimes airtable lies about the result type
    //     {
    //       ...tableColumn,
    //       type: tableColumn.options?.result?.type,
    //     },
    //     options
    //   );

    // Lists
    case 'multipleRecordLinks': {
      const modelClassName =
        camelCasePropertyName.charAt(0).toUpperCase() +
        camelCasePropertyName.slice(1);
      const modelClassString = `export class ${modelClassName} {
        @Title('id')
        @Description('Unique identifer for ${tableColumn.name}')
        @Example('recO0FYb1Tccm9MZ2')
        @Property()
        @Optional()
        public id!: string;

        ${lookupTableColumns
          .filter((lookupTableColumn) => {
            return (
              lookupTableColumn.options?.recordLinkFieldId === tableColumn.id
            );
          })
          .reduce((accumulator, lookupTableColumn) => {
            if (
              !accumulator.find(({ name }) => name === lookupTableColumn.name)
            ) {
              accumulator.push(lookupTableColumn);
            }
            return accumulator;
          }, [] as typeof lookupTableColumns)
          .map((lookupTableColumn) => {
            return getObjectModelPropertyTypeString(lookupTableColumn, options);
          })
          .join(';\n\n')}
      }`;

      restAPIModelExtrasCollector.push(modelClassString);

      if (tableColumn.options?.prefersSingleRecordLink) {
        return `
          ${modelFieldDecorators}
          public ${camelCasePropertyName}?: ${modelClassName}
        `.trimIndent();
      }
      return `
        ${modelFieldDecorators}
        public ${camelCasePropertyName}?: ${modelClassName}[]
      `.trimIndent();
    }
    case 'lookup':
    case 'multipleLookupValues':
      const propertyTypeString = (() => {
        if (rootField !== tableColumn) {
          if (rootField.type === 'multipleRecordLinks') {
            return `
              ${modelFieldDecorators}
              public ${camelCasePropertyName}?: string
            `.trimIndent();
          }
          return getObjectModelPropertyTypeString(rootField, options);
        }
        return getObjectModelPropertyTypeString(
          {
            ...tableColumn,
            type: tableColumn.options?.result?.type,
          },
          options
        );
      })();
      const parentTableColumn = currentTable.fields.find(
        ({ id }) => id === tableColumn.options?.recordLinkFieldId
      );
      return `${propertyTypeString}${
        !propertyTypeString.match(/\[\]$/g) &&
        !parentTableColumn?.options?.prefersSingleRecordLink
          ? '[]'
          : ''
      }`;

    // Numbers
    case 'number':
    case 'percent':
    case 'currency':
    case 'count':
    case 'autoNumber':
    case 'rating':
      return `
        ${modelFieldDecorators}
        public ${camelCasePropertyName}?: number
      `.trimIndent();

    // Booleans
    case 'checkbox':
      return `
        ${modelFieldDecorators}
        public ${camelCasePropertyName}?: boolean
      `.trimIndent();

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
      return `
        ${modelFieldDecorators}
        public ${camelCasePropertyName}?: string
      `.trimIndent();
  }
  return `
    ${modelFieldDecorators}
    public ${camelCasePropertyName}?: any
  `.trimIndent();
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
    case 'multipleRecordLinks': {
      const validationString = `z.object({\nid: z.string()\n})`;
      if (field.options?.prefersSingleRecordLink) {
        return validationString;
      }
      return `z.array(${validationString})`;
    }
    case 'lookup':
    case 'multipleLookupValues':
      const propertyTypeString = (() => {
        if (rootField !== field) {
          if (rootField.type === 'multipleRecordLinks') {
            return `z.string()`;
          }
          return getRequestObjectValidationString(rootField, {
            ...options,
          });
        }
        return getRequestObjectValidationString(
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
