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

export type AirtableSortOption<Field extends string = string> = {
  field: Field;
  direction?: 'asc' | 'desc';
};

export type FindAllRecordsQueryParams<
  Field extends string = string,
  View extends string = string
> = {
  fields?: Field[];
  filterByFormula?: string;
  maxRecords?: number;
  pageSize?: number;
  sort?: AirtableSortOption<Field>[];
  view?: View;
  cellFormat?: 'string' | 'json';
  timeZone?: string;
  userLocale?: string;
  offset?: string;
};

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
    ...omit(queryParams, 'sort', 'fields'),
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
  };

  return airtableQueryParams;
};

export type AirtableColumnConfigMapping<ObjectPropertyName extends string> = {
  propertyName: ObjectPropertyName;
  isMultipleRecordLinksField?: boolean;
  prefersSingleRecordLink?: boolean;
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
  lookupColumnNameToObjectPropertyMapper: Record<string, string>;
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
                const [refPropertyName, lookupPropertyName] =
                  lookupColumnNameToObjectPropertyMapper[key].split('.');

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
                    fields[key][0];
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
                (accumulator as any)[noneLookupColumMapping.propertyName] =
                  fields[key];
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

export type AirtableAttachment = z.infer<
  typeof AirtableAttachmentValidationSchema
>;

// Validates airtable formula column errors.
export const AirtableFormulaColumnErrorValidationSchema = z.object({
  specialValue: z.enum(['NaN'] as const).nullish(),
  error: z.string().nullish(),
});

export type AirtableFormulaColumnError = z.infer<
  typeof AirtableFormulaColumnErrorValidationSchema
>;

export const AirtableButtonValidationSchema = z.object({
  label: z.string(),
  url: z.string().url(),
});

export type AirtableButton = z.infer<typeof AirtableButtonValidationSchema>;
