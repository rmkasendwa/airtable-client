import { AirtableBase } from './Metadata';

export type ConfigTable<FocusColumn extends string> = {
  base?: Partial<AirtableBase>;
  name: string;
  alias?: string;
  labelPlural?: string;
  labelSingular?: string;
  focusColumns: FocusColumn[];
  columnNameToObjectPropertyMapper?: Partial<{
    [P in FocusColumn]: string;
  }>;
};

export type Config<FocusColumn extends string = any> = {
  defaultBase: Partial<AirtableBase>;
  tables: ConfigTable<FocusColumn>[];
};

export const defineConfig = (config: Config) => config;
