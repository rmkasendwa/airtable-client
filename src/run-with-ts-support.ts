import '@infinite-debugger/rmk-js-extensions/RegExp';
import '@infinite-debugger/rmk-js-extensions/String';

import { join, normalize } from 'path';

import { existsSync } from 'fs-extra';

import { generateAirtableAPI } from './api';
import { Config } from './models';

const currentWorkingDirectory = process.cwd();

const pkg = (() => {
  if (existsSync(`${__dirname}/package.json`)) {
    return require(`${__dirname}/package.json`);
  }
  const pkgPath = join(__dirname, '..', 'package.json');
  if (existsSync(pkgPath)) {
    return require(pkgPath);
  }
})();

const args = process.argv;

if (args.includes('-G') || args.includes('--generate')) {
  const generateAllTables = args.includes('--all');
  const userConfigFilePath = `${currentWorkingDirectory}/airtable-api.config`;

  if (
    ['.json', '.js', '.ts'].some((fileExtension) =>
      existsSync(userConfigFilePath + fileExtension)
    )
  ) {
    const userConfig: Config<string> = (() => {
      const config = require(userConfigFilePath);
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
  } else {
    console.log('API configuration file not found. Exiting...');
  }
} else {
  console.log(`${pkg.name} v${pkg.version}`);
}
