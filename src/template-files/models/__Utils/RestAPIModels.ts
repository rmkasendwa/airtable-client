import { Description, Example, Optional, Property, Title } from '@tsed/schema';

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
