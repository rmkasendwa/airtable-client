import {
  Default,
  Description,
  Example,
  Optional,
  Property,
  Title,
} from '@tsed/schema';

export class AirtableSortOptionModel<Field extends string = string> {
  @Title('field')
  @Description('The field to sort by.')
  @Property()
  public field!: Field;

  @Title('direction')
  @Description('The sort direction')
  @Example('asc')
  @Property()
  @Optional()
  public direction?: 'asc' | 'desc';
}

export class FindAllRecordsQueryParamsModel<
  Field extends string = string,
  View extends string = string
> {
  @Title('fields')
  @Description(
    `
    Only data for fields whose names are in this list will be included in the result. If you don't need every field, you can use this parameter to reduce the amount of data transferred.

    For example, to only return data from Name and Status, send these two query parameters:

    fields%5B%5D=Name&fields%5B%5D=Status
    You can also perform the same action with field ids (they can be found in the fields section):

    fields%5B%5D=fldG9yBafL709WagC&fields%5B%5D=fldySXPDpkljy1BCq
    Note: %5B%5D may be omitted when specifying multiple fields, but must always be included when specifying only a single field.
  `
      .trimIndent()
      .trim()
  )
  @Property()
  @Optional()
  public fields?: Field[];

  @Title('filterByFormula')
  @Description(
    `
    A formula used to filter records. The formula will be evaluated for each record, and if the result is not 0, false, "", NaN, [], or #Error! the record will be included in the response. We recommend testing your formula in the Formula field UI before using it in your API request.

    If combined with the view parameter, only records in that view which satisfy the formula will be returned.
    
    The formula must be encoded first before passing it as a value. You can use this tool to not only encode the formula but also create the entire url you need. For example, to only include records where Name isn't empty, pass in NOT({Name} = '') as a parameter like this:
    
    filterByFormula=NOT%28%7BName%7D%20%3D%20%27%27%29
  `
      .trimIndent()
      .trim()
  )
  @Property()
  @Optional()
  public filterByFormula?: string;

  @Title('maxRecords')
  @Description(
    'The maximum total number of records that will be returned in your requests. If this value is larger than pageSize (which is 100 by default), you may have to load multiple pages to reach this total. See the Pagination section below for more.'
  )
  @Property()
  @Optional()
  public maxRecords?: number;

  @Title('pageSize')
  @Description(
    'The number of records returned in each request. Must be less than or equal to 100. Default is 100. See the Pagination section below for more.'
  )
  @Default(100)
  @Property()
  @Optional()
  public pageSize?: number;

  @Title('sort')
  @Description(
    `
    A list of sort objects that specifies how the records will be ordered. Each sort object must have a field key specifying the name of the field to sort on, and an optional direction key that is either "asc" or "desc". The default direction is "asc".

    The sort parameter overrides the sorting of the view specified in the view parameter. If neither the sort nor the view parameter is included, the order of records is arbitrary.

    For example, to sort records by name in descending order, send these two query parameters:

    sort%5B0%5D%5Bfield%5D=name
    sort%5B0%5D%5Bdirection%5D=desc
  `
      .trimIndent()
      .trim()
  )
  @Property()
  @Optional()
  public sort?: AirtableSortOptionModel[];

  @Title('view')
  @Description(
    'The name or ID of a view in the table. If set, only the records in that view will be returned. The records will be sorted according to the order of the view unless the sort parameter is included, which overrides that order. Fields hidden in this view will be returned in the results. To only return a subset of fields, use the fields parameter.'
  )
  @Property()
  @Optional()
  public view?: View;

  @Title('cellFormat')
  @Description(
    `
    The format that should be used for cell values. Supported values are:

    json: cells will be formatted as JSON, depending on the field type.
  
    string: cells will be formatted as user-facing strings, regardless of the field type. The timeZone and userLocale parameters are required when using string as the cellFormat.
  `
      .trimIndent()
      .trim()
  )
  @Property()
  @Optional()
  public cellFormat?: 'string' | 'json';

  @Title('timeZone')
  @Description(
    'The time zone that should be used to format dates when using string as the cellFormat. This parameter is required when using string as the cellFormat.'
  )
  @Property()
  @Optional()
  public timeZone?: string;

  @Title('userLocale')
  @Description(
    'The user locale that should be used to format dates when using string as the cellFormat. This parameter is required when using string as the cellFormat.'
  )
  @Property()
  @Optional()
  public userLocale?: string;

  @Title('offset')
  @Description('The airtable offset to load the next page.')
  @Property()
  @Optional()
  public offset?: string;
}

export class DeleteAirtableRecordResponseModel {
  @Title('id')
  @Description('Unique identifer of the deleted Entity Label')
  @Example('recM9m1bZOccF2TY0')
  @Property()
  public id!: string;

  @Title('delete')
  @Description('Whether the Entity Label was deleted or not')
  @Example(true)
  @Property()
  public delete!: boolean;
}

export class AirtableAttachmentThumbnailModel {
  @Title('url')
  @Description('The thumbnail URL.')
  @Example('https://www.filepicker.io/api/file/ULCoXHhx0ivaSyDg5SIg')
  @Property()
  public url!: string;

  @Title('width')
  @Description('The width of the thumbnail.')
  @Example(64)
  @Property()
  public width!: number;

