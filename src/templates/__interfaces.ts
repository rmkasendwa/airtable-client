export type AirtableSortOption<T> = {
  field: keyof T;
  direction?: 'asc' | 'desc';
};

export type FindAllRecordsQueryParams<
  T extends Record<string, any> = Record<string, any>,
  ViewType extends string = string
> = {
  fields?: (keyof T)[];
  filterByFormula?: string;
  maxRecords?: number;
  pageSize?: number;
  sort?: AirtableSortOption<T>[];
  view?: ViewType;
  cellFormat?: 'string' | 'json';
  timeZone?: string;
  userLocale?: string;
};
