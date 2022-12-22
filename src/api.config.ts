import { defineConfig } from './models';

export default defineConfig({
  defaultBase: {
    name: 'Talent',
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
  bases: [{ name: 'Position Model' }, { name: 'Talent (topology test apps)' }],
});
