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

export type AirtableColumnMapping<T extends string> =
  | {
      propertyName: T;
      prefersSingleRecordLink?: boolean;
    }
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
  objectPropertyToColumnNameMapper: any
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
  small: AirtableThumbnailSizeValidationSchema,
  large: AirtableThumbnailSizeValidationSchema,
  full: AirtableThumbnailSizeValidationSchema,
});

export const AirtableAttachmentValidationSchema = z.object({
  id: z.string(),
  width: z.number(),
  height: z.number(),
  url: z.string(),
  filename: z.string(),
  size: z.number(),
  type: z.string(),
  thumbnails: AirtableAttachmentThumbnailValidationSchema,
});

export const AirtableFormulaColumnErrorValidationSchema = z.object({
  specialValue: z.enum(['NaN'] as const),
});

export const AirtableButtonValidationSchema = z.object({
  label: z.string(),
  url: z.string().url(),
});
