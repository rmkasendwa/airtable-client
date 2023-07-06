import { removeNullValues } from '@infinite-debugger/rmk-utils';
import {
  ArrayOf,
  Default,
  Description,
  Enum,
  Example,
  Property,
  Required,
} from '@tsed/schema';
import { omit } from 'lodash';
import { AnyZodObject, z } from 'zod';

export const airtableFieldTypes = [
  'singleLineText',
  'email',
  'url',
  'multilineText',
  'number',
  'percent',
  'currency',
  'singleSelect',
  'multipleSelects',
  'singleCollaborator',
  'multipleCollaborators',
  'multipleRecordLinks',
  'date',
  'dateTime',
  'phoneNumber',
  'multipleAttachments',
  'checkbox',
  'formula',
  'createdTime',
  'rollup',
  'count',
  'lookup',
  'multipleLookupValues',
  'autoNumber',
  'barcode',
  'rating',
  'richText',
  'duration',
  'lastModifiedTime',
  'button',
  'createdBy',
  'lastModifiedBy',
  'externalSyncSource',
] as const;

export type AirtableFieldType = typeof airtableFieldTypes[number];

export class AirtableSortOption<Field extends string = string> {
  @Property()
  @Required()
  @Description('The field to sort by.')
  public field!: Field;

  @Property()
  @Required()
  @Enum('asc', 'desc')
  @Description('The sort direction')
  @Example('asc')
  public direction?: 'asc' | 'desc';
}

export class FindAllRecordsQueryParams<
  Field extends string = string,
  View extends string = string
> {
  @Property()
  @Description(
    `
    Only data for fields whose names are in this list will be included in the result. If you don't need every field, you can use this parameter to reduce the amount of data transferred.
  `.trimIndent()
  )
  public fields?: Field[];

  @Property()
  @Description(
    `
    A [formula](https://support.airtable.com/docs/formula-field-reference) used to filter records. The formula will be evaluated for each record, and if the result is not 0, false, "", NaN, [], or #Error! the record will be included in the response. We recommend testing your formula in the Formula field UI before using it in your API request.

    If combined with the view parameter, only records in that view which satisfy the formula will be returned.
    
    The formula must be encoded first before passing it as a value. You can use [this tool](https://codepen.io/rmkasendwa/full/qBQPBvJ) to not only encode the formula but also create the entire url you need.
  `.trimIndent()
  )
  public filterByFormula?: string;

  @Property()
  @Description(
    'The maximum total number of records that will be returned in your requests. If this value is larger than pageSize (which is 100 by default), you may have to load multiple pages to reach this total. See the Pagination section below for more.'
  )
  public maxRecords?: number;

  @Property()
  @Description(
    'The number of records returned in each request. Must be less than or equal to 100. Default is 100. See the Pagination section below for more.'
  )
  @Default(100)
  public pageSize?: number;

  @Property()
  @ArrayOf(AirtableSortOption)
  @Description(
    `
    A list of sort objects that specifies how the records will be ordered. Each sort object must have a field key specifying the name of the field to sort on, and an optional direction key that is either "asc" or "desc". The default direction is "asc".

    The sort parameter overrides the sorting of the view specified in the view parameter. If neither the sort nor the view parameter is included, the order of records is arbitrary.
  `.trimIndent()
  )
  public sort?: AirtableSortOption[];

  @Property()
  @Description(
    'The name or ID of a view in the table. If set, only the records in that view will be returned. The records will be sorted according to the order of the view unless the sort parameter is included, which overrides that order. Fields hidden in this view will be returned in the results. To only return a subset of fields, use the fields parameter.'
  )
  public view?: View;

  @Property()
  @Description('The airtable offset to load the next page.')
  public offset?: string;

  /* AIRTABLE_SPECIFIC_QUERY_PARAMETERS */
  @Property()
  @Enum('string', 'json')
  @Description(
    `
    The format that should be used for cell values. Supported values are:

    json: cells will be formatted as JSON, depending on the field type.
  
    string: cells will be formatted as user-facing strings, regardless of the field type. The timeZone and userLocale parameters are required when using string as the cellFormat.
  `.trimIndent()
  )
  public cellFormat?: 'string' | 'json';

  @Property()
  @Description(
    'The time zone that should be used to format dates when using string as the cellFormat. This parameter is required when using string as the cellFormat.'
  )
  public timeZone?: string;

  @Property()
  @Description(
    'The user locale that should be used to format dates when using string as the cellFormat. This parameter is required when using string as the cellFormat.'
  )
  public userLocale?: string;
  /* AIRTABLE_SPECIFIC_QUERY_PARAMETERS */
}

