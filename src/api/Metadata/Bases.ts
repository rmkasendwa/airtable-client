import { getInterpolatedPath } from '@infinite-debugger/rmk-utils/paths';

import {
  FIND_AIRTABLE_BASE_BY_ID_ENDPOINT_PATH,
  FIND_ALL_AIRTABLE_BASES_ENDPOINT_PATH,
} from '../../endpoint-paths/Metadata';
import {
  FindAirtableBaseByIdResponseValidationSchema,
  FindAllAirtableBasesResponseValidationSchema,
} from '../../models/Metadata/Bases';
import { get } from '../Adapter';

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
