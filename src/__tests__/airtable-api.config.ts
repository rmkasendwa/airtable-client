import { defineConfig } from '../models';

export default defineConfig({
  defaultBase: {
    name: 'Talent',
  },
  tables: [
    {
      name: 'Roles',
      focusColumns: [
        [
          'Role Name',
          {
            propertyName: 'name',
            description: 'The name of the role.',
            required: true,
          },
        ],
        [
          'HR Title',
          {
            pascalCasePropertyName: 'HRTitle',
            description: 'The human resource title of the role.',
            required: true,
          },
        ],

        //#region Entity
        [
          'Entity',
          {
            propertyName: 'entity.id',
            description: 'The entity that the role belongs to.',
            required: true,
          },
        ],
        [
          'Group Name (from Entity)',
          {
            propertyName: 'entity.name',
            description: `
              The name of the entity that the role belongs to.
              This field contains values from the [this api](#tag/Entities)
            `.trimIndent(),
          },
        ],
        'Entity Id',
        //#endregion

        //#region Service Line
        [
          'Service Lines',
          {
            propertyName: 'serviceLine.id',
            description: `
              The service line that the role belongs to.
              This field contains values from the [this api](#tag/Service-Lines)
            `.trimIndent(),
            required: true,
          },
        ],
        [
          'Name (from Service Lines)',
          {
            propertyName: 'serviceLine.name',
            description:
              'The name of the service line that the role belongs to.',
          },
        ],
        //#endregion

        //#region Topology Permissions
        [
          'Topology Permissions',
          {
            propertyName: 'topologyPermissions.id',
            description: `
              The permissions that the role has on the topology.
              This field contains values from the [this api](#tag/Topology-Permissions)
            `.trimIndent(),
          },
        ],
        [
          'Topology Permission Codes',
          {
            propertyName: 'topologyPermissions.code',
            description: 'The code of the topology permission.',
          },
        ],
        [
          'Topology Permission Names',
          {
            propertyName: 'topologyPermissions.name',
            description: 'The name of the topology permission.',
          },
        ],
        [
          'Topology Permission Excludes',
          {
            propertyName: 'topologyPermissionExcludes.id',
            description: `
              The permissions that the role does not have on the topology.
              This field contains values from the [this api](#tag/Topology-Permissions)
            `.trimIndent(),
          },
        ],
        [
          'Topology Permission Exclude Codes',
          {
            propertyName: 'topologyPermissionExcludes.code',
            description: 'The code of the topology permission.',
          },
        ],
        [
          'Topology Permission Exclude Names',
          {
            propertyName: 'topologyPermissionExcludes.name',
            description: 'The name of the topology permission.',
          },
        ],
        //#endregion
      ],
      views: [],
    },
  ],
  includeAirtableSpecificQueryParameters: true,
});
