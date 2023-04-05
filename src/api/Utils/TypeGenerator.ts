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
      return '"string"';
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

export type ObjectModelProperty = {
  propertyName: string;
  propertyType: string;
  decorators: string[];
  accessModifier: 'public' | 'private' | 'protected';
  required?: boolean;
  typeDefinitionSnippet?: string;
};

export type ModelClass = {
  modelName: string;
  modelProperties: ObjectModelProperty[];
};

export type TableColumnValidationSchemaTypeStringGroup = {
  airtableResponseValidationString: string;
  objectModelPropertyType: ObjectModelProperty;
  requestObjectPropertyTypeValidationString?: string;
};

export type GetTableColumnValidationSchemaTypeStringsOptions = {
  currentTable: Table;
  tables: Table[];
  nonLookupColumnNameToObjectPropertyMapper: Record<
    string,
    DetailedColumnNameToObjectPropertyMapping
  >;
  lookupColumnNameToObjectPropertyMapper: Record<
    string,
    DetailedColumnNameToObjectPropertyMapping
  >;
  lookupTableColumns: AirtableField[];
  restAPIModelImportsCollector: string[];
  restAPIModelExtrasCollector: ModelClass[];
  airtableAPIModelImportsCollector: string[];
  tableLabelSingular: string;
  camelCasePropertyName?: string;
};

