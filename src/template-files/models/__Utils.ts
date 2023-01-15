import {
  ArrayOf,
  Default,
  Description,
  Enum,
  Example,
  Property,
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
  @Description('The field to sort by.')
  public field!: Field;

  @Property()
  @Enum(['asc', 'desc'] as const)
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

    For example, to only return data from Name and Status, send these two query parameters:

    fields%5B%5D=Name&fields%5B%5D=Status
    You can also perform the same action with field ids (they can be found in the fields section):

    fields%5B%5D=fldG9yBafL709WagC&fields%5B%5D=fldySXPDpkljy1BCq
    Note: %5B%5D may be omitted when specifying multiple fields, but must always be included when specifying only a single field.
  `
      .trimIndent()
      .trim()
  )
  public fields?: Field[];

  @Property()
  @Description(
    `
    A formula used to filter records. The formula will be evaluated for each record, and if the result is not 0, false, "", NaN, [], or #Error! the record will be included in the response. We recommend testing your formula in the Formula field UI before using it in your API request.

    If combined with the view parameter, only records in that view which satisfy the formula will be returned.
    
    The formula must be encoded first before passing it as a value. You can use this tool to not only encode the formula but also create the entire url you need. For example, to only include records where Name isn't empty, pass in NOT({Name} = '') as a parameter like this:
    
    filterByFormula=NOT%28%7BName%7D%20%3D%20%27%27%29
  `
      .trimIndent()
      .trim()
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

    For example, to sort records by name in descending order, send these two query parameters:

    sort%5B0%5D%5Bfield%5D=name
    sort%5B0%5D%5Bdirection%5D=desc
  `
      .trimIndent()
      .trim()
  )
  public sort?: AirtableSortOption[];

  @Property()
  @Description(
    'The name or ID of a view in the table. If set, only the records in that view will be returned. The records will be sorted according to the order of the view unless the sort parameter is included, which overrides that order. Fields hidden in this view will be returned in the results. To only return a subset of fields, use the fields parameter.'
  )
  public view?: View;

  @Property()
  @Description(
    `
    The format that should be used for cell values. Supported values are:

    json: cells will be formatted as JSON, depending on the field type.
  
    string: cells will be formatted as user-facing strings, regardless of the field type. The timeZone and userLocale parameters are required when using string as the cellFormat.
  `
      .trimIndent()
      .trim()
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

  @Property()
  @Description('The airtable offset to load the next page.')
  public offset?: string;
}

export const convertToAirtableFindAllRecordsQueryParams = <
  T extends FindAllRecordsQueryParams
