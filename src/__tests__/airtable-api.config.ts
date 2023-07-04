import { defineConfig } from '../models';

export default defineConfig({
  defaultBase: {
    name: 'Talent',
  },
  tables: [
    {
      name: 'Projects',
      focusColumns: [
        //#region Client
        [
          'Client',
          {
            propertyName: 'client',
            prefersSingleRecordLink: true,
          },
        ],
        [
          'Client Name',
          {
            propertyName: 'client.name',
          },
        ],
        [
          'Client Brand',
          {
            propertyName: 'client.brand',
          },
        ],
        //#endregion
      ],
      views: [],
    },
  ],
  includeAirtableSpecificQueryParameters: true,
});
