import api from './api';

export const couponService = {
  getCoupons: async () => {
    const response = await api.get('/coupons');
    return response.data;
  },

  createCoupon: async (data) => {
    const response = await api.post('/coupons', data);
    return response.data;
  },

  deleteCoupon: async (id) => {
    const response = await api.delete(`/coupons/${id}`);
    return response.data;
  },

  validateCoupon: async (code) => {
    const response = await api.post('/coupons/validate', { code });
    return response.data;
  }
};
