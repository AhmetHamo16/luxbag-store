import api from './api';

export const paymentService = {
  createPaymentIntent: async (data) => {
    // data: { items, shippingCost, discountAmount }
    const response = await api.post('/payment/create-intent', data);
    return response.data;
  }
};
