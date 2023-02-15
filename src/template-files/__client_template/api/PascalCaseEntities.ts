import {
  addSearchParams,
  getInterpolatedPath,
} from '@infinite-debugger/rmk-utils/paths';

import {
  CREATE_NEW_ENTITIES_ENDPOINT_PATH,
  CREATE_NEW_ENTITY_ENDPOINT_PATH,
  DELETE_EXISTING_ENTITIES_ENDPOINT_PATH,
  DELETE_EXISTING_ENTITY_BY_ID_ENDPOINT_PATH,
  FIND_ALL_ENTITIES_ENDPOINT_PATH,
  FIND_ENTITY_BY_ID_ENDPOINT_PATH,
  FIND_FIRST_PAGE_ENTITIES_ENDPOINT_PATH,
  PATCH_EXISTING_ENTITIES_ENDPOINT_PATH,
  PATCH_EXISTING_ENTITY_ENDPOINT_PATH,
  UPDATE_EXISTING_ENTITIES_ENDPOINT_PATH,
  UPDATE_EXISTING_ENTITY_ENDPOINT_PATH,
} from '../endpoint-paths/PascalCaseEntities';
import {
  DeleteRecordResponse,
  DeleteRecordsResponse,
} from '../interfaces/_Utils';
import {
  CreateNewPascalCaseEntitiesReponse,
  FindAllPascalCaseEntitiesReponse,
  PascalCaseEntity,
  PascalCaseEntityCreationDetails,
  PascalCaseEntityUpdates,
  UpdatePascalCaseEntitiesReponse,
} from '../interfaces/PascalCaseEntities';
import {
  FindAllPascalCaseEntitiesQueryParams,
  FindFirstPagePascalCaseEntitiesQueryParams,
} from '../interfaces/PascalCaseEntities';
import { RequestOptions, _delete, get, patch, post, put } from './Adapter';

/**
 * Finds the first page of entities label. Returns entities label first page matching query paramenters.
 *
 * @param queryParams
 * @returns The existing entities label on the first page
 */
export const findFirstPagePascalCaseEntities = async (
  queryParams: FindFirstPagePascalCaseEntitiesQueryParams = {},
  { ...rest }: RequestOptions
) => {
  const { data } = await get<FindAllPascalCaseEntitiesReponse>(
    addSearchParams(FIND_FIRST_PAGE_ENTITIES_ENDPOINT_PATH, {
      ...queryParams,
    }),
    {
      label: 'Finding first page entities label',
      ...rest,
    }
  );
  return data;
};

/**
 * Finds all entities label. Returns entities label matching query paramenters.
 *
 * @param queryParams
 * @returns The existing entities label
 */
export const findAllPascalCaseEntities = async (
  queryParams: FindAllPascalCaseEntitiesQueryParams = {},
  { ...rest }: RequestOptions
) => {
  const { data } = await get<FindAllPascalCaseEntitiesReponse>(
    addSearchParams(FIND_ALL_ENTITIES_ENDPOINT_PATH, { ...queryParams }),
    {
      label: 'Finding all entities label',
      ...rest,
    }
  );
  return data;
};

/**
 * Finds entity label by id. Returns entity label matching the given id.
 *
 * @param camelCaseEntityId The id of the entity label to be found.
 * @returns The existing entity label
 */
export const findPascalCaseEntityById = async (
  camelCaseEntityId: string,
  { ...rest }: RequestOptions
) => {
  const { data } = await get<PascalCaseEntity>(
    getInterpolatedPath(FIND_ENTITY_BY_ID_ENDPOINT_PATH, {
      camelCaseEntityId,
    }),
    {
      label: 'Finding entity label by id',
      ...rest,
    }
  );
  return data;
};

/**
 * Creates new entity label. Returns the created entity label.
 *
 * @param requestPayload
 * @returns The created entity label
 */
export const createNewPascalCaseEntity = async (
  requestPayload: PascalCaseEntityCreationDetails,
  { ...rest }: RequestOptions
) => {
  const { data } = await post<PascalCaseEntity>(
    CREATE_NEW_ENTITY_ENDPOINT_PATH,
    {
      label: 'Creating new entity label',
      data: requestPayload,
      ...rest,
    }
  );
  return data;
};

