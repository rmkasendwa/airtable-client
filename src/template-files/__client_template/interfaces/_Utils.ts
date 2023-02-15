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

export type AirtableAttachmentThumbnail = {
  url: string;
  width: number;
  height: number;
};

export type AirtableAttachmentThumbnailGroup = {
  small?: AirtableAttachmentThumbnail;
  large?: AirtableAttachmentThumbnail;
  full?: AirtableAttachmentThumbnail;
};

export type AirtableAttachment = {
  id: string;
  width: number;
  height: number;
  url: string;
  filename: string;
  size: number;
  type: string;
  thumbnails?: AirtableAttachmentThumbnailGroup;
};

export type AirtableFormulaColumnError = {
  specialValue?: 'NaN';
  error?: string;
};

export type AirtableButton = {
  label: string;
  url: string;
};
