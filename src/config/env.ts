import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

export const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
