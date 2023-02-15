import { DefaultRequestQueryParams } from './_Utils';
/* REST_API_MODEL_IMPORTS */

export type PascalCaseEntity = {
  id: string;
  /* ENTITY_INTERFACE_FIELDS */
  name?: string;
  list?: string[];
  /* ENTITY_INTERFACE_FIELDS */
};

// Entities Table table focus views.
export const camelCaseEntityViews = [
  /* AIRTABLE_VIEWS */
] as const;

// Entities Table table view type.
export type PascalCaseEntityView = typeof camelCaseEntityViews[number];

export type PascalCaseEntityQueryableField =
  | keyof PascalCaseEntity /* QUERYABLE_FIELD_TYPE */
  | 'id' /* QUERYABLE_FIELD_TYPE */;

export type FindFirstPagePascalCaseEntitiesQueryParams =
  DefaultRequestQueryParams<
    PascalCaseEntityQueryableField,
    PascalCaseEntityView
  >;

export type FindAllPascalCaseEntitiesQueryParams = DefaultRequestQueryParams;

export type CreateNewPascalCaseEntitiesReponse = {};
export type FindAllPascalCaseEntitiesReponse = {};
export type PascalCaseEntityCreationDetails = {};
export type PascalCaseEntityUpdates = {};
export type UpdatePascalCaseEntitiesReponse = {};
