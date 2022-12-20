import { z } from 'zod';

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
