import { BodyParams, PathParams, QueryParams } from '@tsed/common';
import { Controller } from '@tsed/di';
import {
  Delete,
  Description,
  Get,
  Patch,
  Post,
  Put,
  Returns,
  Summary,
} from '@tsed/schema';
import { Docs } from '@tsed/swagger';

import {
  createNewPascalCaseEntities,
  createNewPascalCaseEntity,
  deletePascalCaseEntities,
  deletePascalCaseEntity,
  findAllPascalCaseEntities,
  findPascalCaseEntitiesPage,
  findPascalCaseEntityById,
  patchPascalCaseEntities,
  patchPascalCaseEntity,
  updatePascalCaseEntities,
  updatePascalCaseEntity,
} from '../api/PascalCaseEntities';
import { FindAllRecordsQueryParams } from '../models/__Utils';
import {
  PascalCaseEntityCreationDetails,
  PascalCaseEntityModel,
  PascalCaseEntityQueryableField,
  PascalCaseEntityUpdates,
  PascalCaseEntityView,
} from '../models/PascalCaseEntities';

@Controller('/kebab-case-entities')
@Docs('api-v1')
export class PascalCaseEntityController {
  @Get('/first-page')
  @Summary('Finds the first page of entities label.')
  @Description('Returns entities label first page matching query paramenters.')
  @Returns(200, PascalCaseEntityModel)
  async findPascalCaseEntitiesPage(
    @QueryParams()
    queryParams: FindAllRecordsQueryParams<
      PascalCaseEntityQueryableField,
      PascalCaseEntityView
    >
  ) {
    return findPascalCaseEntitiesPage(queryParams);
  }

  @Get()
  @Summary('Finds all entities label.')
  @Description('Returns entities label matching query paramenters.')
  @Returns(200, PascalCaseEntityModel)
  async findAllPascalCaseEntities(
    @QueryParams()
    queryParams: Omit<
      FindAllRecordsQueryParams<
        PascalCaseEntityQueryableField,
        PascalCaseEntityView
      >,
      'pageSize'
    >
  ) {
    return findAllPascalCaseEntities(queryParams);
  }

  @Get('/:camelCaseEntityId')
  @Summary('Finds entity label by id.')
  @Description('Returns entity label matching the given id.')
  @Returns(200, PascalCaseEntityModel)
  @Returns(404).Description('Not found')
  async findPascalCaseEntityById(
    @PathParams('camelCaseEntityId') camelCaseEntityId: string
  ) {
    return findPascalCaseEntityById(camelCaseEntityId);
  }

  @Post()
  @Summary('Creates new entity label.')
  @Description('Returns the created entity label.')
  @Returns(200, PascalCaseEntityModel)
  async createNewPascalCaseEntity(
    @BodyParams() camelCaseEntityDetails: PascalCaseEntityCreationDetails
  ) {
    return createNewPascalCaseEntity(camelCaseEntityDetails);
  }

  @Post()
  @Summary('Creates new entities label.')
  @Description('Returns the created entities label.')
  @Returns(200, PascalCaseEntityModel)
  async createNewPascalCaseEntities(
    @BodyParams() records: PascalCaseEntityCreationDetails[]
  ) {
    return createNewPascalCaseEntities(records);
  }

  @Put()
  async updatePascalCaseEntity(
    @BodyParams() camelCaseEntityUpdates: PascalCaseEntityUpdates
  ) {
    return updatePascalCaseEntity(camelCaseEntityUpdates);
  }

  @Put()
  async updatePascalCaseEntities(
    @BodyParams() records: PascalCaseEntityUpdates[]
  ) {
    return updatePascalCaseEntities(records);
  }

  @Patch()
  async patchPascalCaseEntity(
    @BodyParams() camelCaseEntityUpdates: PascalCaseEntityUpdates
  ) {
    return patchPascalCaseEntity(camelCaseEntityUpdates);
  }

  @Patch()
  async patchPascalCaseEntities(
    @BodyParams() records: PascalCaseEntityUpdates[]
  ) {
    return patchPascalCaseEntities(records);
  }

  @Delete('/:camelCaseEntityId')
  async deletePascalCaseEntity(
    @PathParams('camelCaseEntityId') camelCaseEntityId: string
  ) {
    return deletePascalCaseEntity(camelCaseEntityId);
  }

  @Delete()
  async deletePascalCaseEntities(@BodyParams() recordIds: string[]) {
    return deletePascalCaseEntities(recordIds);
  }
}
