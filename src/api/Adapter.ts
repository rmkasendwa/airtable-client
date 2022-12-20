import axios from 'axios';

import { AIRTABLE_API_KEY } from '../config/env';

const instance = axios.create({
  baseURL: 'https://api.airtable.com/v0',
  headers: {
    Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export default instance;
