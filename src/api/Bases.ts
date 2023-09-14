import {
  TemplatePath,
  getInterpolatedPath,
} from '@infinite-debugger/rmk-utils/paths';

import {
  FindAirtableBaseByIdResponseValidationSchema,
  FindAllAirtableBasesResponseValidationSchema,
} from '../models/Bases';
import { get } from './Adapter';

//#region Endpoint Paths
export const FIND_ALL_AIRTABLE_BASES_ENDPOINT_PATH = `/meta/bases`;

export const FIND_AIRTABLE_BASE_BY_ID_ENDPOINT_PATH: TemplatePath<{
  baseId: string;
}> = `${FIND_ALL_AIRTABLE_BASES_ENDPOINT_PATH}/:baseId`;
//#endregion

/**
 * Finds all airtable bases.
 *
 * @returns Airtable bases response.
 */
export const findAllAirtableBases = async () => {
  const { data } = await get(FIND_ALL_AIRTABLE_BASES_ENDPOINT_PATH, {
    label: 'Loading airtable bases',
  });

  return FindAllAirtableBasesResponseValidationSchema.parse(data);
};

/**
 * Find airtable base by id.
 *
 * @param baseId The airtable base id.
 * @returns The airtable base.
 */
export const findAirtableBaseById = async (baseId: string) => {
  const { data } = await get(
    getInterpolatedPath(FIND_AIRTABLE_BASE_BY_ID_ENDPOINT_PATH, {
      baseId,
    }),
    {
      label: 'Loading airtable base',
    }
  );

  return FindAirtableBaseByIdResponseValidationSchema.parse(data);
};
