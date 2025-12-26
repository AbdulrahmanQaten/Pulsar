import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// إنشاء نسخة axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// إضافة التوكن تلقائياً لكل طلب
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pulsar_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// معالجة الأخطاء
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // إزالة التوكن إذا انتهت صلاحيته
      localStorage.removeItem('pulsar_token');
      localStorage.removeItem('pulsar_user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data: { email: string; username: string; displayName: string; password: string }) =>
    api.post('/auth/register', data),
  
  login: (emailOrUsername: string, password: string) =>
    api.post('/auth/login', { emailOrUsername, password }),
  
  getCurrentUser: () => api.get('/auth/me'),
};

// Posts APIs
export const postsAPI = {
  getAllPosts: () => api.get('/posts'),
  
  getPost: (id: string) => api.get(`/posts/${id}`),
  
  createPost: (data: { content: string; image?: string }) =>
    api.post('/posts', data),
  
  updatePost: (id: string, data: { content: string; image?: string }) =>
    api.put(`/posts/${id}`, data),
  
  deletePost: (id: string) => api.delete(`/posts/${id}`),
  
  likePost: (id: string) => api.post(`/posts/${id}/like`),
  
  commentPost: (id: string, content: string) =>
    api.post(`/posts/${id}/comment`, { content }),
  
  replyToComment: (postId: string, commentId: string, content: string) =>
    api.post(`/posts/${postId}/comment/${commentId}/reply`, { content }),
  
  likeComment: (postId: string, commentId: string) =>
    api.post(`/posts/${postId}/comment/${commentId}/like`),
  
  dislikeComment: (postId: string, commentId: string) =>
    api.post(`/posts/${postId}/comment/${commentId}/dislike`),
};

// Users APIs
export const usersAPI = {
  getUser: (username: string) => api.get(`/users/${username}`),
  
  updateProfile: (data: { displayName?: string; bio?: string; location?: string; avatar?: string }) =>
    api.put('/users/profile', data),
  
  followUser: (id: string) => api.post(`/users/${id}/follow`),
  
  getFollowers: (id: string) => api.get(`/users/${id}/followers`),
  
  getFollowing: (id: string) => api.get(`/users/${id}/following`),
  
  getUserPosts: (username: string) => api.get(`/users/${username}/posts`),
};

export default api;
