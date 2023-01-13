import { BodyParams, PathParams, QueryParams } from '@tsed/common';
import { Controller } from '@tsed/di';
import {
  ArrayOf,
  Delete,
  Description,
  Example,
  Get,
  Name,
  Patch,
  Post,
  Put,
  Required,
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
  findPascalCaseEntitiesFirstPage,
  findPascalCaseEntityById,
  patchPascalCaseEntities,
  patchPascalCaseEntity,
  updatePascalCaseEntities,
  updatePascalCaseEntity,
} from '../api/PascalCaseEntities';
/* AUTH_IMPORTS */
import { Authenticate } from '../decorators/Authenticate.placeholder';
import { Authorize } from '../decorators/Authorize.placeholder';
/* AUTH_IMPORTS */
import {
  DeleteAirtableRecordResponse,
  DeleteAirtableRecordsResponse,
  FindAllRecordsQueryParams,
} from '../models/__Utils';
import {
  CreateNewPascalCaseEntitiesReponse,
  FindAllPascalCaseEntitiesReponse,
  PascalCaseEntity,
  PascalCaseEntityCreationDetails,
  PascalCaseEntityQueryableField,
  PascalCaseEntityUpdates,
  PascalCaseEntityView,
  UpdatePascalCaseEntitiesReponse,
} from '../models/PascalCaseEntities';
import {
  CREATE_ENTITY_PERMISSION,
  DELETE_ENTITY_PERMISSION,
  UPDATE_ENTITY_PERMISSION,
  VIEW_ENTITIES_PERMISSION,
  VIEW_ENTITY_DETAILS_PERMISSION,
} from '../permissions/PascalCaseEntities';

@Controller('/kebab-case-entities')
@Docs('api-v1')
@Name('Entities Label')
@Authenticate()
export class PascalCaseEntityController {
  @Get('/first-page')
  @Authorize(VIEW_ENTITIES_PERMISSION)
  @Summary('Find first page entities label')
  @Description(
    'Finds the first page of entities label. Returns entities label first page matching query paramenters.'
  )
  @Returns(200, FindAllPascalCaseEntitiesReponse).Description(
    'The existing entities label on the first page'
  )
  async findPascalCaseEntitiesFirstPage(
    @QueryParams()
    queryParams: FindAllRecordsQueryParams<
      PascalCaseEntityQueryableField,
      PascalCaseEntityView
    >
  ) {
    return findPascalCaseEntitiesFirstPage(queryParams as any);
  }

  @Get()
  @Authorize(VIEW_ENTITIES_PERMISSION)
  @Summary('Find all entities label')
  @Description(
    'Finds all entities label. Returns entities label matching query paramenters.'
  )
  @Returns(200, FindAllPascalCaseEntitiesReponse).Description(
    'The existing entities label'
  )
  async findAllPascalCaseEntities(
    @QueryParams()
    queryParams: FindAllRecordsQueryParams<
      PascalCaseEntityQueryableField,
      PascalCaseEntityView
    >
  ) {
    return findAllPascalCaseEntities(queryParams as any) as any;
  }

  @Get('/:camelCaseEntityId')
  @Authorize(VIEW_ENTITY_DETAILS_PERMISSION)
  @Summary('Find entity label by id')
  @Description(
    'Finds entity label by id. Returns entity label matching the given id.'
  )
  @Returns(200, PascalCaseEntity).Description('The existing entity label')
  @Returns(404).Description('Not found')
  async findPascalCaseEntityById(
    @Description('The id of the entity label to be found.')
    @PathParams('camelCaseEntityId')
    camelCaseEntityId: string
  ) {
    return findPascalCaseEntityById(camelCaseEntityId) as any;
  }

  @Post()
  @Authorize(CREATE_ENTITY_PERMISSION)
  @Summary('Create new entity label')
  @Description('Creates new entity label. Returns the created entity label.')
  @Returns(200, PascalCaseEntity).Description('The created entity label')
  async createNewPascalCaseEntity(
    @BodyParams()
    @Required()
    camelCaseEntityDetails: PascalCaseEntityCreationDetails
  ) {
    return createNewPascalCaseEntity(camelCaseEntityDetails);
  }

