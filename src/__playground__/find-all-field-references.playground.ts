import { ensureDirSync, writeFileSync } from 'fs-extra';
import pluralize from 'pluralize';

import { findAllTableFieldReferences } from '../api';
import userConfig from './airtable-api.config';

const DUMP_DIR = `${__dirname}/dump`;
ensureDirSync(DUMP_DIR);

(async () => {
  const fieldReferences = await findAllTableFieldReferences({
    baseIdOrName: 'Talent',
    tableIdOrName: 'People List',
    fieldIdOrName: 'Current Role',
    userConfig,
  });
  fieldReferences.sort(
    ({ tableName: aTableName }, { tableName: bTableName }) => {
      return aTableName.localeCompare(bTableName);
    }
  );

  //#region Group field references by table and output list of fields as text
  const fieldReferencesByTable = fieldReferences.reduce<
    Record<string, string[]>
  >((acc, { tableName, fieldName }) => {
    if (!acc[tableName]) {
      acc[tableName] = [];
    }
    acc[tableName].push(fieldName);
    return acc;
  }, {});
  const fieldReferencesByTableText = Object.entries(fieldReferencesByTable)
    .reduce<string[]>((acc, [tableName, fieldNames]) => {
      acc.push(
        [
          `${tableName} (${fieldNames.length} ${pluralize(
            'fields',
            fieldNames.length
          )}):`,
          fieldNames
            .sort()
            .map((fieldName) => {
              return ` -> ${fieldName}`;
            })
            .join('\n'),
        ].join('\n')
      );
      return acc;
    }, [])
    .join('\n\n');
  //#endregion

  //#region Dump fields likely to be affected if the `Current Role` field is changed
  writeFileSync(
    `${DUMP_DIR}/fields-likely-to-be-affected-if-current-role-field-is-changed.dump`,
    `${fieldReferencesByTableText}\n\nSummary\nTable Affected: ${
      Object.keys(fieldReferencesByTable).length
    }\nTotal Fields Affected: ${fieldReferences.length}`
  );
  //#endregion
})();
