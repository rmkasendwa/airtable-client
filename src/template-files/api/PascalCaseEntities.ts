import {
  TemplatePath,
  addSearchParams,
  getInterpolatedPath,
} from '@infinite-debugger/rmk-utils/paths';

import { AIRTABLE_BASE_ID } from '../config';
import {
  DeleteAirtableRecordResponseValidationSchema,
  FindAllRecordsQueryParams,
  convertToAirtableFindAllRecordsQueryParams,
} from '../models/__Utils';
import {
  CreatePascalCaseEntitiesRequestValidationSchema,
  FindAllPascalCaseEntitiesReponseValidationSchema,
  PascalCaseEntity,
  PascalCaseEntityAirtableResponseValidationSchema,
  PascalCaseEntityCreationDetails,
  PascalCaseEntityUpdates,
  PascalCaseEntityView,
  UpdatePascalCaseEntitiesRequestValidationSchema,
} from '../models/PascalCaseEntities';
import Adapter from './Adapter';

/**************************** ENDPOINT PATHS *****************************/
export const FIND_ALL_ENTITIES_ENDPOINT_PATH = `${AIRTABLE_BASE_ID}/Entities Table`;
export const FIND_ENTITY_BY_ID_ENPOINT_PATH: TemplatePath<{
  camelCaseEntityId: string;
}> = `${FIND_ALL_ENTITIES_ENDPOINT_PATH}/:camelCaseEntityId`;
export const ENTITY_CREATE_ENDPOINT_PATH = FIND_ALL_ENTITIES_ENDPOINT_PATH;
export const ENTITY_UPDATE_ENDPOINT_PATH = FIND_ALL_ENTITIES_ENDPOINT_PATH;
export const ENTITY_DELETE_ENDPOINT_PATH = FIND_ALL_ENTITIES_ENDPOINT_PATH;

/**
 * Finds entities label limited by queryParams.pageSize
 *
 * @param queryParams The query params.
 * @returns The entities label.
 */
export const findPascalCaseEntitiesPage = async (
  queryParams: FindAllRecordsQueryParams<
    PascalCaseEntity,
    PascalCaseEntityView
  > = {}
) => {
  console.log(
    `Loading entities label with the following input:\x1b[2m\n${JSON.stringify(
      queryParams,
      null,
      2
    )}\x1b[0m`
  );
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
 * Finds all entities label in Entities Table table.
 *
 * @param queryParams The query params.
 * @returns The entities label.
 */
export const findAllPascalCaseEntities = async (
  queryParams: Omit<
    FindAllRecordsQueryParams<PascalCaseEntity, PascalCaseEntityView>,
    'pageSize'
  > = {}
) => {
  const findPages = async (
    accumulatedRecords = [],
    offset?: string
  ): ReturnType<typeof findPascalCaseEntitiesPage> => {
    const { records, offset: responseOffset } =
      await findPascalCaseEntitiesPage({ ...queryParams, offset });

    if (responseOffset) {
      return await findPages(accumulatedRecords, responseOffset);
    }

    return { records: [...accumulatedRecords, ...records] };
  };

  return findPages();
};

/**
 * Finds entity label by id.
 *
 * @param camelCaseEntityId The entity label id.
 * @returns The entity label.
 */
export const findPascalCaseEntityById = async (camelCaseEntityId: string) => {
  console.log(`Loading entity label by id: \x1b[2m${camelCaseEntityId}\x1b[0m`);
  const { data } = await Adapter.get(
    getInterpolatedPath(FIND_ENTITY_BY_ID_ENPOINT_PATH, { camelCaseEntityId })
  );
  return PascalCaseEntityAirtableResponseValidationSchema.parse(data);
};

/**
 * Creates a new entity label.
 *
 * @param camelCaseEntityDetails The entity label details.
 * @returns The created entity label.
 */
export const createNewPascalCaseEntity = async (
  camelCaseEntityDetails: PascalCaseEntityCreationDetails
) => {
  return (await createNewPascalCaseEntities([camelCaseEntityDetails]))
    .records[0];
};

/**
 * Creates new entities label.
 *
 * @param records The entities label to be created.
 * @returns The created entities label.
 */
export const createNewPascalCaseEntities = async (
  records: PascalCaseEntityCreationDetails[]
) => {
  console.log(
    `Creating entities label with the following input:\x1b[2m\n${JSON.stringify(
      records,
      null,
      2
    )}\x1b[0m`
  );

  const airtableRequestData = {
    records: CreatePascalCaseEntitiesRequestValidationSchema.parse(records),
  };

  console.log(
    `Sending entities label POST request to airtable with the following input:\x1b[2m\n${JSON.stringify(
      airtableRequestData,
      null,
      2
    )}\x1b[0m`
  );

  const { data } = await Adapter.post(
    ENTITY_CREATE_ENDPOINT_PATH,
    airtableRequestData
  );
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
  return (await updatePascalCaseEntities([camelCaseEntityUpdates])).records[0];
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
  console.log(
    `Updating entities label with the following input:\x1b[2m\n${JSON.stringify(
      records,
      null,
      2
    )}\x1b[0m`
  );

  const airtableRequestData = {
    records: UpdatePascalCaseEntitiesRequestValidationSchema.parse(records),
  };

  console.log(
    `Sending entities label POST request to airtable with the following input:\n\x1b[2m${JSON.stringify(
      airtableRequestData,
      null,
      2
    )}\x1b[0m`
  );

  const { data } = await Adapter.post(
    ENTITY_UPDATE_ENDPOINT_PATH,
    airtableRequestData
  );
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
  return (await patchPascalCaseEntities([camelCaseEntityUpdates])).records[0];
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
  console.log(
    `Updating entities label with the following input:\n\x1b[2m${JSON.stringify(
      records,
      null,
      2
    )}\x1b[0m`
  );

  const airtableRequestData = {
    records: UpdatePascalCaseEntitiesRequestValidationSchema.parse(records),
  };

  console.log(
    `Sending entities label PUT request to airtable with the following input:\x1b[2m\n${JSON.stringify(
      airtableRequestData,
      null,
      2
    )}\x1b[0m`
  );

  const { data } = await Adapter.patch(
    ENTITY_UPDATE_ENDPOINT_PATH,
    airtableRequestData
  );
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
  console.log(
    `Deleting entities label with the following input:\n\x1b[2m${JSON.stringify(
      records,
      null,
      2
    )}\x1b[0m`
  );
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
