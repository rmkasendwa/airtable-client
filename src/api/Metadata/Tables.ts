import { getInterpolatedPath } from '@infinite-debugger/rmk-utils/paths';

import { FIND_ALL_TABLES_BY_BASE_ID_ENDPOINT_PATH } from '../../endpoint-paths/Metadata';
import { TablesResponseValidationSchema } from '../../models';
import Adapter from '../Adapter';

export const findAllTablesByBaseId = async (baseId: string) => {
  const { data } = await Adapter.get(
    getInterpolatedPath(FIND_ALL_TABLES_BY_BASE_ID_ENDPOINT_PATH, { baseId })
  );

  return TablesResponseValidationSchema.parse(data);
};

export const generateTableAPI = async () => {};
