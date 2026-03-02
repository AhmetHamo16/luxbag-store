import api from './api';

export const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getMyOrders: async () => {
    const response = await api.get('/orders/myorders');
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  cancelOrder: async (id) => {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data;
  },

  // Admin Routes
  getAllOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  updateOrderStatus: async (id, status, trackingNumber) => {
    const response = await api.put(`/orders/${id}/status`, { status, trackingNumber });
    return response.data;
  }
};
