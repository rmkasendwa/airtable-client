export type Table = {
  name: string;
  alias?: string;
  labelPlural?: string;
  labelSingular?: string;
  columnNameToObjectPropertyMapper?: Record<string, string>;
};

export type Config = {
  tables: Table[];
};

export const defineConfig = (config: Config) => config;
