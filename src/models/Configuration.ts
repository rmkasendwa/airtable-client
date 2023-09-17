import { AirtableBase } from './Bases';
import { AirtableField, AirtableFieldOptions } from './Tables';

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
   * The serialized example value of the property. This is useful when you want to generate a TypeScript type.
   *
   * @example '1234'
   * @example '"A word"'
   * @example '["A word", "Another word"]'
   * @example 'true'
   * @example 'false'
   * @example '{ id: "1234", name: "A word" }'
   */
  example?: string;

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
  Omit<
    UserEditableDetailedColumnNameToObjectPropertyMapping,
    'propertyName'
  > & {
    id: string;
  };

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
  /**
   * The base that the table belongs to.
   */
  base?: ConfigAirtableBase;

  /**
   * The name of the table.
   */
  name: string;

  /**
   * The alias of the table. This is useful when the table name is not a valid JavaScript
   * identifier. For example, if the table name is "English Levels", you can set the alias
   * to "englishLevels" to make the generated TypeScript API
   */
  alias?: string;

  /**
   * The plural label of the table. This is useful when the table name is not a valid
   * JavaScript identifier. For example, if the table name is "English Levels", you can
   * set the plural label to "englishLevels" to make the generated TypeScript API
   */
  labelPlural?: string;

  /**
   * The singular label of the table. This is useful when the table name is not a valid
   * JavaScript identifier. For example, if the table name is "English Levels", you can
   * set the singular label to "englishLevel" to make the generated TypeScript API
   */
  labelSingular?: string;

  /**
   * The list of columns that should be included in the generated TypeScript API.
   */
  focusColumns?: (
    | FocusColumn
    | [FocusColumn, UserEditableDetailedColumnNameToObjectPropertyMapping]
  )[];

  /**
   * The mapping of Airtable column names to object property names. This is useful when the
   * Airtable column name is not a valid JavaScript identifier. For example, if the Airtable
   * column name is "First Name", you can map it to "firstName" by setting the mapping to
   * { 'First Name': 'firstName' }.
   */
  columnNameToObjectPropertyMapper?: ConfigColumnNameToObjectPropertyMapper<FocusColumn>;

  /**
   * The list of views that should be included in the generated TypeScript API.
   */
  views?: string[];

  /**
   * The alternative airtable columns of the table or object field name that can be used
   * to uniquely identify a record.
   */
  alternativeRecordIdColumns?: FocusColumn[];
};

export type Config<FocusColumn extends string> = {
  /**
   * The default base that should be used when the base is not specified in the table.
   */
  defaultBase: ConfigAirtableBase;

  /**
   * The list of tables that should be included in the generated TypeScript API.
   */
  tables?: ConfigTable<FocusColumn>[];

  /**
   * The list of bases that should be included in the generated TypeScript API.
   */
  bases?: (ConfigAirtableBase & {
    tables?: Omit<ConfigTable<FocusColumn>, 'base'>[];
  })[];

  /**
   * Whether the generated TypeScript API should include Airtable specific query parameters.
   * This is useful when you want to use the generated TypeScript API to make requests to
   * the Airtable API directly.
   */
  includeAirtableSpecificQueryParameters?: boolean;
};

export const defineConfig = <FocusColumn extends string>(
  config: Config<FocusColumn>
) => config;
