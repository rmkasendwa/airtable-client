import '@infinite-debugger/rmk-js-extensions/RegExp';
import '@infinite-debugger/rmk-js-extensions/String';

import { existsSync } from 'fs-extra';
import { pick } from 'lodash';
import pluralize from 'pluralize';

import {
  AirtableField,
  AirtableFieldType,
  Config,
  ConfigDetailedColumnNameToObjectPropertyMapper,
  DetailedColumnNameToObjectPropertyMapping,
  Table,
  UserEditableDetailedColumnNameToObjectPropertyMapping,
} from '../models';
import { findAllAirtableBases } from './Bases';
import { findAllTablesByBaseId } from './Tables';
import {
  ModelClass,
  TableColumnValidationSchemaTypeStringGroup,
  getExpandedAirtableLookupColumn,
  getTableColumnValidationSchemaTypeStrings,
} from './TypeGenerator';
import { getCamelCaseFieldPropertyName } from './Utils';

const LOOKUP_TABLE_COLUMN_TYPES: AirtableFieldType[] = [
  'lookup',
  'multipleLookupValues',
];
export const DEFAULT_VIEW_NAME = 'Grid view';
export const DEFAULT_VIEW_ALIAS = 'Default';

export interface ExtractUserDefinedBasesAndTablesInput {
  userConfig: Config<string>;
  generateAllTables?: boolean;
}

/**
 * Extracts the bases and tables that are defined in the user config
 *
 * @param input The input object
 * @returns The bases and tables that are defined in the user config
 */
