import { defineConfig } from '../models';

export default defineConfig({
  defaultBase: {
    name: 'Talent',
  },
  tables: [
    {
      name: 'Employee/Contractor',
      alias: 'Summarized Team Member Types',
      focusColumns: ['Name'],
    },
  ],
  includeAirtableSpecificQueryParameters: true,
});
