import { AirtableBase } from './Metadata';

export type ConfigAirtableBase = Partial<Pick<AirtableBase, 'id' | 'name'>>;

export type ConfigTable<FocusColumn extends string> = {
  base?: ConfigAirtableBase;
  name: string;
  alias?: string;
  labelPlural?: string;
  labelSingular?: string;
  focusColumns?: FocusColumn[];
  columnNameToObjectPropertyMapper?: Partial<{
    [P in FocusColumn]: string;
  }>;
};

export type Config<FocusColumn extends string = any> = {
  defaultBase: ConfigAirtableBase;
  tables: ConfigTable<FocusColumn>[];
  bases?: (ConfigAirtableBase & {
    tables?: Omit<ConfigTable<FocusColumn>, 'base'>[];
  })[];
};

export const defineConfig = (config: Config) => config;
