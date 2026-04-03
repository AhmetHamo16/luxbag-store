import api from './api';

export const securityService = {
  changePassword: async (data) => {
    const response = await api.put('/security/change-password', data);
    return response.data;
  },

  getActivityLogs: async () => {
    const response = await api.get('/security/activity-logs');
    return response.data;
  },

  logoutAllSessions: async () => {
    const response = await api.post('/security/logout-all');
    return response.data;
  }
};
