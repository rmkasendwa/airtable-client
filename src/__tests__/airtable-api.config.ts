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
    },
  ],
  includeAirtableSpecificQueryParameters: true,
});
