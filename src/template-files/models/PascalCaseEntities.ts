import { z } from 'zod';

import { AirtableFieldType } from './__Utils';

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

export type PascalCaseEntityAirtableColumnMapping = {
  type: AirtableFieldType;
  propertyName: string;
};

export const PascalCaseEntityAirtableColumnMapper: Record<
  PascalCaseEntitiesAirtableColumn,
  PascalCaseEntityAirtableColumnMapping
> = {
  /* AIRTABLE_ENTITY_FIELD_TO_PROPERTY_MAPPINGS */
  a: {
    propertyName: 'a',
    type: 'singleLineText',
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
        const { propertyName, type } = (
          PascalCaseEntityAirtableColumnMapper as any
        )[key] as PascalCaseEntityAirtableColumnMapping;
        (accumulator as any)[propertyName] = (() => {
          switch (type) {
            case 'lookup':
              if (fields[key] && Array.isArray(fields[key])) {
                return (fields[key] as string[])[0];
              }
              break;
          }
          return fields[key];
        })();
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

export const FindAllPascalCaseEntitiesReponseValidationSchema = z
  .object({
    records: z.array(PascalCaseEntityAirtableValidationSchema),
  })
  .transform(({ records }) => {
    return records;
  });
