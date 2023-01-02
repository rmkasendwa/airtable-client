import { Description, Example, Optional, Property, Title } from '@tsed/schema';

/* REST_API_MODEL_IMPORTS */

/* REST_API_MODEL_EXTRAS */

export class PascalCaseEntityModel {
  @Title('id')
  @Description('Unique identifer for Entity Label.')
  @Example('recO0FYb1Tccm9MZ2')
  @Property()
  public id!: string;

  /* ENTITY_MODEL_FIELDS */
  @Property()
  @Optional()
  public name?: string;
  /* ENTITY_MODEL_FIELDS */
}

export class FindAllPascalCaseEntitiesReponseModel {
  @Title('records')
  @Description('The list of Entities Label.')
  @Property()
  public records!: PascalCaseEntityModel[];

  @Title('offset')
  @Description(
    'The airtable offset identifier in case there are more records to fetch.'
  )
  @Property()
  @Optional()
  public offset?: string;
}