export const extractUserDefinedBasesAndTables = async ({
  userConfig,
  generateAllTables = false,
}: ExtractUserDefinedBasesAndTablesInput) => {
  const configBases = [
    userConfig.defaultBase,
    ...(userConfig.tables || [])
      .filter(({ base }) => {
        return base;
      })
      .map(({ base }) => {
        return base!;
      }),
    ...(userConfig.bases || []).map(({ id, name }) => {
      return { id, name };
    }),
  ];

  const configTables = [
    ...(userConfig.tables || []).map((table) => {
      return {
        ...table,
        base: table.base || userConfig.defaultBase,
      };
    }),
    ...(userConfig.bases || [])
      .map((base) => {
        return (base.tables || []).map((table) => {
          return {
            ...table,
            base,
          };
        });
      })
      .flat(),
  ];

  const { bases: allBases } = await findAllAirtableBases(); // Loading all airtable bases accessible by the API key

  const workingBases = allBases.filter(({ name, id }) => {
    return configBases.some(({ id: configBaseId, name: configBaseName }) => {
      return (
        (configBaseId && configBaseId === id) ||
        (configBaseName && configBaseName.trim() === name.trim())
      );
    });
  });

  const bases = await Promise.all(
    workingBases.map(async (workingBase) => {
      const { id: workingBaseId, name: workingBaseName } = workingBase;
      const { tables } = await findAllTablesByBaseId(workingBaseId);

      const filteredTables = tables
        .filter(({ name }) => {
          return (
            generateAllTables ||
            configTables.length <= 0 ||
            configTables.some(({ name: configTableName, base }) => {
              return (
                configTableName &&
                configTableName.trim() === name.trim() &&
                ((base.id && base.id === workingBaseId) ||
                  (base.name && base.name.trim() === workingBaseName.trim()))
              );
            })
          );
        })
        .map((table) => {
          const { name: tableName, fields: columns, views } = table;

          //#region User defined table configuration
          const {
            labelPlural,
            labelSingular,
            focusColumns: focusColumnNames = columns.map(({ name }) => name),
            configColumnNameToObjectPropertyMapper,
            configViews,
            alternativeRecordIdColumns,
          } = (() => {
            const outputConfig: {
              labelPlural: string;
              labelSingular: string;
              focusColumns?: string[];
              configColumnNameToObjectPropertyMapper: ConfigDetailedColumnNameToObjectPropertyMapper<string>;
              configViews?: string[];
              alternativeRecordIdColumns?: string[];
            } = {
              labelPlural: '',
              labelSingular: '',
              configColumnNameToObjectPropertyMapper: {},
            };

            // Finding table definition in user config
            const configTable = configTables.find(({ name, base }) => {
              return (
                name.trim() === tableName.trim() &&
                ((base.id && base.id === workingBaseId) ||
                  (base.name && base.name.trim() === workingBaseName.trim()))
              );
            });

            if (configTable) {
              const {
                alias: configTableAlias,
                name: configTableName,
                focusColumns,
                columnNameToObjectPropertyMapper:
                  configColumnNameToObjectPropertyMapper,
                views,
                alternativeRecordIdColumns,
              } = configTable;
              if (configTable.labelPlural) {
                outputConfig.labelPlural = configTable.labelPlural;
              } else {
                const sanitisedTableName = (configTableAlias || configTableName)
                  .trim()
                  .replace(/[^\w\s]/g, '');
                outputConfig.labelPlural = pluralize(sanitisedTableName);
              }
              if (configTable.labelSingular) {
                outputConfig.labelSingular = configTable.labelSingular;
              } else {
                const labelPlural = outputConfig.labelPlural!;
                outputConfig.labelSingular = pluralize.singular(labelPlural);
              }
              if (focusColumns) {
                Object.assign(
                  outputConfig.configColumnNameToObjectPropertyMapper,
                  Object.fromEntries(
                    focusColumns
                      .map((focusColumn) => {
                        if (Array.isArray(focusColumn)) {
                          return focusColumn;
                        }
                      })
                      .filter((focusColumn) => focusColumn) as [
                      string,
                      UserEditableDetailedColumnNameToObjectPropertyMapping
                    ][]
                  )
                );
                outputConfig.focusColumns = focusColumns.map((focusColumn) => {
                  if (Array.isArray(focusColumn)) {
                    return focusColumn[0];
                  }
                  return focusColumn;
                });
              }
              if (configColumnNameToObjectPropertyMapper) {
                Object.assign(
                  outputConfig.configColumnNameToObjectPropertyMapper,
                  Object.fromEntries(
                    Object.entries(configColumnNameToObjectPropertyMapper).map(
                      ([key, value]) => {
                        return [
                          key,
                          typeof value === 'string'
                            ? {
                                propertyName: value,
                              }
                            : value,
                        ];
                      }
                    )
                  )
                );
              }
              views && (outputConfig.configViews = views);
              alternativeRecordIdColumns &&
                (outputConfig.alternativeRecordIdColumns =
                  alternativeRecordIdColumns);
            } else {
              const sanitisedTableName = tableName
                .trim()
                .replace(/[^\w\s]/g, '');
              outputConfig.labelPlural = pluralize(sanitisedTableName);
              outputConfig.labelSingular = pluralize.singular(
                outputConfig.labelPlural
              );
            }

            return outputConfig;
          })();
          //#endregion

          //#region Filtering views
          const userDefinedViews = views
            .sort((a, b) => a.name.localeCompare(b.name))
            .filter(({ name }) => {
              return !configViews || configViews.includes(name);
            })
            .reduce(
              (accumulator, { name }) => {
                if (!accumulator.includes(name) && name !== DEFAULT_VIEW_NAME) {
                  accumulator.push(name);
                }
                return accumulator;
              },
              [DEFAULT_VIEW_ALIAS] as string[]
            );
          //#endregion

          const userDefinedTableColumns = focusColumnNames
            .map((focusColumnName) => {
              return columns.find(({ name }) => name === focusColumnName)!;
            })
            .filter((column) => column)
            .filter(({ name }) => {
              return (
                name.replace(/[^\w\s]/g, '').length > 0 && !name.match(/^id$/gi)
              );
            })
            .map((column) => {
              const fieldOverride =
                configColumnNameToObjectPropertyMapper[column.name]
                  ?.fieldOverride;
              if (fieldOverride) {
                return {
                  ...pick(column, 'id', 'name', 'description'),
                  ...fieldOverride,
                };
              }
              return column;
            });

          return {
            userDefinedViews,
            userDefinedTableColumns,
            labelPlural,
            labelSingular,
            focusColumnNames,
            configColumnNameToObjectPropertyMapper,
            configViews,
            alternativeRecordIdColumns,
            ...table,
          };
        });

      const userDefinedTables = filteredTables.map((table) => {
        const {
          fields: columns,
          userDefinedTableColumns,
          labelSingular,
          focusColumnNames,
          configColumnNameToObjectPropertyMapper,
        } = table;

        const nonLookupTableColumns = userDefinedTableColumns
          .filter(({ type }) => {
            return !type || !LOOKUP_TABLE_COLUMN_TYPES.includes(type);
          })
          .reduce<typeof userDefinedTableColumns>((accumulator, field) => {
            // Filtering columns with similar names.
            if (!accumulator.find(({ name }) => name === field.name)) {
              accumulator.push(field);
            }
            return accumulator;
          }, []);

        const lookupTableColumns = userDefinedTableColumns
          .filter(({ type, options }) => {
            // Making sure the lookup column has a parent field on the table.
            return (
              type === 'multipleLookupValues' &&
              options?.recordLinkFieldId &&
              userDefinedTableColumns.find(
                ({ id }) => id === options?.recordLinkFieldId
              ) != null
            );
          })
          .reduce((accumulator, field) => {
            // Filtering lookup columns with similar references.
            if (
              !accumulator.find(({ options }) => {
                return (
                  options?.recordLinkFieldId &&
                  options?.fieldIdInLinkedTable &&
                  field.options?.recordLinkFieldId &&
                  field.options?.fieldIdInLinkedTable &&
                  options.recordLinkFieldId ===
                    field.options.recordLinkFieldId &&
                  options.fieldIdInLinkedTable ===
                    field.options.fieldIdInLinkedTable
                );
              })
            ) {
              accumulator.push(field);
            }
            return accumulator;
          }, [] as typeof columns);

        // Lookup column name to parent column name map
        const lookupColumnNameToParentColumnNameMap = lookupTableColumns.reduce(
          (accumulator, { name, options }) => {
            const parentColumn = columns.find(
              ({ id }) => id === options?.recordLinkFieldId
            );
            if (parentColumn) {
              accumulator[name] = parentColumn.name;
            } else {
              console.log(`No parent column found for ${name}`);
            }
            return accumulator;
          },
          {} as Record<string, string>
        );

        // Finding editable table columns
        const editableTableColumns = nonLookupTableColumns.filter(
          ({ type }) => {
            switch (type) {
              case 'singleLineText':
              case 'multilineText':
              case 'richText':
              case 'phoneNumber':
              case 'singleSelect':
              case 'url':
              case 'email':
              case 'number':
              case 'percent':
              case 'currency':
              case 'rating':
              case 'checkbox':
              case 'multipleRecordLinks':
              case 'date':
              case 'dateTime':
              case 'multipleSelects':
                return true;
            }
            return false;
          }
        );

        // TODO: Make imports objects with setting keys as paths and values as a list of import objects.
        const airtableAPIModelImportsCollector: string[] = [];
        const restAPIModelImportsCollector: string[] = [];
        const restAPIModelExtrasCollector: ModelClass[] = [];

        const nonLookupColumnNameToObjectPropertyMapper =
          nonLookupTableColumns.reduce<
            Record<
              string,
              DetailedColumnNameToObjectPropertyMapping & {
                tableColumn: (typeof nonLookupTableColumns)[number];
              }
            >
          >((accumulator, tableColumn) => {
            accumulator[tableColumn.name] = {
              ...configColumnNameToObjectPropertyMapper[tableColumn.name],
              id: tableColumn.id,
              propertyName: (() => {
                // Extracting column object property name from user config.
                if (
                  configColumnNameToObjectPropertyMapper[tableColumn.name]
                    ?.propertyName
                ) {
                  return configColumnNameToObjectPropertyMapper[
                    tableColumn.name
                  ]!.propertyName!.split('.')[0];
                }
                return getCamelCaseFieldPropertyName(tableColumn); // Automatically converting table column name to camel case object property name
              })(),
              ...(() => {
                // Extracting prefer single record link
                const prefersSingleRecordLink = Boolean(
                  tableColumn.options?.prefersSingleRecordLink ||
                    configColumnNameToObjectPropertyMapper?.[tableColumn.name]
                      ?.prefersSingleRecordLink
                );
                if (prefersSingleRecordLink) {
                  return { prefersSingleRecordLink };
                }
              })(),
              tableColumn,
            };
            return accumulator;
          }, {});

        //#region Sorting non lookup table columns
        nonLookupTableColumns.sort(({ name: aName }, { name: bName }) => {
          if (
            nonLookupColumnNameToObjectPropertyMapper[aName]?.propertyName &&
            nonLookupColumnNameToObjectPropertyMapper[bName]?.propertyName
          ) {
            return nonLookupColumnNameToObjectPropertyMapper[
              aName
            ].propertyName.localeCompare(
              nonLookupColumnNameToObjectPropertyMapper[bName].propertyName
            );
          }
          return 0;
        });
        //#endregion

        //#region Dependent table column ids.
        const editableFieldsDependentTables = Object.values(
          nonLookupColumnNameToObjectPropertyMapper
        )
          .filter(({ tableColumn: { type, options } }) => {
            return (
              type === 'multipleRecordLinks' &&
              options?.linkedTableId &&
              filteredTables.find(({ id }) => {
                return id === options.linkedTableId;
              })
            );
          })
          .reduce<(typeof nonLookupColumnNameToObjectPropertyMapper)[string][]>(
            (accumulator, column) => {
              if (
                !accumulator.find(({ id }) => {
                  return id === column.id;
                })
              ) {
                accumulator.push(column);
              }
              return accumulator;
            },
            []
          );
        //#endregion

        const lookupColumnNameToObjectPropertyMapper =
          lookupTableColumns.reduce<
            Record<string, DetailedColumnNameToObjectPropertyMapping>
          >((accumulator, tableColumn) => {
            const parentField = (() => {
              const recordLinkFieldId = tableColumn.options?.recordLinkFieldId;
              if (recordLinkFieldId) {
                const recordLinkField = table.fields.find(
                  ({ id }) => id === recordLinkFieldId
                );
                if (recordLinkField) {
                  const linkedTableId = recordLinkField.options?.linkedTableId;
                  const fieldIdInLinkedTable =
                    tableColumn.options?.fieldIdInLinkedTable;
                  if (linkedTableId && fieldIdInLinkedTable) {
                    const linkedTable = tables.find(
                      ({ id }) => id === linkedTableId
                    );
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
              return tableColumn;
            })();

            const shouldFlattenLookupField = (
              lookupTableColumn: typeof tableColumn,
              lookupTable: Table
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
                    ({ id }) =>
                      id === referenceTableColumn.options?.linkedTableId
                  )!
                );
              }

              return Boolean(
                referenceTableColumn?.options?.prefersSingleRecordLink &&
                  !(
                    [
                      'multipleLookupValues',
                      'multipleSelects',
                    ] as (typeof tablecolumnOneLevelUp.type)[]
                  ).includes(tablecolumnOneLevelUp.type)
              );
            };

            const flattenLookupField = shouldFlattenLookupField(
              tableColumn,
              table
            );

            const parentColumn = nonLookupTableColumns.find(
              ({ id }) => id === tableColumn.options?.recordLinkFieldId
            );

            accumulator[tableColumn.name] = {
              ...configColumnNameToObjectPropertyMapper[tableColumn.name],
              id: tableColumn.id,
              propertyName: (() => {
                // Extracting column object property name from user config.
                const propertyName = (() => {
                  if (
                    configColumnNameToObjectPropertyMapper[tableColumn.name]
                      ?.propertyName
                  ) {
                    return configColumnNameToObjectPropertyMapper[
                      tableColumn.name
                    ]!.propertyName;
                  }
                })();

                if (propertyName) {
                  if (propertyName.match(/\./g)) {
                    return propertyName.split('.').slice(-1)[0];
                  }
                  return propertyName;
                }

                return getCamelCaseFieldPropertyName(parentField); // Automatically converting parent table column name to camel case object property name
              })(),
              ...(() => {
                if (flattenLookupField) {
                  return {
                    prefersSingleRecordLink: flattenLookupField,
                  };
                }
              })(),
              ...(() => {
                if (parentColumn) {
                  return {
                    parentColumnPropertyName:
                      nonLookupColumnNameToObjectPropertyMapper[
                        parentColumn.name
                      ].propertyName,
                  };
                }
              })(),
            } as DetailedColumnNameToObjectPropertyMapping;
            return accumulator;
          }, {});

        const columnNameToObjectPropertyMapper = {
          ...nonLookupColumnNameToObjectPropertyMapper,
          ...Object.fromEntries(
            Object.entries(lookupColumnNameToObjectPropertyMapper).map(
              ([key, mapper]) => {
                const { parentColumnPropertyName, propertyName } = mapper;
                return [
                  key,
                  {
                    ...mapper,
                    propertyName: parentColumnPropertyName
                      ? `${parentColumnPropertyName}.${propertyName}`
                      : propertyName,
                  },
                ];
              }
            )
          ),
        };

        // Finding user defined queryable focus columns
        const queryableNonLookupFields = (focusColumnNames || [])
          .filter((columnName) => {
            return nonLookupColumnNameToObjectPropertyMapper[columnName];
          })
          .map((columnName) => {
            return `"${nonLookupColumnNameToObjectPropertyMapper[columnName].propertyName}"`;
          });

        // Finding user defined queryable focus columns
        const queryableLookupFields = (focusColumnNames || [])
          .filter((columnName) => {
            return lookupColumnNameToObjectPropertyMapper[columnName];
          })
          .map((columnName) => {
            return `"${
              nonLookupColumnNameToObjectPropertyMapper[
                lookupColumnNameToParentColumnNameMap[columnName]
              ].propertyName
            }.${
              lookupColumnNameToObjectPropertyMapper[columnName].propertyName
            }"`;
          });

        // TODO: Merge all schema generation calls
        const columnNameToValidationSchemaTypeStringGroupMapper = [
          ...nonLookupTableColumns,
        ].reduce((accumulator, tableColumn) => {
          const tableColumnValidationSchemaTypeStrings =
            getTableColumnValidationSchemaTypeStrings(tableColumn, {
              airtableAPIModelImportsCollector,
              currentTable: table,
              tableLabelSingular: labelSingular,
              nonLookupColumnNameToObjectPropertyMapper,
              lookupColumnNameToObjectPropertyMapper,
              lookupTableColumns,
              restAPIModelExtrasCollector,
              restAPIModelImportsCollector,
              tables,
            });

          if (
            nonLookupColumnNameToObjectPropertyMapper[tableColumn.name]
              ?.required
          ) {
            tableColumnValidationSchemaTypeStrings.editModeDecorators ||
              (tableColumnValidationSchemaTypeStrings.editModeDecorators = {});
            tableColumnValidationSchemaTypeStrings.editModeDecorators[
              'Required'
            ] = [];
          }

          if (
            nonLookupColumnNameToObjectPropertyMapper[tableColumn.name]
              ?.description &&
            (tableColumn.type !== 'multipleRecordLinks' ||
              !tableColumn.options?.prefersSingleRecordLink)
          ) {
            tableColumnValidationSchemaTypeStrings.decorators['Description'] = [
              `${JSON.stringify(
                nonLookupColumnNameToObjectPropertyMapper[tableColumn.name]
                  .description
              )}`,
            ];
          }

          if (tableColumn.type === 'multipleRecordLinks') {
            const tableColumnModelExtras = restAPIModelExtrasCollector.find(
              ({ modelName }) => {
                return (
                  modelName ===
                  tableColumnValidationSchemaTypeStrings.propertyType.replace(
                    /\[\]$/g,
                    ''
                  )
                );
              }
            );
            if (tableColumnModelExtras) {
              const { modelProperties } = tableColumnModelExtras;
              modelProperties.forEach((modelProperty) => {
                if (
                  lookupColumnNameToObjectPropertyMapper[
                    modelProperty.tableColumName
                  ]?.required
                ) {
                  modelProperty.editModeDecorators ||
                    (modelProperty.editModeDecorators = {});
                  modelProperty.editModeDecorators['Required'] = [];
                }
                accumulator[modelProperty.tableColumName] = modelProperty;
              });
            }
          }

          accumulator[tableColumn.name] =
            tableColumnValidationSchemaTypeStrings;
          return accumulator;
        }, {} as Record<string, TableColumnValidationSchemaTypeStringGroup>);

        return {
          ...table,
          nonLookupTableColumns,
          lookupTableColumns,
          editableTableColumns,
          editableFieldsDependentTables,
          queryableNonLookupFields,
          queryableLookupFields,
          columnNameToValidationSchemaTypeStringGroupMapper,
          restAPIModelExtrasCollector,
          airtableAPIModelImportsCollector,
          restAPIModelImportsCollector,
          lookupColumnNameToParentColumnNameMap,
          nonLookupColumnNameToObjectPropertyMapper,
          lookupColumnNameToObjectPropertyMapper,
          columnNameToObjectPropertyMapper,
        };
      });

      return {
        ...workingBase,
        tables,
        userDefinedTables,
      };
    })
  );

  return {
    bases,
    configTables,
  };
};

