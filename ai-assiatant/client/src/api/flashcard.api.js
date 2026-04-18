import api from './axios.config';

export const getFlashcards = (documentId) => api.get(`/flashcards/${documentId}`);
export const updateFlashcard = (id, data) => api.put(`/flashcards/${id}`, data);
export const deleteFlashcard = (id) => api.delete(`/flashcards/${id}`);
