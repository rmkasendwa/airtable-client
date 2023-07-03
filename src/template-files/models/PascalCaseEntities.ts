import {
  ArrayOf,
  DateTime,
  Description,
  Enum,
  Example,
  Property,
  Required,
} from '@tsed/schema';
import { z } from 'zod';

import {
  AirtableColumnMapping,
  AirtableSortOption,
  CountAllRecordsQueryParams,
  FindAllRecordsQueryParams,
  getAirtableRecordRequestValidationSchema,
  getAirtableRecordResponseValidationSchema,
} from './Utils';

/* AIRTABLE_API_MODEL_IMPORTS */

/* REST_API_MODEL_IMPORTS */

//#region Entity Label model referenced models
/* REST_API_MODEL_EXTRAS */
//#endregion

//#region Entity Label model
export class BasePascalCaseEntity {
  @Property()
  @Required()
  @Description('Unique identifer for Entity Label.')
  @Example('recO0FYb1Tccm9MZ2')
  public id!: string;

  @Property()
  @DateTime()
  @Required()
  @Description('The time when the entity label was created.')
  @Example('2021-08-03T18:00:00.000Z')
  public created!: string;

  /* BASE_ENTITY_MODEL_FIELDS */
  @Property()
  public name?: string;

  @Property()
  @ArrayOf(String)
  public list?: string[];
  /* BASE_ENTITY_MODEL_FIELDS */
}

export class PascalCaseEntity {
  @Property()
  @Required()
  @Description('Unique identifer for Entity Label.')
  @Example('recO0FYb1Tccm9MZ2')
  public id!: string;

  @Property()
  @DateTime()
  @Required()
  @Description('The time when the entity label was created.')
  @Example('2021-08-03T18:00:00.000Z')
  public created!: string;

  /* ENTITY_MODEL_FIELDS */
  @Property()
  public name?: string;

  @Property()
  @ArrayOf(String)
  public list?: string[];
  /* ENTITY_MODEL_FIELDS */
}
//#endregion

//#region All Entities Table lookup table columns
export const camelCaseEntitiesAirtableLookupColumns = [
  /* AIRTABLE_ENTITY_LOOKUP_COLUMNS */
  'Name',
  /* AIRTABLE_ENTITY_LOOKUP_COLUMNS */
] as const;

export type PascalCaseEntitiesAirtableLookupColumn =
  typeof camelCaseEntitiesAirtableLookupColumns[number] extends never
    ? string
    : typeof camelCaseEntitiesAirtableLookupColumns[number];
//#endregion

//#region Maps Entities Table lookup columns to Entity Label properties.
export const PascalCaseEntityAirtableLookupColumnNameToObjectPropertyMapper: Record<
  PascalCaseEntitiesAirtableLookupColumn,
  AirtableColumnMapping<string>
> = {
  /* AIRTABLE_LOOKUP_COLUMN_TO_OBJECT_PROPERTY_MAPPINGS */
  ['Name']: 'name',
  /* AIRTABLE_LOOKUP_COLUMN_TO_OBJECT_PROPERTY_MAPPINGS */
};
//#endregion

//#region Maps entity label properties to Entities Table lookup column names
export const PascalCaseEntityPropertyToAirtableLookupColumnNameMapper: Record<
  string,
  string
> = Object.fromEntries(
  Object.entries(
    PascalCaseEntityAirtableLookupColumnNameToObjectPropertyMapper
  ).map(([key, value]) => {
    if (value != null && typeof value === 'object' && 'propertyName' in value) {
      return [value.propertyName, key];
    }
    return [value, key];
  })
);
//#endregion

//#region All Entities Table non lookup table columns
export const camelCaseEntitiesAirtableColumns = [
  /* AIRTABLE_ENTITY_COLUMNS */
  'Name',
  /* AIRTABLE_ENTITY_COLUMNS */
] as const;

export type PascalCaseEntitiesAirtableColumn =
  typeof camelCaseEntitiesAirtableColumns[number] extends never
    ? string
    : typeof camelCaseEntitiesAirtableColumns[number];
//#endregion

//#region Maps Entities Table non lookup columns to Entity Label properties.
export const PascalCaseEntityAirtableColumnToObjectPropertyMapper: Record<
  PascalCaseEntitiesAirtableColumn,
  AirtableColumnMapping<keyof PascalCaseEntity>
