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

export const generateUserConfig = () => {
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

export const findAllTableFieldReferences = async ({
  baseIdOrName,
  tableIdOrName,
  fieldIdOrName,
  userConfig = generateUserConfig(),
}: {
  baseIdOrName: string;
  tableIdOrName: string;
  fieldIdOrName: string;
  userConfig?: Config<string>;
}) => {
  const fieldReferences: AirtableField[] = [];
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
    const field = (() => {
      for (const base of bases) {
        if (
          base.id.trim() === baseIdOrName.trim() ||
          base.name.trim() === baseIdOrName.trim()
        ) {
          for (const table of base.tables) {
            if (table.id === tableIdOrName || table.name === tableIdOrName) {
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

    if (base && field) {
      const searchableFields = base.tables.reduce<AirtableField[]>(
        (accumulator, table) => {
          accumulator.push(...table.fields);
          return accumulator;
        },
        []
      );
      searchableFields.forEach((searchableField) => {
        if (
          searchableField.options?.recordLinkFieldId === field.id ||
          searchableField.options?.inverseLinkFieldId === field.id ||
          searchableField.options?.fieldIdInLinkedTable === field.id ||
          searchableField.options?.linkedTableId === field.id ||
          searchableField.options?.referencedFieldIds?.includes(field.id)
        ) {
          fieldReferences.push(searchableField);
        }
      });
    }
  }
  return fieldReferences;
};
