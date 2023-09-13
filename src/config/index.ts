import { join } from 'path';

import { existsSync } from 'fs-extra';

export const pkg = ((): {
  name: string;
  version: string;
} => {
  const primaryPkPath = join(__dirname, '..', 'package.json');
  if (existsSync(primaryPkPath)) {
    return require(primaryPkPath);
  }
  const pkgPath = join(__dirname, '..', '..', 'package.json');
  if (existsSync(pkgPath)) {
    return require(pkgPath);
  }
  throw new Error('Could not find package.json');
})();
