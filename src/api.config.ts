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
        'Project Role',
        'Team Member',
        'Resource Start',
        'Resource End',
        'Project Override',
        'SOW',
        'Allocation',
        'Status',
      ],
      columnNameToObjectPropertyMapper: {
        ['Project Role']: 'projectRoleId',
        ['Team Member']: 'teamMemberId',
        ['Resource Start']: 'resourceStartDate',
        ['Resource End']: 'resourceEndDate',
        ['Project Override']: 'projectId',
        ['SOW']: 'sowId',
      },
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
  ],
});
