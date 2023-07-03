import { AirtableBase, AirtableFieldOptions } from './Metadata';

export type ConfigAirtableBase = Partial<Pick<AirtableBase, 'id' | 'name'>>;

export type UserEditableDetailedColumnNameToObjectPropertyMapping = Pick<
  AirtableFieldOptions,
  'prefersSingleRecordLink'
> & {
  propertyName?: string;
  description?: string;
  type?: 'boolean' | 'number' | 'number[]' | 'string' | 'string[]';
  isLookupWithListOfValues?: boolean;
  creatable?: boolean;
  editable?: boolean;
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
};

export type DetailedColumnNameToObjectPropertyMapping = Required<
  Pick<UserEditableDetailedColumnNameToObjectPropertyMapping, 'propertyName'>
> &
  Omit<UserEditableDetailedColumnNameToObjectPropertyMapping, 'propertyName'>;

export type ConfigColumnNameToObjectPropertyMapper<FocusColumn extends string> =
  Partial<{
    [P in FocusColumn]:
      | string
      | UserEditableDetailedColumnNameToObjectPropertyMapping;
  }>;

export type ConfigDetailedColumnNameToObjectPropertyMapper<
  FocusColumn extends string
> = Partial<{
  [P in FocusColumn]: UserEditableDetailedColumnNameToObjectPropertyMapping;
}>;

export type ConfigTable<FocusColumn extends string> = {
  base?: ConfigAirtableBase;
  name: string;
  alias?: string;
  labelPlural?: string;
  labelSingular?: string;
  focusColumns?: (
    | FocusColumn
    | [FocusColumn, UserEditableDetailedColumnNameToObjectPropertyMapping]
  )[];
  columnNameToObjectPropertyMapper?: ConfigColumnNameToObjectPropertyMapper<FocusColumn>;
  views?: string[];
};

export type Config<FocusColumn extends string> = {
  defaultBase: ConfigAirtableBase;
  tables?: ConfigTable<FocusColumn>[];
  bases?: (ConfigAirtableBase & {
    tables?: Omit<ConfigTable<FocusColumn>, 'base'>[];
  })[];
  includeAirtableSpecificQueryParameters?: boolean;
};

export const defineConfig = <FocusColumn extends string>(
  config: Config<FocusColumn>
) => config;