export class CountAllRecordsQueryParams<View extends string = string> {
  @Property()
  @Description(
    `
    A [formula](https://support.airtable.com/docs/formula-field-reference) used to filter records. The formula will be evaluated for each record, and if the result is not 0, false, "", NaN, [], or #Error! the record will be included in the response. We recommend testing your formula in the Formula field UI before using it in your API request.

    If combined with the view parameter, only records in that view which satisfy the formula will be returned.
    
    The formula must be encoded first before passing it as a value. You can use [this tool](https://codepen.io/rmkasendwa/full/qBQPBvJ) to not only encode the formula but also create the entire url you need.
  `.trimIndent()
  )
  public filterByFormula?: string;

  @Property()
  @Description(
    'The name or ID of a view in the table. If set, only the records in that view will be returned. The records will be sorted according to the order of the view unless the sort parameter is included, which overrides that order. Fields hidden in this view will be returned in the results. To only return a subset of fields, use the fields parameter.'
  )
  public view?: View;
}

export class CountAllRecordsResponse {
  @Property()
  @Required()
  @Description('The number of existing records that satisfy the query.')
  public recordsCount!: number;
}

export const DEFAULT_VIEW_NAME = 'Grid view';
export const DEFAULT_VIEW_ALIAS = 'Default';

export const convertToAirtableFindAllRecordsQueryParams = <
  T extends FindAllRecordsQueryParams
>(
  queryParams: T,
  objectPropertyToColumnNameMapper: Record<string, string>,
  lookupObjectPropertyToColumnNameMapper: Record<string, string>
) => {
  const airtableQueryParams: Omit<FindAllRecordsQueryParams, 'fields'> & {
    fields?: string[];
  } = {
    ...omit(queryParams, 'sort', 'fields', 'filterByFormula'),
    ...(() => {
      if (queryParams.sort) {
        return {
          sort: queryParams.sort.map(({ field, direction }) => {
            const columnName = (() => {
              if (field.includes('.')) {
                return lookupObjectPropertyToColumnNameMapper[field];
              }
              return objectPropertyToColumnNameMapper[field];
            })();
            return {
              field: columnName,
              direction: direction,
            };
          }),
        };
      }
    })(),
    ...(() => {
      if (queryParams.fields) {
        return {
          fields: queryParams.fields
            .filter((field) => {
              if (field.includes('.')) {
                return lookupObjectPropertyToColumnNameMapper[field];
              }
              return objectPropertyToColumnNameMapper[field];
            })
            .map((field) => {
              if (field.includes('.')) {
                return lookupObjectPropertyToColumnNameMapper[field];
              }
              return objectPropertyToColumnNameMapper[field];
            }),
        };
      }
    })(),
    ...(() => {
      if (queryParams.filterByFormula) {
        return {
          filterByFormula: queryParams.filterByFormula.replace(
            /\{([\w\.]+?)\}/g,
            (_, field) => {
              const airtableColumnName = (() => {
                if (field.includes('.')) {
                  return lookupObjectPropertyToColumnNameMapper[field];
                }
                return objectPropertyToColumnNameMapper[field];
              })();
              return `{${airtableColumnName || field}}`;
            }
          ),
        };
      }
    })(),
    ...(() => {
      if (queryParams.view) {
        return {
          view: (() => {
            if (queryParams.view && queryParams.view !== DEFAULT_VIEW_ALIAS) {
              return queryParams.view;
            }
          })(),
        };
      }
    })(),
  };

  return airtableQueryParams;
};

export type AirtableColumnConfigMapping<ObjectPropertyName extends string> = {
  propertyName: ObjectPropertyName;
  isMultipleRecordLinksField?: boolean;
  prefersSingleRecordLink?: boolean;
  isLookupWithListOfValues?: boolean;
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  type?: 'boolean' | 'number' | 'number[]' | 'string' | 'string[]';
};