/**
 * Reads the airtable-api.config file from the current working directory
 * and returns the user's airtable API configuration. If the file does not
 * exist, it returns undefined.
 *
 * @returns The user's airtable API configuration
 */
export const getUserConfig = () => {
  const currentWorkingDirectory = process.cwd();
  const userConfigFilePath = `${currentWorkingDirectory}/airtable-api.config`;
  if (
    ['.json', '.js', '.ts'].some(
      (fileExtension) =>
        existsSync(userConfigFilePath + fileExtension) ||
        existsSync(userConfigFilePath + '/index' + fileExtension)
    )
  ) {
    const userConfig: Config<string> = (() => {
      const config = require(userConfigFilePath);
      if (config.default) {
        return config.default;
      }
      return config;
    })();

    return userConfig;
  }
};

/**
 * Finds all the fields that reference the given field
 *
 * @param input The input object
 * @returns All the fields that reference the given field
 */
export const findAllTableFieldReferences = async ({
  baseIdOrName,
  tableIdOrName,
  fieldIdOrName,
  userConfig = getUserConfig(),
}: {
  baseIdOrName: string;
  tableIdOrName: string;
  fieldIdOrName: string;
  userConfig?: Config<string>;
}) => {
  const fieldReferences: {
    tableName: string;
    fieldName: string;
    type?: string;
    entityGroupName?: string;
    entityPropertyName?: string;
  }[] = [];
  if (userConfig) {
    const { bases } = await extractUserDefinedBasesAndTables({
      userConfig,
    });

    const base = (() => {
      for (const base of bases) {
        if (
          base.id.trim() === baseIdOrName.trim() ||
          base.name.trim() === baseIdOrName.trim()
        ) {
          return base;
        }
      }
    })();
    const targetField = (() => {
      for (const base of bases) {
        if (
          base.id.trim() === baseIdOrName.trim() ||
          base.name.trim() === baseIdOrName.trim()
        ) {
          for (const table of base.tables) {
            if (
              table.id.trim() === tableIdOrName.trim() ||
              table.name.trim() === tableIdOrName.trim()
            ) {
              for (const field of table.fields) {
                if (
                  field.id === fieldIdOrName ||
                  field.name === fieldIdOrName
                ) {
                  return field;
                }
              }
            }
          }
        }
      }
    })();

    if (base && targetField) {
      //#region Base Table Fields By Id
      const baseTableFieldsById = base.tables.reduce<{
        [fieldId: string]: AirtableField;
      }>((fieldIdToTypeMap, table) => {
        table.fields.forEach((field) => {
          fieldIdToTypeMap[field.id] = field;
        });
        return fieldIdToTypeMap;
      }, {});
      //#endregion

      //#region Table Field Names To Property Name mapper by table id
      const tableFieldNamesToPropertyNameMapperByTableId =
        base.userDefinedTables.reduce<{
          [tableId: string]: {
            entityGroupName: string;
            entityPropertyNameMapper: {
              [columnName: string]: string;
            };
          };
        }>(
          (
            accumulator,
            { id, columnNameToObjectPropertyMapper, labelPlural }
          ) => {
            accumulator[id] = {
              entityGroupName: labelPlural.toPascalCase(),
              entityPropertyNameMapper: Object.fromEntries(
                Object.entries(columnNameToObjectPropertyMapper).map(
                  ([columnName, { propertyName }]) => {
                    return [columnName, propertyName];
                  }
                )
              ),
            };
            return accumulator;
          },
          {}
        );
      //#endregion

      const fieldReferencesTargetField = (
        field: AirtableField,
        visitedFieldIds: string[] = []
      ): boolean => {
        const referencedFieldIds = [
          field.options?.recordLinkFieldId,
          field.options?.inverseLinkFieldId,
          field.options?.fieldIdInLinkedTable,
          field.options?.linkedTableId,
          ...(field.options?.referencedFieldIds || []),
        ].filter((id) => {
          return id && !visitedFieldIds.includes(id);
        }) as string[];

        if (referencedFieldIds.includes(targetField.id)) {
          return true;
        }
        visitedFieldIds.push(field.id);
        if (referencedFieldIds.length > 0) {
          return referencedFieldIds.some((referencedFieldId) => {
            const referencedField = baseTableFieldsById[referencedFieldId];
            if (referencedField) {
              return fieldReferencesTargetField(
                referencedField,
                visitedFieldIds
              );
            }
            return false;
          });
        }
        return false;
      };

      base.tables.forEach((table) => {
        table.fields.forEach((field) => {
          if (fieldReferencesTargetField(field)) {
            const { name, type } = field;
            fieldReferences.push({
              tableName: table.name,
              fieldName: name,
              type,
              entityGroupName:
                tableFieldNamesToPropertyNameMapperByTableId[table.id]
                  ?.entityGroupName,
              entityPropertyName:
                tableFieldNamesToPropertyNameMapperByTableId[table.id]
                  ?.entityPropertyNameMapper[name],
            });
          }
        });
      });
    }
  }
  return fieldReferences;
};
