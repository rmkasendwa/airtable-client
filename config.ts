export type Table<FocusColumn extends string> = {
  name: string;
  alias?: string;
  labelPlural?: string;
  labelSingular?: string;
  focusColumns: FocusColumn[];
  columnNameToObjectPropertyMapper?: Partial<{
    [P in FocusColumn]: string;
  }>;
};

export type Config<FocusColumn extends string> = {
  tables: Table<FocusColumn>[];
};

export const defineConfig = <FocusColumn extends string>(
  config: Config<FocusColumn>
) => config;