export type AirtableColumnMapping<ObjectPropertyName extends string> =
  | AirtableColumnConfigMapping<ObjectPropertyName>
  | ObjectPropertyName;

export type GetAirtableRecordResponseValidationSchemaOptions = {
  responseFieldsValidationSchema: AnyZodObject;
  nonLookupColumnNameToObjectPropertyMapper: Record<
    string,
    AirtableColumnMapping<string>
  >;
  objectPropertyToAirtableColumnNameMapper: Record<string, string>;
  lookupColumnNameToObjectPropertyMapper: Record<
    string,
    AirtableColumnMapping<string>
  >;
};

export const getAirtableRecordResponseValidationSchema = <
  T extends Record<string, any>
>({
  responseFieldsValidationSchema,
  nonLookupColumnNameToObjectPropertyMapper,
  objectPropertyToAirtableColumnNameMapper,
  lookupColumnNameToObjectPropertyMapper,
}: GetAirtableRecordResponseValidationSchemaOptions) => {
  return z
    .object({
      id: z.string(),
      createdTime: z.string().datetime(),
      fields: responseFieldsValidationSchema,
    })
    .transform(({ createdTime, fields, id }) => {
      const transformedRecord = {
        id,
        created: createdTime,
        ...Object.keys(fields)
          .filter((key) => {
            return fields[key] != null;
          })
          .sort()
          .reduce((accumulator, key) => {
            if (fields[key] != null) {
              const nonLookupColumMapping =
                nonLookupColumnNameToObjectPropertyMapper[key];

              // Check if the field is a lookup column.
              if (lookupColumnNameToObjectPropertyMapper[key]) {
                const [refPropertyName, lookupPropertyName] = (() => {
                  if (
                    typeof lookupColumnNameToObjectPropertyMapper[key] ===
                    'string'
                  ) {
                    return lookupColumnNameToObjectPropertyMapper[
                      key
                    ] as string;
                  }
                  return (
                    lookupColumnNameToObjectPropertyMapper[
                      key
                    ] as AirtableColumnConfigMapping<string>
                  ).propertyName;
                })().split('.');

                // Find parent field
                const nonLookupFieldMap =
                  nonLookupColumnNameToObjectPropertyMapper[
                    objectPropertyToAirtableColumnNameMapper[refPropertyName]
                  ] as any;
                if (nonLookupFieldMap) {
                  if (nonLookupFieldMap.prefersSingleRecordLink) {
                    accumulator[refPropertyName] ||
                      ((accumulator as any)[refPropertyName] = {});
                    (accumulator as any)[refPropertyName][lookupPropertyName] =
                      (() => {
                        if (
                          (
                            lookupColumnNameToObjectPropertyMapper[
                              key
                            ] as AirtableColumnConfigMapping<string>
                          ).isLookupWithListOfValues
                        ) {
                          if (!Array.isArray(fields[key])) {
                            return [fields[key]];
                          }
                          return fields[key];
                        }
                        return fields[key][0];
                      })();
                  } else {
                    accumulator[refPropertyName] ||
                      ((accumulator as any)[refPropertyName] = []);
                    if (Array.isArray(fields[key])) {
                      (fields[key] as any[]).forEach(
                        (lookupFieldValue, index) => {
                          (accumulator as any)[refPropertyName][index] ||
                            ((accumulator as any)[refPropertyName][index] = {});
                          (accumulator as any)[refPropertyName][index][
                            lookupPropertyName
                          ] = lookupFieldValue;
                        }
                      );
                    }
                    (accumulator as any)[refPropertyName][lookupPropertyName] =
                      (() => {
                        if (
                          (
                            lookupColumnNameToObjectPropertyMapper[
                              key
                            ] as AirtableColumnConfigMapping<string>
                          ).isLookupWithListOfValues
                        ) {
                          if (!Array.isArray(fields[key])) {
                            return [fields[key]];
                          }
                          return fields[key];
                        }
                        return fields[key][0];
                      })();
                  }
                }
              } else if (typeof nonLookupColumMapping === 'string') {
                // Check if the field is not an airtable error
                if (
                  fields[key] != null &&
                  !fields[key].specialValue &&
                  !fields[key].error
                ) {
                  (accumulator as any)[nonLookupColumMapping] = fields[key];
                }
              } else if (nonLookupColumMapping.isMultipleRecordLinksField) {
                // Check if reference field
                if (fields[key] != null && Array.isArray(fields[key])) {
                  const linkFieldValue = fields[key] as string[];
                  const { propertyName, prefersSingleRecordLink } =
                    nonLookupColumMapping;
                  if (prefersSingleRecordLink) {
                    accumulator[propertyName] ||
                      ((accumulator as any)[propertyName] = {});
                    (accumulator as any)[propertyName].id = fields[key][0];
                  } else {
                    accumulator[propertyName] ||
                      ((accumulator as any)[propertyName] = []);
                    linkFieldValue.forEach((fieldValue, index) => {
                      if (!(accumulator as any)[propertyName][index]) {
                        (accumulator as any)[propertyName][index] = {};
                      }
                      if (!(accumulator as any)[propertyName][index].id) {
                        (accumulator as any)[propertyName][index].id =
                          fieldValue;
                      }
                    });
                  }
                }
              } else {
                const { type } = nonLookupColumMapping;
                (accumulator as any)[nonLookupColumMapping.propertyName] =
                  fields[key];

                if (type) {
                  switch (type) {
                    case 'boolean':
                      {
                        (accumulator as any)[
                          nonLookupColumMapping.propertyName
                        ] = Boolean(
                          (accumulator as any)[
                            nonLookupColumMapping.propertyName
                          ]
                        );
                      }
                      break;
                    case 'number':
                      {
                        const num = parseFloat(
                          (accumulator as any)[
                            nonLookupColumMapping.propertyName
                          ]
                        );
                        if (!isNaN(num)) {
                          (accumulator as any)[
                            nonLookupColumMapping.propertyName
                          ] = num;
                        } else {
                          delete (accumulator as any)[
                            nonLookupColumMapping.propertyName
                          ];
                        }
                      }
                      break;
                    case 'number[]':
                      {
                        if (
                          Array.isArray(
                            (accumulator as any)[
                              nonLookupColumMapping.propertyName
                            ]
                          )
                        ) {
                          [
                            ...(accumulator as any)[
                              nonLookupColumMapping.propertyName
                            ],
                          ]
                            .filter((value) => {
                              return !isNaN(parseFloat(value));
                            })
                            .map((value) => {
                              return parseFloat(value);
                            });
                        } else {
                          delete (accumulator as any)[
                            nonLookupColumMapping.propertyName
                          ];
                        }
                      }
                      break;
                    case 'string':
                      {
                        (accumulator as any)[
                          nonLookupColumMapping.propertyName
                        ] = String(
                          (accumulator as any)[
                            nonLookupColumMapping.propertyName
                          ]
                        );
                      }
                      break;
                    case 'string[]':
                      {
                        if (
                          Array.isArray(
                            (accumulator as any)[
                              nonLookupColumMapping.propertyName
                            ]
                          )
                        ) {
                          [
                            ...(accumulator as any)[
                              nonLookupColumMapping.propertyName
                            ],
                          ].map((value) => {
                            return String(value);
                          });
                        } else {
                          delete (accumulator as any)[
                            nonLookupColumMapping.propertyName
                          ];
                        }
                      }
                      break;
                  }
                }
              }
            }
            return accumulator;
          }, {} as Omit<T, 'id'>),
      };

      //#region Remove deformed array items
      Object.values(nonLookupColumnNameToObjectPropertyMapper).forEach(
        (nonLookupColumMapping) => {
          if (
            typeof nonLookupColumMapping === 'object' &&
            nonLookupColumMapping.isMultipleRecordLinksField
          ) {
            const { propertyName } = nonLookupColumMapping;
            if (
              transformedRecord[propertyName] &&
              Array.isArray(transformedRecord[propertyName])
            ) {
              const deformedItems = transformedRecord[propertyName].filter(
                ({ id }: any) => !id
              );
              deformedItems.forEach((deformedItem: any) => {
                transformedRecord[propertyName].splice(
                  transformedRecord[propertyName].indexOf(deformedItem),
                  1
                );
              });
            }
          }
        }
      );
      //#endregion

      return removeNullValues(transformedRecord);
    });
};

