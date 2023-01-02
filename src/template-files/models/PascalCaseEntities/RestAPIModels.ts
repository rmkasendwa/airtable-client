import { Description, Example, Property, Title } from '@tsed/schema';

export class PascalCaseEntityModel {
  @Title('id')
  @Description('Unique identifer for Entity Label')
  @Example('recYc1Z0M9ObmT2cF')
  @Property()
  public id!: string;
  /* ENTITY_MODEL_FIELDS */
}
