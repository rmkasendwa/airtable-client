import { getInterpolatedPath } from '@infinite-debugger/rmk-utils/paths';

import {
  FIND_AIRTABLE_BASE_BY_ID_ENDPOINT_PATH,
  FIND_ALL_AIRTABLE_BASES_ENDPOINT_PATH,
} from '../../endpoint-paths/Metadata';
import {
  FindAirtableBaseByIdResponseValidationSchema,
  FindAllAirtableBasesResponseValidationSchema,
} from '../../models/Metadata/Bases';
import Adapter from '../Adapter';

/**
 * Finds all airtable bases.
 *
 * @returns Airtable bases response.
 */
export const findAllAirtableBases = async () => {
  const { data } = await Adapter.get(FIND_ALL_AIRTABLE_BASES_ENDPOINT_PATH);

  return FindAllAirtableBasesResponseValidationSchema.parse(data);
};

/**
 * Find airtable base by id.
 *
 * @param baseId The airtable base id.
 * @returns The airtable base.
 */
export const findAirtableBaseById = async (baseId: string) => {
  const { data } = await Adapter.get(
    getInterpolatedPath(FIND_AIRTABLE_BASE_BY_ID_ENDPOINT_PATH, {
      baseId,
    })
  );

  return FindAirtableBaseByIdResponseValidationSchema.parse(data);
};
