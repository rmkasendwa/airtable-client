import { z } from 'zod';

export const airtablePermissionLevels = [
  'none',
  'read',
  'comment',
  'edit',
  'create',
] as const;

export type AirtablePermissionLevel = typeof airtablePermissionLevels[number];

export const AirtableBaseValidationSchema = z.object({
  id: z.string(),
  name: z.string(),
  permissionLevel: z.enum(airtablePermissionLevels),
});

export type AirtableBase = z.infer<typeof AirtableBaseValidationSchema>;

export const FindAllAirtableBasesResponseValidationSchema = z.object({
  bases: z.array(AirtableBaseValidationSchema),
});

export type FindAllAirtableBasesResponse = z.infer<
  typeof FindAllAirtableBasesResponseValidationSchema
>;

export const FindAirtableBaseByIdResponseValidationSchema =
  AirtableBaseValidationSchema.extend({
    createdTime: z.string(),
  });
