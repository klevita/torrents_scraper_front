import axios from 'axios';

export const coreHTTPClient = axios.create({
  baseURL: '/api',
});
