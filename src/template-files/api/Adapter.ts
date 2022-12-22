import axios from 'axios';

import { AIRTABLE_API_KEY } from '../config';

const instance = axios.create({
  baseURL: 'https://api.airtable.com/v0',
  headers: {
    Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  ...(() => {
    return { retry: 3, retryDelay: 3000 };
  })(),
});

instance.interceptors.response.use(undefined, (err) => {
  const { config, message } = err;
  if (!config || !config.retry) {
    return Promise.reject(err);
  }
  // retry while Network timeout or Network Error
  if (!(message.includes('timeout') || message.includes('Network Error'))) {
    return Promise.reject(err);
  }
  config.retry -= 1;
  const delayRetryRequest = new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log('retry the request', config.url);
      resolve();
    }, config.retryDelay || 1000);
  });
  return delayRetryRequest.then(() => axios(config));
});

export default instance;
