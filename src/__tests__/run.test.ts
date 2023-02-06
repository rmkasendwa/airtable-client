import { generateAirtableAPI } from '../api';
import userConfig from './airtable-api.config';

generateAirtableAPI({
  userConfig,
  outputRootPath: `${__dirname}/__sandbox`,
});
