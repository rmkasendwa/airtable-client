import { omit, pick } from 'lodash';

import {
  AirtableBase,
  AirtableField,
  DetailedColumnNameToObjectPropertyMapping,
  Table,
} from '../models';
import {
  ModelClass,
  TableColumnValidationSchemaTypeStringGroup,
} from './TypeGenerator';

export type GetEntityTemplateFileInterpolationOptions = {
  base: AirtableBase;
  currentTable: Table;
  nonLookupTableColumns: AirtableField[];
  lookupTableColumns: AirtableField[];
  editableTableColumns: AirtableField[];
  tables: Table[];
  nonLookupColumnNameToObjectPropertyMapper: Record<
    string,
    DetailedColumnNameToObjectPropertyMapping
  >;
  lookupColumnNameToObjectPropertyMapper: Record<
    string,
    DetailedColumnNameToObjectPropertyMapping
  >;
  airtableAPIModelImportsCollector: string[];
  restAPIModelImportsCollector: string[];
  restAPIModelExtrasCollector: ModelClass[];
  queryableNonLookupFields: string[];
  queryableLookupFields: string[];
  columnNameToValidationSchemaTypeStringGroupMapper: Record<
    string,
    TableColumnValidationSchemaTypeStringGroup
  >;
  includeAirtableSpecificQueryParameters?: boolean;
  alternativeRecordIdColumns?: string[];
};