> = {
  /* AIRTABLE_ENTITY_FIELD_TO_PROPERTY_MAPPINGS */
  ['Name']: {
    propertyName: 'name',
  },
  /* AIRTABLE_ENTITY_FIELD_TO_PROPERTY_MAPPINGS */
};
//#endregion

//#region Required Properties
export const camelCaseEntityRequiredProperties = [
  ...Object.entries(PascalCaseEntityAirtableColumnToObjectPropertyMapper),
  ...Object.entries(
    PascalCaseEntityAirtableLookupColumnNameToObjectPropertyMapper
  ),
]
  .filter(([, value]) => {
    return typeof value === 'object' && value.required;
  })
  .map(([, value]) => {
    if (typeof value === 'string') {
      return value;
    }
    return value.propertyName;
  });
//#endregion

//#region Queryable Fields
export const camelCaseEntityQueryableFields = [
  /* QUERYABLE_FIELDS */
  'name',
  /* QUERYABLE_FIELDS */
] as const;

export type PascalCaseEntityQueryableField =
  typeof camelCaseEntityQueryableFields[number];
//#endregion

/********************* Airtable Entities Table views ***********************/

//#region Entities Table table focus views.
export const camelCaseEntityViews = [
  /* AIRTABLE_VIEWS */
] as const;

export type PascalCaseEntityView = typeof camelCaseEntityViews[number];
//#endregion

/********************* Validation Schemas ***********************/

//#region Maps entity label properties to Entities Table columns
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
            ...(() => {
              if (
                typeof value !== 'string' &&
                value.isMultipleRecordLinksField
              ) {
                return {
                  isMultipleRecordLinksField: true,
                };
              }
            })(),
          },
        ];
      }
    )
  );
//#endregion

//#region Maps entity label properties to Entities Table column names
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
//#endregion

