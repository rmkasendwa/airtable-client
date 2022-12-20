import { AIRTABLE_BASE_ID } from './__config';

// Endpoint Paths
export const FIND_ALL_RECORDS_ENDPOINT_PATH = `${AIRTABLE_BASE_ID}/Records`;
export const FIND_RECORD_BY_ID_ENPOINT_PATH = `${FIND_ALL_RECORDS_ENDPOINT_PATH}/:recordId`;
export const RECORD_CREATE_ENDPOINT_PATH = `/Records`;
export const RECORD_UPDATE_ENDPOINT_PATH = `/Records`;
export const RECORD_DELETE_ENDPOINT_PATH = `/Records`;
