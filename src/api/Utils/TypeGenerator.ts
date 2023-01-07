import {
  AirtableField,
  DetailedColumnNameToObjectPropertyMapping,
  Table,
} from '../../models';

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

export const getModelPropertyExampleString = (type: string) => {
  switch (type) {
    case 'boolean':
      return 'true';
    case 'number':
      return '0';
    case 'string':
      return '"String"';
    case 'email':
      return '"me@example.com"';
    case 'url':
      return '"https://example.com"';
  }
  if (type.endsWith('[]')) {
    return '[]';
  }
  return '""';
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
  columnNameToObjectPropertyMapper: Record<
    string,
    DetailedColumnNameToObjectPropertyMapping
  >;
  lookupColumnNameToObjectPropertyMapper: Record<
    string,
    DetailedColumnNameToObjectPropertyMapping
  >;
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
    columnNameToObjectPropertyMapper,
    lookupColumnNameToObjectPropertyMapper,
    airtableAPIModelImportsCollector,
    restAPIModelImportsCollector,
    restAPIModelExtrasCollector,
    camelCasePropertyName,
  } = options;

  const rootField = getRootAirtableColumn(tableColumn, tables, currentTable);

  const { type } = tableColumn;
  const { type: userDefinedType, prefersSingleRecordLink } =
    {
      ...columnNameToObjectPropertyMapper,
      ...lookupColumnNameToObjectPropertyMapper,
    }[tableColumn.name] || {};

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
        @Property()
        @Optional()
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
        @Property()
        @Optional()
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

    case 'rollup':
      {
        if (
          tableColumn.options?.result?.type &&
          [
            'number',
            'percent',
            'currency',
            'count',
            'autoNumber',
            'rating',
          ].includes(tableColumn.options?.result?.type)
        ) {
          return getTableColumnValidationSchemaTypeStrings(
            {
              ...tableColumn,
              type: tableColumn.options?.result?.type,
            },
            options
          );
        }
      }
      break;

    // Dates
    case 'date':
    case 'dateTime':
    case 'lastModifiedTime':
    case 'createdTime': {
      const airtableResponseValidationString = `z.string()`;
      const objectPropetyTypeString = `string`;
      const objectModelPropertyTypeString = `
        @Property()
        @Example('2023-01-05T19:00:44.544Z')
        @Optional()
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
                  .propertyName
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
                        ].propertyName,
                    }
                  ).objectModelPropertyTypeString;
                })
            ),
          ].join(';\n\n')}
        }`;

        restAPIModelExtrasCollector.push(modelClassString);

        if (tableColumn.options?.prefersSingleRecordLink) {
          return `
            @Property()
            @Optional()
            public ${camelCasePropertyName}?: ${modelClassName}
          `.trimIndent();
        }
        return `
          @Property()
          @Optional()
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
      const baseType = userDefinedType || 'string';
      const {
        objectPropetyTypeString: baseObjectPropetyTypeString,
        objectModelPropertyTypeString: baseObjectModelPropertyTypeString,
        airtableResponseValidationString: baseAirtableResponseValidationString,
      } = (() => {
        if (rootField !== tableColumn) {
          if (rootField.type === 'multipleRecordLinks') {
            return {
              airtableResponseValidationString: `z.string()`,
              objectPropetyTypeString: baseType,
              objectModelPropertyTypeString: `
                @Property()
                @Example(${getModelPropertyExampleString(baseType)})
                @Optional()
                public ${camelCasePropertyName}?: ${baseType}
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

      const airtableResponseValidationString: string = `z.array(${baseAirtableResponseValidationString}.nullish())`;
      const objectPropetyTypeString = (() => {
        if (
          !baseObjectPropetyTypeString.match(/\[\]$/g) &&
          !prefersSingleRecordLink
        ) {
          return `(${baseObjectPropetyTypeString})[]`;
        }
        return `(${baseObjectPropetyTypeString})`;
      })();
      const objectModelPropertyTypeString = (() => {
        if (
          !baseObjectModelPropertyTypeString.match(/\[\]$/g) &&
          !prefersSingleRecordLink
        ) {
          return (
            baseObjectModelPropertyTypeString
              .trim()
              .replace(/\:\s*(.+?)$/g, (_, propertyTypeString) => {
                return `: (${propertyTypeString})`;
              })
              .replace(/\@Example\((.+?)\)/g, (_, baseExample) => {
                return `@Example([${baseExample}])`;
              }) + '[]'
          );
        }
        return baseObjectModelPropertyTypeString
          .trim()
          .replace(/\:\s*(.+?)$/g, (_, propertyTypeString) => {
            return `: (${propertyTypeString})`;
          });
      })();

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
      const baseType = userDefinedType || 'number';
      const airtableResponseValidationString = `z.number()`;
      const objectPropetyTypeString = baseType;
      const objectModelPropertyTypeString = `
        @Property()
        @Example(${getModelPropertyExampleString(userDefinedType || 'number')})
        @Optional()
        public ${camelCasePropertyName}?: ${baseType}
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
      const baseType = userDefinedType || 'boolean';
      const airtableResponseValidationString = `z.boolean()`;
      const objectPropetyTypeString = baseType;
      const objectModelPropertyTypeString = `
        @Property()
        @Example(${getModelPropertyExampleString(userDefinedType || 'boolean')})
        @Optional()
        public ${camelCasePropertyName}?: ${baseType}
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
      const baseType = userDefinedType || 'string';
      const airtableResponseValidationString = `z.string().email()`;
      const objectPropetyTypeString = baseType;
      const objectModelPropertyTypeString = `
        @Property()
        @Example(${getModelPropertyExampleString(userDefinedType || 'email')})
        @Optional()
        public ${camelCasePropertyName}?: ${baseType}
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
      const baseType = userDefinedType || 'string';
      const airtableResponseValidationString = `z.string().url()`;
      const objectPropetyTypeString = baseType;
      const objectModelPropertyTypeString = `
        @Property()
        @Example(${getModelPropertyExampleString(userDefinedType || 'url')})
        @Optional()
        public ${camelCasePropertyName}?: ${baseType}
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
      const baseType = userDefinedType || 'string';
      const airtableResponseValidationString = `z.string()`;
      const objectPropetyTypeString = baseType;
      const objectModelPropertyTypeString = `
        @Property()
        @Example(${getModelPropertyExampleString(baseType)})
        @Optional()
        public ${camelCasePropertyName}?: ${baseType}
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
  const baseType = userDefinedType || 'any';
  return {
    airtableResponseValidationString: `z.any()`,
    objectPropetyTypeString: baseType,
    objectModelPropertyTypeString: `
      @Property()
      @Optional()
      public ${camelCasePropertyName}?: ${baseType}
    `.trimIndent(),
  };
};