export const getTableColumnValidationSchemaTypeStrings = (
  tableColumn: AirtableField,
  options: GetTableColumnValidationSchemaTypeStringsOptions
): TableColumnValidationSchemaTypeStringGroup => {
  const {
    tables,
    currentTable,
    lookupTableColumns,
    nonLookupColumnNameToObjectPropertyMapper,
    lookupColumnNameToObjectPropertyMapper,
    airtableAPIModelImportsCollector,
    restAPIModelExtrasCollector,
    tableLabelSingular,
  } = options;

  let { camelCasePropertyName } = options;

  const columnToObjectPropertyMapper = {
    ...nonLookupColumnNameToObjectPropertyMapper,
    ...lookupColumnNameToObjectPropertyMapper,
  };

  camelCasePropertyName ||
    (camelCasePropertyName =
      columnToObjectPropertyMapper[tableColumn.name].propertyName);

  const rootField = getRootAirtableColumn(tableColumn, tables, currentTable);

  const { type, options: tableColumnOptions } = tableColumn;
  const {
    type: userDefinedType,
    prefersSingleRecordLink,
    isLookupWithListOfValues,
  } = {
    ...nonLookupColumnNameToObjectPropertyMapper,
    ...lookupColumnNameToObjectPropertyMapper,
  }[tableColumn.name] || {};

  switch (type) {
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
        `import {AirtableAttachmentValidationSchema, AirtableAttachment} from './__Utils';`
      );

      const airtableResponseValidationString = `z.array(AirtableAttachmentValidationSchema)`;
      const objectModelPropertyType: ObjectModelProperty = {
        propertyName: camelCasePropertyName,
        propertyType: `AirtableAttachment[]`,
        accessModifier: 'public',
        decorators: ['@Property()', '@ArrayOf(AirtableAttachment)'],
        required: false,
      };

      return {
        airtableResponseValidationString,
        objectModelPropertyType,
      };
    }

    case 'button': {
      airtableAPIModelImportsCollector.push(
        `import {AirtableButton, AirtableButtonValidationSchema} from './__Utils';`
      );

      const airtableResponseValidationString = `AirtableButtonValidationSchema`;
      const objectModelPropertyType: ObjectModelProperty = {
        propertyName: camelCasePropertyName,
        propertyType: `AirtableButton`,
        accessModifier: 'public',
        decorators: ['@Property()'],
        required: false,
      };

      return {
        airtableResponseValidationString,
        objectModelPropertyType,
      };
    }

    case 'formula': {
      airtableAPIModelImportsCollector.push(
        `import {AirtableFormulaColumnErrorValidationSchema} from './__Utils';`
      );

      const {
        airtableResponseValidationString: baseAirtableResponseValidationString,
        objectModelPropertyType: baseObjectModelPropertyType,
      } = getTableColumnValidationSchemaTypeStrings(
        {
          ...tableColumn,
          type: tableColumn.options?.result?.type,
        },
        { ...options, camelCasePropertyName }
      );

      const airtableResponseValidationString: string = `z.union([${baseAirtableResponseValidationString}, AirtableFormulaColumnErrorValidationSchema])`;
      const objectModelPropertyType: ObjectModelProperty = {
        ...baseObjectModelPropertyType,
        propertyType: `${baseObjectModelPropertyType.propertyType}`,
      };

      return {
        airtableResponseValidationString,
        objectModelPropertyType,
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
            { ...options, camelCasePropertyName }
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
      const objectModelPropertyType: ObjectModelProperty = {
        propertyName: camelCasePropertyName,
        propertyType: `string`,
        accessModifier: 'public',
        decorators: ['@Property()', `@Example('2023-01-05T19:00:44.544Z')`],
        required: false,
      };
      return {
        airtableResponseValidationString,
        objectModelPropertyType,
        requestObjectPropertyTypeValidationString:
          airtableResponseValidationString,
      };
    }

    // Lists
    case 'multipleRecordLinks': {
      const airtableResponseValidationString = `z.array(z.string())`;
      const objectModelPropertyType: ObjectModelProperty = (() => {
        const modelClassName =
          tableLabelSingular.toPascalCase() +
          camelCasePropertyName.charAt(0).toUpperCase() +
          camelCasePropertyName.slice(1);

        const modelClass: ModelClass = {
          modelName: modelClassName,
          modelProperties: [
            {
              accessModifier: 'public',
              decorators: [
                '@Property()',
                '@Required()',
                `@Description('Unique identifer for ${tableColumn.name}')`,
                `@Example('recO0FYb1Tccm9MZ2')`,
              ],
              propertyName: 'id',
              propertyType: 'string',
              required: true,
            },
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
                    options
                  ).objectModelPropertyType;
                })
            ),
          ],
        };

        restAPIModelExtrasCollector.push(modelClass);

        if (
          prefersSingleRecordLink ||
          tableColumn.options?.prefersSingleRecordLink
        ) {
          return {
            propertyName: camelCasePropertyName,
            propertyType: modelClassName,
            accessModifier: 'public',
            decorators: ['@Property()'],
          };
        }
        return {
          propertyName: camelCasePropertyName,
          propertyType: `${modelClassName}[]`,
          accessModifier: 'public',
          decorators: ['@Property()', `@ArrayOf(${modelClassName})`],
        };
      })();
      const requestObjectPropertyTypeValidationString = (() => {
        const validationString = `z.object({\nid: z.string()\n})`;
        if (
          prefersSingleRecordLink ||
          tableColumn.options?.prefersSingleRecordLink
        ) {
          return validationString;
        }
        return `z.array(${validationString})`;
      })();

      return {
        airtableResponseValidationString,
        objectModelPropertyType,
        requestObjectPropertyTypeValidationString,
      };
    }

    case 'lookup':
    case 'multipleLookupValues': {
      const baseType = userDefinedType || 'string';
      const {
        objectModelPropertyType: baseObjectModelPropertyType,
        airtableResponseValidationString: baseAirtableResponseValidationString,
      } = (() => {
        if (rootField !== tableColumn) {
          if (rootField.type === 'multipleRecordLinks') {
            return {
              airtableResponseValidationString: `z.string()`,
              objectModelPropertyType: {
                accessModifier: 'public',
                decorators: [
                  `@Example(${getModelPropertyExampleString(baseType)})`,
                ],
                propertyName: camelCasePropertyName,
                propertyType: baseType,
              } as ObjectModelProperty,
            };
          }
          return getTableColumnValidationSchemaTypeStrings(rootField, {
            ...options,
            camelCasePropertyName,
          });
        }
        return getTableColumnValidationSchemaTypeStrings(
          {
            ...tableColumn,
            type: tableColumn.options?.result?.type,
          },
          { ...options, camelCasePropertyName }
        );
      })();

      const airtableResponseValidationString: string = (() => {
        if (!baseAirtableResponseValidationString.match(/^z\.array/g)) {
          return `z.array(${baseAirtableResponseValidationString})`;
        }
        return baseAirtableResponseValidationString;
      })();
      const objectModelPropertyType = ((): ObjectModelProperty => {
        if (
          !baseObjectModelPropertyType.propertyName.match(/\[\]$/g) &&
          isLookupWithListOfValues
        ) {
          baseObjectModelPropertyType.decorators.push(`@ArrayOf(String)`);
          baseObjectModelPropertyType.decorators.forEach((decorator, index) => {
            if (decorator.match(/\@Example\((.+?)\)/g)) {
              baseObjectModelPropertyType.decorators[index] = decorator.replace(
                /\@Example\((.+?)\)/g,
                (_, baseExample) => {
                  return `@Example([${baseExample}])`;
                }
              );
            }
          });
          return {
            ...baseObjectModelPropertyType,
            propertyType: `(${baseObjectModelPropertyType.propertyType})[]`,
          };
        }
        return {
          ...baseObjectModelPropertyType,
          propertyType: `(${baseObjectModelPropertyType.propertyType})`,
        };
      })();

      return {
        airtableResponseValidationString,
        objectModelPropertyType,
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
      const objectModelPropertyType: ObjectModelProperty = {
        propertyName: camelCasePropertyName,
        propertyType: baseType,
        accessModifier: 'public',
        decorators: [
          '@Property()',
          `@Example(${getModelPropertyExampleString(
            userDefinedType || 'number'
          )})`,
        ],
      };

      return {
        airtableResponseValidationString,
        objectModelPropertyType,
        requestObjectPropertyTypeValidationString:
          airtableResponseValidationString,
      };
    }

    // Booleans
    case 'checkbox': {
      const baseType = userDefinedType || 'boolean';
      const airtableResponseValidationString = `z.boolean()`;
      const objectModelPropertyType: ObjectModelProperty = {
        propertyName: camelCasePropertyName,
        propertyType: baseType,
        accessModifier: 'public',
        decorators: [
          '@Property()',
          `@Example(${getModelPropertyExampleString(
            userDefinedType || 'boolean'
          )})`,
        ],
      };

      return {
        airtableResponseValidationString,
        objectModelPropertyType,
        requestObjectPropertyTypeValidationString:
          airtableResponseValidationString,
      };
    }

    // Special text
    case 'email': {
      const baseType = userDefinedType || 'string';
      const airtableResponseValidationString = `z.string().trim().email()`;
      const objectModelPropertyType: ObjectModelProperty = {
        propertyName: camelCasePropertyName,
        propertyType: baseType,
        accessModifier: 'public',
        decorators: [
          '@Property()',
          `@Example(${getModelPropertyExampleString(
            userDefinedType || 'email'
          )})`,
        ],
      };

      return {
        airtableResponseValidationString,
        objectModelPropertyType,
        requestObjectPropertyTypeValidationString:
          airtableResponseValidationString,
      };
    }

    case 'url': {
      const baseType = userDefinedType || 'string';
      const airtableResponseValidationString = `z.string().trim().url()`;
      const objectModelPropertyType: ObjectModelProperty = {
        propertyName: camelCasePropertyName,
        propertyType: baseType,
        accessModifier: 'public',
        decorators: [
          '@Property()',
          `@Example(${getModelPropertyExampleString(
            userDefinedType || 'url'
          )})`,
        ],
      };

      return {
        airtableResponseValidationString,
        objectModelPropertyType,
        requestObjectPropertyTypeValidationString:
          airtableResponseValidationString,
      };
    }

    // Regular text
    case 'singleLineText':
    case 'multilineText':
    case 'richText':
    case 'phoneNumber': {
      const baseType = userDefinedType || 'string';
      const airtableResponseValidationString = `z.string()`;
      const objectModelPropertyType: ObjectModelProperty = {
        propertyName: camelCasePropertyName,
        propertyType: baseType,
        accessModifier: 'public',
        decorators: [
          '@Property()',
          `@Example(${getModelPropertyExampleString(baseType)})`,
        ],
      };

      return {
        airtableResponseValidationString,
        objectModelPropertyType,
        requestObjectPropertyTypeValidationString:
          airtableResponseValidationString,
      };
    }
    case 'singleSelect':
    case 'multipleSelects': {
      const enumValuesVariableName =
        tableLabelSingular.toCamelCase() +
        camelCasePropertyName.charAt(0).toUpperCase() +
        camelCasePropertyName.slice(1) +
        'Options';

      const enumTypeName =
        tableLabelSingular.toPascalCase() +
        camelCasePropertyName.charAt(0).toUpperCase() +
        camelCasePropertyName.slice(1) +
        'Option';

      const enumValues = (() => {
        if (tableColumnOptions?.choices) {
          return tableColumnOptions.choices.map(({ name }) => {
            return `"${name}"`;
          });
        }
        return [`"A"`];
      })();

      const enumValuesCode = `
        export const ${enumValuesVariableName} = [${enumValues.join(
        ', '
      )}] as const;
        export type ${enumTypeName} = (typeof ${enumValuesVariableName})[number];
      `;

      const baseType =
        userDefinedType ||
        (() => {
          switch (type) {
            case 'multipleSelects':
              return `${enumTypeName}[]`;
            case 'singleSelect':
            default:
              return enumTypeName;
          }
        })();
      const airtableResponseValidationString = (() => {
        switch (type) {
          case 'multipleSelects':
            return `z.enum(${enumValuesVariableName})`;
          case 'singleSelect':
          default:
            return `z.array(z.enum(${enumValuesVariableName}))`;
        }
      })();
      const objectModelPropertyType: ObjectModelProperty = {
        propertyName: camelCasePropertyName,
        propertyType: baseType,
        accessModifier: 'public',
        decorators: ['@Property()', `@Enum(...${enumValuesVariableName})`],
        typeDefinitionSnippet: enumValuesCode,
      };

      return {
        airtableResponseValidationString,
        objectModelPropertyType,
        requestObjectPropertyTypeValidationString:
          airtableResponseValidationString,
      };
    }
  }
  const baseType = userDefinedType || 'any';
  return {
    airtableResponseValidationString: `z.any()`,
    objectModelPropertyType: {
      propertyName: camelCasePropertyName,
      propertyType: baseType,
      accessModifier: 'public',
      decorators: ['@Property()'],
    },
  };
};
