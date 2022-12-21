import { z } from 'zod';

import {
  AirtableColumnMapping,
  getAirtableRecordRequestValidationSchema,
  getAirtableRecordResponseValidationSchema,
} from './__Utils';

/* MODEL_IMPORTS */

export type PascalCaseEntity = {
  id: string;
  /* ENTITY_INTERFACE_FIELDS */
};

export const PascalCaseEntityAirtableColumnToPropertyMapper: Record<
  PascalCaseEntitiesAirtableColumn,
  AirtableColumnMapping
> = {
  /* AIRTABLE_ENTITY_FIELD_TO_PROPERTY_MAPPINGS */
  a: {
    propertyName: 'a',
  },
  /* AIRTABLE_ENTITY_FIELD_TO_PROPERTY_MAPPINGS */
} as const;

export const camelCaseEntityViews = [
  /* AIRTABLE_VIEWS */
] as const;

export type PascalCaseEntityView = typeof camelCaseEntityViews[number];

export type PascalCaseEntityCreationDetails = Partial<
  Pick<
    PascalCaseEntity,
    /* AIRTABLE_ENTITY_EDITABLE_FIELD_TYPE */ 'id' /* AIRTABLE_ENTITY_EDITABLE_FIELD_TYPE */
  >
>;

export type PascalCaseEntityUpdates = PascalCaseEntityCreationDetails &
  Pick<PascalCaseEntity, 'id'>;

/********************* Validation Schemas ***********************/

export const camelCaseEntitiesAirtableFieldsValidationSchema = {
  /* AIRTABLE_ENTITY_FIELDS */
  a: z.string().nullish(),
  /* AIRTABLE_ENTITY_FIELDS */
} as const;

export type PascalCaseEntitiesAirtableColumn =
  keyof typeof camelCaseEntitiesAirtableFieldsValidationSchema;

export const PascalCaseEntityAirtableResponseValidationSchema =
  getAirtableRecordResponseValidationSchema<PascalCaseEntity>(
    camelCaseEntitiesAirtableFieldsValidationSchema,
    PascalCaseEntityAirtableColumnToPropertyMapper
  );

export type AirtablePascalCaseEntity = z.infer<
  typeof PascalCaseEntityAirtableResponseValidationSchema
>;

// Validates airtable response to find all entities label.
export const FindAllPascalCaseEntitiesReponseValidationSchema = z.object({
  records: z.array(PascalCaseEntityAirtableResponseValidationSchema),
  offset: z.string().optional(),
});

export const PascalCaseEntityPropertyToAirtableColumnMapper =
  Object.fromEntries(
    Object.entries(PascalCaseEntityAirtableColumnToPropertyMapper).map(
      ([key, value]) => {
        const propertyName = (() => {
          if (typeof value === 'string') {
            return value;
          }
          return value.propertyName;
        })();
        return [
          propertyName,
          {
            propertyName: key,
            ...(() => {
              if (typeof value !== 'string' && value.prefersSingleRecordLink) {
                return {
                  prefersSingleRecordLink: true,
                };
              }
            })(),
          },
        ];
      }
    )
  );

export const PascalCaseEntityAirtableRequestValidationSchema =
  getAirtableRecordRequestValidationSchema<PascalCaseEntity>(
    camelCaseEntitiesAirtableFieldsValidationSchema, // TODO: Generate reverse airtable validation schema.
    PascalCaseEntityPropertyToAirtableColumnMapper
  );

export const CreatePascalCaseEntityRequestValidationSchema =
  PascalCaseEntityAirtableRequestValidationSchema;

// Validates request to create entities label.
export const CreatePascalCaseEntitiesRequestValidationSchema = z.array(
  CreatePascalCaseEntityRequestValidationSchema
);

export const UpdatePascalCaseEntityRequestValidationSchema =
  PascalCaseEntityAirtableRequestValidationSchema;

// Validates request to update entities label.
export const UpdatePascalCaseEntitiesRequestValidationSchema = z.array(
  UpdatePascalCaseEntityRequestValidationSchema
);
