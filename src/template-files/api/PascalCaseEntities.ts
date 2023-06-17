import {
  TemplatePath,
  addSearchParams,
  getInterpolatedPath,
} from '@infinite-debugger/rmk-utils/paths';

import { AIRTABLE_BASE_ID } from '../config';
import {
  AirtablePascalCaseEntity,
  CountAllPascalCaseEntitiesQueryParams,
  CreateManyNewPascalCaseEntitiesRequestValidationSchema,
  FindAllPascalCaseEntitiesQueryParams,
  FindAllPascalCaseEntitiesReponseValidationSchema,
  PascalCaseEntity,
  PascalCaseEntityAirtableResponseValidationSchema,
  PascalCaseEntityCreationDetails,
  PascalCaseEntityPropertyToAirtableColumnNameMapper,
  PascalCaseEntityPropertyToAirtableLookupColumnNameMapper,
  PascalCaseEntityUpdates,
  UpdateManyPascalCaseEntitiesRequestValidationSchema,
  camelCaseEntityQueryableFields,
} from '../models/PascalCaseEntities';
import {
  DeleteAirtableRecordResponseValidationSchema,
  convertToAirtableFindAllRecordsQueryParams,
} from '../models/Utils';
import { APIAdapterConfiguration, _delete, get, patch, post } from './Adapter';

/**************************** ENDPOINT PATHS *****************************/
export const FIND_ALL_ENTITIES_ENDPOINT_PATH = `/${AIRTABLE_BASE_ID}/${encodeURIComponent(
  'Entities Table'
)}`;
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
export const findFirstPagePascalCaseEntities = async (
  queryParams: FindAllPascalCaseEntitiesQueryParams = {}
) => {
  console.log(
    `\nLoading entities label with the following input:\x1b[2m\n${JSON.stringify(
      queryParams,
      null,
      2
    )}\x1b[0m`
  );

  if (
    !queryParams.fields &&
    camelCaseEntityQueryableFields.length > 0 &&
    APIAdapterConfiguration.AIRTABLE_REQUEST_ONLY_FOCUS_FIELDS
  ) {
    queryParams = {
      ...queryParams,
      fields: [...camelCaseEntityQueryableFields],
    };
  }

  const requestPayload = convertToAirtableFindAllRecordsQueryParams(
    queryParams,
    PascalCaseEntityPropertyToAirtableColumnNameMapper,
    PascalCaseEntityPropertyToAirtableLookupColumnNameMapper
  );

  const requestUrl = `${FIND_ALL_ENTITIES_ENDPOINT_PATH}/listRecords`;

  console.log(
    `\nSending entities label POST request to airtable to the following URL:\x1b[2m\n${requestUrl}\x1b[0m\nWith the following payload: \x1b[2m\n${JSON.stringify(
      requestPayload,
      null,
      2
    )}\x1b[0m`
  );

  const { data } = await post(requestUrl, {
    data: requestPayload,
    label: 'Loading entities label',
  });
  return FindAllPascalCaseEntitiesReponseValidationSchema.parse(data);
};

/**
 * Finds all existing entities label in Entities Table table.
 *
 * @param queryParams The query params.
 * @returns The entities label.
 */
export const findAllPascalCaseEntities = async (
  queryParams: FindAllPascalCaseEntitiesQueryParams = {}
) => {
  const records: AirtablePascalCaseEntity[] = [];

  const findPages = async (offset?: string) => {
    const { records: responseRecords, offset: responseOffset } =
      await findFirstPagePascalCaseEntities({ ...queryParams, offset });

    records.push(...responseRecords);
    if (responseOffset) {
      await findPages(responseOffset);
    }
  };

  await findPages();

  return { records };
};

/**
 * Count all existing entities label in Entities Table table.
 *
 * @param queryParams The query params.
 * @returns The number of existing entities label.
 */
export const countAllPascalCaseEntities = async (
  queryParams: CountAllPascalCaseEntitiesQueryParams = {}
) => {
  const { records } = await findAllPascalCaseEntities({
    ...queryParams,
    fields: [],
  });

  return { recordsCount: records.length };
};

/**
 * Finds entity label by id.
 *
 * @param camelCaseEntityId The entity label id.
 * @returns The entity label.
 */
