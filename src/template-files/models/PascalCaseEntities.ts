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

// All Entities Table table columns
export const camelCaseEntitiesAirtableColumns = [
  /* AIRTABLE_ENTITY_COLUMNS */
  'Name',
  /* AIRTABLE_ENTITY_COLUMNS */
] as const;

export type PascalCaseEntitiesAirtableColumn =
  typeof camelCaseEntitiesAirtableColumns[number];

// Maps Entities Table columns to Entity Label properties.
export const PascalCaseEntityAirtableColumnToPropertyMapper: Record<
  PascalCaseEntitiesAirtableColumn,
  AirtableColumnMapping<keyof PascalCaseEntity>
> = {
  /* AIRTABLE_ENTITY_FIELD_TO_PROPERTY_MAPPINGS */
  ['Name']: {
    propertyName: 'id',
  },
  /* AIRTABLE_ENTITY_FIELD_TO_PROPERTY_MAPPINGS */
} as const;

/********************* Airtable Entities Table views ***********************/

export const camelCaseEntityViews = [
  /* AIRTABLE_VIEWS */
] as const;

// Entities Table table view type.
export type PascalCaseEntityView = typeof camelCaseEntityViews[number];

// Entity Label editable fields.
export type PascalCaseEntityCreationDetails = Partial<
  Pick<
    PascalCaseEntity,
    /* AIRTABLE_ENTITY_EDITABLE_FIELD_TYPE */ 'id' /* AIRTABLE_ENTITY_EDITABLE_FIELD_TYPE */
  >
>;

export type PascalCaseEntityUpdates = PascalCaseEntityCreationDetails &
  Pick<PascalCaseEntity, 'id'>;

/********************* Validation Schemas ***********************/

// Validates Entities Table airtable response.
export const PascalCaseEntityAirtableResponseValidationSchema =
  getAirtableRecordResponseValidationSchema<PascalCaseEntity>(
    z.object({
      /* AIRTABLE_ENTITY_FIELDS */
      a: z.string().nullish(),
      /* AIRTABLE_ENTITY_FIELDS */
    }),
    PascalCaseEntityAirtableColumnToPropertyMapper
  );

// Entities Table table columns interface.
export type AirtablePascalCaseEntity = z.infer<
  typeof PascalCaseEntityAirtableResponseValidationSchema
>;

// Validates airtable response to find all entities label.
export const FindAllPascalCaseEntitiesReponseValidationSchema = z.object({
  records: z.array(PascalCaseEntityAirtableResponseValidationSchema),
  offset: z.string().optional(),
});

// Maps entity label properties to Entities Table columns
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

// Maps entity label properties to Entities Table column names
export const PascalCaseEntityPropertyToAirtableColumnNameMapper =
  Object.fromEntries(
    Object.entries(PascalCaseEntityAirtableColumnToPropertyMapper).map(
      ([key, value]) => {
        return [
          (() => {
            if (typeof value === 'string') {
              return value;
            }
            return value.propertyName;
          })(),
          key,
        ];
      }
    )
  );

// Validates requests to mutate entities label.
export const PascalCaseEntityAirtableRequestValidationSchema =
  getAirtableRecordRequestValidationSchema<PascalCaseEntity>(
    z.object({
      /* REQUEST_ENTITY_PROPERTIES */
      a: z.string().nullish(),
      /* REQUEST_ENTITY_PROPERTIES */
    }),
    PascalCaseEntityPropertyToAirtableColumnMapper
  );

// Validates request to create entity label.
export const CreatePascalCaseEntityRequestValidationSchema =
  PascalCaseEntityAirtableRequestValidationSchema;

// Validates request to create entities label.
export const CreatePascalCaseEntitiesRequestValidationSchema = z.array(
  CreatePascalCaseEntityRequestValidationSchema
);

// Validates request to update entity label.
export const UpdatePascalCaseEntityRequestValidationSchema =
  PascalCaseEntityAirtableRequestValidationSchema;

// Validates request to update entities label.
export const UpdatePascalCaseEntitiesRequestValidationSchema = z.array(
  UpdatePascalCaseEntityRequestValidationSchema
);
