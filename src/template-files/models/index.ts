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
