import { defineConfig } from '../models';

export default defineConfig({
  defaultBase: {
    name: 'Talent',
  },
  tables: [
    {
      name: 'People List',
      alias: 'Team Members',
      focusColumns: [
        [
          'Last Modified',
          {
            description:
              'The date and time when the team member was last modified.',
          },
        ],

        [
          'Name',
          {
            description: 'The name of the team member.',
            required: true,
          },
        ],
        [
          'Legal Name',
          {
            description: 'The legal name of the team member.',
            required: true,
          },
        ],
        [
          'Email',
          {
            description: 'The company email address of the team member.',
            required: true,
          },
        ],
        [
          'Picture',
          {
            propertyName: 'namelyProfilePictureUrl',
            description: "The url of the team member's profile picture.",
            propertyNameAlias: 'photoUrl',
          },
        ],
        [
          'Gender',
          {
            description: 'The gender of the team member.',
            required: true,
          },
        ],
        'Github Username',
        [
          'Slack UID',
          {
            propertyName: 'slackUID',
            description: 'The slack UID of the team member.',
            required: true,
          },
        ],
        [
          'Slack Handle',
          {
            description: 'The slack handle of the team member.',
            required: true,
          },
        ],
        [
          'Status',
          {
            description: 'The current status of the team member',
            fieldOverride: {
              type: 'singleSelect',
              options: {
                choices: [
                  'Automation',
                  'Current Team Member',
                  'Past Team Member',
                  'Rejected Offer',
                  'Duplicate',
                ].map((status) => {
                  return {
                    id: status,
                    name: status,
                  };
                }),
              },
            },
            editable: false,
          },
        ],
        [
          'Hiring Source',
          {
            description: 'The source from which the team member was hired.',
            required: true,
          },
        ],
        [
          'Hiring Source Mech',
          {
            propertyName: 'hiringSourceMechanism',
            description: 'The mechanism from which the team member was hired.',
            required: true,
          },
        ],
        [
          'Apply Date',
          {
            description: 'The date when the team member applied.',
          },
        ],
        [
          'Offer Date',
          {
            description: 'The date when the team member was offered.',
            required: true,
          },
        ],
        [
          'Join Date',
          {
            description: 'The date when the team member joined.',
            required: true,
          },
        ],
        [
          'Exit Date',
          {
            description: 'The exit date of the team member.',
            creatable: false,
          },
        ],

        [
          'Pipelines',
          {
            propertyName: 'pipeline.id',
            prefersSingleRecordLink: true,
            required: true,
          },
        ],
        'Skills Deck',
        'Linkedin URL',
        'Github URL',
        'Twitter URL',
        'Personal URL',
        //#region Time Zone
        [
          'Timezone',
          {
            propertyName: 'timezone.id',
            required: true,
          },
        ],
        [
          'Timezone Label',
          {
            propertyName: 'timezone.label',
            description:
              'The label of the timezone where the team member is located.',
          },
        ],
        [
          'Timezone Offset',
          {
            propertyName: 'timezone.offset',
          },
        ],
        [
          'Slack ID (from Timezone)',
          {
            propertyName: 'timezone.name',
          },
        ],
        //#endregion

        //#region Country
        [
          'Country',
          {
            propertyName: 'country.id',
            prefersSingleRecordLink: true,
            required: true,
          },
        ],
        [
          'Country Name',
          {
            propertyName: 'country.name',
          },
        ],
        [
          'Abbreviation (from Country)',
          {
            propertyName: 'country.countryCode',
          },
        ],
        [
          'Continent Name',
          {
            propertyName: 'country.continentName',
          },
        ],
        [
          'Holiday Dates (from Country)',
          {
            propertyName: 'country.holidayDates',
            isLookupWithListOfValues: true,
          },
        ],
        //#endregion

        //#region State
        [
          'State/province',
          {
            propertyName: 'state.id',
            required: true,
          },
        ],
        [
          'State/Province Name',
          {
            propertyName: 'state.name',
          },
        ],
        [
          'Date (from Holidays) (from State/province)',
          {
            propertyName: 'state.holidayDates',
            isLookupWithListOfValues: true,
          },
        ],
        //#endregion

        //#region Current Role
        [
          'Current Role',
          {
            propertyName: 'currentRole.id',
            required: true,
          },
        ],
        [
          'Current Role Name',
          {
            propertyName: 'currentRole.name',
          },
        ],
        'Foundry (from Current Role)',
        'Name (from Foundry) (from Current Role)',
        'Discipline (from Current Role)',
        'Name (from Discipline) (from Current Role)',
        'Level (from Current Role)',
        'Name (from Level) (from Current Role)',
        [
          'HR Title',
          {
            propertyName: 'currentRole.hrTitleName',
          },
        ],
        [
          'Billable Role',
          {
            propertyName: 'currentRole.billable',
          },
        ],
        [
          'Topology Permission Codes',
          {
            isLookupWithListOfValues: true,
          },
        ],
        [
          'Topology Permission Exclude Codes',
          {
            isLookupWithListOfValues: true,
          },
        ],
        //#endregion

        //#region Foundry Role
        [
          'Foundry Role',
          {
            propertyName: 'foundryRole.id',
          },
        ],
        [
          'Role Name (from Foundry Role)',
          {
            propertyName: 'foundryRole.name',
          },
        ],
        [
          'Discipline Name (from Foundry Role)',
          {
            propertyName: 'foundryRole.discipline',
          },
        ],
        [
          'Name (from Foundry) (from Foundry Role)',
          {
            propertyName: 'foundryRole.foundry',
          },
        ],
        [
          'Name (from Level) (from Foundry Role)',
          {
            propertyName: 'foundryRole.level',
          },
        ],
        //#endregion

        //#region Starting Role
        [
          'Starting Role',
          {
            propertyName: 'startingRole.id',
            required: true,
          },
        ],
        //#endregion

        //#region Hiring Manager
        [
          'Hiring Manager',
          {
            propertyName: 'hiringManager.id',
            required: true,
          },
        ],
        //#endregion

        //#region Hiring Recruiter
        [
          'Hiring Recruiter',
          {
            propertyName: 'hiringRecruiter.id',
          },
        ],
        //#endregion

        //#region Current Manager
        [
          'Current Manager',
          {
            propertyName: 'currentManager.id',
          },
        ],
        [
          'Name (from Current Manager)',
          {
            propertyName: 'currentManager.name',
          },
        ],
        [
          'Picture (from Current Manager)',
          {
            propertyName: 'currentManager.namelyProfilePictureUrl',
            propertyNameAlias: 'currentManager.photoUrl',
          },
        ],
        [
          'Slack Photo Url (from Current Manager)',
          {
            propertyName: 'currentManager.slackProfilePictureUrl',
          },
        ],
        'Current Manager Email',
        'Current Manager Id',
        //#endregion

        //#region Foundry Manager
        [
          'Foundry Manager',
          {
            propertyName: 'foundryManager.id',
          },
        ],
        [
          'Name (from Foundry Manager)',
          {
            propertyName: 'foundryManager.name',
          },
        ],
        [
          'Picture (from Foundry Manager)',
          {
            propertyName: 'foundryManager.namelyProfilePictureUrl',
            propertyNameAlias: 'foundryManager.photoUrl',
          },
        ],
        [
          'Slack Photo Url (from Foundry Manager)',
          {
            propertyName: 'foundryManager.slackProfilePictureUrl',
          },
        ],
        'Foundry Manager Email',
        //#endregion

        //#region Entity
        [
          'Entity',
          {
            propertyName: 'entity.id',
            prefersSingleRecordLink: true,
            required: true,
          },
        ],
        [
          'Group Name (from Entity)',
          {
            propertyName: 'entity.name',
          },
        ],
        'Entity Id',
        //#endregion

        //#region Entity Works With
        [
          'Entity Works With',
          {
            propertyName: 'entityWorksWith.id',
            required: true,
          },
        ],
        [
          'Group Name (from Entity Works With)',
          {
            propertyName: 'entityWorksWith.name',
          },
        ],
        'Entity Works With Id',
        //#endregion

        //#region Topology Permissions Override
        [
          'Topology Permission Override',
          {
            propertyName: 'topologyPermissionOverride.id',
          },
        ],
        [
          'Topology Permission Override Codes',
          {
            propertyName: 'topologyPermissionOverride.code',
          },
        ],
        [
          'Topology Permission Exclude Override',
          {
            propertyName: 'topologyPermissionExcludeOverride.id',
          },
        ],
        [
          'Topology Permission Exclude Override Codes',
          {
            propertyName: 'topologyPermissionExcludeOverride.code',
          },
        ],
        //#endregion

        //#region Team Member Type
        [
          'Team Member Type',
          {
            propertyName: 'teamMemberType.id',
            required: true,
          },
        ],
        [
          'Type (from Team Member Type)',
          {
            propertyName: 'teamMemberType.type',
          },
        ],
        [
          'Employee/Contractor',
          {
            propertyName: 'teamMemberType.companyEngagementType',
          },
        ],
        [
          'Name (from Employee/Contractor) (from Team Member Type)',
          {
            propertyName: 'teamMemberType.companyEngagementTypeName',
          },
        ],
        //#endregion

        //#region Practice Area
        [
          'Practice Area',
          {
            propertyName: 'practiceArea.id',
            required: true,
          },
        ],
        [
          'Practice Area Name',
          {
            propertyName: 'practiceArea.name',
          },
        ],
        //#endregion

        //#region Department
        [
          'Departments',
          {
            propertyName: 'department.id',
            required: true,
          },
        ],
        [
          'Department Name',
          {
            propertyName: 'department.name',
          },
        ],
        //#endregion

        [
          'Billable',
          {
            type: 'boolean',
            description: 'Whether the team member is billable.',
          },
        ],

        [
          'Active Billing Allocations',
          {
            description: 'The active billing allocations of the team member.',
          },
        ],
        [
          'Active Team Member Utilization',
          {
            description: 'The active utilization of the team member.',
          },
        ],
        [
          'Active Project Ids',
          {
            type: 'string[]',
            description: 'The active project ids that the team member is on',
          },
        ],

        //#region Starting Project
        [
          'Starting Project',
          {
            propertyName: 'startingProject.id',
            required: true,
          },
        ],
        //#endregion

        [
          'SOW Ids',
          {
            type: 'string[]',
          },
        ],
        [
          'Namely Profile ID',
          {
            propertyName: 'namelyProfileId',
            description: 'The Namely profile id of the team member.',
            required: true,
          },
        ],

        //#region Team Member Candidate Profile
        [
          'Lever Report',
          {
            propertyName: 'candidateProfile.id',
            required: true,
            prefersSingleRecordLink: true,
          },
        ],
        [
          'linkedin-url (from Lever Report)',
          {
            propertyName: 'candidateProfile.linkedinUrl',
          },
        ],
        //#endregion

        [
          'PX Tags',
          {
            propertyName: 'pxTags',
            type: 'string[]',
            arrayItemSeparator: ', ',
            description:
              'The parallax tags associated with the team member. These tags are used to enhance searching and filtering in the Parallax application.',
          },
        ],

        'Feedback Submitted Count',
        'Interviews Count',

        [
          'City',
          {
            description: 'The city where the team member is located.',
          },
        ],

        'Assignments Count',
        'Active Assignments Count',
        [
          'Active Assignments Project Names',
          {
            propertyName: 'activeAssignmentsProjectNames',
            type: 'string[]',
          },
        ],

        //#region Active Projects
        [
          'Active Project Count',
          {
            description:
              'The number of active projects that the team member is on.',
          },
        ],
        [
          'Active Project Names',
          {
            type: 'string[]',
            description:
              'The names of the active projects that the team member is or has been on.',
          },
        ],
        //#endregion

        //#region All Projects
        [
          'Project Count',
          {
            description: 'The number of projects that the team member is on.',
          },
        ],
        [
          'Project Names',
          {
            type: 'string[]',
            description:
              'The names of the projects that the team member is or has been on.',
          },
        ],
        [
          'Project Names With Client Names',
          {
            type: 'string[]',
            description:
              'The names of the projects that the team member is or has been on including the client name.',
          },
        ],
        //#endregion

        //#region Josh Robichaud fields
        [
          'Team Member Type Entity',
          {
            propertyName: 'teamMemberType.entityId',
          },
        ],
        'Namely employee_type',
        'Personal Email',

        //#region OfficeVibe Teams
        [
          'OfficeVibe Teams',
          {
            propertyName: 'officeVibeTeams.id',
          },
        ],
        [
          'Name (from OfficeVibe Teams)',
          {
            propertyName: 'officeVibeTeams.name',
          },
        ],
        //#endregion
        'Division',
        'is People Manager',
        'Is Leader',
        'Manager Of',
        [
          'Skills',
          {
            propertyName: 'skills.id',
          },
        ],
        [
          'Name (from Skills)',
          {
            propertyName: 'skills.name',
          },
        ],
        [
          'Biography',
          {
            type: 'string',
            editable: true,
          },
        ],
        [
          'Languages',
          {
            propertyName: 'languages.id',
          },
        ],
        [
          'Name (from Languages)',
          {
            propertyName: 'languages.name',
          },
        ],

        'Project Interest Areas',
        'Past Industry Experience',

        'it_okta_entity',
        'it_okta_state',
        'it_okta_type',
        'it_okta_temporary_manager',
        'it_okta_override_start_date',
        'it_okta_rate_limit',
        'it_google_alias',
        [
          'it_hubspot_roles',
          {
            type: 'string[]',
          },
        ],
        'it_welcome_email_send_on_next_run',
        'it_welcome_email_is_allowed',
        'it_welcome_email_sent',
        'it_is_namely_active',
        //#endregion

        //#region Slack Photos
        [
          'Slack Photo Url',
          {
            propertyName: 'slackProfilePictureUrl',
            description:
              "The url of the team member's current profile picture in Slack.",
          },
        ],
        //#endregion
      ],
      views: [
        'Alumni',
        'Current Team - All',
        'Current Team - Managers',
        'Current Team - TheoremOne',
        'Current Team - Zemoga',
        'Topology Users',
      ],
    },
  ],
  includeAirtableSpecificQueryParameters: true,
  bases: [
    {
      name: 'Topology Guest Access',
      tables: [
        {
          name: 'Guests',
          focusColumns: [
            'Name',
            'Email',
            [
              'Topology Permission Codes',
              {
                type: 'string[]',
              },
            ],
            [
              'Topology Permission Excludes Codes',
              {
                type: 'string[]',
              },
            ],
            'Environments',
          ],
          views: [],
        },
      ],
    },
  ],
});
