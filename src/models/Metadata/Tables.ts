import { z } from 'zod';

export const AirtableFieldResultSchema = z.object({
  type: z.string(),
  // options: options2Schema, // Should circular reference options schema
});

export const AirtableFieldOptionsSchema = z.object({
  isValid: z.boolean().optional(),
  referencedFieldIds: z.array(z.string()).optional(),
  result: AirtableFieldResultSchema.nullish(),
  recordLinkFieldId: z.string().nullish(),
  fieldIdInLinkedTable: z.string().nullish(),
  choices: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        color: z.string().optional(),
      })
    )
    .optional(),
  linkedTableId: z.string().optional(),
  isReversed: z.boolean().optional(),
  prefersSingleRecordLink: z.boolean().optional(),
  inverseLinkFieldId: z.string().optional(),
  dateFormat: z
    .object({
      name: z.string(),
      format: z.string(),
    })
    .optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  precision: z.number().optional().optional(),
  viewIdForRecordSelection: z.string().optional(),
  symbol: z.string().optional(),
  timeFormat: z
    .object({
      name: z.string(),
      format: z.string(),
    })
    .optional(),
  timeZone: z.string().optional(),
  max: z.number().optional(),
  durationFormat: z.string().optional(),
});

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

export const AirtableFieldSchema = z.object({
  id: z.string(),
  type: z.enum(airtableFieldTypes).optional(),
  name: z.string(),
  description: z.string().optional(),
  options: AirtableFieldOptionsSchema.optional(),
});

export const airtableViewTypes = [
  'grid',
  'form',
  'calendar',
  'gallery',
  'kanban',
  'timeline',
  'block',
] as const;

export type AirtableViewType = typeof airtableViewTypes[number];

export const AirtableViewSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(airtableViewTypes),
  visibleFieldIds: z.array(z.string()).optional(),
});

export const TableSchema = z.object({
  id: z.string(),
  name: z.string(),
  primaryFieldId: z.string(),
  fields: z.array(AirtableFieldSchema),
  views: z.array(AirtableViewSchema),
});

export const TablesResponseValidationSchema = z.object({
  tables: z.array(TableSchema),
});
