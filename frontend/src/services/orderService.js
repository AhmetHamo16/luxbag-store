import api, { apiBaseUrl } from './api';

export const orderService = {
  createOrder: async (orderData) => {
    const isFormData = orderData instanceof FormData;
    const response = await api.post('/orders', orderData, {
      headers: isFormData ? { 'Content-Type': undefined } : {}
    });
    return response.data;
  },

  createPosOrder: async (orderData) => {
    const response = await api.post('/orders/pos', orderData);
    return response.data;
  },

  resetDemoData: async () => {
    const response = await api.post('/orders/reset-demo');
    return response.data;
  },

  voidPosOrder: async (id, reason = '') => {
    const response = await api.put(`/orders/${id}/void-pos`, { reason });
    return response.data;
  },

  getPosSummary: async () => {
    const response = await api.get('/orders/pos/summary');
    return response.data;
  },

  getOrderAlerts: async (limit = 8) => {
    const response = await api.get(`/orders/alerts?limit=${limit}`);
    return response.data;
  },

  markOrderPreparing: async (id) => {
    const response = await api.put(`/orders/${id}/prepare`);
    return response.data;
  },

  getCurrentPosShift: async () => {
    const response = await api.get('/orders/pos/shift/current');
    return response.data;
  },

  openPosShift: async (payload) => {
    const response = await api.post('/orders/pos/shift/open', payload);
    return response.data;
  },

  closePosShift: async (payload) => {
    const response = await api.post('/orders/pos/shift/close', payload);
    return response.data;
  },

  getPosShifts: async (limit = 8) => {
    const response = await api.get(`/orders/pos/shifts?limit=${limit}`);
    return response.data;
  },

  uploadReceipt: async (formData) => {
    const response = await api.post('/orders/upload', formData, {
      headers: { 'Content-Type': undefined }
    });
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

  getPublicOrderStatus: async (id) => {
    const response = await api.get(`/orders/public/${id}`);
    return response.data;
  },

  cancelOrder: async (id) => {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data;
  },

  // Admin Routes
  getAllOrders: async (search = '', status = 'All', page = 1, limit = 15) => {
    const response = await api.get(`/orders?search=${search}&status=${status}&page=${page}&limit=${limit}`);
    return response.data;
  },

  updateOrderStatus: async (id, status, trackingNumber) => {
    const response = await api.put(`/orders/${id}/status`, { status, trackingNumber });
    return response.data;
  },

  markAsPaid: async (id) => {
    const response = await api.put(`/orders/${id}/pay`);
    return response.data;
  },

  getAdminStats: async (timeframe) => {
    const response = await api.get(`/orders/stats?timeframe=${timeframe}`);
    return response.data;
  },
  
  exportOrdersCSV: () => {
    // Return the string URL for direct anchor-tag downloading
    return `${apiBaseUrl}/orders/export`;
  }
};
