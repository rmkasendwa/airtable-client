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
      base: {
        name: 'Position Model',
      },
      name: 'Assignments',
      focusColumns: [
        'Name',
        'Start',
        'End',
        'Status',
        'Position',
        'Team Member',
        'Timing',
        'Billing',
        'Billing Method',
        'Rate Card',
        'SOW',
        'Project',
      ],
      columnNameToObjectPropertyMapper: {
        ['Start']: 'startDate',
        ['End']: 'endDate',
        ['Position']: 'positionId',
        ['Team Member']: 'teamMemberId',
        ['Timing']: 'timingAllocationRatio',
        ['Billing']: 'billingAllocationRatio',
        ['Billing Method']: 'roleId',
        ['Rate Card']: 'rateCardId',
        ['SOW']: 'sowId',
        ['Project']: 'projectId',
      },
    },
  ],
});