export const getEntityTemplateFileInterpolationBlocks = ({
  base,
  nonLookupTableColumns,
  lookupTableColumns,
  editableTableColumns,
  nonLookupColumnNameToObjectPropertyMapper,
  lookupColumnNameToObjectPropertyMapper,
  queryableNonLookupFields,
  queryableLookupFields,
  columnNameToValidationSchemaTypeStringGroupMapper,
  restAPIModelExtrasCollector,
}: GetEntityTemplateFileInterpolationOptions) => {
  const editableFieldsTypes = editableTableColumns.filter((tableColumn) => {
    return columnNameToValidationSchemaTypeStringGroupMapper[tableColumn.name]
      .requestObjectPropertyTypeValidationString;
  });

  return {
    ['/* AIRTABLE_BASE_ID */']: `"${base.id}"`,
    ['/* AIRTABLE_BASE_NAME */']: `"${base.name}"`,

    ['/* AIRTABLE_ENTITY_COLUMNS */']: nonLookupTableColumns
      .map(({ name }) => `"${name}"`)
      .join(', '),

    ['/* AIRTABLE_ENTITY_LOOKUP_COLUMNS */']: lookupTableColumns
      .map(({ name }) => `"${name}"`)
      .join(', '),

    ['/* AIRTABLE_ENTITY_FIELD_TO_PROPERTY_MAPPINGS */']: nonLookupTableColumns
      .map((tableColumn) => {
        const { name, type } = tableColumn;
        const camelCasePropertyName =
          nonLookupColumnNameToObjectPropertyMapper[name].propertyName;

        return `["${name}"]: ${(() => {
          const obj: any = {
            propertyName: camelCasePropertyName,
            tableColumnType: type,
            ...(() => {
              return pick(
                nonLookupColumnNameToObjectPropertyMapper[name],
                'prefersSingleRecordLink',
                'type',
                'arrayItemSeparator',
                'required',
                'min',
                'max',
                'minLength',
                'maxLength'
              );
            })(),
          };
          if (type === 'multipleRecordLinks') {
            obj.isMultipleRecordLinksField = true;
          }
          return JSON.stringify(obj);
        })()}`;
      })
      .join(',\n'),

    ['/* AIRTABLE_LOOKUP_COLUMN_TO_OBJECT_PROPERTY_MAPPINGS */']:
      lookupTableColumns
        .map(({ name, type, options }) => {
          const parentColumn = nonLookupTableColumns.find(
            ({ id }) => id === options?.recordLinkFieldId
          );
          if (parentColumn) {
            return `["${name}"]:  ${(() => {
              const obj: any = {
                propertyName: (() => {
                  return `${
                    nonLookupColumnNameToObjectPropertyMapper[parentColumn.name]
                      .propertyName
                  }.${
                    lookupColumnNameToObjectPropertyMapper[name].propertyName
                  }`;
                })(),
                tableColumnType: type,
                ...(() => {
                  return pick(
                    lookupColumnNameToObjectPropertyMapper[name],
                    'prefersSingleRecordLink',
                    'isLookupWithListOfValues',
                    'arrayItemSeparator',
                    'required',
                    'min',
                    'max',
                    'minLength',
                    'maxLength',
                    'type'
                  );
                })(),
                ...(() => {
                  if (
                    options?.result?.type &&
                    ['multipleAttachments', 'multipleSelects'].includes(
                      options.result.type
                    )
                  ) {
                    return {
                      isLookupWithListOfValues: true,
                    };
                  }
                })(),
              };
              return JSON.stringify(obj);
            })()}`;
          }
        })
        .filter((lookupColumnMapping) => lookupColumnMapping)
        .join(',\n'),

    ['/* AIRTABLE_RESPONSE_VALIDATION_SCHEMA_FIELDS */']: [
      ...nonLookupTableColumns,
      ...lookupTableColumns,
    ]
      .filter(({ name }) => {
        return columnNameToValidationSchemaTypeStringGroupMapper[name];
      })
      .map(({ name }) => {
        return `["${name}"]: ${columnNameToValidationSchemaTypeStringGroupMapper[name].airtableResponseValidationString}.nullish()`;
      })
      .join(',\n'),

    ['/* QUERYABLE_FIELD_TYPE */']: (() => {
      if (queryableLookupFields.length > 0) {
        return `| ${queryableLookupFields.join(' | ')}`;
      }
      return '';
    })(),

    ['/* QUERYABLE_FIELDS */']: [
      ...queryableNonLookupFields,
      ...queryableLookupFields,
    ]
      .sort()
      .join(', '),

    ['/* BASE_ENTITY_MODEL_FIELDS */']: nonLookupTableColumns
      .map((tableColumn) => {
        const {
          accessModifier,
          decorators,
          propertyName,
          propertyType,
          required,
        } = columnNameToValidationSchemaTypeStringGroupMapper[tableColumn.name];
        const decoratorsCode = Object.entries(decorators)
          .map(([decoratorName, parameters]) => {
            return `@${decoratorName}(${parameters.join(', ')})`;
          })
          .join('\n');
        return `
          ${decoratorsCode}
          ${accessModifier} ${propertyName}${
          required ? '!' : '?'
        }: ${propertyType}
        `.trimIndent();
      })
      .join(';\n\n'),

    ['/* ENTITY_MODEL_FIELDS */']: nonLookupTableColumns
      .map((tableColumn) => {
        const {
          accessModifier,
          decorators,
          propertyName,
          propertyType,
          required,
        } = columnNameToValidationSchemaTypeStringGroupMapper[tableColumn.name];
        const decoratorsCode = Object.entries(decorators)
          .map(([decoratorName, parameters]) => {
            return `@${decoratorName}(${parameters.join(', ')})`;
          })
          .join('\n');
        return `
          ${decoratorsCode}
          ${accessModifier} ${propertyName}${
          required ? '!' : '?'
        }: ${propertyType}
        `.trimIndent();
      })
      .join(';\n\n'),

    ['/* ENTITY_INTERFACE_FIELDS */']: nonLookupTableColumns
      .map((tableColumn) => {
        const { propertyName, propertyType, required } =
          columnNameToValidationSchemaTypeStringGroupMapper[tableColumn.name];

        const modelExtra = restAPIModelExtrasCollector.find(({ modelName }) => {
          return modelName === propertyType;
        });

        if (modelExtra) {
          const modelPropertiesString = modelExtra.modelProperties
            .map(({ propertyName, propertyType, required }) => {
              return `${propertyName}${required ? '' : '?'}: ${propertyType}`;
            })
            .join(';\n');
          return `
              ${propertyName}${
            required ? '' : '?'
          }: {\n${modelPropertiesString}\n}
            `.trimIndent();
        }

        return `
            ${propertyName}${required ? '' : '?'}: ${propertyType}
          `.trimIndent();
      })
      .join(';\n'),

    ['/* REQUEST_ENTITY_PROPERTIES */']: editableFieldsTypes
      .map((tableColumn) => {
        return `"${
          nonLookupColumnNameToObjectPropertyMapper[tableColumn.name]
            .propertyName
        }": ${
          columnNameToValidationSchemaTypeStringGroupMapper[tableColumn.name]
            .requestObjectPropertyTypeValidationString
        }.nullish()`;
      })
      .join(',\n'),

    ['/* BASE_ENTITY_MODEL_CREATABLE_FIELDS */']: editableFieldsTypes
      .map((tableColumn) => {
        const {
          accessModifier,
          decorators,
          editModeDecorators,
          propertyName,
          editablePropertyType,
          propertyType,
          required,
        } = columnNameToValidationSchemaTypeStringGroupMapper[tableColumn.name];
        const decoratorsCode = Object.entries(
          omit(
            {
              ...decorators,
              ...editModeDecorators,
            },
            'Required'
          )
        )
          .map(([decoratorName, parameters]) => {
            return `@${decoratorName}(${parameters.join(', ')})`;
          })
          .join('\n');

        return `
            ${decoratorsCode}
            ${accessModifier} ${propertyName}${required ? '!' : '?'}: ${
          editablePropertyType || propertyType
        }
          `.trimIndent();
      })
      .join(';\n\n'),

    ['/* ENTITY_MODEL_CREATABLE_FIELDS */']: editableFieldsTypes
      .filter((tableColumn) => {
        return (
          nonLookupColumnNameToObjectPropertyMapper[tableColumn.name]
            .creatable !== false &&
          nonLookupColumnNameToObjectPropertyMapper[tableColumn.name]
            .editable !== false
        );
      })
      .map((tableColumn) => {
        const {
          accessModifier,
          decorators,
          editModeDecorators,
          propertyName,
          editablePropertyType,
          propertyType,
          required: baseRequired,
        } = columnNameToValidationSchemaTypeStringGroupMapper[tableColumn.name];
        const decoratorsCode = Object.entries({
          ...decorators,
          ...editModeDecorators,
        })
          .map(([decoratorName, parameters]) => {
            return `@${decoratorName}(${parameters.join(', ')})`;
          })
          .join('\n');
        const required =
          baseRequired ||
          nonLookupColumnNameToObjectPropertyMapper[tableColumn.name].required;

        return `
          ${decoratorsCode}
          ${accessModifier} ${propertyName}${required ? '!' : '?'}: ${
          editablePropertyType || propertyType
        }
        `.trimIndent();
      })
      .join(';\n\n'),

    ['/* ENTITY_MODEL_EDITABLE_FIELDS */']: editableFieldsTypes
      .filter((tableColumn) => {
        return (
          nonLookupColumnNameToObjectPropertyMapper[tableColumn.name]
            .editable !== false
        );
      })
      .map((tableColumn) => {
        const {
          accessModifier,
          decorators,
          editModeDecorators,
          propertyName,
          editablePropertyType,
          propertyType,
          required: baseRequired,
        } = columnNameToValidationSchemaTypeStringGroupMapper[tableColumn.name];
        const required =
          baseRequired ||
          nonLookupColumnNameToObjectPropertyMapper[tableColumn.name].required;

        const decoratorsCode = Object.entries({
          ...decorators,
          ...editModeDecorators,
        })
          .map(([decoratorName, parameters]) => {
            return `@${decoratorName}(${parameters.join(', ')})`;
          })
          .join('\n');
        return `
          ${decoratorsCode}
          ${accessModifier} ${propertyName}${required ? '!' : '?'}: ${
          editablePropertyType || propertyType
        }
        `.trimIndent();
      })
      .join(';\n\n'),

    ['/* ENTITY_MODEL_PATCHABLE_FIELDS */']: editableFieldsTypes
      .filter((tableColumn) => {
        return (
          nonLookupColumnNameToObjectPropertyMapper[tableColumn.name]
            .editable !== false
        );
      })
      .map((tableColumn) => {
        const {
          accessModifier,
          decorators,
          editModeDecorators,
          propertyName,
          editablePropertyType,
          propertyType,
          required,
        } = columnNameToValidationSchemaTypeStringGroupMapper[tableColumn.name];
        let propertyTypeCode = editablePropertyType || propertyType;
        const allDecorators = omit(
          {
            ...decorators,
            ...editModeDecorators,
          },
          'Required'
        );
        const decoratorsCode = [
          ...Object.entries(allDecorators).map(
            ([decoratorName, parameters]) => {
              return `@${decoratorName}(${parameters.join(', ')})`;
            }
          ),
          ...(() => {
            if (!required) {
              propertyTypeCode = `${propertyTypeCode} | null`;
              const nullableModelCode = (() => {
                if (allDecorators.Enum) {
                  return 'String';
                }
                return (editablePropertyType || propertyType)
                  .replace(/\[\]$/g, '')
                  .toPascalCase();
              })();
              return [`@Nullable(${nullableModelCode})`];
            }
            return [];
          })(),
        ].join('\n');
        return `
            ${decoratorsCode}
            ${accessModifier} ${propertyName}?: ${propertyTypeCode}
          `.trimIndent();
      })
      .join(';\n\n'),

    ['/* TSED_CONTROLLER_DECORATOR_IMPORTS */']: `import { Authenticate, Authorize, RegisterMutation } from '../../../../decorators';`,
  } as Record<string, string>;
};

