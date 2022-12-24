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

// All Entities Table lookup table columns
export const camelCaseEntitiesAirtableLookupColumns = [
  /* AIRTABLE_ENTITY_LOOKUP_COLUMNS */
  'Name',
  /* AIRTABLE_ENTITY_LOOKUP_COLUMNS */
] as const;

export type PascalCaseEntitiesAirtableLookupColumn =
  typeof camelCaseEntitiesAirtableLookupColumns[number];

// Maps Entities Table lookup columns to Entity Label properties.
export const PascalCaseEntityAirtableLookupColumnNameToObjectPropertyMapper: Record<
  PascalCaseEntitiesAirtableLookupColumn,
  string
> = {
  /* AIRTABLE_LOOKUP_COLUMN_TO_OBJECT_PROPERTY_MAPPINGS */
  ['Name']: 'name',
  /* AIRTABLE_LOOKUP_COLUMN_TO_OBJECT_PROPERTY_MAPPINGS */
};

// Maps entity label properties to Entities Table lookup column names
export const PascalCaseEntityPropertyToAirtableLookupColumnNameMapper =
  Object.fromEntries(
    Object.entries(
      PascalCaseEntityAirtableLookupColumnNameToObjectPropertyMapper
    ).map(([key, value]) => {
      return [value, key];
    })
  );

// All Entities Table non lookup table columns
export const camelCaseEntitiesAirtableColumns = [
  /* AIRTABLE_ENTITY_COLUMNS */
  'Name',
  /* AIRTABLE_ENTITY_COLUMNS */
] as const;

export type PascalCaseEntitiesAirtableColumn =
  typeof camelCaseEntitiesAirtableColumns[number];

// Maps Entities Table non lookup columns to Entity Label properties.
export const PascalCaseEntityAirtableColumnToObjectPropertyMapper: Record<
  PascalCaseEntitiesAirtableColumn,
  AirtableColumnMapping<
    keyof PascalCaseEntity,
    PascalCaseEntitiesAirtableLookupColumn
  >
> = {
  /* AIRTABLE_ENTITY_FIELD_TO_PROPERTY_MAPPINGS */
  ['Name']: {
    propertyName: 'id',
  },
  /* AIRTABLE_ENTITY_FIELD_TO_PROPERTY_MAPPINGS */
};

/********************* Airtable Entities Table views ***********************/

export const camelCaseEntityViews = [
  /* AIRTABLE_VIEWS */
] as const;

// Entities Table table view type.
export type PascalCaseEntityView = typeof camelCaseEntityViews[number];

export type PascalCaseEntityQueryableField =
  | keyof PascalCaseEntity /* QUERYABLE_FIELD_TYPE */
  | 'id' /* QUERYABLE_FIELD_TYPE */;

/********************* Validation Schemas ***********************/

// Validates Entities Table airtable response.
export const PascalCaseEntityAirtableResponseValidationSchema =
  getAirtableRecordResponseValidationSchema<PascalCaseEntity>(
    z.object({
      /* AIRTABLE_RESPONSE_VALIDATION_SCHEMA_FIELDS */
      a: z.string().nullish(),
      /* AIRTABLE_RESPONSE_VALIDATION_SCHEMA_FIELDS */
    }),
    PascalCaseEntityAirtableColumnToObjectPropertyMapper,
    PascalCaseEntityAirtableLookupColumnNameToObjectPropertyMapper
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
export const PascalCaseEntityPropertyToAirtableColumnConfigMapper =
  Object.fromEntries(
    Object.entries(PascalCaseEntityAirtableColumnToObjectPropertyMapper).map(
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
    Object.entries(PascalCaseEntityAirtableColumnToObjectPropertyMapper).map(
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
export const PascalCaseEntityAirtableRequestValidationSchema = z.object({
  /* REQUEST_ENTITY_PROPERTIES */
  a: z.string().nullish(),
  /* REQUEST_ENTITY_PROPERTIES */
});

// Validates request to create entity label.
export const CreatePascalCaseEntityRequestValidationSchema =
  getAirtableRecordRequestValidationSchema(
    PascalCaseEntityAirtableRequestValidationSchema,
    PascalCaseEntityPropertyToAirtableColumnConfigMapper
  );

// Entity Label editable fields.
export type PascalCaseEntityCreationDetails = z.infer<
  typeof PascalCaseEntityAirtableRequestValidationSchema
>;

// Validates request to create entities label.
export const CreatePascalCaseEntitiesRequestValidationSchema = z.array(
  CreatePascalCaseEntityRequestValidationSchema
);

// Validates request to update entity label.
export const UpdatePascalCaseEntityRequestValidationSchema =
  getAirtableRecordRequestValidationSchema(
    PascalCaseEntityAirtableRequestValidationSchema.extend({
      id: z.string(),
    }),
    PascalCaseEntityPropertyToAirtableColumnConfigMapper
  );

export type PascalCaseEntityUpdates = PascalCaseEntityCreationDetails &
  Pick<PascalCaseEntity, 'id'>;

// Validates request to update entities label.
export const UpdatePascalCaseEntitiesRequestValidationSchema = z.array(
  UpdatePascalCaseEntityRequestValidationSchema
);