/**
 * Creates new entities label. Returns the created entities label.
 *
 * @param requestPayload
 * @returns The created entities label
 */
export const createNewPascalCaseEntities = async (
  requestPayload: PascalCaseEntityCreationDetails[],
  { ...rest }: RequestOptions
) => {
  const { data } = await post<CreateNewPascalCaseEntitiesReponse>(
    CREATE_NEW_ENTITIES_ENDPOINT_PATH,
    {
      label: 'Creating new entities label',
      data: requestPayload,
      ...rest,
    }
  );
  return data;
};

/**
 * Updates an existing entity label. Returns the updated entity label. Null values will wipe database fields.
 *
 * @param requestPayload
 * @returns The updated entity label
 */
export const updateExistingPascalCaseEntity = async (
  requestPayload: PascalCaseEntityUpdates,
  { ...rest }: RequestOptions
) => {
  const { data } = await put<PascalCaseEntity>(
    UPDATE_EXISTING_ENTITY_ENDPOINT_PATH,
    {
      label: 'Updating existing entity label',
      data: requestPayload,
      ...rest,
    }
  );
  return data;
};

/**
 * Updates existing entities label. Returns the updated entities label. Null values will wipe database table fields.
 *
 * @param requestPayload
 * @returns The updated entities label
 */
export const updateExistingPascalCaseEntities = async (
  requestPayload: PascalCaseEntityUpdates[],
  { ...rest }: RequestOptions
) => {
  const { data } = await put<UpdatePascalCaseEntitiesReponse>(
    UPDATE_EXISTING_ENTITIES_ENDPOINT_PATH,
    {
      label: 'Updating existing entities label',
      data: requestPayload,
      ...rest,
    }
  );
  return data;
};

/**
 * Patches an existing entity label. Returns the patched entity label.
 *
 * @param requestPayload
 * @returns The patched entity label
 */
export const patchExistingPascalCaseEntity = async (
  requestPayload: PascalCaseEntityUpdates,
  { ...rest }: RequestOptions
) => {
  const { data } = await patch<PascalCaseEntity>(
    PATCH_EXISTING_ENTITY_ENDPOINT_PATH,
    {
      label: 'Patching existing entity label',
      data: requestPayload,
      ...rest,
    }
  );
  return data;
};

/**
 * Patches existing entities label. Returns the patched entities label.
 *
 * @param requestPayload
 * @returns The patched entities label
 */
export const patchExistingPascalCaseEntities = async (
  requestPayload: PascalCaseEntityUpdates[],
  { ...rest }: RequestOptions
) => {
  const { data } = await patch<UpdatePascalCaseEntitiesReponse>(
    PATCH_EXISTING_ENTITIES_ENDPOINT_PATH,
    {
      label: 'Patching existing entities label',
      data: requestPayload,
      ...rest,
    }
  );
  return data;
};

/**
 * Deletes an existing entity label by id. Returns id of the deleted entity label.
 *
 * @param camelCaseEntityId The id of the entity label to be deleted.
 * @returns The deleted entity label response
 */
export const deleteExistingPascalCaseEntityById = async (
  camelCaseEntityId: string,
  { ...rest }: RequestOptions
) => {
  const { data } = await _delete<DeleteRecordResponse>(
    getInterpolatedPath(DELETE_EXISTING_ENTITY_BY_ID_ENDPOINT_PATH, {
      camelCaseEntityId,
    }),
    {
      label: 'Deleting existing entity label by id',
      ...rest,
    }
  );
  return data;
};

/**
 * Deletes existing entities label. Returns ids of the deleted entities label.
 *
 * @param requestPayload The list of ids of the entities label to be deleted. Note: this list should contain at least one entity label.
 * @returns The deleted entities label response
 */
export const deleteExistingPascalCaseEntities = async (
  requestPayload: string[],
  { ...rest }: RequestOptions
) => {
  const { data } = await _delete<DeleteRecordsResponse>(
    DELETE_EXISTING_ENTITIES_ENDPOINT_PATH,
    {
      label: 'Deleting existing entities label',
      data: requestPayload,
      ...rest,
    }
  );
  return data;
};
