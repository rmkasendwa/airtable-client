import '@infinite-debugger/rmk-js-extensions/RegExp';
import '@infinite-debugger/rmk-js-extensions/String';

import { dirname, normalize } from 'path';

import {
  ensureDirSync,
  existsSync,
  readFileSync,
  readdirSync,
  removeSync,
  writeFileSync,
} from 'fs-extra';
import globby from 'globby';
import prettier from 'prettier';

import {
  findAllTablesByBaseId,
  getAirtableAPIGeneratorTemplateFileInterpolationBlocks,
  getAirtableAPIGeneratorTemplateFileInterpolationLabels,
  getCamelCaseFieldPropertyName,
} from './api';
import { findAllAirtableBases } from './api/Metadata/Bases';
import { Config } from './models';

const config: Config = (() => {
  const config = require('./api.config');
  if (config.default) {
    return config.default;
  }
  return config;
})();

const prettierConfig = require('../.prettierrc.js');

const configBases = [
  config.defaultBase,
  ...config.tables
    .filter(({ base }) => {
      return base;
    })
    .map(({ base }) => {
      return base!;
    }),
  ...(config.bases || []).map(({ id, name }) => {
    return { id, name };
  }),
];

/****************** PATHS *********************/

const airtableAPIFolderName = 'airtable';
const outputRootPath = `${__dirname}/__sandbox`; // TODO: Get this from command otherwise fallback to process.cwd()
const outputFolderPath = normalize(
  `${outputRootPath}/${airtableAPIFolderName}`
);
const templatesFolderPath = normalize(`${__dirname}/template-files`);
const templateFilePaths = globby
  .sync(`src/template-files`, {
    absolute: true,
  })
  .map((filePath) => normalize(filePath));

(async () => {
  const { bases } = await findAllAirtableBases();
  const workingBases = bases.filter(({ name, id }) => {
    return configBases.some(({ id: configBaseId, name: configBaseName }) => {
      return (
        (configBaseId && configBaseId === id) ||
        (configBaseName && configBaseName.trim() === name.trim())
      );
    });
  });
  if (workingBases.length > 0) {
    if (existsSync(outputFolderPath)) {
      readdirSync(outputFolderPath).forEach((path) => {
        if (!path.match(/test/gi)) {
          removeSync(`${outputFolderPath}/${path}`);
        }
      });
    }
    ensureDirSync(outputFolderPath);

    workingBases.forEach(async (base) => {
      const { id: baseId, name: baseName } = base;
      const { tables } = await findAllTablesByBaseId(baseId);
      if (tables.length > 0) {
        console.log(`\nProcessing \x1b[34m${baseName.trim()}\x1b[0m base...`);

        const pascalCaseBaseName = baseName.toPascalCase();
        const baseAPIOutputFolderPath = normalize(
          `${outputFolderPath}/${pascalCaseBaseName}`
        );

        const moduleFiles: string[] = [];

        tables.forEach((table) => {
          const { name: tableName, fields: columns, views } = table;

          // Filter id, emoji, any field we don't understand
          const filteredColumns = columns
            .filter(({ name }) => {
              return (
                !name.match(/^id$/gi) && name.replace(/[^\w\s]/g, '').length > 0
              );
            })
            .reduce((accumulator, field) => {
              // Filtering columns with similar names.
              if (!accumulator.find(({ name }) => name === field.name)) {
                accumulator.push(field);
              }
              return accumulator;
            }, [] as typeof columns);

          const editableColumns = filteredColumns.filter(({ type }) => {
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
              case 'count':
              case 'autoNumber':
              case 'rating':
              case 'checkbox':
              case 'multipleRecordLinks':
              case 'date':
              case 'dateTime':
              case 'lastModifiedTime':
              case 'createdTime':
              case 'multipleSelects':
                return true;
            }
            return false;
          });

          const modelImports: string[] = [];

          console.log(
            ` -> Processing \x1b[34m${baseName.trim()}/${tableName.trim()}\x1b[0m table...`
          );

          const sanitisedTableName = tableName.trim().replace(/[^\w\s]/g, '');
          const labelPlural = (() => {
            if (!sanitisedTableName.match(/s$/g)) {
              return sanitisedTableName + 's';
            }
            return sanitisedTableName;
          })();
          const labelSingular = (() => {
            if (labelPlural.match(/ies$/)) {
              return labelPlural.replace(/ies$/, 'y');
            }
            return labelPlural.replace(/s$/g, '');
          })();

          const columnToPropertyMapper = filteredColumns.reduce(
            (accumulator, field) => {
              accumulator[field.name] = getCamelCaseFieldPropertyName(field);
              return accumulator;
            },
            {} as Record<string, string>
          );

          const interpolationBlocks =
            getAirtableAPIGeneratorTemplateFileInterpolationBlocks({
              base,
              currentTable: table,
              filteredTableColumns: filteredColumns,
              editableTableColumns: editableColumns,
              tables,
              columnToPropertyMapper,
              modelImportsCollector: modelImports,
            });

          const interpolationLabels =
            getAirtableAPIGeneratorTemplateFileInterpolationLabels({
              currentTable: table,
              filteredTableColumns: filteredColumns,
              columnToPropertyMapper,
              modelImportsCollector: modelImports,
              views,
              labelPlural,
              labelSingular,
            });

          const getInterpolatedString = (templateFileContents: string) => {
            return Object.keys(interpolationLabels).reduce(
              (fileContents, key) => {
                return fileContents.replaceAll(
                  key,
                  (interpolationLabels as any)[key]
                );
              },
              Object.keys(interpolationBlocks).reduce((fileContents, key) => {
                const escapedKey = RegExp.escape(key);
                return fileContents.replace(
                  new RegExp(`${escapedKey}[\\s\\S]*${escapedKey}`, 'g'),
                  (interpolationBlocks as any)[key]
                );
              }, templateFileContents)
            );
          };

          moduleFiles.push(`./api/${labelPlural.toPascalCase()}`);

          templateFilePaths.forEach((templateFilePath) => {
            const templateFileContents = readFileSync(
              templateFilePath,
              'utf-8'
            );
            const filePath = getInterpolatedString(
              `${baseAPIOutputFolderPath}${templateFilePath.replace(
                templatesFolderPath,
                ''
              )}`
            );

            ensureDirSync(dirname(filePath));

            writeFileSync(
              filePath,
              prettier.format(getInterpolatedString(templateFileContents), {
                filepath: filePath,
                ...prettierConfig,
              })
            );
          });
        });

        writeFileSync(
          `${baseAPIOutputFolderPath}/index.ts`,
          moduleFiles
            .map((filePath) => {
              return `export * from '${filePath}'`;
            })
            .join('\n')
        );

        console.log(
          `\n\x1b[32mAirtable [${baseName.trim()}] base API generated here: ${baseAPIOutputFolderPath}\x1b[0m`
        );
      }
    });
  }
})();
