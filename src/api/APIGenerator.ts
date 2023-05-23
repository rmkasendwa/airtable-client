import '@infinite-debugger/rmk-js-extensions/RegExp';
import '@infinite-debugger/rmk-js-extensions/String';

import { dirname, join, normalize, relative } from 'path';

import {
  ensureDirSync,
  existsSync,
  readFileSync,
  removeSync,
  writeFileSync,
} from 'fs-extra';
import prettier from 'prettier';
import walk from 'walk-sync';

import {
  AirtableFieldType,
  Config,
  ConfigColumnNameToObjectPropertyMapper,
  DetailedColumnNameToObjectPropertyMapping,
} from '../models';
import { findAllAirtableBases, findAllTablesByBaseId } from './Metadata';
import {
  ModelClass,
  TableColumnValidationSchemaTypeStringGroup,
  getAirtableAPIGeneratorTemplateFileInterpolationBlocks,
  getAirtableAPIGeneratorTemplateFileInterpolationLabels,
  getCamelCaseFieldPropertyName,
  getExpandedAirtableLookupColumn,
  getTableColumnValidationSchemaTypeStrings,
} from './Utils';

const prettierConfig: prettier.Options = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  endOfLine: 'auto',
};

const airtableAPIFolderName = 'Airtable';

/****************** CONSTANTS *********************/
const LOOKUP_TABLE_COLUMN_TYPES: AirtableFieldType[] = [
  'lookup',
  'multipleLookupValues',
];

export interface GenerateAirtableAPIConfig {
  userConfig: Config<string>;
  outputRootPath: string;
  generateAllTables?: boolean;
  generateAPIClientConfig?: boolean;
}

