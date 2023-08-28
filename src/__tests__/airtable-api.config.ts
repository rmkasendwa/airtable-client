import { defineConfig } from '../models';

export default defineConfig({
  defaultBase: {
    name: 'Talent',
  },
  tables: [
    {
      name: 'English Levels',
      focusColumns: [
        [
          'Name',
          {
            description: 'The name of the English level',
            required: true,
          },
        ],
        [
          'Group',
          {
            description: 'The group of the English level',
            required: true,
          },
        ],
        [
          'Label',
          {
            description: 'The label of the English level',
            required: true,
          },
        ],
        [
          'Notes',
          {
            description: 'Notes about the English level',
            required: true,
          },
        ],
        [
          'Status',
          {
            description: 'The status of the English level',
          },
        ],
      ],
      views: [],
      alternativeRecordIdColumns: ['Name'],
    },
    {
      name: 'Assignments',
      focusColumns: [
        'Name',
        [
          'Status',
          {
            required: true,
            description: 'The current status of the assignment',
            fieldOverride: {
              type: 'singleSelect',
              options: {
                choices: ['Active', 'Pending', 'Ended', 'Error'].map(
                  (status) => {
                    return {
                      id: status,
                      name: status,
                    };
                  }
                ),
              },
            },
            editable: false,
          },
        ],

        //#region Position
        [
          'Position',
          {
            propertyName: 'position.id',
            required: true,
          },
        ],
        [
          'Name (from Position)',
          {
            propertyName: 'position.name',
            required: true,
          },
        ],
        [
          'Role (from Position)',
          {
            propertyName: 'position.roleId',
          },
        ],
        [
          'Role Name (from Role) (from Position)',
          {
            propertyName: 'position.roleName',
          },
        ],
        [
          'Planned Timing Allocation (from Position)',
          {
            propertyName: 'position.plannedTimingAllocation',
          },
        ],
        [
          'Planned Billing Allocation (from Position)',
          {
            propertyName: 'position.plannedBillingAllocation',
          },
        ],
        [
          'Project (from Team) (from Position)',
          {
            propertyName: 'position.projectId',
          },
        ],
        [
          'Project (from Project) (from Team) (from Position)',
          {
            propertyName: 'position.projecName',
          },
        ],
        [
          'Client (from Project) (from Team) (from Position)',
          {
            propertyName: 'position.clientId',
          },
        ],
        [
          'Client Name (from Project) (from Team) (from Position)',
          {
            propertyName: 'position.clientName',
          },
        ],
        [
          'Client Brand (from Project) (from Team) (from Position)',
          {
            propertyName: 'position.clientBrand',
          },
        ],
        //#endregion

        //#region Team Member
        [
          'Team Member',
          {
            propertyName: 'teamMember.id',
            required: true,
          },
        ],
        'Team Member Id',
        [
          'Name (from Team Member)',
          {
            propertyName: 'teamMember.name',
          },
        ],
        [
          'Picture (from Team Member)',
          {
            propertyName: 'teamMember.photoUrl',
          },
        ],
        //#endregion

        //#region Dates
        [
          'Start Date',
          {
            required: true,
            description: 'The date when the assignment starts',
          },
        ],
        [
          'End Date',
          {
            description: 'The date when the assignment ends',
          },
        ],
        //#endregion

        //#region Allocation
        [
          'Billing Allocation',
          {
            description:
              'The billing allocation percentage of the assignment. If no value is provided, the `plannedBillingAllocation` on the position will be used. This field accepts and returns numeric values between 0 and 1',
            required: true,
          },
        ],
        [
          'Timing Allocation',
          {
            description:
              'The timing allocation percentage of the assignment. If no value is provided, the `plannedTimingAllocation` on the position will be used. This field accepts and returns numeric values between 0 and 1',
            required: true,
          },
        ],
        //#endregion

        //#region REQ
        [
          'REQ',
          {
            propertyName: 'req.id',
            creatable: false,
          },
        ],
        [
          'REQ status',
          {
            propertyName: 'req.status',
            description:
              'The current status of the req linked to the assignment',
          },
        ],
        [
          'REQ (from REQ)',
          {
            propertyName: 'req.name',
          },
        ],
        [
          'REQ Number (from REQ)',
          {
            propertyName: 'req.reqNumber',
          },
        ],
        [
          'Pipeline Name (from Role) (from REQ)',
          {
            propertyName: 'req.pipelineName',
            isLookupWithListOfValues: false,
          },
        ],
        [
          'Pipeline (from Role) (from REQ)',
          {
            propertyName: 'req.pipelineId',
            isLookupWithListOfValues: false,
          },
        ],
        [
          'Required Start (from REQ)',
          {
            propertyName: 'req.requiredStartDate',
            isLookupWithListOfValues: false,
            type: 'string',
          },
        ],
        [
          'Open Date (from REQ)',
          {
            propertyName: 'req.openDate',
            isLookupWithListOfValues: false,
            type: 'string',
          },
        ],
        [
          'Calculated Closed Date (from REQ)',
          {
            propertyName: 'req.closedDate',
            isLookupWithListOfValues: false,
            type: 'string',
          },
        ],
        //#endregion

        [
          'Filled REQ Assignment',
          {
            creatable: false,
          },
        ],
        [
          'Filled by Assignment',
          {
            creatable: false,
          },
        ],

        //#region Project
        [
          'Project',
          {
            propertyName: 'project.id',
            editable: false,
          },
        ],
        [
          'Project (from Project)',
          {
            propertyName: 'project.name',
          },
        ],
        //#endregion

        //#region Role
        [
          'Role',
          {
            propertyName: 'role.id',
            required: true,
          },
        ],
        [
          'Role Name (from Role)',
          {
            propertyName: 'role.name',
          },
        ],
        //#endregion

        //#region SOW
        [
          'SOW',
          {
            propertyName: 'sow.id',
            required: true,
          },
        ],
        'SOW Id',
        [
          'Project (from SOW)',
          {
            propertyName: 'sow.projectId',
          },
        ],
        [
          'dealName (from SOW)',
          {
            propertyName: 'sow.dealName',
          },
        ],
        [
          'dealid (from SOW)',
          {
            propertyName: 'sow.dealId',
          },
        ],
        //#endregion

        //#region Entity
        [
          'Entity',
          {
            propertyName: 'entity.id',
            editable: false,
          },
        ],
        //#endregion
        [
          'Notes',
          {
            description: 'The notes of the assignment',
          },
        ],
        [
          'Assignment Number',
          {
            description:
              'The auto-generated number that uniquely identifies the assignment',
          },
        ],

        [
          'Has Allocation Issue',
          {
            type: 'boolean',
            description:
              'Flag to indicate whether the assignment has on or several allocation issues, issues include having timing or billing allocation less than 100% or having timing or billing allocations that are different from the planned allocations on the position. This field is set automatically and cannot be set manually',
          },
        ],

        'Position Id',
        'Team Id',
        'Project Id',

        //#region Migration Fields
        [
          'Generated By Resourcing Migration Script',
          {
            description:
              'Flag to indicate whether the assignment was generated by the resourcing migration script. Ignore this field if you are not migrating resourcings. This field will be removed when we fully migrate to the positions and assignment model',
          },
        ],
        [
          'Resourcing Number',
          {
            description:
              'The unique number that identifies the resourcing record that the assignment was generated from. Ignore this field if you are not migrating resourcings. This field will be removed when we fully migrate to the positions and assignment model',
          },
        ],
        [
          'Resource Last Modified',
          {
            description:
              'The date and time when the resourcing record that the assignment was generated from was last modified Ignore this field if you are not migrating resourcings. This field will be removed when we fully migrate to the positions and assignment model',
          },
        ],
        //#endregion
      ],
      views: [],
    },
  ],
  includeAirtableSpecificQueryParameters: true,
});
