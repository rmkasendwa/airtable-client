import '@infinite-debugger/rmk-js-extensions/String';

import { basename } from 'path';

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  removeSync,
  writeFileSync,
} from 'fs-extra';
import prettier from 'prettier';

import { findAllTablesByBaseId } from './api';
import { findAllAirtableBases } from './api/Metadata/Bases';

const prettierConfig = require('../.prettierrc.js');

const sandboxFolder = `${__dirname}/__sandbox`;
const tableAPITemplateFilePath = `${__dirname}/templates/TableAPI.ts`;
const tableAPIUtilityFiles = [
  '__Adapter.ts',
  '__config.ts',
  '__interfaces.ts',
  '__utils.ts',
].map((filePath) => `${__dirname}/templates/${filePath}`);

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

      const moduleFiles: string[] = [];

      tables.forEach(({ name, fields }) => {
        const sanitisedTableName = name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
        const labelPlural = sanitisedTableName;
        const labelSingular = (() => {
          if (labelPlural.match(/ies$/)) {
            return labelPlural.replace(/ies$/, 'y');
          }
          return labelPlural.replace(/s$/g, '');
        })();

        const TITLE_CASE_ENTITIES_LABEL_WITH_SPACES = labelPlural;
        const TITLE_CASE_ENTITY_LABEL_WITH_SPACES = labelSingular;

        const LOWER_CASE_ENTITIES_LABEL_WITH_SPACES = labelPlural.toLowerCase();
        const LOWER_CASE_ENTITY_LABEL_WITH_SPACES = labelSingular.toLowerCase();

        const UPPER_CASE_ENTITIES_LABEL = labelPlural
          .replace(/\s/g, '_')
          .toUpperCase();
        const UPPER_CASE_ENTITY_LABEL = labelSingular
          .replace(/\s/g, '_')
          .toUpperCase();

        const CAMEL_CASE_ENTITIES_LABEL = UPPER_CASE_ENTITIES_LABEL.replace(
          /\s/g,
          '_'
        ).toCamelCase('UPPER_CASE');
        const CAMEL_CASE_ENTITY_LABEL = UPPER_CASE_ENTITY_LABEL.replace(
          /\s/g,
          '_'
        ).toCamelCase('UPPER_CASE');

        const PASCAL_CASE_ENTITIES_LABEL = CAMEL_CASE_ENTITIES_LABEL.replace(
          /^\w/g,
          (character) => {
            return character.toUpperCase();
          }
        );
        const PASCAL_CASE_ENTITY_LABEL = CAMEL_CASE_ENTITY_LABEL.replace(
          /^\w/g,
          (character) => {
            return character.toUpperCase();
          }
        );

        const KEBAB_CASE_ENTITIES_LABEL =
          LOWER_CASE_ENTITIES_LABEL_WITH_SPACES.replace(/\s/g, '-');
        const KEBAB_CASE_ENTITY_LABEL =
          LOWER_CASE_ENTITY_LABEL_WITH_SPACES.replace(/\s/g, '-');

        // Generating schema
        const schemaText = fields
          .map(({ name }) => {
            return `["${name}"]: z.string().nullish()`;
          })
          .join(',\n');

        const interpolationLabels = {
          ['/* AIRTABLE_ENTITY_FIELDS */']: schemaText,

          ['Entities Label']: TITLE_CASE_ENTITIES_LABEL_WITH_SPACES,
          ['Entity Label']: TITLE_CASE_ENTITY_LABEL_WITH_SPACES,

          ['entities label']: LOWER_CASE_ENTITIES_LABEL_WITH_SPACES,
          ['entity label']: LOWER_CASE_ENTITY_LABEL_WITH_SPACES,

          ['ENTITIES']: UPPER_CASE_ENTITIES_LABEL,
          ['ENTITY']: UPPER_CASE_ENTITY_LABEL,

          ['camelCaseEntities']: CAMEL_CASE_ENTITIES_LABEL,
          ['camelCaseEntity']: CAMEL_CASE_ENTITY_LABEL,

          ['PascalCaseEntities']: PASCAL_CASE_ENTITIES_LABEL,
          ['PascalCaseEntity']: PASCAL_CASE_ENTITY_LABEL,

          ['kebab-case-entities']: KEBAB_CASE_ENTITIES_LABEL,
          ['kebab-case-entity']: KEBAB_CASE_ENTITY_LABEL,
        };

        const fileName = `${sandboxFolder}/${PASCAL_CASE_ENTITIES_LABEL}.ts`;
        moduleFiles.push(`./${PASCAL_CASE_ENTITIES_LABEL}`);
        console.log(`Writing ${fileName}`);
        writeFileSync(
          fileName,
          prettier.format(
            Object.keys(interpolationLabels).reduce((fileContents, key) => {
              return fileContents.replaceAll(
                key,
                (interpolationLabels as any)[key]
              );
            }, tableAPITemplate),
            {
              filepath: fileName,
              ...prettierConfig,
            }
          )
        );
      });

      writeFileSync(
        `${sandboxFolder}/index.ts`,
        moduleFiles
          .map((filePath) => {
            return `export * from '${filePath}'`;
          })
          .join('\n')
      );
    }
  }
})();