export const getAirtableRecordRequestValidationSchema = (
  requestValidationSchema: AnyZodObject,
  objectPropertyToColumnNameMapper: Record<
    string,
    AirtableColumnConfigMapping<string>
  >
) => {
  return requestValidationSchema.transform(({ id, ...fields }) => {
    return {
      id,
      fields: Object.keys(fields)
        .filter((key) => {
          return fields[key] != null;
        })
        .reduce((accumulator, key) => {
          const mapping = objectPropertyToColumnNameMapper[
            key
          ] as AirtableColumnMapping<string>;

          if (typeof mapping === 'string') {
            (accumulator as any)[mapping] = fields[key];
          } else {
            const {
              propertyName,
              prefersSingleRecordLink,
              isMultipleRecordLinksField,
            } = mapping;
            (accumulator as any)[propertyName] = (() => {
              if (isMultipleRecordLinksField) {
                if (Array.isArray(fields[key])) {
                  if (prefersSingleRecordLink) {
                    return [fields[key][0].id];
                  }
                  return fields[key].map(({ id }: any) => id);
                } else {
                  return [fields[key].id];
                }
              }
              return fields[key];
            })();
          }
          return accumulator;
        }, {} as Record<string, any>),
    };
  });
};

export const DeleteAirtableRecordResponseValidationSchema = z
  .object({
    records: z.array(
      z.object({
        id: z.string(),
        deleted: z.boolean(),
      })
    ),
  })
  .transform(({ records }) => {
    return records;
  });

