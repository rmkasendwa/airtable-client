import { AirtableField, Table } from '../../models';

export const getExpandedAirtableLookupColumn = (
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
                  return linkedField;
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

export type TableColumnValidationSchemaTypeStringGroup = {
  airtableResponseValidationString: string;
  objectPropetyTypeString: string;
  objectModelPropertyTypeString: string;
  requestObjectPropertyTypeValidationString?: string;
};

export type GetTableColumnValidationSchemaTypeStringsOptions = {
  currentTable: Table;
  tables: Table[];
  lookupColumnNameToObjectPropertyMapper: Record<string, string>;
  lookupTableColumns: AirtableField[];
  restAPIModelImportsCollector: string[];
  restAPIModelExtrasCollector: string[];
  camelCasePropertyName: string;
  airtableAPIModelImportsCollector: string[];
};

export const getTableColumnValidationSchemaTypeStrings = (
  tableColumn: AirtableField,
  options: GetTableColumnValidationSchemaTypeStringsOptions
): TableColumnValidationSchemaTypeStringGroup => {
  const {
    tables,
    currentTable,
    lookupTableColumns,
    lookupColumnNameToObjectPropertyMapper,
    airtableAPIModelImportsCollector,
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

    case 'multipleAttachments': {
      airtableAPIModelImportsCollector.push(
        `import {AirtableAttachmentValidationSchema, AirtableAttachment} from '../__Utils';`
      );
      restAPIModelImportsCollector.push(
        `import {AirtableAttachmentModel} from '../__Utils/RestAPIModels';`
      );

      const airtableResponseValidationString = `z.array(AirtableAttachmentValidationSchema)`;
      const objectPropetyTypeString = `AirtableAttachment[]`;
      const objectModelPropertyTypeString = `
        ${modelFieldDecorators}
        public ${camelCasePropertyName}?: AirtableAttachmentModel[]
      `.trimIndent();

      return {
        airtableResponseValidationString,
        objectPropetyTypeString,
        objectModelPropertyTypeString,
      };
    }

    case 'button': {
      airtableAPIModelImportsCollector.push(
        `import {AirtableButton, AirtableButtonValidationSchema} from '../__Utils';`
      );
      restAPIModelImportsCollector.push(
        `import {AirtableButtonModel} from '../__Utils/RestAPIModels';`
      );

      const airtableResponseValidationString = `AirtableButtonValidationSchema`;
      const objectPropetyTypeString = `AirtableButton`;
      const objectModelPropertyTypeString = `
        ${modelFieldDecorators}
        public ${camelCasePropertyName}?: AirtableButtonModel
      `.trimIndent();

      return {
        airtableResponseValidationString,
        objectPropetyTypeString,
        objectModelPropertyTypeString,
      };
    }

    case 'formula': {
      airtableAPIModelImportsCollector.push(
        `import {AirtableFormulaColumnError, AirtableFormulaColumnErrorValidationSchema} from '../__Utils';`
      );
      restAPIModelImportsCollector.push(
        `import {AirtableFormulaColumnErrorModel} from '../__Utils/RestAPIModels';`
      );

      const {
        airtableResponseValidationString: baseAirtableResponseValidationString,
        objectPropetyTypeString: baseObjectPropetyTypeString,
        objectModelPropertyTypeString: baseObjectModelPropertyTypeString,
      } = getTableColumnValidationSchemaTypeStrings(
        {
          ...tableColumn,
          type: tableColumn.options?.result?.type,
        },
        options
      );

      const airtableResponseValidationString: string = `z.union([${baseAirtableResponseValidationString}, AirtableFormulaColumnErrorValidationSchema])`;
      const objectPropetyTypeString: string = `${baseObjectPropetyTypeString} | AirtableFormulaColumnError`;
      const objectModelPropertyTypeString = `${baseObjectModelPropertyTypeString} | AirtableFormulaColumnErrorModel`;

      return {
        airtableResponseValidationString,
        objectPropetyTypeString,
        objectModelPropertyTypeString,
      };
    }

    // Dates
    case 'date':
    case 'dateTime':
    case 'lastModifiedTime':
    case 'createdTime': {
      const airtableResponseValidationString = `z.string()`;
      const objectPropetyTypeString = `string`;
      const objectModelPropertyTypeString = `
        ${modelFieldDecorators}
        public ${camelCasePropertyName}?: string
      `.trimIndent();

      return {
        airtableResponseValidationString,
        objectPropetyTypeString,
        objectModelPropertyTypeString,
        requestObjectPropertyTypeValidationString:
          airtableResponseValidationString,
      };
    }

    // Lists
    case 'multipleRecordLinks': {
      const airtableResponseValidationString = `z.array(z.string())`;
      const objectPropetyTypeString = (() => {
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
              }: ${
                getTableColumnValidationSchemaTypeStrings(
                  lookupTableColumn,
                  options
                ).objectPropetyTypeString
              }`;
            })
            .join(';')}
        }`;
        if (tableColumn.options?.prefersSingleRecordLink) {
          return typeString;
        }
        return `${typeString}[]`;
      })();
      const objectModelPropertyTypeString = (() => {
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
  
          ${[
            ...new Set(
              lookupTableColumns
                .filter((lookupTableColumn) => {
                  return (
                    lookupTableColumn.options?.recordLinkFieldId ===
                    tableColumn.id
                  );
                })
                .map((lookupTableColumn) => {
                  return getTableColumnValidationSchemaTypeStrings(
                    lookupTableColumn,
                    {
                      ...options,
                      camelCasePropertyName:
                        lookupColumnNameToObjectPropertyMapper[
                          lookupTableColumn.name
                        ],
                    }
                  ).objectModelPropertyTypeString;
                })
            ),
          ].join(';\n\n')}
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
      })();
      const requestObjectPropertyTypeValidationString = (() => {
        const validationString = `z.object({\nid: z.string()\n})`;
        if (tableColumn.options?.prefersSingleRecordLink) {
          return validationString;
        }
        return `z.array(${validationString})`;
      })();

      return {
        airtableResponseValidationString,
        objectPropetyTypeString,
        objectModelPropertyTypeString,
        requestObjectPropertyTypeValidationString,
      };
    }

    case 'lookup':
    case 'multipleLookupValues': {
      const validationString = (() => {
        if (rootField !== tableColumn) {
          if (rootField.type === 'multipleRecordLinks') {
            return `z.string()`;
          }
          return getTableColumnValidationSchemaTypeStrings(rootField, options)
            .airtableResponseValidationString;
        }
        return getTableColumnValidationSchemaTypeStrings(
          {
            ...tableColumn,
            type: tableColumn.options?.result?.type,
          },
          options
        ).airtableResponseValidationString;
      })();

      const {
        objectPropetyTypeString: baseObjectPropetyTypeString,
        objectModelPropertyTypeString: baseObjectModelPropertyTypeString,
      } = (() => {
        if (rootField !== tableColumn) {
          if (rootField.type === 'multipleRecordLinks') {
            return {
              objectPropetyTypeString: `string`,
              objectModelPropertyTypeString: `
                ${modelFieldDecorators}
                public ${camelCasePropertyName}?: string
              `.trimIndent(),
            };
          }
          return getTableColumnValidationSchemaTypeStrings(rootField, options);
        }
        return getTableColumnValidationSchemaTypeStrings(
          {
            ...tableColumn,
            type: tableColumn.options?.result?.type,
          },
          options
        );
      })();

      const shouldFlattenLookupField = (
        lookupTableColumn: typeof tableColumn,
        lookupTable: typeof currentTable
      ): boolean => {
        const referenceTableColumn = lookupTable.fields.find(
          ({ id }) => id === lookupTableColumn.options?.recordLinkFieldId
        );
        const tablecolumnOneLevelUp = getExpandedAirtableLookupColumn(
          lookupTableColumn,
          tables,
          lookupTable
        );

        if (
          referenceTableColumn?.options?.prefersSingleRecordLink &&
          tablecolumnOneLevelUp.type === 'multipleLookupValues'
        ) {
          return shouldFlattenLookupField(
            tablecolumnOneLevelUp,
            tables.find(
              ({ id }) => id === referenceTableColumn.options?.linkedTableId
            )!
          );
        }

        return Boolean(
          referenceTableColumn?.options?.prefersSingleRecordLink &&
            !(
              [
                'multipleLookupValues',
                'multipleSelects',
              ] as typeof tablecolumnOneLevelUp.type[]
            ).includes(tablecolumnOneLevelUp.type)
        );
      };

      const flattenLookupField = shouldFlattenLookupField(
        tableColumn,
        currentTable
      );

      const airtableResponseValidationString: string = `z.array(${validationString}.nullish())`;
      const objectPropetyTypeString = `${baseObjectPropetyTypeString}${
        !baseObjectPropetyTypeString.match(/\[\]$/g) && !flattenLookupField
          ? '[]'
          : ''
      }`;
      const objectModelPropertyTypeString = `${baseObjectModelPropertyTypeString}${
        !baseObjectModelPropertyTypeString.match(/\[\]$/g) &&
        !flattenLookupField
          ? '[]'
          : ''
      }`;

      return {
        airtableResponseValidationString,
        objectPropetyTypeString,
        objectModelPropertyTypeString,
      };
    }

    // Numbers
    case 'number':
    case 'percent':
    case 'currency':
    case 'count':
    case 'autoNumber':
    case 'rating': {
      const airtableResponseValidationString = `z.number()`;
      const objectPropetyTypeString = `number`;
      const objectModelPropertyTypeString = `
        ${modelFieldDecorators}
        public ${camelCasePropertyName}?: number
      `.trimIndent();

      return {
        airtableResponseValidationString,
        objectPropetyTypeString,
        objectModelPropertyTypeString,
        requestObjectPropertyTypeValidationString:
          airtableResponseValidationString,
      };
    }

    // Booleans
    case 'checkbox': {
      const airtableResponseValidationString = `z.boolean()`;
      const objectPropetyTypeString = `boolean`;
      const objectModelPropertyTypeString = `
        ${modelFieldDecorators}
        public ${camelCasePropertyName}?: boolean
      `.trimIndent();

      return {
        airtableResponseValidationString,
        objectPropetyTypeString,
        objectModelPropertyTypeString,
        requestObjectPropertyTypeValidationString:
          airtableResponseValidationString,
      };
    }

    // Special text
    case 'email': {
      const airtableResponseValidationString = `z.string().email()`;
      const objectPropetyTypeString = `string`;
      const objectModelPropertyTypeString = `
        ${modelFieldDecorators}
        public ${camelCasePropertyName}?: string
      `.trimIndent();

      return {
        airtableResponseValidationString,
        objectPropetyTypeString,
        objectModelPropertyTypeString,
        requestObjectPropertyTypeValidationString:
          airtableResponseValidationString,
      };
    }

    case 'url': {
      const airtableResponseValidationString = `z.string().url()`;
      const objectPropetyTypeString = `string`;
      const objectModelPropertyTypeString = `
        ${modelFieldDecorators}
        public ${camelCasePropertyName}?: string
      `.trimIndent();

      return {
        airtableResponseValidationString,
        objectPropetyTypeString,
        objectModelPropertyTypeString,
        requestObjectPropertyTypeValidationString:
          airtableResponseValidationString,
      };
    }

    // Regular text
    case 'singleLineText':
    case 'multilineText':
    case 'richText':
    case 'phoneNumber':
    case 'singleSelect': {
      const airtableResponseValidationString = `z.string()`;
      const objectPropetyTypeString = `string`;
      const objectModelPropertyTypeString = `
        ${modelFieldDecorators}
        public ${camelCasePropertyName}?: string
      `.trimIndent();

      return {
        airtableResponseValidationString,
        objectPropetyTypeString,
        objectModelPropertyTypeString,
        requestObjectPropertyTypeValidationString:
          airtableResponseValidationString,
      };
    }
  }
  return {
    airtableResponseValidationString: `z.any()`,
    objectPropetyTypeString: `any`,
    objectModelPropertyTypeString: `
      ${modelFieldDecorators}
      public ${camelCasePropertyName}?: any
    `.trimIndent(),
  };
};
