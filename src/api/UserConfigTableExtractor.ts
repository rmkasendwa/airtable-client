import '@infinite-debugger/rmk-js-extensions/RegExp';
import '@infinite-debugger/rmk-js-extensions/String';

import { existsSync } from 'fs-extra';
import { pick } from 'lodash';
import pluralize from 'pluralize';

import {
  AirtableField,
  Config,
  ConfigDetailedColumnNameToObjectPropertyMapper,
  UserEditableDetailedColumnNameToObjectPropertyMapping,
} from '../models';
import { findAllAirtableBases } from './Bases';
import { findAllTablesByBaseId } from './Tables';

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
      const userDefinedTables = tables
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
      //#region Build fields map
      const baseTableFieldsById = base.tables.reduce<{
        [fieldId: string]: AirtableField;
      }>((fieldIdToTypeMap, table) => {
        table.fields.forEach((field) => {
          fieldIdToTypeMap[field.id] = field;
        });
        return fieldIdToTypeMap;
      }, {});
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
            });
          }
        });
      });
    }
  }
  return fieldReferences;
};