export const findPascalCaseEntityById = async (camelCaseEntityId: string) => {
  console.log(
    `\nLoading entity label by id: \x1b[2m${camelCaseEntityId}\x1b[0m`
  );
  const { data } = await get(
    getInterpolatedPath(FIND_ENTITY_BY_ID_ENPOINT_PATH, { camelCaseEntityId }),
    {
      label: 'Loading entity label',
    }
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
  return (await createManyNewPascalCaseEntities([camelCaseEntityDetails]))
    .records[0];
};

/**
 * Creates new entities label.
 *
 * @param records The entities label to be created.
 * @returns The created entities label.
 */
export const createManyNewPascalCaseEntities = async (
  records: PascalCaseEntityCreationDetails[]
) => {
  console.log(
    `\nCreating entities label with the following input:\x1b[2m\n${JSON.stringify(
      records,
      null,
      2
    )}\x1b[0m`
  );

  const createdRecords: PascalCaseEntity[] = [];

  const createPascalCaseEntitiePage = async (
    records: PascalCaseEntityCreationDetails[]
  ) => {
    records = [...records];
    const recordsToCreate = records.splice(0, 10);

    const airtableRequestData = {
      records:
        CreateManyNewPascalCaseEntitiesRequestValidationSchema.parse(
          recordsToCreate
        ),
    };

    console.log(
      `\nSending entities label POST request to airtable with the following input:\x1b[2m\n${JSON.stringify(
        airtableRequestData,
        null,
        2
      )}\x1b[0m`
    );

    const { data } = await post(ENTITY_CREATE_ENDPOINT_PATH, {
      data: airtableRequestData,
      label: 'Creating entities label',
    });

    createdRecords.push(
      ...FindAllPascalCaseEntitiesReponseValidationSchema.parse(data).records
    );

    if (records.length > 0) {
      await createPascalCaseEntitiePage(records);
    }
  };

  if (records.length > 0) {
    await createPascalCaseEntitiePage(records);
  }

  return {
    records: createdRecords,
  };
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
  return (await updateManyPascalCaseEntities([camelCaseEntityUpdates]))
    .records[0];
};

/**
 * Updates entities label.
 *
 * @param records The entities label to be updated.
 * @returns The updated entities label.
 */
export const updateManyPascalCaseEntities = async (
  records: PascalCaseEntityUpdates[]
) => {
  console.log(
    `\nUpdating entities label with the following input:\x1b[2m\n${JSON.stringify(
      records,
      null,
      2
    )}\x1b[0m`
  );

  const airtableRequestData = {
    records: UpdateManyPascalCaseEntitiesRequestValidationSchema.parse(records),
  };

  console.log(
    `\nSending entities label POST request to airtable with the following input:\n\x1b[2m${JSON.stringify(
      airtableRequestData,
      null,
      2
    )}\x1b[0m`
  );

  const { data } = await post(ENTITY_UPDATE_ENDPOINT_PATH, {
    data: airtableRequestData,
    label: 'Updating entities label',
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
  return (await patchManyPascalCaseEntities([camelCaseEntityUpdates]))
    .records[0];
};

/**
 * Patches entities label.
 *
 * @param records The entities label to be patched.
 * @returns The patched entities label.
 */
export const patchManyPascalCaseEntities = async (
  records: PascalCaseEntityUpdates[]
) => {
  console.log(
    `\nUpdating entities label with the following input:\n\x1b[2m${JSON.stringify(
      records,
      null,
      2
    )}\x1b[0m`
  );

  const updatedRecords: PascalCaseEntity[] = [];

  const patchPascalCaseEntitiesPage = async (
    records: PascalCaseEntityUpdates[]
  ) => {
    records = [...records];
    const recordsToUpdate = records.splice(0, 10);

    const airtableRequestData = {
      records:
        UpdateManyPascalCaseEntitiesRequestValidationSchema.parse(
          recordsToUpdate
        ),
    };

    console.log(
      `\nSending entities label PATCH request to airtable with the following input:\x1b[2m\n${JSON.stringify(
        airtableRequestData,
        null,
        2
      )}\x1b[0m`
    );

    const { data } = await patch(ENTITY_UPDATE_ENDPOINT_PATH, {
      data: airtableRequestData,
      label: 'Updating entities label',
    });

    updatedRecords.push(
      ...FindAllPascalCaseEntitiesReponseValidationSchema.parse(data).records
    );

    if (records.length > 0) {
      await patchPascalCaseEntitiesPage(records);
    }
  };

  if (records.length > 0) {
    await patchPascalCaseEntitiesPage(records);
  }

  return {
    records: updatedRecords,
  };
};

/**
 * Deletes entity label.
 *
 * @param camelCaseEntityId The entity label id.
 * @returns Deleted record response.
 */
export const deletePascalCaseEntity = async (camelCaseEntityId: string) => {
  return (await deleteManyPascalCaseEntities([camelCaseEntityId]))[0];
};

/**
 * Deletes entities label.
 *
 * @param recordIds The ids of the entities label to be deleted.
 * @returns Deleted records response.
 */
export const deleteManyPascalCaseEntities = async (recordIds: string[]) => {
  console.log(
    `\nDeleting entities label with the following input:\n\x1b[2m${JSON.stringify(
      recordIds,
      null,
      2
    )}\x1b[0m`
  );

  const deletedRecordsResponse: { id: string; deleted: boolean }[] = [];

  const deletePascalCaseEntitiesPage = async (recordIds: string[]) => {
    recordIds = [...recordIds];
    const recordsToDelete = recordIds.splice(0, 10);

    const { data } = await _delete(
      addSearchParams(
        ENTITY_DELETE_ENDPOINT_PATH,
        {
          records: recordsToDelete,
        },
        { arrayParamStyle: 'append' }
      ),
      {
        data: { records: recordsToDelete },
        label: 'Deleting entities label',
      }
    );

    deletedRecordsResponse.push(
      ...DeleteAirtableRecordResponseValidationSchema.parse(data)
    );

    if (recordIds.length > 0) {
      await deletePascalCaseEntitiesPage(recordIds);
    }
  };

  if (recordIds.length > 0) {
    await deletePascalCaseEntitiesPage(recordIds);
  }

  return deletedRecordsResponse;
};
