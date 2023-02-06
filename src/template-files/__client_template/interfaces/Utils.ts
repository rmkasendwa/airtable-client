export type DeleteRecordResponse = {
  delete: boolean;
  id: string;
};

export type DeleteRecordsResponse = {
  records?: DeleteRecordResponse[];
};

export type DefaultRequestQueryParams<
  Field extends string = string,
  View extends string = string
> = {
  fields?: Field[];
  filterByFormula?: string;
  maxRecords?: number;
  pageSize?: number;
  sort?: {
    direction?: 'asc' | 'desc';
    field?: Field;
  }[];
  view?: View;
  cellFormat?: 'string' | 'json';
  timeZone?: string;
  userLocale?: string;
  offset?: string;
};
