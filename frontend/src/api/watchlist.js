import api from './client';

export const watchlistAPI = {
  get: (profileId) => api.get(`/profiles/${profileId}/watchlist`),
  add: (profileId, data) => api.post(`/profiles/${profileId}/watchlist`, data),
  remove: (profileId, tmdbId) =>
    api.delete(`/profiles/${profileId}/watchlist/${tmdbId}`),
  check: (profileId, tmdbId) =>
    api.get(`/profiles/${profileId}/watchlist/check/${tmdbId}`),
};

export const historyAPI = {
  get: (profileId) => api.get(`/profiles/${profileId}/history`),
  upsert: (profileId, data) => api.post(`/profiles/${profileId}/history`, data),
  continueWatching: (profileId) =>
    api.get(`/profiles/${profileId}/history/continue`),
  remove: (profileId, tmdbId) =>
    api.delete(`/profiles/${profileId}/history/${tmdbId}`),
};