export const generateAirtableAPI = async ({
  userConfig,
  outputRootPath,
  generateAllTables = false,
  generateAPIClientConfig = false,
}: GenerateAirtableAPIConfig) => {
  console.log('Generating airtable API...');

  const configBases = [
    userConfig.defaultBase,
    ...(userConfig.tables || [])
      .filter(({ base }) => {
        return base;
      })
      .map(({ base }) => {
        return base!;
      }),
    ...(userConfig.bases || []).map(({ id, name }) => {
      return { id, name };
    }),
  ];

  const configTables = [
    ...(userConfig.tables || []).map((table) => {
      return {
        ...table,
        base: table.base || userConfig.defaultBase,
      };
    }),
    ...(userConfig.bases || [])
      .map((base) => {
        return (base.tables || []).map((table) => {
          return {
            ...table,
            base,
          };
        });
      })
      .flat(),
  ];

  const includeAirtableSpecificQueryParameters =
    userConfig.includeAirtableSpecificQueryParameters;

  const outputFolderPath = normalize(
    `${outputRootPath}/${airtableAPIFolderName}`
  );

  // Template files
  const templatesFolderPath = normalize(join(__dirname, '../template-files'));
  const templateFilePaths = walk(templatesFolderPath, {
    includeBasePath: true,
    directories: false,
  })
    .map((filePath) => normalize(filePath))
    .filter((filePath) => {
      return !filePath.match(/\.(template|placeholder)\.\w+$/g);
    });
  const modulePermissionsTemplate = readFileSync(
    join(
      __dirname,
      '../template-files/permissions/__entity_permissions_group.template.txt'
    ),
    'utf-8'
  );

  const { bases } = await findAllAirtableBases(); // Loading all airtable bases accessible by the API key

  // Filtering focus airtable base (Bases defined in user config)
  const workingBases = bases.filter(({ name, id }) => {
    return configBases.some(({ id: configBaseId, name: configBaseName }) => {
      return (
        (configBaseId && configBaseId === id) ||
        (configBaseName && configBaseName.trim() === name.trim())
      );
    });
  });

  if (workingBases.length > 0) {
    // Cleaning up output directory
    if (existsSync(outputFolderPath)) {
      removeSync(outputFolderPath);
    }
    ensureDirSync(outputFolderPath);

    // Processing each focus airtable base
    workingBases.forEach(async (workingBase) => {
      const { id: workingBaseId, name: workingBaseName } = workingBase;

      const { tables } = await findAllTablesByBaseId(workingBaseId); // Loading table in airtable base.

      const filteredTables = tables.filter(({ name }) => {
        return (
          generateAllTables ||
          configTables.length <= 0 ||
          configTables.some(({ name: configTableName, base }) => {
            return (
              configTableName &&
              configTableName.trim() === name.trim() &&
              ((base.id && base.id === workingBaseId) ||
                (base.name && base.name.trim() === workingBaseName.trim()))
            );
          })
        );
      });

      // Filtering focus tables (tables defined in user config)
      if (filteredTables.length > 0) {
        console.log(
          `\nProcessing \x1b[34m${workingBaseName.trim()}\x1b[0m base...`
        );

        const pascalCaseBaseName = workingBaseName.toPascalCase();
        const baseAPIOutputFolderPath = normalize(
          `${outputFolderPath}/${pascalCaseBaseName}`
        );

        // Permissions exports
        const permissionsImports: string[] = [];
        const permissionsExports: string[] = [];
        const permissionsObjectStrings: string[] = [];

        const moduleFiles: string[] = [];

        // Processing each focus table.
        filteredTables.forEach((table) => {
          const { name: tableName, fields: columns, views } = table;

          // Table Configuration.
          const {
            labelPlural,
            labelSingular,
            focusColumns: focusColumnNames,
            configColumnNameToObjectPropertyMapper,
            configViews,
          } = (() => {
            const outputConfig: {
              labelPlural: string;
              labelSingular: string;
              focusColumns?: string[];
              configColumnNameToObjectPropertyMapper?: ConfigColumnNameToObjectPropertyMapper<string>;
              configViews?: string[];
            } = { labelPlural: '', labelSingular: '' };

            // Finding table definition in user config
            const configTable = configTables.find(({ name, base }) => {
              return (
                name.trim() === tableName.trim() &&
                ((base.id && base.id === workingBaseId) ||
                  (base.name && base.name.trim() === workingBaseName.trim()))
              );
            });

            if (configTable) {
              const {
                alias: configTableAlias,
                name: configTableName,
                focusColumns,
                columnNameToObjectPropertyMapper:
                  configColumnNameToObjectPropertyMapper,
                views,
              } = configTable;
              if (configTable.labelPlural) {
                outputConfig.labelPlural = configTable.labelPlural;
              } else {
                const sanitisedTableName = (configTableAlias || configTableName)
                  .trim()
                  .replace(/[^\w\s]/g, '');
                outputConfig.labelPlural = (() => {
                  if (!sanitisedTableName.match(/s$/g)) {
                    return sanitisedTableName + 's';
                  }
                  return sanitisedTableName;
                })();
              }
              if (configTable.labelSingular) {
                outputConfig.labelSingular = configTable.labelSingular;
              } else {
                const labelPlural = outputConfig.labelPlural!;
                outputConfig.labelSingular = (() => {
                  if (labelPlural.match(/ies$/)) {
                    return labelPlural.replace(/ies$/, 'y');
                  }
                  return labelPlural.replace(/s$/g, '');
                })();
              }
              focusColumns && (outputConfig.focusColumns = focusColumns.sort());
              configColumnNameToObjectPropertyMapper &&
                (outputConfig.configColumnNameToObjectPropertyMapper =
                  configColumnNameToObjectPropertyMapper);
              views && (outputConfig.configViews = views);
            } else {
              const sanitisedTableName = tableName
                .trim()
                .replace(/[^\w\s]/g, '');
              outputConfig.labelPlural = (() => {
                if (!sanitisedTableName.match(/s$/g)) {
                  return sanitisedTableName + 's';
                }
                return sanitisedTableName;
              })();
              outputConfig.labelSingular = (() => {
                if (outputConfig.labelPlural.match(/ies$/)) {
                  return outputConfig.labelPlural.replace(/ies$/, 'y');
                }
                return outputConfig.labelPlural.replace(/s$/g, '');
              })();
            }

            return outputConfig;
          })();

          // Filtering views
          const filteredViews = views
            .sort((a, b) => a.name.localeCompare(b.name))
            .filter(({ name }) => {
              return !configViews || configViews.includes(name);
            });

          const filteredTableColumns = columns
            .sort((a, b) => {
              return a.name.localeCompare(b.name);
            })
            .filter(({ name }) => {
              return (
                (name.replace(/[^\w\s]/g, '').length > 0 || // Filtering table columns with names with invalid characters
                  configColumnNameToObjectPropertyMapper?.[name]) &&
                (!focusColumnNames || focusColumnNames.includes(name))
              );
            })
            .filter(({ name }) => {
              return (
                !name.match(/^id$/gi) || // Filtering columns that match the id field to avoid overwriting the id
                configColumnNameToObjectPropertyMapper?.[name]
              );
            });

          const nonLookupTableColumns = filteredTableColumns
            .filter(({ type }) => {
              return !type || !LOOKUP_TABLE_COLUMN_TYPES.includes(type);
            })
            .reduce((accumulator, field) => {
              // Filtering columns with similar names.
              if (!accumulator.find(({ name }) => name === field.name)) {
                accumulator.push(field);
              }
              return accumulator;
            }, [] as typeof columns);

          const lookupTableColumns = filteredTableColumns
            .filter(({ type, options }) => {
              // Making sure the lookup column has a parent field on the table.
              return (
                type === 'multipleLookupValues' &&
                options?.recordLinkFieldId &&
                filteredTableColumns.find(
                  ({ id }) => id === options?.recordLinkFieldId
                ) != null
              );
            })
            .reduce((accumulator, field) => {
              // Filtering lookup columns with similar references.
              if (
                !accumulator.find(({ options }) => {
                  return (
                    options?.recordLinkFieldId &&
                    options?.fieldIdInLinkedTable &&
                    field.options?.recordLinkFieldId &&
                    field.options?.fieldIdInLinkedTable &&
                    options.recordLinkFieldId ===
                      field.options.recordLinkFieldId &&
                    options.fieldIdInLinkedTable ===
                      field.options.fieldIdInLinkedTable
                  );
                })
              ) {
                accumulator.push(field);
              }
              return accumulator;
            }, [] as typeof columns);

          // Lookup column name to parent column name map
          const lookupColumnNameToParentColumnNameMap =
            lookupTableColumns.reduce((accumulator, { name, options }) => {
              const parentColumn = columns.find(
                ({ id }) => id === options?.recordLinkFieldId
              );
              if (parentColumn) {
                accumulator[name] = parentColumn.name;
              } else {
                console.log(`No parent column found for ${name}`);
              }
              return accumulator;
            }, {} as Record<string, string>);

          // Finding editable table columns
          const editableTableColumns = nonLookupTableColumns.filter(
            ({ type }) => {
              switch (type) {
                case 'singleLineText':
                case 'multilineText':
                case 'richText':
                case 'phoneNumber':
                case 'singleSelect':
                case 'url':
                case 'email':
                case 'number':
                case 'percent':
                case 'currency':
                case 'count':
                case 'autoNumber':
                case 'rating':
                case 'checkbox':
                case 'multipleRecordLinks':
                case 'date':
                case 'dateTime':
                case 'lastModifiedTime':
                case 'createdTime':
                case 'multipleSelects':
                  return true;
              }
              return false;
            }
          );

          // TODO: Make imports objects with setting keys as paths and values as a list of import objects.
          const airtableAPIModelImportsCollector: string[] = [];
          const restAPIModelImportsCollector: string[] = [];
          const restAPIModelExtrasCollector: ModelClass[] = [];

          console.log(
            `  -> Processing \x1b[34m${workingBaseName.trim()}/${tableName.trim()}\x1b[0m table...`
          );

          const nonLookupColumnNameToObjectPropertyMapper =
            nonLookupTableColumns.reduce((accumulator, tableColumn) => {
              accumulator[tableColumn.name] = {
                propertyName: (() => {
                  // Extracting column object property name from user config.
                  if (configColumnNameToObjectPropertyMapper) {
                    if (
                      configColumnNameToObjectPropertyMapper[
                        tableColumn.name
                      ] &&
                      typeof configColumnNameToObjectPropertyMapper[
                        tableColumn.name
                      ] !== 'string' &&
                      (
                        configColumnNameToObjectPropertyMapper[
                          tableColumn.name
                        ] as any
                      ).propertyName
                    ) {
                      return (
                        configColumnNameToObjectPropertyMapper[
                          tableColumn.name
                        ] as any
                      ).propertyName;
                    }
                    if (
                      configColumnNameToObjectPropertyMapper[
                        tableColumn.name
                      ] &&
                      typeof configColumnNameToObjectPropertyMapper[
                        tableColumn.name
                      ] === 'string'
                    ) {
                      return configColumnNameToObjectPropertyMapper[
                        tableColumn.name
                      ];
                    }
                  }

                  return getCamelCaseFieldPropertyName(tableColumn); // Automatically converting table column name to camel case object property name
                })(),
                ...(() => {
                  // Extracting prefer single record link
                  const prefersSingleRecordLink = Boolean(
                    tableColumn.options?.prefersSingleRecordLink ||
                      (configColumnNameToObjectPropertyMapper?.[
                        tableColumn.name
                      ] &&
                        typeof configColumnNameToObjectPropertyMapper?.[
                          tableColumn.name
                        ] === 'object' &&
                        (
                          configColumnNameToObjectPropertyMapper?.[
                            tableColumn.name
                          ] as DetailedColumnNameToObjectPropertyMapping
                        ).prefersSingleRecordLink)
                  );
                  if (prefersSingleRecordLink) {
                    return { prefersSingleRecordLink };
                  }
                })(),
                ...(() => {
                  // Extracting user defined object data type
                  if (
                    typeof configColumnNameToObjectPropertyMapper?.[
                      tableColumn.name
                    ] === 'object' &&
                    (
                      configColumnNameToObjectPropertyMapper![
                        tableColumn.name
                      ] as DetailedColumnNameToObjectPropertyMapping
                    ).type
                  ) {
                    return {
                      type: (
                        configColumnNameToObjectPropertyMapper[
                          tableColumn.name
                        ] as DetailedColumnNameToObjectPropertyMapping
                      ).type,
                    };
                  }
                })(),
              };
              return accumulator;
            }, {} as Record<string, DetailedColumnNameToObjectPropertyMapping>);

          const lookupColumnNameToObjectPropertyMapper =
            lookupTableColumns.reduce((accumulator, tableColumn) => {
              const parentField = (() => {
                const recordLinkFieldId =
                  tableColumn.options?.recordLinkFieldId;
                if (recordLinkFieldId) {
                  const recordLinkField = table.fields.find(
                    ({ id }) => id === recordLinkFieldId
                  );
                  if (recordLinkField) {
                    const linkedTableId =
                      recordLinkField.options?.linkedTableId;
                    const fieldIdInLinkedTable =
                      tableColumn.options?.fieldIdInLinkedTable;
                    if (linkedTableId && fieldIdInLinkedTable) {
                      const linkedTable = tables.find(
                        ({ id }) => id === linkedTableId
                      );
                      if (linkedTable) {
                        const linkedField = linkedTable.fields.find(
                          ({ id }) => id === fieldIdInLinkedTable
                        );
                        if (linkedField) {
                          return linkedField;
                        }
                      }
                    }
                  }
                }
                return tableColumn;
              })();

              const shouldFlattenLookupField = (
                lookupTableColumn: typeof tableColumn,
                lookupTable: typeof table
              ): boolean => {
                const referenceTableColumn = lookupTable.fields.find(
                  ({ id }) =>
                    id === lookupTableColumn.options?.recordLinkFieldId
                );
                const tablecolumnOneLevelUp = getExpandedAirtableLookupColumn(
                  lookupTableColumn,
                  tables,
                  lookupTable
                );

                if (
                  referenceTableColumn?.options?.prefersSingleRecordLink &&
                  tablecolumnOneLevelUp.type === 'multipleLookupValues'
                ) {
                  return shouldFlattenLookupField(
                    tablecolumnOneLevelUp,
                    tables.find(
                      ({ id }) =>
                        id === referenceTableColumn.options?.linkedTableId
                    )!
                  );
                }

                return Boolean(
                  referenceTableColumn?.options?.prefersSingleRecordLink &&
                    !(
                      [
                        'multipleLookupValues',
                        'multipleSelects',
                      ] as typeof tablecolumnOneLevelUp.type[]
                    ).includes(tablecolumnOneLevelUp.type)
                );
              };

              const flattenLookupField = shouldFlattenLookupField(
                tableColumn,
                table
              );

              accumulator[tableColumn.name] = {
                propertyName: (() => {
                  // Extracting column object property name from user config.
                  const propertyName: string | undefined = (() => {
                    if (configColumnNameToObjectPropertyMapper) {
                      if (
                        configColumnNameToObjectPropertyMapper[
                          tableColumn.name
                        ] &&
                        typeof configColumnNameToObjectPropertyMapper[
                          tableColumn.name
                        ] !== 'string' &&
                        (
                          configColumnNameToObjectPropertyMapper[
                            tableColumn.name
                          ] as any
                        ).propertyName
                      ) {
                        return (
                          configColumnNameToObjectPropertyMapper[
                            tableColumn.name
                          ] as any
                        ).propertyName;
                      }
                      if (
                        configColumnNameToObjectPropertyMapper[
                          tableColumn.name
                        ] &&
                        typeof configColumnNameToObjectPropertyMapper[
                          tableColumn.name
                        ] === 'string'
                      ) {
                        return configColumnNameToObjectPropertyMapper[
                          tableColumn.name
                        ];
                      }
                    }
                  })();

                  if (propertyName) {
                    if (propertyName.match(/\./g)) {
                      return propertyName.split('.').slice(-1)[0];
                    }
                    return propertyName;
                  }

                  return getCamelCaseFieldPropertyName(parentField); // Automatically converting parent table column name to camel case object property name
                })(),
                ...(() => {
                  if (flattenLookupField) {
                    return {
                      prefersSingleRecordLink: flattenLookupField,
                    };
                  }
                })(),
                ...(() => {
                  if (
                    configColumnNameToObjectPropertyMapper?.[
                      tableColumn.name
                    ] &&
                    typeof configColumnNameToObjectPropertyMapper?.[
                      tableColumn.name
                    ] === 'object' &&
                    (
                      configColumnNameToObjectPropertyMapper?.[
                        tableColumn.name
                      ] as DetailedColumnNameToObjectPropertyMapping
                    ).isLookupWithListOfValues
                  ) {
                    return { isLookupWithListOfValues: true };
                  }
                })(),
                ...(() => {
                  // Extracting user defined object data type
                  if (
                    typeof configColumnNameToObjectPropertyMapper?.[
                      tableColumn.name
                    ] === 'object' &&
                    (
                      configColumnNameToObjectPropertyMapper![
                        tableColumn.name
                      ] as DetailedColumnNameToObjectPropertyMapping
                    ).type
                  ) {
                    return {
                      type: (
                        configColumnNameToObjectPropertyMapper[
                          tableColumn.name
                        ] as DetailedColumnNameToObjectPropertyMapping
                      ).type,
                    };
                  }
                })(),
              };
              return accumulator;
            }, {} as Record<string, DetailedColumnNameToObjectPropertyMapping>);

          // Finding user defined queryable focus columns
          const queryableNonLookupFields = (focusColumnNames || [])
            .filter((columnName) => {
              return nonLookupColumnNameToObjectPropertyMapper[columnName];
            })
            .map((columnName) => {
              return `"${nonLookupColumnNameToObjectPropertyMapper[columnName].propertyName}"`;
            });

          // Finding user defined queryable focus columns
          const queryableLookupFields = (focusColumnNames || [])
            .filter((columnName) => {
              return lookupColumnNameToObjectPropertyMapper[columnName];
            })
            .map((columnName) => {
              return `"${
                nonLookupColumnNameToObjectPropertyMapper[
                  lookupColumnNameToParentColumnNameMap[columnName]
                ].propertyName
              }.${
                lookupColumnNameToObjectPropertyMapper[columnName].propertyName
              }"`;
            });

          // TODO: Merge all schema generation calls
          const columnNameToValidationSchemaTypeStringGroupMapper = [
            ...nonLookupTableColumns,
          ].reduce((accumulator, tableColumn) => {
            const tableColumnValidationSchemaTypeStrings =
              getTableColumnValidationSchemaTypeStrings(tableColumn, {
                airtableAPIModelImportsCollector,
                currentTable: table,
                tableLabelSingular: labelSingular,
                nonLookupColumnNameToObjectPropertyMapper,
                lookupColumnNameToObjectPropertyMapper,
                lookupTableColumns,
                restAPIModelExtrasCollector,
                restAPIModelImportsCollector,
                tables,
              });

            if (tableColumn.type === 'multipleRecordLinks') {
              const tableColumnModelExtras = restAPIModelExtrasCollector.find(
                ({ modelName }) => {
                  return (
                    modelName ===
                    tableColumnValidationSchemaTypeStrings.propertyType.replace(
                      /\[\]$/g,
                      ''
                    )
                  );
                }
              );
              if (tableColumnModelExtras) {
                const { modelProperties } = tableColumnModelExtras;
                modelProperties.forEach((modelProperty) => {
                  accumulator[modelProperty.tableColumName] = modelProperty;
                });
              }
            }

            accumulator[tableColumn.name] =
              tableColumnValidationSchemaTypeStrings;
            return accumulator;
          }, {} as Record<string, TableColumnValidationSchemaTypeStringGroup>);

          // Getting interpolation block replacement map
          const interpolationBlocks =
            getAirtableAPIGeneratorTemplateFileInterpolationBlocks({
              base: workingBase,
              currentTable: table,
              nonLookupTableColumns,
              lookupTableColumns,
              editableTableColumns,
              tables,
              nonLookupColumnNameToObjectPropertyMapper,
              lookupColumnNameToObjectPropertyMapper,
              airtableAPIModelImportsCollector,
              restAPIModelImportsCollector,
              queryableLookupFields,
              queryableNonLookupFields,
              restAPIModelExtrasCollector,
              columnNameToValidationSchemaTypeStringGroupMapper,
              includeAirtableSpecificQueryParameters,
            });

          // Getting interpolation string replacement map
          const interpolationLabels =
            getAirtableAPIGeneratorTemplateFileInterpolationLabels({
              currentTable: table,
              nonLookupTableColumns,
              lookupTableColumns,
              tables,
              nonLookupColumnNameToObjectPropertyMapper,
              lookupColumnNameToObjectPropertyMapper,
              airtableAPIModelImportsCollector,
              restAPIModelImportsCollector,
              views: filteredViews,
              labelPlural,
              labelSingular,
              queryableLookupFields,
              queryableNonLookupFields,
              restAPIModelExtrasCollector,
              columnNameToValidationSchemaTypeStringGroupMapper,
              includeAirtableSpecificQueryParameters,
            });

          // Replacing interpolation templates in template file contents
          const getInterpolatedString = (templateFileContents: string) => {
            return Object.keys(interpolationLabels).reduce(
              (fileContents, key) => {
                return fileContents.replaceAll(key, interpolationLabels[key]);
              },
              Object.keys(interpolationBlocks).reduce((fileContents, key) => {
                const escapedKey = RegExp.escape(key);
                return fileContents.replace(
                  new RegExp(`${escapedKey}([\\s\\S]*)${escapedKey}`, 'g'),
                  interpolationBlocks[key]
                );
              }, templateFileContents)
            );
          };

          moduleFiles.push(`./api/${labelPlural.toPascalCase()}`); // Adding api file to exportable files

          templateFilePaths.forEach((templateFilePath) => {
            const templateFileContents = readFileSync(
              templateFilePath,
              'utf-8'
            );
            const filePath = getInterpolatedString(
              `${baseAPIOutputFolderPath}${templateFilePath.replace(
                templatesFolderPath,
                ''
              )}`
            );

            ensureDirSync(dirname(filePath));

            writeFileSync(
              filePath,
              prettier.format(getInterpolatedString(templateFileContents), {
                filepath: filePath,
                ...prettierConfig,
              })
            );
          });

          // Permissions
          // Accumulating all focus table permissions
          permissionsImports.push(
            getInterpolatedString(`
              import {
                MANAGE_ENTITIES_PERMISSION,
                CREATE_ENTITY_PERMISSION,
                VIEW_ENTITIES_PERMISSION,
                VIEW_ENTITY_DETAILS_PERMISSION,
                UPDATE_ENTITY_PERMISSION,
                DELETE_ENTITY_PERMISSION
              } from './PascalCaseEntities';
            `)
          );
          permissionsExports.push(
            getInterpolatedString(`export * from './PascalCaseEntities';`)
          );
          permissionsObjectStrings.push(
            getInterpolatedString(
              `
              // Entities Label Permissions.
              ${modulePermissionsTemplate}
            `.trimIndent()
            )
          );
        });

        writeFileSync(
          `${baseAPIOutputFolderPath}/index.ts`,
          moduleFiles
            .map((filePath) => {
              return `export * from '${filePath}'`;
            })
            .join('\n')
        );

        const permissionsFilePath = `${baseAPIOutputFolderPath}/permissions/index.ts`;
        writeFileSync(
          permissionsFilePath,
          prettier.format(
            `
            ${permissionsImports.join('\n')}
            ${permissionsExports.join('\n')}

            export const allPermissions = [${permissionsObjectStrings.join(
              ',\n\n'
            )}];
          `.trimIndent(),
            {
              filepath: permissionsFilePath,
              ...prettierConfig,
            }
          )
        );

        // Generate api client config file
        const clientTemplateDirectory = `${baseAPIOutputFolderPath}/__client_template`;
        if (existsSync(clientTemplateDirectory)) {
          if (generateAPIClientConfig) {
            const clientConfigFileContents = walk(clientTemplateDirectory, {
              includeBasePath: true,
              directories: false,
            }).reduce((accumulator, filePath) => {
              const relativeFilePath = relative(
                clientTemplateDirectory,
                filePath
              );
              accumulator[relativeFilePath] = readFileSync(filePath, 'utf-8');
              return accumulator;
            }, {} as Record<string, string>);
            writeFileSync(
              `${baseAPIOutputFolderPath}/api-client.config.json`,
              JSON.stringify(clientConfigFileContents, null, 2)
            );
          }
          removeSync(clientTemplateDirectory);
        }

        console.log(
          `\n\x1b[32mAirtable [${workingBaseName.trim()}] base API generated here: ${baseAPIOutputFolderPath}\x1b[0m`
        );
      }
    });
  }
};
