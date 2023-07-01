# Airtable Client

Airtable Client is a package that provides a TypeScript API for Airtable, a popular cloud-based spreadsheet and database platform. This package allows you to interact with Airtable's API and easily integrate it into your TypeScript Express server application built with tsED framework.

## Features

- Generates TypeScript API for Airtable.
- Provides tsED controllers for easy integration into tsED server applications.
- Simplifies interaction with the Airtable API.

## Installation

You can install the package using npm:

```bash
npm i @theoremone-talent/airtable-client
```

or yarn:

```bash
yarn add @theoremone-talent/airtable-client
```

## Usage

To use the Airtable Client package, you need to define a configuration file called `airtable-api.config.js` or `airtable-api.config.ts` or `airtable-api.config.json` in your current working directory. This configuration file should define the bases and tables for which you want to generate the API. Here's an example of how the `airtable-api.config.js` file should be structured:

```typescript
export default defineConfig({
  defaultBase: {
    name: 'Sample Base',
  },
  tables: [
    {
      name: 'Sample Table',
      focusColumns: [
        'Column A',
        'Column B'
      ],
      views: [],
    },
  ],
  includeAirtableSpecificQueryParameters: true,
});
```

Feel free to modify the provided example to suit your needs and make any necessary adjustments to fit your project structure.

## Documentation

TBD

## Contributing

Contributions are welcome! If you encounter any issues or have suggestions for improvements, please open an issue on the [GitHub repository](https://github.com/TheoremOne-Talent/airtable-client).

## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT). See the [LICENSE](./LICENSE) file for more details.

---

Feel free to customize the above README.md file to fit your specific needs. Remember to provide comprehensive documentation to assist users in effectively utilizing your package.