export const AirtableAttachmentThumbnailValidationSchema = z.object({
  url: z.string(),
  width: z.number(),
  height: z.number(),
});

export const AirtableAttachmentThumbnailGroupValidationSchema = z.object({
  small: AirtableAttachmentThumbnailValidationSchema.nullish(),
  large: AirtableAttachmentThumbnailValidationSchema.nullish(),
  full: AirtableAttachmentThumbnailValidationSchema.nullish(),
});

export const AirtableAttachmentValidationSchema = z.object({
  id: z.string(),
  width: z.number().nullish(),
  height: z.number().nullish(),
  url: z.string(),
  filename: z.string(),
  size: z.number(),
  type: z.string(),
  thumbnails: AirtableAttachmentThumbnailGroupValidationSchema.nullish(),
});

export class AirtableAttachmentThumbnail {
  @Property()
  @Required()
  @Description('The thumbnail URL.')
  @Example('https://www.filepicker.io/api/file/ULCoXHhx0ivaSyDg5SIg')
  public url!: string;

  @Property()
  @Required()
  @Description('The width of the thumbnail.')
  @Example(64)
  public width!: number;

  @Property()
  @Required()
  @Description('The height of the thumbnail.')
  @Example(64)
  public height!: number;
}

export class AirtableAttachmentThumbnailGroup {
  @Property()
  @Description('The small thumbnail.')
  @Example({
    url: 'https://www.filepicker.io/api/file/vCgLXiayH5UgDSxShoI0',
    width: 54,
    height: 36,
  })
  public small?: AirtableAttachmentThumbnail;

  @Property()
  @Description('The large thumbnail.')
  @Example({
    url: 'https://www.filepicker.io/api/file/ui0ARnU2yuUZ4ehY0qi0',
    width: 197,
    height: 131,
  })
  public large?: AirtableAttachmentThumbnail;

  @Property()
  @Description('The large thumbnail.')
  @Example({
    url: 'https://v5.airtableusercontent.com/v1/13/13/7206610005207/bIbbgi0VoLUe42zY4tn-sg/6zLDXJ2fZ5zZvSoHimlxSzbjTSQ4QIcpAN98fVW/-pWboVONLE10-mbhlXk7sYpuTjqtv7mSY2O2SsYTE_Tg4ZIM8h253PdM3A7U9FRZS_68iFxygr-rQGvzZbtubeGes6',
    width: 3000,
    height: 3000,
  })
  public full?: AirtableAttachmentThumbnail;
}

export class AirtableAttachment {
  @Property()
  @Required()
  @Description('The id of the attachment.')
  @Example('attL8HyJ4HiaudbBJ')
  public id!: string;

  @Property()
  @Required()
  @Description('The attachment width.')
  @Example(144)
  public width!: number;

