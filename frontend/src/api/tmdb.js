import api from './client';

const IMG_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p';

export const tmdbAPI = {
  // Content discovery
  trending: (mediaType = 'all', timeWindow = 'week', page = 1) =>
    api.get(`/tmdb/trending/${mediaType}/${timeWindow}`, { params: { page } }),

  popular: (mediaType = 'movie', page = 1) =>
    api.get(`/tmdb/${mediaType}/popular`, { params: { page } }),

  topRated: (mediaType = 'movie', page = 1) =>
    api.get(`/tmdb/${mediaType}/top_rated`, { params: { page } }),

  discover: (mediaType = 'movie', genreId = null, page = 1) =>
    api.get(`/tmdb/discover/${mediaType}`, {
      params: { page, ...(genreId && { with_genres: genreId }) },
    }),

  // Search
  search: (query, page = 1) =>
    api.get('/tmdb/search', { params: { query, page } }),

  // Details
  movieDetail: (tmdbId) => api.get(`/tmdb/movie/${tmdbId}`),
  tvDetail: (tmdbId) => api.get(`/tmdb/tv/${tmdbId}`),
  seasonDetail: (tmdbId, seasonNumber) =>
    api.get(`/tmdb/tv/${tmdbId}/season/${seasonNumber}`),

  // Genres
  genres: (mediaType = 'movie') => api.get(`/tmdb/genre/${mediaType}/list`),
};

// ── Image URL Helpers ──────────────────────────────────────────
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return null;
  return `${IMG_BASE}/${size}${path}`;
};

export const getBackdropUrl = (path, size = 'original') => {
  if (!path) return null;
  return `${IMG_BASE}/${size}${path}`;
};

export const getPosterUrl = (path, size = 'w342') => {
  if (!path) return null;
  return `${IMG_BASE}/${size}${path}`;
};

export const getProfileImageUrl = (path, size = 'w185') => {
  if (!path) return null;
  return `${IMG_BASE}/${size}${path}`;
};
