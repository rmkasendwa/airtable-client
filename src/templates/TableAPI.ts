import {
  TemplatePath,
  addSearchParams,
  getInterpolatedPath,
} from '@infinite-debugger/rmk-utils/paths';
import { z } from 'zod';

import Adapter from './__Adapter';
import { AIRTABLE_BASE_ID } from './__config';
import { FindAllRecordsQueryParams } from './__interfaces';
import { convertToAirtableFindAllRecordsQueryParams } from './__utils';

// Endpoint Paths
export const FIND_ALL_ENTITIES_ENDPOINT_PATH = `${AIRTABLE_BASE_ID}/Entities Label`;
export const FIND_ENTITY_BY_ID_ENPOINT_PATH: TemplatePath<{
  camelCaseEntityId: string;
}> = `${FIND_ALL_ENTITIES_ENDPOINT_PATH}/:camelCaseEntityId`;
export const ENTITY_CREATE_ENDPOINT_PATH = `${AIRTABLE_BASE_ID}/Entities Label`;
export const ENTITY_UPDATE_ENDPOINT_PATH = `${AIRTABLE_BASE_ID}/Entities Label`;
export const ENTITY_DELETE_ENDPOINT_PATH = `${AIRTABLE_BASE_ID}/Entities Label`;

export const PascalCaseEntityAirtableSchema = z.object({
  id: z.string(),
  createdTime: z.string().datetime(),
  fields: z
    .object({
      /* AIRTABLE_ENTITY_FIELDS */
    })
    .transform((camelCaseEntity: any) => {
      const { id, createdTime, fields } = camelCaseEntity;
      return {
        id,
        created: createdTime,
        ...fields,
      };
    }),
});

export type AirtablePascalCaseEntity = z.infer<
  typeof PascalCaseEntityAirtableSchema
>;

export type PascalCaseEntity = {
  id: string;
};

export type PascalCaseEntityCreationDetails = Partial<
  Omit<PascalCaseEntity, 'id'>
>;

export type PascalCaseEntityUpdates = PascalCaseEntityCreationDetails &
  Pick<PascalCaseEntity, 'id'>;

export const camelCaseEntityViews = [''] as const;

export type PascalCaseEntityView = typeof camelCaseEntityViews[number];

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
  return data;
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
  return data;
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
  return data;
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
  return data;
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
  return data;
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
  return data;
};
