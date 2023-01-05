import { AirtableBase, AirtableFieldOptions } from './Metadata';

export type ConfigAirtableBase = Partial<Pick<AirtableBase, 'id' | 'name'>>;

export type DetailedColumnNameToObjectPropertyMapping = Pick<
  AirtableFieldOptions,
  'prefersSingleRecordLink'
> & {
  propertyName?: string;
};

export type ConfigColumnNameToObjectPropertyMapper<FocusColumn extends string> =
  Partial<{
    [P in FocusColumn]: string | DetailedColumnNameToObjectPropertyMapping;
  }>;

export type ConfigTable<FocusColumn extends string> = {
  base?: ConfigAirtableBase;
  name: string;
  alias?: string;
  labelPlural?: string;
  labelSingular?: string;
  focusColumns?: FocusColumn[];
  columnNameToObjectPropertyMapper?: ConfigColumnNameToObjectPropertyMapper<FocusColumn>;
  views?: string[];
};

export type Config<FocusColumn extends string> = {
  defaultBase: ConfigAirtableBase;
  tables?: ConfigTable<FocusColumn>[];
  bases?: (ConfigAirtableBase & {
    tables?: Omit<ConfigTable<FocusColumn>, 'base'>[];
  })[];
};

export const defineConfig = <FocusColumn extends string>(
  config: Config<FocusColumn>
) => config;
