import { z } from 'zod';

import { AirtableColumnMapping } from './__Utils';

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

export const PascalCaseEntityAirtableValidationSchema = z
  .object({
    id: z.string(),
    createdTime: z.string().datetime(),
    fields: z.object(camelCaseEntitiesAirtableFieldsValidationSchema),
  })
  .transform(({ createdTime, fields, id }) => {
    return {
      id,
      created: createdTime,
      ...Object.keys(fields).reduce((accumulator, a) => {
        const key = a as PascalCaseEntitiesAirtableColumn;
        const mapping = (PascalCaseEntityAirtableColumnMapper as any)[
          key
        ] as AirtableColumnMapping;
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
      }, {} as Omit<PascalCaseEntity, 'id'>),
    };
  });

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
