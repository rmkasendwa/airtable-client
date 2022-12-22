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

export type AirtableSortOption<T> = {
  field: keyof T;
  direction?: 'asc' | 'desc';
};

export type FindAllRecordsQueryParams<
  T extends Record<string, any> = Record<string, any>,
  ViewType extends string = string
> = {
  fields?: (keyof T)[];
  filterByFormula?: string;
  maxRecords?: number;
  pageSize?: number;
  sort?: AirtableSortOption<T>[];
  view?: ViewType;
  cellFormat?: 'string' | 'json';
  timeZone?: string;
  userLocale?: string;
  offset?: string;
};

export const convertToAirtableFindAllRecordsQueryParams = <
  T extends FindAllRecordsQueryParams
>(
  queryParams: T,
  objectPropertyToColumnNameMapper: Record<string, string>
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
              return objectPropertyToColumnNameMapper[field];
            })
            .map((field) => {
              return objectPropertyToColumnNameMapper[field];
            }),
        };
      }
    })(),
  };

  return airtableQueryParams;
};

export type AirtableColumnConfigMapping<T extends string> = {
  propertyName: T;
  prefersSingleRecordLink?: boolean;
};

export type AirtableColumnMapping<T extends string> =
  | AirtableColumnConfigMapping<T>
  | T;

/**
 * Generates the airtable record response validation schema.
 *
 * @param responseFieldsValidationSchema The response validation schema.
 * @param columnNameToObjectPropertyMapper The column name to object property mapper.
 * @returns The airtable record response validation schema.
 */
export const getAirtableRecordResponseValidationSchema = <T>(
  responseFieldsValidationSchema: AnyZodObject,
  columnNameToObjectPropertyMapper: any
) => {
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
          .reduce((accumulator, key) => {
            const mapping = columnNameToObjectPropertyMapper[
              key
            ] as AirtableColumnMapping<string>;
            if (typeof mapping === 'string') {
              (accumulator as any)[mapping] = fields[key];
            } else {
              const { propertyName, prefersSingleRecordLink } = mapping;
              (accumulator as any)[propertyName] = (() => {
                if (prefersSingleRecordLink && Array.isArray(fields[key])) {
                  return (fields[key] as string[])[0];
                }
                return fields[key];
              })();
            }
            return accumulator;
          }, {} as Omit<T, 'id'>),
      };
    });
};

export const getAirtableRecordRequestValidationSchema = <T>(
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
        }, {} as Omit<T, 'id'>),
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

export const AirtableThumbnailSizeValidationSchema = z.object({
  url: z.string(),
  width: z.number(),
  height: z.number(),
});

export const AirtableAttachmentThumbnailValidationSchema = z.object({
  small: AirtableThumbnailSizeValidationSchema.nullish(),
  large: AirtableThumbnailSizeValidationSchema.nullish(),
  full: AirtableThumbnailSizeValidationSchema.nullish(),
});

export const AirtableAttachmentValidationSchema = z.object({
  id: z.string(),
  width: z.number().nullish(),
  height: z.number().nullish(),
  url: z.string(),
  filename: z.string(),
  size: z.number(),
  type: z.string(),
  thumbnails: AirtableAttachmentThumbnailValidationSchema.nullish(),
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
