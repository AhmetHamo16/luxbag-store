import api from './api';

export const contentService = {
  getContent: async () => {
    const response = await api.get('/content');
    return response.data;
  },

  updateContent: async (contentData) => {
    // Determine if we need multipart/form-data for file uploads
    const isFormData = contentData instanceof FormData;
    const response = await api.put('/content', contentData, {
      headers: isFormData ? { 'Content-Type': undefined } : {}
    });
    return response.data;
  }
};
