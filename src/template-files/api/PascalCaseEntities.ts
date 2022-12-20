import {
  addSearchParams,
  getInterpolatedPath,
} from '@infinite-debugger/rmk-utils/paths';

import {
  ENTITY_CREATE_ENDPOINT_PATH,
  ENTITY_DELETE_ENDPOINT_PATH,
  ENTITY_UPDATE_ENDPOINT_PATH,
  FIND_ALL_ENTITIES_ENDPOINT_PATH,
  FIND_ENTITY_BY_ID_ENPOINT_PATH,
} from '../endpoint-paths/PascalCaseEntities';
import { FindAllRecordsQueryParams } from '../interfaces';
import { DeleteAirtableRecordResponseValidationSchema } from '../models';
import {
  FindAllPascalCaseEntitiesReponseValidationSchema,
  PascalCaseEntity,
  PascalCaseEntityAirtableValidationSchema,
  PascalCaseEntityCreationDetails,
  PascalCaseEntityUpdates,
  PascalCaseEntityView,
} from '../models/PascalCaseEntities';
import { convertToAirtableFindAllRecordsQueryParams } from '../utils';
import Adapter from './Adapter';

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