  @Title('height')
  @Description('The height of the thumbnail.')
  @Example(64)
  @Property()
  public height!: number;
}

export class AirtableAttachmentThumbnailGroupModel {
  @Title('small')
  @Description('The small thumbnail.')
  @Example({
    url: 'https://www.filepicker.io/api/file/vCgLXiayH5UgDSxShoI0',
    width: 54,
    height: 36,
  })
  @Property()
  @Optional()
  public small?: AirtableAttachmentThumbnailModel;

  @Title('large')
  @Description('The large thumbnail.')
  @Example({
    url: 'https://www.filepicker.io/api/file/ui0ARnU2yuUZ4ehY0qi0',
    width: 197,
    height: 131,
  })
  @Property()
  @Optional()
  public large?: AirtableAttachmentThumbnailModel;

  @Title('full')
  @Description('The large thumbnail.')
  @Example({
    url: 'https://v5.airtableusercontent.com/v1/13/13/7206610005207/bIbbgi0VoLUe42zY4tn-sg/6zLDXJ2fZ5zZvSoHimlxSzbjTSQ4QIcpAN98fVW/-pWboVONLE10-mbhlXk7sYpuTjqtv7mSY2O2SsYTE_Tg4ZIM8h253PdM3A7U9FRZS_68iFxygr-rQGvzZbtubeGes6',
    width: 3000,
    height: 3000,
  })
  @Property()
  @Optional()
  public full?: AirtableAttachmentThumbnailModel;
}

export class AirtableAttachmentModel {
  @Title('id')
  @Description('The id of the attachment.')
  @Example('attL8HyJ4HiaudbBJ')
  @Property()
  public id!: string;

  @Title('width')
  @Description('The attachment width.')
  @Example(144)
  @Property()
  public width!: number;

  @Title('height')
  @Description('The attachment height.')
  @Example(144)
  @Property()
  public height!: number;

  @Title('url')
  @Description('The attachment URL.')
  @Example(
    'https://v5.airtableusercontent.com/v1/13/13/2610752006007/RI51n3urgmQT8QKzLwlhnU/f1EqI4fPTACz8osywCFfw--kAv717Z6EGx8MOZnX3OGjqYpsGqdhlXUbSyYnOCOs-pQd_5eHNjbGprAnrDkRan/MYGj8OggA5ZRKdjUUDxyQLR5IZA33oucbyxvmfFkTIg'
  )
  @Property()
  public url!: string;

  @Title('filename')
  @Description('The name of the attachment file.')
  @Example('dog.png')
  @Property()
  public filename!: string;

  @Title('size')
  @Description('The size of the attachment file in bytes.')
  @Example(4146)
  @Property()
  public size!: number;

  @Title('type')
  @Description('The mime type of the attachment file.')
  @Example('image/png')
  @Property()
  public type!: string;

  @Title('thumbnails')
  @Description('The attachment thumbnails.')
  @Example({
    small: {
      url: 'https://v5.airtableusercontent.com/v1/13/13/6075000710622/zA1nk30Z_h9MA9Ahg1mxJq/11GHxrybSFMCzJbexzwO0gHAwSWKqqH8ovOyR2YiezC6ZYma8icW87yw-s0_6Mg2ZaB2G7lFOiztypreHSdSvi/0vYOKJr3Pi3ksBdIM-4IqR7HxPJUBXs6eHqqkzFxZ8U',
      width: 36,
      height: 36,
    },
    large: {
      url: 'https://v5.airtableusercontent.com/v1/13/13/2017005662007/kbDstWmhNUzDEptuLJNCQb/47KtSWqOLbwfS8_4HwEWSeZlz14bMANkX2coOHSuFDpLbmYAQhPJCcs_15821f2KCzeIKXSH84zqjB6t4B3FQe/QMGR7gOtIcco4GPl7l_0firaau-p7a2j--JBEMtB8Zj',
      width: 144,
      height: 144,
    },
    full: {
      url: 'https://v5.airtableusercontent.com/v1/13/13/0002621775600/t4eLoU4izb0IbsnVY2gbg-/svGir93FTOPvxWf-bzVj0b3FU7SRo_El7mY-e9oLsDplbi425z-IW_SrZZksZm42ZymQ8OuMH6gbtSzfhVJuvN/jtTSA7Z21pdT6bcXqI8hpQSMg8Y5TQYeEzxGNXA62LS',
      width: 3000,
      height: 3000,
    },
  })
  @Property()
  @Optional()
  public thumbnails?: AirtableAttachmentThumbnailGroupModel;
}

export class AirtableFormulaColumnErrorModel {
  @Title('specialValue')
  @Description('Invalid output of a formula.')
  @Example('NaN')
  @Property()
  @Optional()
  public specialValue?: 'NaN';

  @Title('error')
  @Description('The error message')
  @Example('#Error!')
  @Property()
  @Optional()
  public error?: string;
}

export class AirtableButtonModel {
  @Title('label')
  @Description('The button label')
  @Example('Make Document')
  @Property()
  public label!: string;

  @Title('url')
  @Description('The URL that should be opened when the button is clicked')
  @Example(
    'https://airtable.com/tbljnMFy6nqsFHFR7/recIXIpWdiuZd9VYg?blocks=blxYtqVDViGvyu90b'
  )
  @Property()
  public url!: string;
}
