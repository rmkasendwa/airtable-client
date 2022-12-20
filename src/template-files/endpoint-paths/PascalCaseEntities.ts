import { TemplatePath } from '@infinite-debugger/rmk-utils/paths';

import { AIRTABLE_BASE_ID } from '../config';

export const FIND_ALL_ENTITIES_ENDPOINT_PATH = `${AIRTABLE_BASE_ID}/Entities Label`;

export const FIND_ENTITY_BY_ID_ENPOINT_PATH: TemplatePath<{
  camelCaseEntityId: string;
}> = `${FIND_ALL_ENTITIES_ENDPOINT_PATH}/:camelCaseEntityId`;

export const ENTITY_CREATE_ENDPOINT_PATH = `${AIRTABLE_BASE_ID}/Entities Label`;

export const ENTITY_UPDATE_ENDPOINT_PATH = `${AIRTABLE_BASE_ID}/Entities Label`;

export const ENTITY_DELETE_ENDPOINT_PATH = `${AIRTABLE_BASE_ID}/Entities Label`;
