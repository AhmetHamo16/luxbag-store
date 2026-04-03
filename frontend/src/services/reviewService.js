import api from './api';

export const reviewService = {
  getReviewsByProduct: async (productId) => {
    const response = await api.get(`/reviews/${productId}`);
    return response.data;
  },
  addReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },
  deleteReview: async (id) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  }
};
