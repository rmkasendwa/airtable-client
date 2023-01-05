import { BodyParams, PathParams, QueryParams } from '@tsed/common';
import { Controller } from '@tsed/di';
import {
  Delete,
  Description,
  Example,
  Get,
  Name,
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
@Name('Entities Label')
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
  ) {
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
  ) {
    return findAllPascalCaseEntities(queryParams as any) as any;
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
  ) {
    return findPascalCaseEntityById(camelCaseEntityId) as any;
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
  @Returns(422).Description('Unprocessable Request')
  async createNewPascalCaseEntities(
    @BodyParams() records: PascalCaseEntityCreationDetails[]
  ) {
    return createNewPascalCaseEntities(records);
  }

  @Put()
  @Summary('Updates an existing entity label.')
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
  @Summary('Updates existing entities label.')
  @Description(
    'Returns the updated entities label. Null values will wipe database fields.'
  )
  @Returns(200, [PascalCaseEntityModel])
  @Returns(422).Description('Unprocessable Request')
  async updatePascalCaseEntities(
    @BodyParams() records: PascalCaseEntityUpdates[]
  ) {
    return updatePascalCaseEntities(records);
  }

  @Patch()
  @Summary('Patches an existing entity label.')
  @Description('Returns the patched entity label.')
  @Returns(200, PascalCaseEntityModel)
  async patchPascalCaseEntity(
    @BodyParams() camelCaseEntityUpdates: PascalCaseEntityUpdates
  ) {
    return patchPascalCaseEntity(camelCaseEntityUpdates);
  }

  @Patch('/batch')
  @Summary('Patches existing entities label.')
  @Description('Returns the patched entities label.')
  @Returns(200, [PascalCaseEntityModel])
  @Returns(422).Description('Unprocessable Request')
  async patchPascalCaseEntities(
    @BodyParams() records: PascalCaseEntityUpdates[]
  ) {
    return patchPascalCaseEntities(records);
  }

  @Delete('/:camelCaseEntityId')
  @Summary('Deletes an existing entity label by id.')
  @Description('Returns id of the deleted entity label.')
  @Returns(200, DeleteAirtableRecordResponseModel)
  @Returns(404).Description('Not found')
  async deletePascalCaseEntity(
    @Description('The id of the entity label to be deleted.')
    @PathParams('camelCaseEntityId')
    camelCaseEntityId: string
  ) {
    return deletePascalCaseEntity(camelCaseEntityId);
  }

  @Delete('/batch')
  @Summary('Deletes existing entities label.')
  @Description('Returns ids of the deleted entities label.')
  @Returns(200, [DeleteAirtableRecordResponseModel])
  @Returns(422).Description('Unprocessable Request')
  async deletePascalCaseEntities(
    @Description(
      'The list of ids of the entities label to be deleted.\nNote: this list should contain at least one entity label.'
    )
    @Example(['recO0FYb1Tccm9MZ2'])
    @BodyParams()
    recordIds: string[]
  ) {
    return deletePascalCaseEntities(recordIds);
  }
}
