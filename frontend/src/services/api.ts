import axios from 'axios';

const API_URL = 'http://localhost:8000/api';


// Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    tag_name?: string;
    crew?: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const response = await api.post('/auth/login', formData);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateMe: async (data: any) => {
    const response = await api.put('/auth/me', data);
    return response.data;
  },
};

// Pieces endpoints
export const piecesApi = {
  create: async (formData: FormData) => {
    const response = await api.post('/pieces/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAll: async (params?: {
    skip?: number;
    limit?: number;
    piece_type?: string;
    surface?: string;
    search?: string;
  }) => {
    const response = await api.get('/pieces/', { params });
    return response.data;
  },

  getOne: async (id: number) => {
    const response = await api.get(`/pieces/${id}`);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/pieces/${id}`);
    return response.data;
  },

  like: async (id: number) => {
    const response = await api.post(`/pieces/${id}/like`);
    return response.data;
  },

  unlike: async (id: number) => {
    const response = await api.delete(`/pieces/${id}/like`);
    return response.data;
  },
};

// Users endpoints
export const usersApi = {
  getAll: async (params?: { skip?: number; limit?: number; search?: string }) => {
    const response = await api.get('/users/', { params });
    return response.data;
  },

  getOne: async (username: string) => {
    const response = await api.get(`/users/${username}`);
    return response.data;
  },

  getUserPieces: async (username: string, params?: any) => {
    const response = await api.get(`/users/${username}/pieces`, { params });
    return response.data;
  },
};

// Comments endpoints
export const commentsApi = {
  create: async (content: string, piece_id: number) => {
    const response = await api.post('/comments/', { content, piece_id });
    return response.data;
  },

  getForPiece: async (piece_id: number, params?: { skip?: number; limit?: number }) => {
    const response = await api.get(`/comments/piece/${piece_id}`, { params });
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  },
};

export default api;