import { basename } from 'path';

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  removeSync,
  writeFileSync,
} from 'fs-extra';

import { findAllTablesByBaseId } from './api';
import { findAllAirtableBases } from './api/Metadata/Bases';

const sandboxFolder = `${__dirname}/__sandbox`;
const tableAPITemplateFilePath = `${__dirname}/templates/TableAPI.ts`;
const tableAPIUtilityFiles = ['__config.ts', '__Adapter.ts'].map(
  (filePath) => `${__dirname}/templates/${filePath}`
);

(async () => {
  const { bases } = await findAllAirtableBases();
  const talentBase = bases.find(({ name }) => name.trim().match(/^Talent$/g));
  if (talentBase) {
    const { tables } = await findAllTablesByBaseId(talentBase.id);

    if (tables.length > 0 && existsSync(tableAPITemplateFilePath)) {
      if (existsSync(sandboxFolder)) {
        removeSync(sandboxFolder);
      }
      mkdirSync(sandboxFolder);

      tableAPIUtilityFiles.forEach((sourcePath) => {
        const destinationPath = `${sandboxFolder}/${basename(sourcePath)}`;
        console.log(`Copying ${sourcePath} -> ${destinationPath}`);
        copyFileSync(sourcePath, destinationPath);
      });

      const tableAPITemplate = readFileSync(tableAPITemplateFilePath, 'utf-8');

      tables.forEach(({ name }) => {
        const sanitisedTableName = name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
        const fileName = `${sandboxFolder}/${sanitisedTableName}.ts`;
        console.log(`Writing ${fileName}`);
        writeFileSync(fileName, tableAPITemplate);
      });
    }
  }
})();
