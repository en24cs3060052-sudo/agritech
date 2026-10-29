import axios from 'axios';
// Accepts the server URL with or without a trailing slash or /api
const raw = (process.env.REACT_APP_API_URL || 'http://localhost:5001').trim().replace(/\/+$/, '');
const api = axios.create({ baseURL: raw.endsWith('/api') ? raw : raw + '/api' });
api.interceptors.request.use(c => { const t = localStorage.getItem('token'); if (t) c.headers.Authorization = 'Bearer ' + t; return c; });
api.interceptors.response.use(r => r, e => {
  if (e.response?.status === 401 && localStorage.getItem('token')) { localStorage.clear(); window.location.href = '/login'; }
  return Promise.reject(e);
});
export const errMsg = e => e.response?.data?.message || 'Cannot reach the server. If it was idle, wait 50 seconds and try again.';
export default api;
