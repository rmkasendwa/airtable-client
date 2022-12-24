import { defineConfig } from './models';

export default defineConfig({
  defaultBase: {
    name: 'Talent (topology test apps)',
  },
  tables: [
    {
      name: 'Resourcing',
      alias: 'Resourcings',
      focusColumns: [
        'Slot',
        'Project Role',
        'Team Member',
        'Resource Start',
        'Resource End',
        'Project Override',
        'SOW',
        'Allocation',
        'Status',
      ],
    },
    {
      name: 'Assignments',
      focusColumns: [
        'Name',
        'Role',
        'Team Member',
        'SOW',
        'Start Date',
        'End Date',
        'Project',
        'Timing Allocation',
        'Billing Allocation',
        'Resourcing Status',
      ],
    },
    {
      name: 'People List',
      alias: 'Team Members',
      focusColumns: [
        'Name',
        'Legal Name',

        'Lever Opportunity ID',

        'Apply Date',
        'Offer Date',
        'Join Date',
        'Exit Date',

        'Email',
        'Slack UID',
        'Slack Handle',

        'Team Member Type',

        'Current Role',
        'Current Role Name',
        'Department Name',

        'Starting Role',
        'Hiring Recruiter',
        'Starting Project',

        'Hiring Source Mech',
        'Hiring Source',

        'Pipelines',

        'Lever Report',

        'Rejected Offer',

        'Hiring Manager',
        'Current Manager',

        'Country',
        'Country Name',
        'Continent Name',

        'State/province',
        'State/Province Name',

        'Timezone Offset',
        'Timezone Label',

        'Gender',
        'Namely Profile ID',

        'Status',

        'Topology Permission Codes',
        'Topology Permission Exclude Codes',

        'SOWs',
        'Picture',
        'Github Username',

        'Active Team Member Utilization',
        'Active Billing Allocations',

        'Practice Area',
        'Practice Area Name',
        'HR Title',

        'Billable',

        'Project Count',
        'Project Names',
        'Active Project Count',
      ],
      columnNameToObjectPropertyMapper: {
        ['Country']: {
          prefersSingleRecordLink: true,
        },
        'State/province': 'state',
      },
    },
    {
      name: 'Positions',
    },
    {
      name: 'SOWs',
    },
  ],
  bases: [{ name: 'Position Model' }, { name: 'Talent (topology test apps)' }],
});
