import { AirtableField } from '../../models';

export const getCamelCaseFieldPropertyName = ({ name }: AirtableField) => {
  const camelCasePropertyName = name.toCamelCase();

  if (camelCasePropertyName.match(/^\d/g)) {
    return `_${camelCasePropertyName}`;
  }

  return camelCasePropertyName;
};
