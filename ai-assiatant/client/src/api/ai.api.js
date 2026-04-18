import api from './axios.config';

export const askQuestion = (data) => api.post('/ai/ask', data);
export const summarize = (data) => api.post('/ai/summarize', data);
export const generateFlashcards = (data) => api.post('/ai/flashcards', data);