export const getEntityTemplateFileInterpolationLabels = ({
  currentTable,
  airtableAPIModelImportsCollector,
  restAPIModelImportsCollector,
  restAPIModelExtrasCollector,
  views,
  labelSingular,
  labelPlural,
  nonLookupTableColumns,
  columnNameToValidationSchemaTypeStringGroupMapper,
  nonLookupColumnNameToObjectPropertyMapper,
  alternativeRecordIdColumns,
}: Omit<
  GetEntityTemplateFileInterpolationOptions,
  'base' | 'editableTableColumns'
> & {
  views: string[];
  labelSingular: string;
  labelPlural: string;
}) => {
  const { name: tableName } = currentTable;

  return {
    ['/* AIRTABLE_VIEWS */']: views
      .map((view) => {
        return `"${RegExp.escape(view)}"`;
      })
      .join(', '),

    ['/* AIRTABLE_API_MODEL_IMPORTS */']: [
      ...new Set(airtableAPIModelImportsCollector),
    ].join('\n'),

    ['/* REST_API_MODEL_IMPORTS */']: [
      ...new Set(restAPIModelImportsCollector),
    ].join('\n'),

    ['/* REST_API_MODEL_EXTRAS */']: [
      ...new Set([
        ...nonLookupTableColumns
          .filter((tableColumn) => {
            return columnNameToValidationSchemaTypeStringGroupMapper[
              tableColumn.name
            ]?.typeDefinitionSnippet;
          })
          .map((tableColumn) => {
            const { typeDefinitionSnippet } =
              columnNameToValidationSchemaTypeStringGroupMapper[
                tableColumn.name
              ];
            return typeDefinitionSnippet!.trimIndent();
          }),
        ...restAPIModelExtrasCollector
          .reduce((accumulator, modelDefinition) => {
            accumulator.push(...modelDefinition.modelProperties);
            return accumulator;
          }, [] as (typeof restAPIModelExtrasCollector)[number]['modelProperties'])
          .filter(({ typeDefinitionSnippet }) => {
            return typeDefinitionSnippet;
          })
          .map(({ typeDefinitionSnippet }) => {
            return typeDefinitionSnippet!.trimIndent();
          }),
        ...restAPIModelExtrasCollector.map(
          ({ modelName, modelProperties, tableColumName }) => {
            const modelPropertiesString = modelProperties
              .map(
                ({
                  accessModifier,
                  decorators,
                  propertyName,
                  propertyType,
                  required,
                }) => {
                  const decoratorsCode = Object.entries(decorators)
                    .map(([decoratorName, parameters]) => {
                      return `@${decoratorName}(${parameters.join(', ')})`;
                    })
                    .join('\n');
                  return `
                    ${decoratorsCode}
                    ${accessModifier} ${propertyName}${
                    required ? '!' : '?'
                  }: ${propertyType}
                  `.trimIndent();
                }
              )
              .join(';\n\n');

            const descriptionDecoratorCode = (() => {
              if (
                nonLookupColumnNameToObjectPropertyMapper[tableColumName]
                  ?.description
              ) {
                return `@Description(${JSON.stringify(
                  nonLookupColumnNameToObjectPropertyMapper[tableColumName]
                    .description
                )})`;
              }
              return '';
            })();

            return `
              ${descriptionDecoratorCode}
              export class ${modelName} {
                ${modelPropertiesString}
              }
            `.trimIndent();
          }
        ),
      ]),
    ].join('\n\n'),

    ['/* AIRTABLE_ENTITY_ALTERNATIVE_RECORD_ID_COLUMNS */']: [
      ...new Set(alternativeRecordIdColumns),
    ]
      .map((fieldName) => {
        return `"${fieldName}"`;
      })
      .join(','),

    ['Entities Table']: tableName,
    ['Entities Label']: labelPlural,
    ['Entity Label']: labelSingular,

    ['entities label']: labelPlural.toLowerCase(),
    ['entity label']: labelSingular.toLowerCase(),

    ['ENTITIES']: labelPlural.replace(/\s/g, '_').toUpperCase(),
    ['ENTITY']: labelSingular.replace(/\s/g, '_').toUpperCase(),

    ['camelCaseEntities']: labelPlural.toCamelCase(),
    ['camelCaseEntity']: labelSingular.toCamelCase(),

    ['PascalCaseEntities']: labelPlural.toPascalCase(),
    ['PascalCaseEntity']: labelSingular.toPascalCase(),

    ['kebab-case-entities']: labelPlural.toKebabCase(),
    ['kebab-case-entity']: labelSingular.toKebabCase(),

    ['snake_case_entities']: labelPlural.replace(/\s/g, '_').toLowerCase(),
    ['snake_case_entity']: labelSingular.replace(/\s/g, '_').toLowerCase(),
  } as Record<string, string>;
};
