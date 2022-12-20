import { z } from 'zod';

export const DeleteAirtableRecordResponseValidationSchema = z
  .object({
    records: z.array(
      z.object({
        id: z.string(),
        delete: z.boolean(),
      })
    ),
  })
  .transform(({ records }) => {
    return records;
  });
