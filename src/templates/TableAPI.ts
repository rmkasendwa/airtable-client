import {
  TemplatePath,
  addSearchParams,
  getInterpolatedPath,
} from '@infinite-debugger/rmk-utils/paths';
import { z } from 'zod';

import Adapter from './__Adapter';
import { AIRTABLE_BASE_ID } from './__config';
import { FindAllRecordsQueryParams } from './__interfaces';
import {
  AirtableFieldType,
  DeleteAirtableRecordResponseValidationSchema,
} from './__models';
import { convertToAirtableFindAllRecordsQueryParams } from './__utils';

// Endpoint Paths
export const FIND_ALL_ENTITIES_ENDPOINT_PATH = `${AIRTABLE_BASE_ID}/Entities Label`;

export const FIND_ENTITY_BY_ID_ENPOINT_PATH: TemplatePath<{
  camelCaseEntityId: string;
}> = `${FIND_ALL_ENTITIES_ENDPOINT_PATH}/:camelCaseEntityId`;

export const ENTITY_CREATE_ENDPOINT_PATH = `${AIRTABLE_BASE_ID}/Entities Label`;

export const ENTITY_UPDATE_ENDPOINT_PATH = `${AIRTABLE_BASE_ID}/Entities Label`;

export const ENTITY_DELETE_ENDPOINT_PATH = `${AIRTABLE_BASE_ID}/Entities Label`;

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

/**
 * Finds entities label.
 *
 * @param queryParams The query params.
 * @returns The entities label.
 */
export const findAllPascalCaseEntities = async (
  queryParams: FindAllRecordsQueryParams<
    PascalCaseEntity,
    PascalCaseEntityView
  > = {}
) => {
  const { data } = await Adapter.get(
    addSearchParams(
      FIND_ALL_ENTITIES_ENDPOINT_PATH,
      {
        ...convertToAirtableFindAllRecordsQueryParams(queryParams as any),
      },
      { arrayParamStyle: 'append' }
    )
  );
  return FindAllPascalCaseEntitiesReponseValidationSchema.parse(data);
};

/**
 * Finds entity label by id.
 *
 * @param camelCaseEntityId The entity label id.
 * @returns The entity label.
 */
export const findPascalCaseEntityById = async (camelCaseEntityId: string) => {
  const { data } = await Adapter.get(
    getInterpolatedPath(FIND_ENTITY_BY_ID_ENPOINT_PATH, { camelCaseEntityId })
  );
  return PascalCaseEntityAirtableValidationSchema.parse(data);
};

/**
 * Creates a new entity label.
 *
 * @param camelCaseEntityDetails The entity label details.
 * @returns The created entity label.
 */
export const createPascalCaseEntity = async (
  camelCaseEntityDetails: PascalCaseEntityCreationDetails
) => {
  return (await createPascalCaseEntities([camelCaseEntityDetails]))[0];
};

/**
 * Creates new entities label.
 *
 * @param records The entities label to be created.
 * @returns The created entities label.
 */
export const createPascalCaseEntities = async (
  records: PascalCaseEntityCreationDetails[]
) => {
  const { data } = await Adapter.post(ENTITY_CREATE_ENDPOINT_PATH, {
    data: JSON.stringify({ records }),
  });
  return FindAllPascalCaseEntitiesReponseValidationSchema.parse(data);
};

/**
 * Updates entity label.
 *
 * @param camelCaseEntityUpdates The entity label updates.
 * @returns The updated entity label.
 */
export const updatePascalCaseEntity = async (
  camelCaseEntityUpdates: PascalCaseEntityUpdates
) => {
  return (await updatePascalCaseEntities([camelCaseEntityUpdates]))[0];
};

/**
 * Updates entities label.
 *
 * @param records The entities label to be updated.
 * @returns The updated entities label.
 */
export const updatePascalCaseEntities = async (
  records: PascalCaseEntityUpdates[]
) => {
  const { data } = await Adapter.post(ENTITY_UPDATE_ENDPOINT_PATH, {
    data: JSON.stringify({ records }),
  });
  return FindAllPascalCaseEntitiesReponseValidationSchema.parse(data);
};

/**
 * Patches entity label.
 *
 * @param camelCaseEntityUpdates The entity label updates.
 * @returns The patched entity label.
 */
export const patchPascalCaseEntity = async (
  camelCaseEntityUpdates: PascalCaseEntityUpdates
) => {
  return (await patchPascalCaseEntities([camelCaseEntityUpdates]))[0];
};

/**
 * Patches entities label.
 *
 * @param records The entities label to be patched.
 * @returns The patched entities label.
 */
export const patchPascalCaseEntities = async (
  records: PascalCaseEntityUpdates[]
) => {
  const { data } = await Adapter.patch(ENTITY_UPDATE_ENDPOINT_PATH, {
    data: JSON.stringify({ records }),
  });
  return FindAllPascalCaseEntitiesReponseValidationSchema.parse(data);
};

/**
 * Deletes entity label.
 *
 * @param camelCaseEntityId The entity label id.
 * @returns Deleted record response.
 */
export const deletePascalCaseEntity = async (camelCaseEntityId: string) => {
  return (await deletePascalCaseEntities([camelCaseEntityId]))[0];
};

/**
 * Deletes entities label.
 *
 * @param records The ids of the entities label to be deleted.
 * @returns Deleted records response.
 */
export const deletePascalCaseEntities = async (records: string[]) => {
  const { data } = await Adapter.delete(
    addSearchParams(
      ENTITY_DELETE_ENDPOINT_PATH,
      {
        records,
      },
      { arrayParamStyle: 'append' }
    ),
    {
      data: JSON.stringify({ records }),
    }
  );
  return DeleteAirtableRecordResponseValidationSchema.parse(data);
};
