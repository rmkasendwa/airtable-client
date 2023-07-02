import { defineConfig } from '../models';

export default defineConfig({
  defaultBase: {
    name: 'Talent',
  },
  tables: [
    {
      name: 'REQs',
      focusColumns: [
        'Assignments',
        [
          'Closed Date Override',
          {
            propertyName: 'closedDate',
          },
        ],
        'Country Exclusions',
        'Days Open',
        [
          'English Levels',
          {
            propertyName: 'requiredEnglishFluencyLevel',
          },
        ],
        [
          'Filled Closed Date',
          {
            propertyName: 'filledClosedDate',
            type: 'string',
          },
        ],
        [
          'Filled by',
          {
            prefersSingleRecordLink: true,
          },
        ],
        'Hiring Manager',
        'Late Stage Candidate Email',
        'Late Stage Candidate Lever Link',
        'Late Stage Candidate Name',
        'Late Stage Candidate',
        'Name (from Hiring Manager)',
        'Open Date',
        [
          'Picture (from Hiring Manager)',
          {
            propertyName: 'hiringManager.photoUrl',
          },
        ],
        [
          'Pipelines (from Pipelines)',
          {
            propertyName: 'pipeline.name',
          },
        ],
        [
          'Pipelines',
          {
            prefersSingleRecordLink: true,
            propertyName: 'pipeline',
          },
        ],
        'Planned Start Date',
        'REQ Details',
        'REQ Number',
        [
          'REQ',
          {
            propertyName: 'reqName',
          },
        ],
        [
          'Recruitment Lead Name',
          {
            propertyName: 'pipeline.recruitmentLeadName',
          },
        ],
        [
          'Recruitment Lead Photo Url',
          {
            propertyName: 'pipeline.recruitmentLeadPhotoUrl',
          },
        ],
        [
          'Recruitment Lead',
          {
            propertyName: 'pipeline.recruitmentLeadId',
          },
        ],
        'Reference Time Zone',
        'Requested by',
        'Required Countries',
        [
          'Required Start',
          {
            propertyName: 'requiredStartDate',
          },
        ],
        'Signup Info',
        'Status',
        [
          'TZ Alignment Override',
          {
            propertyName: 'timezoneAlignment',
          },
        ],
        'Team Member Type',
        'Time Zone Offset Minus',
        'Time Zone Offset Plus',

        //#region Service Department
        [
          'Service Department',
          {
            propertyName: 'serviceDepartment.id',
            required: true,
          },
        ],
        //#endregion

        //#region Project
        [
          'Project',
          {
            propertyName: 'project.id',
            required: true,
          },
        ],
        [
          'Project Name',
          {
            propertyName: 'project.name',
            required: true,
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
          'Role Name',
          {
            propertyName: 'role.name',
            required: true,
          },
        ],
        [
          'Department Name',
          {
            propertyName: 'role.departmentName',
            required: true,
          },
        ],
        [
          'Pipeline (from Role)',
          {
            propertyName: 'role.pipelineId',
            required: true,
          },
        ],
        [
          'Pipeline Name (from Role)',
          {
            propertyName: 'role.pipelineName',
            required: true,
          },
        ],
        [
          'Practice Area',
          {
            propertyName: 'role.practiceAreaId',
            required: true,
          },
        ],
        [
          'Practice Area (from Practice Area) (from Role)',
          {
            propertyName: 'role.practiceAreaName',
            required: true,
          },
        ],
        //#endregion

        //#region Role Level
        [
          'Role Level Override',
          {
            propertyName: 'roleLevel.id',
            required: true,
          },
        ],
        [
          'Name (from Role Level Override)',
          {
            propertyName: 'roleLevel.name',
            required: true,
          },
        ],
        //#endregion

        //#region Team Member Type
        [
          'Team Member Type',
          {
            propertyName: 'teamMemberType.id',
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
        [
          'dealid (from SOW)',
          {
            propertyName: 'sow.dealId',
            required: true,
          },
        ],
        [
          'dealName (from SOW)',
          {
            propertyName: 'sow.dealName',
            required: true,
          },
        ],
        [
          'Client',
          {
            propertyName: 'sow.clientId',
          },
        ],
        [
          'Client Name (from SOW)',
          {
            propertyName: 'sow.clientName',
          },
        ],
        [
          'Client Brand (from SOW)',
          {
            propertyName: 'sow.clientBrand',
          },
        ],
        [
          'Entity Name',
          {
            propertyName: 'sow.entityName',
            required: true,
          },
        ],
        [
          'Entity',
          {
            propertyName: 'sow.entityId',
            required: true,
          },
        ],
        [
          'Department',
          {
            propertyName: 'sow.departmentId',
            required: true,
          },
        ],
        [
          'Department Name (from SOW)',
          {
            propertyName: 'sow.departmentName',
            required: true,
          },
        ],
        //#endregion
      ],
      views: ['Department - Contingent ', 'Open REQs - All'],
    },
  ],
  includeAirtableSpecificQueryParameters: true,
});
