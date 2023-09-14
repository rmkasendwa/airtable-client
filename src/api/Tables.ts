import {
  TemplatePath,
  getInterpolatedPath,
} from '@infinite-debugger/rmk-utils/paths';

import { TablesResponseValidationSchema } from '../models';
import { get } from './Adapter';

//#region Endpoint Paths
export const FIND_ALL_TABLES_BY_BASE_ID_ENDPOINT_PATH: TemplatePath<{
  baseId: string;
}> = `/meta/bases/:baseId/tables`;
//#endregion

export const findAllTablesByBaseId = async (baseId: string) => {
  const { data } = await get(
    getInterpolatedPath(FIND_ALL_TABLES_BY_BASE_ID_ENDPOINT_PATH, { baseId }),
    {
      label: 'Loading tables',
    }
  );

  return TablesResponseValidationSchema.parse(data);
};

export const generateTableAPI = async () => {};
