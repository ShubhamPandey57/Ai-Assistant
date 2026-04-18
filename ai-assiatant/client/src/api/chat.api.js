import api from './axios.config';

export const getChatHistory = (documentId) => api.get(`/chats/${documentId}`);
export const clearChatHistory = (documentId) => api.delete(`/chats/${documentId}`);
