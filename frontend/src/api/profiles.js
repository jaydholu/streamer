import api from './client';

export const profileAPI = {
  list: () => api.get('/profiles'),
  create: (data) => api.post('/profiles', data),
  update: (profileId, data) => api.put(`/profiles/${profileId}`, data),
  delete: (profileId) => api.delete(`/profiles/${profileId}`),
  setPin: (profileId, pin) => api.post(`/profiles/${profileId}/pin`, { pin }),
  removePin: (profileId, currentPin) =>
    api.delete(`/profiles/${profileId}/pin`, { data: { current_pin: currentPin } }),
  verifyPin: (profileId, pin) => api.post(`/profiles/${profileId}/verify-pin`, { pin }),
};
