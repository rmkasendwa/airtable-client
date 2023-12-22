import { generateAirtableAPI } from '../api';
import userConfig from './airtable-api.config';

(async () => {
  // Wait for remote debugger commit
  await (() => {
    return new Promise((resolve) => {
      setTimeout(resolve, 1000 * 10);
    });
  })();
  await generateAirtableAPI({
    userConfig,
    outputRootPath: `${__dirname}/__sandbox`,
  });
  return new Promise((resolve) => {
    setTimeout(resolve, 1000 * 60 * 60 * 24);
  });
})();
