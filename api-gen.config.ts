import { defineConfig } from './config';

module.exports = defineConfig({
  tables: [
    {
      name: 'Resourcing',
      alias: 'Resourcings',
      columnNameToObjectPropertyMapper: {
        ['Project Role']: 'projectRoleId',
        ['Team Member']: 'teamMemberId',
        ['Resource Start']: 'resourceStartDate',
        ['Resource End']: 'resourceEndDate',
        ['Project Override']: 'projectId',
        ['SOW']: 'sowId',
        ['Allocation']: 'allocation',
        ['Status']: 'status',
      },
    },
    {
      name: 'Assignments',
      columnNameToObjectPropertyMapper: {
        ['Position']: 'positionId',
        ['Role']: 'roleId',
        ['Team Member']: 'teamMemberId',
        ['Rate Card']: 'rateCardId',
        ['Start Date']: 'startDate',
        ['End Date']: 'endDate',
        ['SOW']: 'sowId',
        ['Timing Allocation']: 'timingAllocation',
        ['Billing Allocation']: 'billingAllocation',
        ['Status']: 'status',
      },
    },
  ],
});