//#region Validates Entities Table airtable response.
export const PascalCaseEntityAirtableResponseValidationSchema =
  getAirtableRecordResponseValidationSchema<BasePascalCaseEntity>({
    nonLookupColumnNameToObjectPropertyMapper:
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
//#endregion

//#region Entities Table table columns interface.
export type AirtablePascalCaseEntity = z.infer<
  typeof PascalCaseEntityAirtableResponseValidationSchema
>;
//#endregion

//#region Validates airtable response to find all entities label.
export const FindAllPascalCaseEntitiesReponseValidationSchema = z.object({
  records: z.array(PascalCaseEntityAirtableResponseValidationSchema),
  offset: z.string().optional(),
});
//#endregion

//#region Validates requests to mutate entities label.
export const PascalCaseEntityAirtableRequestValidationSchema = z.object({
  /* REQUEST_ENTITY_PROPERTIES */
  a: z.string().nullish(),
  /* REQUEST_ENTITY_PROPERTIES */
});
//#endregion

//#region Validates request to create entity label.
export const CreateNewPascalCaseEntityRequestValidationSchema =
  getAirtableRecordRequestValidationSchema(
    PascalCaseEntityAirtableRequestValidationSchema,
    PascalCaseEntityPropertyToAirtableColumnConfigMapper
  );
//#endregion

//#region Validates request to create entities label.
export const CreateManyNewPascalCaseEntitiesRequestValidationSchema = z.array(
  CreateNewPascalCaseEntityRequestValidationSchema
);
//#endregion

//#region Validates request to update entity label.
export const UpdatePascalCaseEntityRequestValidationSchema =
  getAirtableRecordRequestValidationSchema(
    PascalCaseEntityAirtableRequestValidationSchema.extend({
      id: z.string(),
    }),
    PascalCaseEntityPropertyToAirtableColumnConfigMapper
  );
//#endregion

//#region Validates request to update entities label.
export const UpdateManyPascalCaseEntitiesRequestValidationSchema = z.array(
  UpdatePascalCaseEntityRequestValidationSchema
);
//#endregion

//#region Find all entities label response.
export class BaseFindAllPascalCaseEntitiesReponse {
  @Property()
  @Required()
  @ArrayOf(BasePascalCaseEntity)
  @Description('The list of Entities Label.')
  public records!: BasePascalCaseEntity[];
}

export class FindAllPascalCaseEntitiesReponse {
  @Property()
  @Required()
  @ArrayOf(PascalCaseEntity)
  @Description('The list of Entities Label.')
  public records!: PascalCaseEntity[];
}

export class BaseFindFirstPagePascalCaseEntitiesReponse extends BaseFindAllPascalCaseEntitiesReponse {
  @Property()
  @Description(
    'The airtable offset identifier in case there are more records to fetch.'
  )
  public offset?: string;
}

export class FindFirstPagePascalCaseEntitiesReponse extends FindAllPascalCaseEntitiesReponse {
  @Property()
  @Description(
    'The airtable offset identifier in case there are more records to fetch.'
  )
  public offset?: string;
}
//#endregion

//#region Entity Label creation details.
export class BasePascalCaseEntityCreationDetails {
  /* BASE_ENTITY_MODEL_CREATABLE_FIELDS */
  @Property()
  public name?: string;

  @Property()
  @ArrayOf(String)
  public list?: string[];
  /* BASE_ENTITY_MODEL_CREATABLE_FIELDS */
}
export class PascalCaseEntityCreationDetails {
  /* ENTITY_MODEL_CREATABLE_FIELDS */
  @Property()
  public name?: string;

  @Property()
  @ArrayOf(String)
  public list?: string[];
  /* ENTITY_MODEL_CREATABLE_FIELDS */
}
//#endregion

//#region Create new entity label response payload.
export class CreateNewPascalCaseEntitiesReponse {
  @Property()
  @Required()
  @ArrayOf(PascalCaseEntity)
  @Description('The list of Entities Label.')
  public records!: PascalCaseEntity[];
}
//#endregion

//#region Entity Label updates.
export class PascalCaseEntityUpdates {
  @Property()
  @Required()
  @Description('Unique identifer for Entity Label.')
  @Example('recO0FYb1Tccm9MZ2')
  public id!: string;

  /* ENTITY_MODEL_EDITABLE_FIELDS */
  @Property()
  public name?: string;

  @Property()
  @ArrayOf(String)
  public list?: string[];
  /* ENTITY_MODEL_EDITABLE_FIELDS */
}
//#endregion

//#region Entity Label patches.
export class PascalCaseEntityPatches {
  @Property()
  @Required()
  @Description('Unique identifer for Entity Label.')
  @Example('recO0FYb1Tccm9MZ2')
  public id!: string;

  /* ENTITY_MODEL_PATCHABLE_FIELDS */
  @Property()
  public name?: string;

  @Property()
  @ArrayOf(String)
  public list?: string[];
  /* ENTITY_MODEL_PATCHABLE_FIELDS */
}
//#endregion

//#region Update entity label response payload.
export class UpdatePascalCaseEntitiesReponse extends CreateNewPascalCaseEntitiesReponse {}
//#endregion

//#region Find All entities label query params.
export class PascalCaseEntitiesSortOption extends AirtableSortOption {
  @Property()
  @Required()
  @Enum(...camelCaseEntityQueryableFields)
  @Description('The field to sort by.')
  public declare field: PascalCaseEntityQueryableField;
}

export class FindAllPascalCaseEntitiesQueryParams extends FindAllRecordsQueryParams {
  @Property()
  @Enum(...camelCaseEntityQueryableFields)
  @Description(
    "Only data for fields whose names are in this list will be included in the result. If you don't need every field, you can use this parameter to reduce the amount of data transferred."
  )
  public declare fields?: PascalCaseEntityQueryableField[];

  @Property()
  @ArrayOf(PascalCaseEntitiesSortOption)
  @Description(
    `
    A list of sort objects that specifies how the records will be ordered. Each sort object must have a field key specifying the name of the field to sort on, and an optional direction key that is either "asc" or "desc". The default direction is "asc".

    The sort parameter overrides the sorting of the view specified in the view parameter. If neither the sort nor the view parameter is included, the order of records is arbitrary.
  `.trimIndent()
  )
  public declare sort?: PascalCaseEntitiesSortOption[];

  @Property()
  @Enum(...camelCaseEntityViews)
  @Description(
    'The name or ID of a view in the table. If set, only the records in that view will be returned. The records will be sorted according to the order of the view unless the sort parameter is included, which overrides that order. Fields hidden in this view will be returned in the results. To only return a subset of fields, use the fields parameter.'
  )
  public declare view?: PascalCaseEntityView;
}
//#endregion

//#region Count all entities label query params.
export class CountAllPascalCaseEntitiesQueryParams extends CountAllRecordsQueryParams {
  @Property()
  @Enum(...camelCaseEntityViews)
  @Description(
    'The name or ID of a view in the table. If set, only the records in that view will be returned. The records will be sorted according to the order of the view unless the sort parameter is included, which overrides that order. Fields hidden in this view will be returned in the results. To only return a subset of fields, use the fields parameter.'
  )
  public declare view?: PascalCaseEntityView;
}
//#endregion
