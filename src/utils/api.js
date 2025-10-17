import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5050';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lsrToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-logout for login, register, or token verify routes
      const reqUrl = error.config?.url;
      if (
        reqUrl &&
        (
          reqUrl.includes('/api/auth/login') ||
          reqUrl.includes('/api/auth/register') ||
          reqUrl.includes('/api/auth/verify')
        )
      ) {
        // Just reject the error to let UI handle it
        return Promise.reject(error);
      }
      // For all other endpoints, force logout
      localStorage.removeItem('lsrToken');
      localStorage.removeItem('lsrUser');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  register: async (email, password, name) => {
    const response = await api.post('/api/auth/register', { email, password, name });
    return response.data;
  },

  verifyToken: async (token) => {
    const response = await api.post('/api/auth/verify', { token });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

// User Management API
export const userAPI = {
  deleteAccount: async () => {
    const response = await api.delete('/api/users/me');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/api/users/stats');
    return response.data;
  },
};

// Problem API
export const problemAPI = {
  // Legacy problem schedule APIs
  getTodaysProblems: async () => {
    const response = await api.get('/getTodaysProblem');
    return response.data;
  },

  getSolvedProblems: async () => {
    const response = await api.get('/api/solvedProblemIds');
    return response.data;
  },

  markNewProblemSolved: async (problemId, difficulty) => {
    const response = await api.post('/api/newProblemSolved', {
      problemId,
      difficulty,
    });
    return response.data;
  },

  markRevisionProblemSolved: async (problemId) => {
    const response = await api.post('/api/revisionProblemSolved', {
      problemId,
    });
    return response.data;
  },

  getProblemScheduleDetails: async (problemId) => {
    const response = await api.get(`/api/problemSchedule/${problemId}`);
    return response.data;
  },

  resetProblemSchedule: async (problemId) => {
    const response = await api.post(`/api/problemSchedule/${problemId}/reset`);
    return response.data;
  },

  deleteProblemSchedule: async (problemId) => {
    const response = await api.delete(`/api/problemSchedule/${problemId}`);
    return response.data;
  },

  // Get user's lists
  getUserLists: async () => {
    const response = await api.get('/api/lists');
    return response.data;
  },

  // Problem management APIs
  addProblemManually: async (problemData) => {
    const response = await api.post('/api/problems/manual', problemData);
    return response.data;
  },

  getProblems: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.tags) params.append('tags', filters.tags);
    if (filters.search) params.append('search', filters.search);
    
    const response = await api.get(`/api/problems?${params.toString()}`);
    return response.data;
  },

  // List management APIs
  createList: async (listData) => {
    const response = await api.post('/api/lists', listData);
    return response.data;
  },

  getList: async (listId) => {
    const response = await api.get(`/api/lists/${listId}`);
    return response.data;
  },

  addProblemToList: async (listId, problemId) => {
    const response = await api.post(`/api/lists/${listId}/problems`, { problemId });
    return response.data;
  },

  moveProblemInList: async (listId, problemId, newPosition) => {
    const response = await api.patch(`/api/lists/${listId}/move-problem`, {
      problemId,
      newPosition,
    });
    return response.data;
  },

  // Notes APIs
  getNotes: async (problemId) => {
    const response = await api.get(`/api/problemSchedule/${problemId}/notes`);
    return response.data;
  },

  addNote: async (problemId, content) => {
    const response = await api.post(`/api/problemSchedule/${problemId}/notes`, { content });
    return response.data;
  },

  updateNote: async (problemId, noteId, content) => {
    const response = await api.put(`/api/problemSchedule/${problemId}/notes/${noteId}`, { content });
    return response.data;
  },

  deleteNote: async (problemId, noteId) => {
    const response = await api.delete(`/api/problemSchedule/${problemId}/notes/${noteId}`);
    return response.data;
  },
};

export default api;

