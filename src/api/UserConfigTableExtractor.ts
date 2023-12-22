import '@infinite-debugger/rmk-js-extensions/RegExp';
import '@infinite-debugger/rmk-js-extensions/String';

import { existsSync } from 'fs-extra';

import { AirtableField, Config } from '../models';
import { findAllAirtableBases } from './Bases';
import { findAllTablesByBaseId } from './Tables';

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
      return {
        ...workingBase,
        tables,
        userDefinedTables: tables.filter(({ name }) => {
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
        }),
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
