import { findAllTableFieldReferences } from '../api';
import userConfig from './airtable-api.config';

(async () => {
  const fieldReferences = await findAllTableFieldReferences({
    baseIdOrName: 'Talent',
    tableIdOrName: 'People List',
    fieldIdOrName: 'Current Role',
    userConfig,
  });
  console.log({ fieldReferences });
})();
