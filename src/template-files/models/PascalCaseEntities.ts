import {
  ArrayOf,
  Description,
  Example,
  Optional,
  Property,
} from '@tsed/schema';
import { z } from 'zod';

import {
  AirtableColumnMapping,
  getAirtableRecordRequestValidationSchema,
  getAirtableRecordResponseValidationSchema,
} from './__Utils';

/* AIRTABLE_API_MODEL_IMPORTS */

/* REST_API_MODEL_IMPORTS */

/* REST_API_MODEL_EXTRAS */

export class PascalCaseEntity {
  @Description('Unique identifer for Entity Label.')
  @Example('recO0FYb1Tccm9MZ2')
  @Property()
  public id!: string;

  /* ENTITY_MODEL_FIELDS */
  @Property()
  @Optional()
  public name?: string;

  @Property()
  @ArrayOf(String)
  @Optional()
  public list?: string[];
  /* ENTITY_MODEL_FIELDS */
}

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
  AirtableColumnMapping<string>
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
  AirtableColumnMapping<keyof PascalCaseEntity>
> = {
  /* AIRTABLE_ENTITY_FIELD_TO_PROPERTY_MAPPINGS */
  ['Name']: {
    propertyName: 'id',
  },
  /* AIRTABLE_ENTITY_FIELD_TO_PROPERTY_MAPPINGS */
};

/********************* Airtable Entities Table views ***********************/

// Entities Table table focus views.
export const camelCaseEntityViews = [
  /* AIRTABLE_VIEWS */
] as const;

// Entities Table table view type.
export type PascalCaseEntityView = typeof camelCaseEntityViews[number];

export type PascalCaseEntityQueryableField =
  | keyof PascalCaseEntity /* QUERYABLE_FIELD_TYPE */
  | 'id' /* QUERYABLE_FIELD_TYPE */;

/********************* Validation Schemas ***********************/

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

// Validates Entities Table airtable response.
export const PascalCaseEntityAirtableResponseValidationSchema =
  getAirtableRecordResponseValidationSchema<PascalCaseEntity>({
    columnNameToObjectPropertyMapper:
      PascalCaseEntityAirtableColumnToObjectPropertyMapper,
    lookupColumnNameToObjectPropertyMapper:
      PascalCaseEntityAirtableLookupColumnNameToObjectPropertyMapper,
    objectPropertyToAirtableColumnNameMapper:
      PascalCaseEntityPropertyToAirtableColumnNameMapper,
    responseFieldsValidationSchema: z.object({
      /* AIRTABLE_RESPONSE_VALIDATION_SCHEMA_FIELDS */
      a: z.string().nullish(),
      /* AIRTABLE_RESPONSE_VALIDATION_SCHEMA_FIELDS */
    }),
  });

// Entities Table table columns interface.
export type AirtablePascalCaseEntity = z.infer<
  typeof PascalCaseEntityAirtableResponseValidationSchema
>;

// Validates airtable response to find all entities label.
export const FindAllPascalCaseEntitiesReponseValidationSchema = z.object({
  records: z.array(PascalCaseEntityAirtableResponseValidationSchema),
  offset: z.string().optional(),
});

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

// Validates request to update entities label.
export const UpdatePascalCaseEntitiesRequestValidationSchema = z.array(
  UpdatePascalCaseEntityRequestValidationSchema
);

export class FindAllPascalCaseEntitiesReponse {
  @Property()
  @ArrayOf(PascalCaseEntity)
  @Description('The list of Entities Label.')
  public records!: PascalCaseEntity[];

  @Description(
    'The airtable offset identifier in case there are more records to fetch.'
  )
  @Property()
  @Optional()
  public offset?: string;
}

// Entity Label editable fields.
export class PascalCaseEntityCreationDetails {
  /* ENTITY_MODEL_EDITABLE_FIELDS */
  @Property()
  @Optional()
  public name?: string;

  @Property()
  @ArrayOf(String)
  @Optional()
  public list?: string[];
  /* ENTITY_MODEL_EDITABLE_FIELDS */
}

export class CreateNewPascalCaseEntitiesReponse {
  @Property()
  @ArrayOf(PascalCaseEntity)
  @Description('The list of Entities Label.')
  public records!: PascalCaseEntity[];
}

export class PascalCaseEntityUpdates extends PascalCaseEntityCreationDetails {
  @Description('Unique identifer for Entity Label.')
  @Example('recO0FYb1Tccm9MZ2')
  @Property()
  public id!: string;
}

export class UpdatePascalCaseEntitiesReponse extends CreateNewPascalCaseEntitiesReponse {}
