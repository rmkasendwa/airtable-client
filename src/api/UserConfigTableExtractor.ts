import '@infinite-debugger/rmk-js-extensions/RegExp';
import '@infinite-debugger/rmk-js-extensions/String';

import { Config } from '../models';
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
