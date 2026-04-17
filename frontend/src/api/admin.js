import api from './client';

export const adminAPI = {
  listUsers: () => api.get('/admin/users'),
  deactivateUser: (userId) => api.patch(`/admin/users/${userId}/deactivate`),
  activateUser: (userId) => api.patch(`/admin/users/${userId}/activate`),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  resetUserPassword: (userId, newPassword) =>
    api.patch(`/admin/users/${userId}/reset-password`, { new_password: newPassword }),
  getStats: () => api.get('/admin/stats'),
  getInviteCode: () => api.get('/admin/invite-code'),
  updateInviteCode: (data) => api.put('/admin/invite-code', data),
  regenerateInviteCode: () => api.post('/admin/invite-code/regenerate'),
};
