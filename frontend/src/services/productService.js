import api from './api';

export const productService = {
  getProducts: async (params = {}) => {
    // e.g. params = { search, category, sort, page, limit }
    const response = await api.get('/products', { params });
    return response.data;
  },

  getProductBySlug: async (slug) => {
    const response = await api.get(`/products/${slug}`);
    return response.data;
  },

  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (productData) => {
    // Determine if we need multipart/form-data
    const isFormData = productData instanceof FormData;
    // Axios automatically sets boundary for FormData if we remove the global application/json override
    const config = isFormData ? { headers: { 'Content-Type': undefined } } : {};
    
    const response = await api.post('/products', productData, config);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const isFormData = productData instanceof FormData;
    const config = isFormData ? { headers: { 'Content-Type': undefined } } : {};

    const response = await api.put(`/products/${id}`, productData, config);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  duplicateProduct: async (id) => {
    const response = await api.post(`/products/${id}/duplicate`);
    return response.data;
  },

  bulkAction: async (payload) => {
    // payload = { action: 'DELETE' | 'MARK_FEATURED' | etc, productIds: [] }
    const response = await api.post('/products/bulk', payload);
    return response.data;
  }
};
