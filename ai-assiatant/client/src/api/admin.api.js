import api from './axios.config';

export const getAdminUsers = () => api.get('/admin/users');
export const deleteAdminUser = (id) => api.delete(`/admin/users/${id}`);
export const getAdminDocuments = () => api.get('/admin/documents');
export const deleteAdminDocument = (id) => api.delete(`/admin/documents/${id}`);
export const getAdminStats = () => api.get('/admin/stats');
export const getAdminFlashcards = () => api.get('/admin/flashcards');
export const updateAdminFlashcard = (id, data) => api.put(`/admin/flashcards/${id}`, data);
export const deleteAdminFlashcard = (id) => api.delete(`/admin/flashcards/${id}`);
export const getAdminContacts = () => api.get('/admin/contacts');
export const updateAdminContact = (id, data) => api.patch(`/admin/contacts/${id}`, data);
export const deleteAdminContact = (id) => api.delete(`/admin/contacts/${id}`);
