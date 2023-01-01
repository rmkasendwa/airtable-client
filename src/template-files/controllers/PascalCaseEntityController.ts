import { BodyParams, PathParams, QueryParams } from '@tsed/common';
import { Controller } from '@tsed/di';
import { Delete, Get, Patch, Post, Put } from '@tsed/schema';

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
  PascalCaseEntityQueryableField,
  PascalCaseEntityUpdates,
  PascalCaseEntityView,
} from '../models/PascalCaseEntities';

@Controller('/kebab-case-entities')
export class PascalCaseEntityController {
  @Get('page')
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

  @Get('{camelCaseEntityId}')
  async findPascalCaseEntityById(
    @PathParams('camelCaseEntityId') camelCaseEntityId: string
  ) {
    return findPascalCaseEntityById(camelCaseEntityId);
  }

  @Post()
  async createNewPascalCaseEntity(
    @BodyParams() camelCaseEntityDetails: PascalCaseEntityCreationDetails
  ) {
    return createNewPascalCaseEntity(camelCaseEntityDetails);
  }

  @Post()
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

  @Delete('{camelCaseEntityId}')
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
