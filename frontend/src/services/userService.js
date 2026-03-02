import api from './api';

export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/users/profile/password', passwordData);
    return response.data;
  },

  manageAddresses: async (addresses) => {
    const response = await api.put('/users/profile/addresses', { addresses });
    return response.data;
  },

  toggleWishlist: async (productId) => {
    const response = await api.put(`/users/profile/wishlist/${productId}`);
    return response.data;
  },

  // Admin Methods
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  updateUserStatus: async (id, isActive) => {
    const response = await api.put(`/users/${id}/status`, { isActive });
    return response.data;
  },

  updateUserRole: async (id, role) => {
    const response = await api.put(`/users/${id}/role`, { role });
    return response.data;
  },
  
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};
