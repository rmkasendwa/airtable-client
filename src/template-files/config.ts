import * as dotenv from 'dotenv';
dotenv.config();

export const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
export const ORIGINAL_AIRTABLE_BASE_ID =
  /* AIRTABLE_BASE_ID */ process.env.AIRTABLE_BASE_ID; /* AIRTABLE_BASE_ID */
export const AIRTABLE_BASE_ID =
  process.env.AIRTABLE_BASE_ID ?? ORIGINAL_AIRTABLE_BASE_ID;
export const AIRTABLE_BASE_NAME =
  /* AIRTABLE_BASE_NAME */ 'Base Name'; /* AIRTABLE_BASE_NAME */
