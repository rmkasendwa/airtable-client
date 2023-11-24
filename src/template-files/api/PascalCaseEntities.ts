import {
  TemplatePath,
  addSearchParams,
  getInterpolatedPath,
} from '@infinite-debugger/rmk-utils/paths';
import { $log } from '@tsed/logger';

import { AIRTABLE_BASE_ID } from '../config';
import {
  BasePascalCaseEntity,
  BasePascalCaseEntityCreationDetails,
  CountAllPascalCaseEntitiesQueryParams,
  CreateManyNewPascalCaseEntitiesRequestValidationSchema,
  FindAllPascalCaseEntitiesReponseValidationSchema,
  FindFirstPagePascalCaseEntitiesQueryParams,
  PascalCaseEntityAirtableResponseValidationSchema,
  PascalCaseEntityPatches,
  PascalCaseEntityPropertyToAirtableColumnNameMapper,
  PascalCaseEntityPropertyToAirtableLookupColumnNameMapper,
  PascalCaseEntityUpdates,
  UpdateManyPascalCaseEntitiesRequestValidationSchema,
  camelCaseEntitiesAirtableAlternativeRecordIdColumns,
  camelCaseEntityQueryableFields,
  camelCaseEntityRequiredProperties,
} from '../models/PascalCaseEntities';
import {
  DeleteAirtableRecordResponseValidationSchema,
  convertToAirtableFindAllRecordsQueryParams,
} from '../models/Utils';
import { APIAdapterConfiguration, _delete, get, patch, post } from './Adapter';

//#region ENDPOINT PATHS
export const FIND_ALL_ENTITIES_ENDPOINT_PATH = `/${AIRTABLE_BASE_ID}/${encodeURIComponent(
  'Entities Table'
)}`;
export const FIND_ENTITY_BY_ID_ENPOINT_PATH: TemplatePath<{
  camelCaseEntityId: string;
}> = `${FIND_ALL_ENTITIES_ENDPOINT_PATH}/:camelCaseEntityId`;
export const ENTITY_CREATE_ENDPOINT_PATH = FIND_ALL_ENTITIES_ENDPOINT_PATH;
export const ENTITY_UPDATE_ENDPOINT_PATH = FIND_ALL_ENTITIES_ENDPOINT_PATH;
export const ENTITY_DELETE_ENDPOINT_PATH = FIND_ALL_ENTITIES_ENDPOINT_PATH;
//#endregion

//#region Find All Entities Label
/**
 * Finds entities label limited by queryParams.pageSize
 *
 * @param queryParams The query params.
 * @returns The entities label.
 */
export const findFirstPagePascalCaseEntities = async (
  queryParams: FindFirstPagePascalCaseEntitiesQueryParams = {}
): Promise<{
  records: BasePascalCaseEntity[];
  offset?: string;
}> => {
  $log.info(`Loading entities label`, {
    queryParams,
  });

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

  const requestPayload = convertToAirtableFindAllRecordsQueryParams({
    queryParams,
    lookupObjectPropertyToColumnNameMapper:
      PascalCaseEntityPropertyToAirtableLookupColumnNameMapper,
    objectPropertyToColumnNameMapper:
      PascalCaseEntityPropertyToAirtableColumnNameMapper,
    requiredFields: camelCaseEntityRequiredProperties,
  });

  const requestUrl = `${FIND_ALL_ENTITIES_ENDPOINT_PATH}/listRecords`;

  $log.info(`Sending entities label POST request to airtable`, {
    requestUrl,
    requestPayload,
  });

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
  queryParams: FindFirstPagePascalCaseEntitiesQueryParams = {}
) => {
  const records: BasePascalCaseEntity[] = [];

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
//#endregion

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
export const findPascalCaseEntityById = async (
  camelCaseEntityId: string
): Promise<BasePascalCaseEntity> => {
  $log.info(`Loading entity label by id`, { camelCaseEntityId });
  if (camelCaseEntityId.match(/^rec/)) {
    const { data } = await get(
      getInterpolatedPath(FIND_ENTITY_BY_ID_ENPOINT_PATH, {
        camelCaseEntityId,
      }),
      {
        label: 'Loading entity label',
      }
    );

    return PascalCaseEntityAirtableResponseValidationSchema.parse(data);
  }

  if (camelCaseEntitiesAirtableAlternativeRecordIdColumns.length > 0) {
    const { records } = await findAllPascalCaseEntities({
      filterByFormula: `OR(${camelCaseEntitiesAirtableAlternativeRecordIdColumns
        .map((column) => `{${column}}='${camelCaseEntityId}'`)
        .join(',')})`,
    });

    if (records.length > 0) {
      return records[0];
    }
  }
  throw new Error(`Record with id ${camelCaseEntityId} not found.`);
};

/**
 * Creates a new entity label.
 *
 * @param camelCaseEntityDetails The entity label details.
 * @returns The created entity label.
 */
export const createNewPascalCaseEntity = async (
  camelCaseEntityDetails: BasePascalCaseEntityCreationDetails
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
  records: BasePascalCaseEntityCreationDetails[]
) => {
  $log.info(`Creating entities label`, { records });

  const createdRecords: BasePascalCaseEntity[] = [];

  const createPascalCaseEntitiePage = async (
    records: BasePascalCaseEntityCreationDetails[]
  ) => {
    records = [...records];
    const recordsToCreate = records.splice(0, 10);

    const airtableRequestData = {
      records:
        CreateManyNewPascalCaseEntitiesRequestValidationSchema.parse(
          recordsToCreate
        ),
    };

    $log.info(`Sending entities label POST request to airtable`, {
      airtableRequestData,
    });

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
  $log.info(`Updating entities label`, { records });

  const airtableRequestData = {
    records: UpdateManyPascalCaseEntitiesRequestValidationSchema.parse(records),
  };

  $log.info(`Sending entities label POST request to airtable`, {
    airtableRequestData,
  });

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
  camelCaseEntityUpdates: PascalCaseEntityPatches
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
  records: PascalCaseEntityPatches[]
) => {
  $log.info(`Updating entities label`, { records });

  const updatedRecords: BasePascalCaseEntity[] = [];

  const patchPascalCaseEntitiesPage = async (
    records: PascalCaseEntityPatches[]
  ) => {
    records = [...records];
    const recordsToUpdate = records.splice(0, 10);

    const airtableRequestData = {
      records:
        UpdateManyPascalCaseEntitiesRequestValidationSchema.parse(
          recordsToUpdate
        ),
    };

    $log.info(`Sending entities label PATCH request to airtable`, {
      airtableRequestData,
    });

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
  $log.info(`Deleting entities label`, { recordIds });

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
