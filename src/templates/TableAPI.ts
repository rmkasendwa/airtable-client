import {
  TemplatePath,
  addSearchParams,
  getInterpolatedPath,
} from '@infinite-debugger/rmk-utils/paths';

import Adapter from './__Adapter';
import { AIRTABLE_BASE_ID } from './__config';

// Endpoint Paths
export const FIND_ALL_ENTITIES_ENDPOINT_PATH = `${AIRTABLE_BASE_ID}/Entities`;
export const FIND_ENTITY_BY_ID_ENPOINT_PATH: TemplatePath<{
  entityId: string;
}> = `${FIND_ALL_ENTITIES_ENDPOINT_PATH}/:entityId`;
export const ENTITY_CREATE_ENDPOINT_PATH = `${AIRTABLE_BASE_ID}/Entities`;
export const ENTITY_UPDATE_ENDPOINT_PATH = `${AIRTABLE_BASE_ID}/Entities`;
export const ENTITY_DELETE_ENDPOINT_PATH = `${AIRTABLE_BASE_ID}/Entities`;

export type Entity = {
  id: string;
};

export type EntityCreationDetails = Partial<Omit<Entity, 'id'>>;

export type EntityUpdates = EntityCreationDetails & Pick<Entity, 'id'>;

export const findAllEntities = async () => {
  const { data } = await Adapter.get(FIND_ALL_ENTITIES_ENDPOINT_PATH);
  return data;
};

export const findEntityById = async (entityId: string) => {
  const { data } = await Adapter.get(
    getInterpolatedPath(FIND_ENTITY_BY_ID_ENPOINT_PATH, { entityId })
  );
  return data;
};

export const createEntity = async (entityDetails: EntityCreationDetails) => {
  return (await createEntities([entityDetails]))[0];
};

export const createEntities = async (records: EntityCreationDetails[]) => {
  const { data } = await Adapter.post(ENTITY_CREATE_ENDPOINT_PATH, {
    data: JSON.stringify({ records }),
  });
  return data;
};

export const updateEntity = async (entityUpdates: EntityUpdates) => {
  return (await updateEntities([entityUpdates]))[0];
};

export const updateEntities = async (records: EntityUpdates[]) => {
  const { data } = await Adapter.post(ENTITY_UPDATE_ENDPOINT_PATH, {
    data: JSON.stringify({ records }),
  });
  return data;
};

export const patchEntity = async (entityUpdates: EntityUpdates) => {
  return (await patchEntities([entityUpdates]))[0];
};

export const patchEntities = async (records: EntityUpdates[]) => {
  const { data } = await Adapter.patch(ENTITY_UPDATE_ENDPOINT_PATH, {
    data: JSON.stringify({ records }),
  });
  return data;
};

export const deleteEntity = async (entityId: string) => {
  return (await deleteEntities([entityId]))[0];
};

export const deleteEntities = async (records: string[]) => {
  const { data } = await Adapter.delete(
    addSearchParams(ENTITY_DELETE_ENDPOINT_PATH, {
      records,
    }),
    {
      data: JSON.stringify({ records }),
    }
  );
  return data;
};