  @Property()
  @Required()
  @Description('The attachment height.')
  @Example(144)
  public height!: number;

  @Property()
  @Required()
  @Description('The attachment URL.')
  @Example(
    'https://v5.airtableusercontent.com/v1/13/13/2610752006007/RI51n3urgmQT8QKzLwlhnU/f1EqI4fPTACz8osywCFfw--kAv717Z6EGx8MOZnX3OGjqYpsGqdhlXUbSyYnOCOs-pQd_5eHNjbGprAnrDkRan/MYGj8OggA5ZRKdjUUDxyQLR5IZA33oucbyxvmfFkTIg'
  )
  public url!: string;

  @Property()
  @Required()
  @Description('The name of the attachment file.')
  @Example('dog.png')
  public filename!: string;

  @Property()
  @Required()
  @Description('The size of the attachment file in bytes.')
  @Example(4146)
  public size!: number;

  @Property()
  @Required()
  @Description('The mime type of the attachment file.')
  @Example('image/png')
  public type!: string;

  @Property()
  @Description('The attachment thumbnails.')
  @Example({
    small: {
      url: 'https://v5.airtableusercontent.com/v1/13/13/6075000710622/zA1nk30Z_h9MA9Ahg1mxJq/11GHxrybSFMCzJbexzwO0gHAwSWKqqH8ovOyR2YiezC6ZYma8icW87yw-s0_6Mg2ZaB2G7lFOiztypreHSdSvi/0vYOKJr3Pi3ksBdIM-4IqR7HxPJUBXs6eHqqkzFxZ8U',
      width: 36,
      height: 36,
    },
    large: {
      url: 'https://v5.airtableusercontent.com/v1/13/13/2017005662007/kbDstWmhNUzDEptuLJNCQb/47KtSWqOLbwfS8_4HwEWSeZlz14bMANkX2coOHSuFDpLbmYAQhPJCcs_15821f2KCzeIKXSH84zqjB6t4B3FQe/QMGR7gOtIcco4GPl7l_0firaau-p7a2j--JBEMtB8Zj',
      width: 144,
      height: 144,
    },
    full: {
      url: 'https://v5.airtableusercontent.com/v1/13/13/0002621775600/t4eLoU4izb0IbsnVY2gbg-/svGir93FTOPvxWf-bzVj0b3FU7SRo_El7mY-e9oLsDplbi425z-IW_SrZZksZm42ZymQ8OuMH6gbtSzfhVJuvN/jtTSA7Z21pdT6bcXqI8hpQSMg8Y5TQYeEzxGNXA62LS',
      width: 3000,
      height: 3000,
    },
  })
  public thumbnails?: AirtableAttachmentThumbnailGroup;
}

// Validates airtable formula column errors.
export const AirtableFormulaColumnErrorValidationSchema = z.object({
  specialValue: z.enum(['NaN'] as const).nullish(),
  error: z.string().nullish(),
});

export class AirtableFormulaColumnError {
  @Property()
  @Description('Invalid output of a formula.')
  @Example('NaN')
  public specialValue?: 'NaN';

  @Property()
  @Description('The error message')
  @Example('#Error!')
  public error?: string;
}

export const AirtableButtonValidationSchema = z.object({
  label: z.string(),
  url: z.string().url(),
});

export class AirtableButton {
  @Property()
  @Required()
  @Description('The button label')
  @Example('Make Document')
  public label!: string;

  @Property()
  @Required()
  @Description('The URL that should be opened when the button is clicked')
  @Example(
    'https://airtable.com/tbljnMFy6nqsFHFR7/recIXIpWdiuZd9VYg?blocks=blxYtqVDViGvyu90b'
  )
  public url!: string;
}

export class DeleteAirtableRecordResponse {
  @Property()
  @Required()
  @Description('Unique identifer of the deleted item.')
  @Example('recM9m1bZOccF2TY0')
  public id!: string;

  @Property()
  @Required()
  @Description('Whether the item was deleted or not.')
  @Example(true)
  public delete!: boolean;
}

export class DeleteAirtableRecordsResponse {
  @Property()
  @Required()
  @ArrayOf(DeleteAirtableRecordResponse)
  @Description('The list of deleted items.')
  public records!: DeleteAirtableRecordResponse[];
}
