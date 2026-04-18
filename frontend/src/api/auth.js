import api from './client';

export const authAPI = {
  getMe: () => api.get('/auth/me'),
  signup: (data) => api.post('/auth/signup', data),
  signin: (data) => api.post('/auth/signin', data),
  refresh: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),
  signout: () => api.post('/auth/signout'),
  deleteAccount: (password) => api.delete('/auth/account', { data: { password } }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) =>
    api.post('/auth/reset-password', { token, new_password: newPassword }),
  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    }),
};
