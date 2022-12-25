import '@infinite-debugger/rmk-js-extensions/RegExp';
import '@infinite-debugger/rmk-js-extensions/String';

import { join, normalize } from 'path';

import { generateAirtableAPI } from './api';
import { Config } from './models';

export * from './api';

const args = process.argv;

if (args.includes('-G') || args.includes('--generate')) {
  const currentWorkingDirectory = process.cwd();
  const generateAllTables = args.includes('--all');

  const userConfig: Config<string> = (() => {
    const config = require('./airtable-api.config');
    if (config.default) {
      return config.default;
    }
    return config;
  })();

  const outputRootPath = (() => {
    if (args.includes('-o')) {
      const argsPath = args[args.indexOf('-o') + 1];
      if (argsPath) {
        return normalize(join(currentWorkingDirectory, argsPath));
      }
    }
    return currentWorkingDirectory;
  })();

  generateAirtableAPI({
    userConfig,
    outputRootPath,
    generateAllTables,
  });
}
