import axios from 'axios';

export const coreHTTPClient = axios.create({
  baseURL: 'http://185.170.153.5',
});