>(
  queryParams: T,
  objectPropertyToColumnNameMapper: Record<string, string>,
  lookupObjectPropertyToColumnNameMapper: Record<string, string>
) => {
  const airtableQueryParams: Omit<
    FindAllRecordsQueryParams,
    'sort' | 'fields'
  > & {
    sort?: string[];
    fields?: string[];
  } = {
    ...omit(queryParams, 'sort', 'fields', 'filterByFormula'),
    ...(() => {
      if (queryParams.sort) {
        return {
          sort: queryParams.sort
            .map(({ field, direction }, index) => {
              return [
                `sort[${index}][field]=${field}`,
                ...(() => {
                  if (direction) {
                    return `sort[${index}][direction]=${direction}`;
                  }
                  return [];
                })(),
              ];
            })
            .flat(),
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
  };

  return airtableQueryParams;
};

export type AirtableColumnConfigMapping<ObjectPropertyName extends string> = {
  propertyName: ObjectPropertyName;
  isMultipleRecordLinksField?: boolean;
  prefersSingleRecordLink?: boolean;
  type?: 'boolean' | 'number' | 'number[]' | 'string' | 'string[]';
};

export type AirtableColumnMapping<ObjectPropertyName extends string> =
  | AirtableColumnConfigMapping<ObjectPropertyName>
  | ObjectPropertyName;

export type GetAirtableRecordResponseValidationSchemaOptions = {
  responseFieldsValidationSchema: AnyZodObject;
  columnNameToObjectPropertyMapper: Record<
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
  columnNameToObjectPropertyMapper,
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
      return {
        id,
        created: createdTime,
        ...Object.keys(fields)
          .filter((key) => {
            return fields[key] != null;
          })
          .sort()
          .reduce((accumulator, key) => {
            if (fields[key] != null) {
              const noneLookupColumMapping =
                columnNameToObjectPropertyMapper[key];

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

                // Find parent field and make sure it only accepts one value
                if (
                  (
                    columnNameToObjectPropertyMapper[
                      objectPropertyToAirtableColumnNameMapper[refPropertyName]
                    ] as any
                  )?.prefersSingleRecordLink
                ) {
                  accumulator[refPropertyName] ||
                    ((accumulator as any)[refPropertyName] = {});
                  (accumulator as any)[refPropertyName][lookupPropertyName] =
                    (() => {
                      if (
                        (
                          lookupColumnNameToObjectPropertyMapper[
                            key
                          ] as AirtableColumnConfigMapping<string>
                        ).prefersSingleRecordLink
                      ) {
                        return fields[key][0];
                      }
                      return fields[key];
                    })();
                }
              } else if (typeof noneLookupColumMapping === 'string') {
                (accumulator as any)[noneLookupColumMapping] = fields[key];
              } else if (noneLookupColumMapping.isMultipleRecordLinksField) {
                if (fields[key] != null && Array.isArray(fields[key])) {
                  const linkFieldValue = fields[key] as string[];
                  const { propertyName, prefersSingleRecordLink } =
                    noneLookupColumMapping;
                  if (prefersSingleRecordLink) {
                    accumulator[propertyName] ||
                      ((accumulator as any)[propertyName] = {});
                    (accumulator as any)[propertyName].id = fields[key][0];
                  } else {
                    accumulator[propertyName] ||
                      ((accumulator as any)[propertyName] = []);
                    linkFieldValue.forEach((fieldValue, index) => {
                      (accumulator as any)[propertyName][index] = {
                        id: fieldValue,
                      };
                    });
                  }
                }
              } else {
                const { type } = noneLookupColumMapping;
                (accumulator as any)[noneLookupColumMapping.propertyName] =
                  fields[key];

                if (type) {
                  switch (type) {
                    case 'boolean':
                      {
                        (accumulator as any)[
                          noneLookupColumMapping.propertyName
                        ] = Boolean(
                          (accumulator as any)[
                            noneLookupColumMapping.propertyName
                          ]
                        );
                      }
                      break;
                    case 'number':
                      {
                        const num = parseFloat(
                          (accumulator as any)[
                            noneLookupColumMapping.propertyName
                          ]
                        );
                        if (!isNaN(num)) {
                          (accumulator as any)[
                            noneLookupColumMapping.propertyName
                          ] = num;
                        } else {
                          delete (accumulator as any)[
                            noneLookupColumMapping.propertyName
                          ];
                        }
                      }
                      break;
                    case 'number[]':
                      {
                        if (
                          Array.isArray(
                            (accumulator as any)[
                              noneLookupColumMapping.propertyName
                            ]
                          )
                        ) {
                          [
                            ...(accumulator as any)[
                              noneLookupColumMapping.propertyName
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
                            noneLookupColumMapping.propertyName
                          ];
                        }
                      }
                      break;
                    case 'string':
                      {
                        (accumulator as any)[
                          noneLookupColumMapping.propertyName
                        ] = String(
                          (accumulator as any)[
                            noneLookupColumMapping.propertyName
                          ]
                        );
                      }
                      break;
                    case 'string[]':
                      {
                        if (
                          Array.isArray(
                            (accumulator as any)[
                              noneLookupColumMapping.propertyName
                            ]
                          )
                        ) {
                          [
                            ...(accumulator as any)[
                              noneLookupColumMapping.propertyName
                            ],
                          ].map((value) => {
                            return String(value);
                          });
                        } else {
                          delete (accumulator as any)[
                            noneLookupColumMapping.propertyName
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
            const { propertyName, prefersSingleRecordLink } = mapping;
            (accumulator as any)[propertyName] = (() => {
              if (prefersSingleRecordLink && !Array.isArray(fields[key])) {
                return [fields[key]];
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
        delete: z.boolean(),
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
  @Description('The thumbnail URL.')
  @Example('https://www.filepicker.io/api/file/ULCoXHhx0ivaSyDg5SIg')
  public url!: string;

  @Property()
  @Description('The width of the thumbnail.')
  @Example(64)
  public width!: number;

  @Property()
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
  @Description('The id of the attachment.')
  @Example('attL8HyJ4HiaudbBJ')
  public id!: string;

  @Property()
  @Description('The attachment width.')
  @Example(144)
  public width!: number;

  @Property()
  @Description('The attachment height.')
  @Example(144)
  public height!: number;

  @Property()
  @Description('The attachment URL.')
  @Example(
    'https://v5.airtableusercontent.com/v1/13/13/2610752006007/RI51n3urgmQT8QKzLwlhnU/f1EqI4fPTACz8osywCFfw--kAv717Z6EGx8MOZnX3OGjqYpsGqdhlXUbSyYnOCOs-pQd_5eHNjbGprAnrDkRan/MYGj8OggA5ZRKdjUUDxyQLR5IZA33oucbyxvmfFkTIg'
  )
  public url!: string;

  @Property()
  @Description('The name of the attachment file.')
  @Example('dog.png')
  public filename!: string;

  @Description('The size of the attachment file in bytes.')
  @Example(4146)
  @Property()
  public size!: number;

  @Property()
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
  @Description('The button label')
  @Example('Make Document')
  public label!: string;

  @Property()
  @Description('The URL that should be opened when the button is clicked')
  @Example(
    'https://airtable.com/tbljnMFy6nqsFHFR7/recIXIpWdiuZd9VYg?blocks=blxYtqVDViGvyu90b'
  )
  public url!: string;
}

export class DeleteAirtableRecordResponse {
  @Property()
  @Description('Unique identifer of the deleted item.')
  @Example('recM9m1bZOccF2TY0')
  public id!: string;

  @Property()
  @Description('Whether the item was deleted or not.')
  @Example(true)
  public delete!: boolean;
}

export class DeleteAirtableRecordsResponse {
  @Property()
  @ArrayOf(DeleteAirtableRecordResponse)
  @Description('The list of deleted items.')
  public records!: DeleteAirtableRecordResponse[];
}
