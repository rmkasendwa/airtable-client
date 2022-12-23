import {
  AirtableBase,
  AirtableField,
  AirtableView,
  ConfigColumnNameToObjectPropertyMapper,
  Table,
} from '../../models';
import {
  getAirtableResponseTypeValidationString,
  getObjectPropertyTypeString,
  getRequestObjectValidationString,
  getRootAirtableColumn,
} from './TypeGenerator';

export type GetAirtableAPIGeneratorTemplateFileInterpolationOptions = {
  base: AirtableBase;
  currentTable: Table;
  filteredTableColumns: AirtableField[];
  editableTableColumns: AirtableField[];
  tables: Table[];
  columnToPropertyMapper: Record<string, string>;
  modelImportsCollector: string[];
  columnNameToObjectPropertyMapper?: ConfigColumnNameToObjectPropertyMapper<string>;
};

export const getAirtableAPIGeneratorTemplateFileInterpolationBlocks = ({
  base,
  currentTable,
  filteredTableColumns,
  editableTableColumns,
  tables,
  columnToPropertyMapper,
  modelImportsCollector,
  columnNameToObjectPropertyMapper = {},
}: GetAirtableAPIGeneratorTemplateFileInterpolationOptions) => {
  const { id: baseId } = base;
  return {
    ['/* AIRTABLE_BASE_ID */']: `"${baseId}"`,

    ['/* AIRTABLE_ENTITY_COLUMNS */']: filteredTableColumns
      .map(({ name }) => `"${name}"`)
      .join(', '),

    ['/* AIRTABLE_ENTITY_FIELD_TO_PROPERTY_MAPPINGS */']: filteredTableColumns
      .map((field) => {
        const { name } = field;
        const rootColumn = getRootAirtableColumn(field, tables, currentTable);
        const camelCasePropertyName = columnToPropertyMapper[name];
        const columnNameToObjectPropertyMapperConfig =
          columnNameToObjectPropertyMapper[name];

        return `["${name}"]: ${(() => {
          const obj = {
            propertyName: (() => {
              if (columnNameToObjectPropertyMapperConfig) {
                if (
                  typeof columnNameToObjectPropertyMapperConfig === 'string'
                ) {
                  return columnNameToObjectPropertyMapperConfig;
                }
                if (columnNameToObjectPropertyMapperConfig.propertyName) {
                  return columnNameToObjectPropertyMapperConfig.propertyName;
                }
              }
              return camelCasePropertyName;
            })(),
            ...(() => {
              if (
                (rootColumn && rootColumn.options?.prefersSingleRecordLink) ||
                (columnNameToObjectPropertyMapperConfig &&
                  typeof columnNameToObjectPropertyMapperConfig !== 'string' &&
                  columnNameToObjectPropertyMapperConfig.prefersSingleRecordLink)
              ) {
                return {
                  prefersSingleRecordLink: true,
                };
              }
            })(),
          };

          if (Object.keys(obj).length > 1) {
            return JSON.stringify(obj);
          }

          return `"${obj.propertyName}"`;
        })()}`;
      })
      .join(',\n'),

    ['/* AIRTABLE_ENTITY_FIELDS */']: filteredTableColumns
      .map((field) => {
        const { name } = field;
        const rootColumn = getRootAirtableColumn(field, tables, currentTable);
        switch (rootColumn.type) {
          case 'multipleAttachments':
            modelImportsCollector.push(
              `import {AirtableAttachmentValidationSchema} from './__Utils';`
            );
            break;
          case 'button':
            modelImportsCollector.push(
              `import {AirtableButtonValidationSchema} from './__Utils';`
            );
            break;
          case 'formula':
            modelImportsCollector.push(
              `import {AirtableFormulaColumnErrorValidationSchema} from './__Utils';`
            );
        }
        return `["${name}"]: ${getAirtableResponseTypeValidationString(field, {
          currentTable,
          tables,
        })}.nullish()`;
      })
      .join(',\n'),

    ['/* AIRTABLE_ENTITY_EDITABLE_FIELD_TYPE */']: editableTableColumns
      .map(({ name }) => `'${columnToPropertyMapper[name]}'`)
      .join(' | '),

    ['/* REQUEST_ENTITY_PROPERTIES */']: editableTableColumns
      .map(
        (field) =>
          `"${
            columnToPropertyMapper[field.name]
          }": ${getRequestObjectValidationString(field, {
            currentTable,
            tables,
          })}.nullish()`
      )
      .join(',\n'),
  } as Record<string, string>;
};

export const getAirtableAPIGeneratorTemplateFileInterpolationLabels = ({
  currentTable,
  filteredTableColumns,
  columnToPropertyMapper,
  modelImportsCollector,
  views,
  labelSingular,
  labelPlural,
  focusColumnNames,
  tables,
}: Omit<
  GetAirtableAPIGeneratorTemplateFileInterpolationOptions,
  'base' | 'editableTableColumns'
> & {
  views: AirtableView[];
  labelSingular: string;
  labelPlural: string;
  focusColumnNames: string[];
}) => {
  const { name: tableName } = currentTable;

  return {
    ['/* AIRTABLE_VIEWS */']: views
      .map(({ name }) => {
        return `"${RegExp.escape(name)}"`;
      })
      .join(', '),

    ['/* ENTITY_INTERFACE_FIELDS */']: filteredTableColumns
      .map((field) => {
        const camelCasePropertyName = columnToPropertyMapper[field.name];
        const rootColumn = getRootAirtableColumn(field, tables, currentTable);
        switch (rootColumn.type) {
          case 'multipleAttachments':
            modelImportsCollector.push(
              `import {AirtableAttachment} from './__Utils';`
            );
            break;
          case 'button':
            modelImportsCollector.push(
              `import {AirtableButton} from './__Utils';`
            );
            break;
          case 'formula':
            modelImportsCollector.push(
              `import {AirtableFormulaColumnError} from './__Utils';`
            );
        }
        return [
          `${camelCasePropertyName}?: ${getObjectPropertyTypeString(field, {
            currentTable,
            tables,
          })}`,
        ];
      })
      .flat()
      .join(';\n'),

    ['/* ENTITY_FOCUS_FIELDS */']: focusColumnNames
      .map((columnName) => {
        return `"${columnToPropertyMapper[columnName]}"`;
      })
      .join(', '),

    ['/* MODEL_IMPORTS */']: [...new Set(modelImportsCollector)].join('\n'),

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
  } as Record<string, string>;
};
