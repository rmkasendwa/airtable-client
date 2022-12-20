import { z } from 'zod';

import {
  AirtableColumnMapping,
  getAirtableRecordValidationSchema,
} from './__Utils';

/* MODEL_IMPORTS */

export type PascalCaseEntity = {
  id: string;
  /* ENTITY_INTERFACE_FIELDS */
};

export const camelCaseEntitiesAirtableFieldsValidationSchema = {
  /* AIRTABLE_ENTITY_FIELDS */
  a: z.string().nullish(),
  /* AIRTABLE_ENTITY_FIELDS */
} as const;

export type PascalCaseEntitiesAirtableColumn =
  keyof typeof camelCaseEntitiesAirtableFieldsValidationSchema;

export const PascalCaseEntityAirtableColumnMapper: Record<
  PascalCaseEntitiesAirtableColumn,
  AirtableColumnMapping
> = {
  /* AIRTABLE_ENTITY_FIELD_TO_PROPERTY_MAPPINGS */
  a: {
    propertyName: 'a',
  },
  /* AIRTABLE_ENTITY_FIELD_TO_PROPERTY_MAPPINGS */
} as const;

export const PascalCaseEntityAirtableValidationSchema =
  getAirtableRecordValidationSchema<PascalCaseEntity>(
    camelCaseEntitiesAirtableFieldsValidationSchema,
    PascalCaseEntityAirtableColumnMapper
  );

export type AirtablePascalCaseEntity = z.infer<
  typeof PascalCaseEntityAirtableValidationSchema
>;

export type PascalCaseEntityCreationDetails = Partial<
  Omit<PascalCaseEntity, 'id'>
>;

export type PascalCaseEntityUpdates = PascalCaseEntityCreationDetails &
  Pick<PascalCaseEntity, 'id'>;

export const camelCaseEntityViews = [
  /* AIRTABLE_VIEWS */
] as const;

export type PascalCaseEntityView = typeof camelCaseEntityViews[number];

export const FindAllPascalCaseEntitiesReponseValidationSchema = z.object({
  records: z.array(PascalCaseEntityAirtableValidationSchema),
  offset: z.string().optional(),
});
