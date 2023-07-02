import pluralize from 'pluralize';

import {
  AirtableField,
  DetailedColumnNameToObjectPropertyMapping,
  Table,
} from '../../models';

//#region getExpandedAirtableLookupColumn
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
//#endregion

//#region getRootAirtableColumn
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
//#endregion

//#region getModelPropertyExampleString
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
//#endregion

//#region getTableColumnValidationSchemaTypeStrings
export type ObjectModelProperty = {
  propertyName: string;
  propertyType: string;
  editablePropertyType?: string;
  decorators: string[];
  accessModifier: 'public' | 'private' | 'protected';
  required?: boolean;
  typeDefinitionSnippet?: string;
  airtableResponseValidationString: string;
  requestObjectPropertyTypeValidationString?: string;
  tableColumName: string;
};

export type ModelClass = {
  modelName: string;
  modelProperties: ObjectModelProperty[];
  tableColumName: string;
};

export type TableColumnValidationSchemaTypeStringGroup = ObjectModelProperty;

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
  camelCaseParentPropertyName?: string;
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
    camelCaseParentPropertyName,
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
    editable,
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
        `import {AirtableAttachmentValidationSchema, AirtableAttachment} from './Utils';`
      );

      return {
        propertyName: camelCasePropertyName,
        propertyType: `AirtableAttachment[]`,
        accessModifier: 'public',
        decorators: ['@Property()', '@ArrayOf(AirtableAttachment)'],
        required: false,
        airtableResponseValidationString: `z.array(AirtableAttachmentValidationSchema)`,
        tableColumName: tableColumn.name,
      };
    }

    case 'button': {
      airtableAPIModelImportsCollector.push(
        `import {AirtableButton, AirtableButtonValidationSchema} from './Utils';`
      );

      return {
        propertyName: camelCasePropertyName,
        propertyType: `AirtableButton`,
        accessModifier: 'public',
        decorators: ['@Property()'],
        required: false,
        airtableResponseValidationString: `AirtableButtonValidationSchema`,
        tableColumName: tableColumn.name,
      };
    }

    case 'formula': {
      airtableAPIModelImportsCollector.push(
        `import {AirtableFormulaColumnErrorValidationSchema} from './Utils';`
      );

      const {
        airtableResponseValidationString: baseAirtableResponseValidationString,
        ...baseObjectModelPropertyType
      } = getTableColumnValidationSchemaTypeStrings(
        {
          ...tableColumn,
          type: tableColumn.options?.result?.type,
        },
        { ...options, camelCasePropertyName }
      );

      const airtableResponseValidationString: string = `z.union([${baseAirtableResponseValidationString}, AirtableFormulaColumnErrorValidationSchema])`;

      return {
        ...baseObjectModelPropertyType,
        airtableResponseValidationString,
        propertyType: `${baseObjectModelPropertyType.propertyType}`,
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
            'singleLineText',
          ].includes(tableColumn.options?.result?.type)
        ) {
          return {
            ...getTableColumnValidationSchemaTypeStrings(
              {
                ...tableColumn,
                type: tableColumn.options?.result?.type,
              },
              { ...options, camelCasePropertyName }
            ),
            airtableResponseValidationString: `z.any()`,
          };
        }
      }
      break;

    // Dates
    case 'date':
    case 'dateTime':
    case 'lastModifiedTime':
    case 'createdTime': {
      return {
        propertyName: camelCasePropertyName,
        propertyType: `string`,
        accessModifier: 'public',
        decorators: ['@Property()', `@Example('2023-01-05T19:00:44.544Z')`],
        required: false,
        airtableResponseValidationString: `z.string()`,
        requestObjectPropertyTypeValidationString: `z.string()`,
        tableColumName: tableColumn.name,
      };
    }

    // Lists
    case 'multipleRecordLinks': {
      const airtableResponseValidationString = `z.array(z.string())`;
      const objectModelPropertyType: ObjectModelProperty = (() => {
        const pascalCasePropertyNameSingular = pluralize.singular(
          camelCasePropertyName
        );
        const modelClassName =
          `${tableLabelSingular} ${pascalCasePropertyNameSingular}`.toPascalCase();
        const modelClass: ModelClass = {
          modelName: modelClassName,
          modelProperties: [
            {
              accessModifier: 'public',
              decorators: [
                '@Property()',
                '@Required()',
                `@Description('The unique identifer')`,
                `@Example('recO0FYb1Tccm9MZ2')`,
              ],
              propertyName: 'id',
              propertyType: 'string',
              required: true,
              airtableResponseValidationString,
              tableColumName: tableColumn.name,
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
                  const {
                    airtableResponseValidationString,
                    ...objectModelPropertyType
                  } = getTableColumnValidationSchemaTypeStrings(
                    lookupTableColumn,
                    {
                      ...options,
                      camelCaseParentPropertyName: camelCasePropertyName,
                    }
                  );
                  return {
                    ...objectModelPropertyType,
                    airtableResponseValidationString,
                    tableColumName: lookupTableColumn.name,
                  };
                })
            ),
          ],
          tableColumName: tableColumn.name,
        };

        const editableModelClassName = `Editable${modelClassName}`;
        const editableModelClass: ModelClass = {
          modelName: editableModelClassName,
          modelProperties: [
            {
              accessModifier: 'public',
              decorators: [
                '@Property()',
                '@Required()',
                `@Description('The unique identifer')`,
                `@Example('recO0FYb1Tccm9MZ2')`,
              ],
              propertyName: 'id',
              propertyType: 'string',
              required: true,
              airtableResponseValidationString,
              tableColumName: tableColumn.name,
            },
          ],
          tableColumName: tableColumn.name,
        };

        restAPIModelExtrasCollector.push(modelClass);
        if (editable !== false) {
          restAPIModelExtrasCollector.push(editableModelClass);
        }

        if (
          prefersSingleRecordLink ||
          tableColumn.options?.prefersSingleRecordLink
        ) {
          return {
            propertyName: camelCasePropertyName,
            propertyType: modelClassName,
            editablePropertyType: editableModelClassName,
            accessModifier: 'public',
            decorators: ['@Property()'],
            airtableResponseValidationString,
            tableColumName: tableColumn.name,
          };
        }

        return {
          propertyName: camelCasePropertyName,
          propertyType: `${modelClassName}[]`,
          editablePropertyType: `${editableModelClassName}[]`,
          accessModifier: 'public',
          decorators: ['@Property()', `@ArrayOf(${modelClassName})`],
          airtableResponseValidationString,
          tableColumName: tableColumn.name,
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
        ...objectModelPropertyType,
        airtableResponseValidationString,
        requestObjectPropertyTypeValidationString,
      };
    }

    case 'lookup':
    case 'multipleLookupValues': {
      const baseType = userDefinedType || 'string';
      const {
        airtableResponseValidationString: baseAirtableResponseValidationString,
        ...baseObjectModelPropertyType
      } = (() => {
        if (rootField !== tableColumn) {
          if (rootField.type === 'multipleRecordLinks') {
            return {
              airtableResponseValidationString: `z.string()`,
              accessModifier: 'public',
              decorators: [
                `@Example(${getModelPropertyExampleString(baseType)})`,
              ],
              propertyName: camelCasePropertyName,
              propertyType: baseType,
            } as ObjectModelProperty;
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
          return `z.array(${baseAirtableResponseValidationString}.nullish())`;
        }
        return baseAirtableResponseValidationString;
      })();
      const objectModelPropertyType = ((): Omit<
        ObjectModelProperty,
        'airtableResponseValidationString'
      > => {
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
        ...objectModelPropertyType,
        airtableResponseValidationString,
      };
    }

    // Numbers
    case 'number':
    case 'percent':
    case 'currency':
    case 'count':
    case 'autoNumber':
    case 'rating': {
      return {
        propertyName: camelCasePropertyName,
        propertyType: userDefinedType || 'number',
        accessModifier: 'public',
        decorators: [
          '@Property()',
          `@Example(${getModelPropertyExampleString(
            userDefinedType || 'number'
          )})`,
        ],
        airtableResponseValidationString: `z.number()`,
        requestObjectPropertyTypeValidationString: `z.number()`,
        tableColumName: tableColumn.name,
      };
    }

    // Booleans
    case 'checkbox': {
      return {
        propertyName: camelCasePropertyName,
        propertyType: userDefinedType || 'boolean',
        accessModifier: 'public',
        decorators: [
          '@Property()',
          `@Example(${getModelPropertyExampleString(
            userDefinedType || 'boolean'
          )})`,
        ],
        airtableResponseValidationString: `z.boolean()`,
        requestObjectPropertyTypeValidationString: `z.boolean()`,
        tableColumName: tableColumn.name,
      };
    }

    // Special text
    case 'email': {
      return {
        propertyName: camelCasePropertyName,
        propertyType: userDefinedType || 'string',
        accessModifier: 'public',
        decorators: [
          '@Property()',
          `@Example(${getModelPropertyExampleString(
            userDefinedType || 'email'
          )})`,
        ],
        airtableResponseValidationString: `z.string().trim().email()`,
        requestObjectPropertyTypeValidationString: `z.string().trim().email()`,
        tableColumName: tableColumn.name,
      };
    }

    case 'url': {
      return {
        propertyName: camelCasePropertyName,
        propertyType: userDefinedType || 'string',
        accessModifier: 'public',
        decorators: [
          '@Property()',
          `@Example(${getModelPropertyExampleString(
            userDefinedType || 'url'
          )})`,
        ],
        airtableResponseValidationString: `z.string().trim().url()`,
        requestObjectPropertyTypeValidationString: `z.string().trim().url()`,
        tableColumName: tableColumn.name,
      };
    }

    // Regular text
    case 'singleLineText':
    case 'multilineText':
    case 'richText':
    case 'phoneNumber': {
      const baseType = userDefinedType || 'string';

      return {
        propertyName: camelCasePropertyName,
        propertyType: baseType,
        accessModifier: 'public',
        decorators: [
          '@Property()',
          `@Example(${getModelPropertyExampleString(baseType)})`,
        ],
        airtableResponseValidationString: `z.string()`,
        requestObjectPropertyTypeValidationString: `z.string()`,
        tableColumName: tableColumn.name,
      };
    }
    case 'singleSelect':
    case 'multipleSelects': {
      const pascalCasePropertyNameSingular = pluralize.singular(
        camelCaseParentPropertyName || ''
      );

      const enumValuesVariableName =
        `${tableLabelSingular} ${pascalCasePropertyNameSingular} ${camelCasePropertyName} Options`.toCamelCase();

      const enumTypeName =
        `${tableLabelSingular} ${pascalCasePropertyNameSingular} ${camelCasePropertyName} Option`.toPascalCase();

      const enumValues = (() => {
        if (tableColumnOptions?.choices) {
          return tableColumnOptions.choices.map(({ name }) => {
            if (name.includes('"') && !name.includes("'")) {
              return `'${name}'`;
            }
            return `"${name.replace(/(['"])/g, '\\$1')}"`;
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
            return `z.array(z.enum(${enumValuesVariableName}))`;
          case 'singleSelect':
          default:
            return `z.enum(${enumValuesVariableName})`;
        }
      })();

      return {
        propertyName: camelCasePropertyName,
        propertyType: baseType,
        accessModifier: 'public',
        decorators: ['@Property()', `@Enum(...${enumValuesVariableName})`],
        typeDefinitionSnippet: enumValuesCode,
        airtableResponseValidationString,
        requestObjectPropertyTypeValidationString:
          airtableResponseValidationString,
        tableColumName: tableColumn.name,
      };
    }
  }
  const baseType = userDefinedType || 'any';
  return {
    propertyName: camelCasePropertyName,
    propertyType: baseType,
    accessModifier: 'public',
    decorators: ['@Property()'],
    airtableResponseValidationString: `z.any()`,
    tableColumName: tableColumn.name,
  };
};
//#endregion
