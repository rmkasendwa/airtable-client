import { omit } from 'lodash';

import { FindAllRecordsQueryParams } from './__interfaces';

export const convertToAirtableFindAllRecordsQueryParams = <
  T extends FindAllRecordsQueryParams
>(
  queryParams: T
) => {
  const airtableQueryParams: Omit<
    FindAllRecordsQueryParams,
    'sort' | 'fields'
  > & {
    sort?: string[];
    fields?: string;
  } = {
    ...omit(queryParams, 'sort', 'fields'),
    ...(() => {
      if (queryParams.sort) {
        return {
          sort: queryParams.sort
            .map(({ field, direction }, index) => {
              return [
                `sort[${index}][field]=${field}`,
                ...(() => {
                  if (direction) {
                    return `sort[${index}][direction]=${direction}`;
                  }
                  return [];
                })(),
              ];
            })
            .flat(),
        };
      }
    })(),
  };

  return airtableQueryParams;
};