  @Post('/batch')
  @Authorize(CREATE_ENTITY_PERMISSION)
  @Summary('Create new entities label')
  @Description(
    'Creates new entities label. Returns the created entities label.'
  )
  @Returns(200, CreateNewPascalCaseEntitiesReponse).Description(
    'The created entities label'
  )
  @Returns(422).Description('Unprocessable Request')
  async createNewPascalCaseEntities(
    @BodyParams()
    @ArrayOf(PascalCaseEntityCreationDetails)
    @Required()
    records: PascalCaseEntityCreationDetails[]
  ) {
    return createNewPascalCaseEntities(records);
  }

  @Put()
  @Authorize(UPDATE_ENTITY_PERMISSION)
  @Summary('Update existing entity label')
  @Description(
    'Updates an existing entity label. Returns the updated entity label. Null values will wipe database fields.'
  )
  @Returns(200, PascalCaseEntity).Description('The updated entity label')
  async updatePascalCaseEntity(
    @BodyParams()
    @Required()
    camelCaseEntityUpdates: PascalCaseEntityUpdates
  ) {
    return updatePascalCaseEntity(camelCaseEntityUpdates);
  }

  @Put('/batch')
  @Authorize(UPDATE_ENTITY_PERMISSION)
  @Summary('Update existing entities label')
  @Description(
    'Updates existing entities label. Returns the updated entities label. Null values will wipe database table fields.'
  )
  @Returns(200, UpdatePascalCaseEntitiesReponse).Description(
    'The updated entities label'
  )
  @Returns(422).Description('Unprocessable Request')
  async updatePascalCaseEntities(
    @BodyParams()
    @ArrayOf(PascalCaseEntityUpdates)
    @Required()
    records: PascalCaseEntityUpdates[]
  ) {
    return updatePascalCaseEntities(records);
  }

  @Patch()
  @Authorize(UPDATE_ENTITY_PERMISSION)
  @Summary('Patch existing entity label')
  @Description(
    'Patches an existing entity label. Returns the patched entity label.'
  )
  @Returns(200, PascalCaseEntity).Description('The patched entity label')
  async patchPascalCaseEntity(
    @BodyParams()
    @Required()
    camelCaseEntityUpdates: PascalCaseEntityUpdates
  ) {
    return patchPascalCaseEntity(camelCaseEntityUpdates);
  }

  @Patch('/batch')
  @Authorize(UPDATE_ENTITY_PERMISSION)
  @Summary('Patch existing entities label')
  @Description(
    'Patches existing entities label. Returns the patched entities label.'
  )
  @Returns(200, UpdatePascalCaseEntitiesReponse).Description(
    'The patched entities label'
  )
  @Returns(422).Description('Unprocessable Request')
  async patchPascalCaseEntities(
    @BodyParams()
    @ArrayOf(PascalCaseEntityUpdates)
    @Required()
    records: PascalCaseEntityUpdates[]
  ) {
    return patchPascalCaseEntities(records);
  }

  @Delete('/:camelCaseEntityId')
  @Authorize(DELETE_ENTITY_PERMISSION)
  @Summary('Delete existing entity label by id')
  @Description(
    'Deletes an existing entity label by id. Returns id of the deleted entity label.'
  )
  @Returns(200, DeleteAirtableRecordResponse).Description(
    'The deleted entity label response'
  )
  @Returns(404).Description('Not found')
  async deletePascalCaseEntity(
    @Description('The id of the entity label to be deleted.')
    @PathParams('camelCaseEntityId')
    camelCaseEntityId: string
  ) {
    return deletePascalCaseEntity(camelCaseEntityId);
  }

  @Delete('/batch')
  @Authorize(DELETE_ENTITY_PERMISSION)
  @Summary('Delete existing entities label')
  @Description(
    'Deletes existing entities label. Returns ids of the deleted entities label.'
  )
  @Returns(200, DeleteAirtableRecordsResponse).Description(
    'The deleted entities label response'
  )
  @Returns(422).Description('Unprocessable Request')
  async deletePascalCaseEntities(
    @Description(
      'The list of ids of the entities label to be deleted. Note: this list should contain at least one entity label.'
    )
    @Example(['recO0FYb1Tccm9MZ2'])
    @BodyParams()
    @ArrayOf(String)
    @Required()
    recordIds: string[]
  ) {
    return deletePascalCaseEntities(recordIds);
  }
}
