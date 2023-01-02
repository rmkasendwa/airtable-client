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
import {
  DeleteAirtableRecordResponseModel,
  FindAllRecordsQueryParamsModel,
} from '../models/__Utils/RestAPIModels';
import {
  PascalCaseEntityCreationDetails,
  PascalCaseEntityQueryableField,
  PascalCaseEntityUpdates,
  PascalCaseEntityView,
} from '../models/PascalCaseEntities';
import {
  FindAllPascalCaseEntitiesReponseModel,
  PascalCaseEntityModel,
} from '../models/PascalCaseEntities/RestAPIModels';

@Controller('/kebab-case-entities')
@Docs('api-v1')
export class PascalCaseEntityController {
  @Get('/first-page')
  @Summary('Finds the first page of entities label.')
  @Description('Returns entities label first page matching query paramenters.')
  @Returns(200, FindAllPascalCaseEntitiesReponseModel)
  async findPascalCaseEntitiesPage(
    @QueryParams()
    queryParams: FindAllRecordsQueryParamsModel<
      PascalCaseEntityQueryableField,
      PascalCaseEntityView
    >
  ): Promise<FindAllPascalCaseEntitiesReponseModel> {
    return findPascalCaseEntitiesPage(queryParams as any);
  }

  @Get()
  @Summary('Finds all entities label.')
  @Description('Returns entities label matching query paramenters.')
  @Returns(200, FindAllPascalCaseEntitiesReponseModel)
  async findAllPascalCaseEntities(
    @QueryParams()
    queryParams: FindAllRecordsQueryParamsModel<
      PascalCaseEntityQueryableField,
      PascalCaseEntityView
    >
  ): Promise<FindAllPascalCaseEntitiesReponseModel> {
    return findAllPascalCaseEntities(queryParams as any);
  }

  @Get('/:camelCaseEntityId')
  @Summary('Finds entity label by id.')
  @Description('Returns entity label matching the given id.')
  @Returns(200, PascalCaseEntityModel)
  @Returns(404).Description('Not found')
  async findPascalCaseEntityById(
    @Description('The id of the entity label to be found.')
    @PathParams('camelCaseEntityId')
    camelCaseEntityId: string
  ): Promise<PascalCaseEntityModel> {
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

  @Post('/batch')
  @Summary('Creates new entities label.')
  @Description('Returns the created entities label.')
  @Returns(200, [PascalCaseEntityModel])
  async createNewPascalCaseEntities(
    @BodyParams() records: PascalCaseEntityCreationDetails[]
  ) {
    return createNewPascalCaseEntities(records);
  }

  @Put()
  @Summary('Updates entity label.')
  @Description(
    'Returns the updated entity label. Null values will wipe database fields.'
  )
  @Returns(200, PascalCaseEntityModel)
  async updatePascalCaseEntity(
    @BodyParams() camelCaseEntityUpdates: PascalCaseEntityUpdates
  ) {
    return updatePascalCaseEntity(camelCaseEntityUpdates);
  }

  @Put('/batch')
  @Summary('Updates entities label.')
  @Description(
    'Returns the updated entities label. Null values will wipe database fields.'
  )
  @Returns(200, [PascalCaseEntityModel])
  async updatePascalCaseEntities(
    @BodyParams() records: PascalCaseEntityUpdates[]
  ) {
    return updatePascalCaseEntities(records);
  }

  @Patch()
  @Summary('Patches entity label.')
  @Description('Returns the patched entity label.')
  @Returns(200, PascalCaseEntityModel)
  async patchPascalCaseEntity(
    @BodyParams() camelCaseEntityUpdates: PascalCaseEntityUpdates
  ) {
    return patchPascalCaseEntity(camelCaseEntityUpdates);
  }

  @Patch('/batch')
  @Summary('Patches entities label.')
  @Description('Returns the patched entities label.')
  @Returns(200, [PascalCaseEntityModel])
  async patchPascalCaseEntities(
    @BodyParams() records: PascalCaseEntityUpdates[]
  ) {
    return patchPascalCaseEntities(records);
  }

  @Delete('/:camelCaseEntityId')
  @Summary('Deletes entity label by id.')
  @Description('Returns id of the deleted entity label.')
  @Returns(200, DeleteAirtableRecordResponseModel)
  @Returns(404).Description('Not found')
  async deletePascalCaseEntity(
    @Description('The id of the entity label to be deleted.')
    @PathParams('camelCaseEntityId')
    camelCaseEntityId: string
  ): Promise<DeleteAirtableRecordResponseModel> {
    return deletePascalCaseEntity(camelCaseEntityId);
  }

  @Delete('/batch')
  @Summary('Deletes entities label.')
  @Description('Returns ids of the deleted entities label.')
  @Returns(200, [DeleteAirtableRecordResponseModel])
  async deletePascalCaseEntities(
    @Description('The list of ids of the entities label to be deleted.')
    @BodyParams()
    recordIds: string[]
  ): Promise<DeleteAirtableRecordResponseModel[]> {
    return deletePascalCaseEntities(recordIds);
  }
}
