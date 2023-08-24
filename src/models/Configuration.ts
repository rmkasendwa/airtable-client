import { AirtableBase, AirtableField, AirtableFieldOptions } from './Metadata';

export type ConfigAirtableBase = Partial<Pick<AirtableBase, 'id' | 'name'>>;

export type UserEditableDetailedColumnNameToObjectPropertyMapping = Pick<
  AirtableFieldOptions,
  'prefersSingleRecordLink'
> & {
  /**
   * The name of the property on the object that will be mapped to the column.
   */
  propertyName?: string;

  /**
   * The name of the property on the object that will be mapped to the column in pascal case.
   */
  pascalCasePropertyName?: string;

  /**
   * The description of the property.
   */
  description?: string;

  /**
   * The data type of the property. In most cases, this will be inferred from the Airtable field type.
   * However, sometimes you may want to override the inferred type. Overriding the type is common when
   * the Airtable field is a formula field.
   */
  type?: 'boolean' | 'number' | 'number[]' | 'string' | 'string[]';

  /**
   * Whether the lookup field should not be unwrapped to a single record when generating the TypeScript
   * type. This is useful when the lookup field is a many-to-many relationship.
   */
  isLookupWithListOfValues?: boolean;

  /**
   * Whether the field should be present in the record creation payload. By default, all fields are
   * creatable. Set to false to exclude the field from the record creation payload.
   *
   * @default true
   */
  creatable?: boolean;

  /**
   * Whether the field should be present in the record creation and update payload. By default,
   * all fields are updatable. Set to false to exclude the field from the record update payload.
   *
   * @default true
   */
  editable?: boolean;

  /**
   * Whether the field should be required in the record creation and update payload. By default,
   * all fields are not required. Set to true to make the field required.
   *
   * @default false
   */
  required?: boolean;

  /**
   * The minimum value of the field. This is only applicable to number fields.
   */
  min?: number;

  /**
   * The maximum value of the field. This is only applicable to number fields.
   */
  max?: number;

  /**
   * The minimum length of the field. This is only applicable to string fields.
   */
  minLength?: number;

  /**
   * The maximum length of the field. This is only applicable to string fields.
   */
  maxLength?: number;

  /**
   * The airtable field configuration that should be used to generate the property.
   * This field will let you override the default field configuration that is inferred
   * from the Airtable field type.
   */
  fieldOverride?: Omit<AirtableField, 'id' | 'name' | 'description'>;
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

  /**
   * The alternative airtable columns of the table or object field name that can be used
   * to uniquely identify a record.
   */
  alternativeRecordIdColumns?: FocusColumn[];
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
