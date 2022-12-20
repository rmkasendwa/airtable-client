import { TemplatePath } from '@infinite-debugger/rmk-utils/paths';

export const FIND_ALL_AIRTABLE_BASES_ENDPOINT_PATH = `/meta/bases`;

export const FIND_AIRTABLE_BASE_BY_ID_ENDPOINT_PATH: TemplatePath<{
  baseId: string;
}> = `${FIND_ALL_AIRTABLE_BASES_ENDPOINT_PATH}/:baseId`;

export const FIND_ALL_TABLES_BY_BASE_ID_ENDPOINT_PATH: typeof FIND_AIRTABLE_BASE_BY_ID_ENDPOINT_PATH = `${FIND_AIRTABLE_BASE_BY_ID_ENDPOINT_PATH}/tables`;
