import api from './axios.config';

export const sendContactQuery = (data) => api.post('/contact', data);
