import { getAPIAdapter } from '@infinite-debugger/axios-api-adapter';

import { AIRTABLE_API_KEY } from '../config';

declare module '@infinite-debugger/axios-api-adapter' {
  interface IAPIAdapterConfiguration {
    AIRTABLE_REQUEST_ONLY_FOCUS_FIELDS?: boolean;
  }
}

export {
  IAPIAdapterConfiguration,
  CANCELLED_API_REQUEST_MESSAGE,
  EXPIRED_SESSION_ERROR_MESSAGES,
  RequestOptions,
  ResponseProcessor,
} from '@infinite-debugger/axios-api-adapter';

export {
  APIAdapterConfiguration,
  RequestController,
  _delete,
  defaultRequestHeaders,
  get,
  logout,
  patch,
  patchDefaultRequestHeaders,
  post,
  put,
};

const {
  APIAdapterConfiguration,
  RequestController,
  _delete,
  defaultRequestHeaders,
  get,
  logout,
  patch,
  patchDefaultRequestHeaders,
  post,
  put,
} = getAPIAdapter({
  id: 'airtable-client',
});

APIAdapterConfiguration.HOST_URL = 'https://api.airtable.com/v0';
APIAdapterConfiguration.preProcessResponseErrorMessages = false;
APIAdapterConfiguration.AIRTABLE_REQUEST_ONLY_FOCUS_FIELDS = true;

patchDefaultRequestHeaders({
  Authorization: `Bearer ${AIRTABLE_API_KEY}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
});
