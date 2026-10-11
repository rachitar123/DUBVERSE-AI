import axios from 'axios';
import { User, Project, VoiceProfile, LanguageOption, AnalyticsData, UserSettings } from '../types';

const API_BASE = '/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor: Attach JWT from localStorage ─────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dubverse_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor: Handle 401 session expiry ───────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale token and dispatch event for auth context to react
      localStorage.removeItem('dubverse_token');
      window.dispatchEvent(new CustomEvent('dubverse:session-expired'));
    }
    return Promise.reject(error);
  }
);

// ─── Helper: Build authenticated media URL with token query param ───────────
// This is required because browser <video> and <a> elements cannot set
// Authorization headers — they make raw HTTP requests without JS headers.
export const buildMediaUrl = (path: string): string => {
  const token = localStorage.getItem('dubverse_token');
  if (!token) return path;
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}token=${encodeURIComponent(token)}`;
};

export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (email: string, password: string, full_name: string) => {
    const res = await api.post('/auth/register', { email, password, full_name });
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const projectService = {
  create: async (data: { title: string; target_language: string; voice_id: string; voice_name?: string; youtube_url?: string }): Promise<Project> => {
    const res = await api.post('/projects', data);
    return res.data;
  },
  upload: async (formData: FormData): Promise<Project> => {
    const res = await api.post('/projects/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  list: async (status?: string, search?: string): Promise<Project[]> => {
    const res = await api.get('/projects', { params: { status, search } });
    return res.data;
  },
  get: async (id: number): Promise<Project> => {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  },
  retry: async (id: number): Promise<Project> => {
    const res = await api.post(`/projects/${id}/process`);
    return res.data;
  },
  updateSegment: async (projectId: number, segmentId: number, translated_text: string) => {
    const res = await api.put(`/projects/${projectId}/segments/${segmentId}`, { translated_text });
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  },
};

export const voiceService = {
  getLanguages: async (): Promise<LanguageOption[]> => {
    const res = await api.get('/voices/languages');
    return res.data;
  },
  getVoices: async (): Promise<VoiceProfile[]> => {
    const res = await api.get('/voices/profiles');
    return res.data;
  },
};

export const analyticsService = {
  getAnalytics: async (): Promise<AnalyticsData> => {
    const res = await api.get('/analytics');
    return res.data;
  },
  getSettings: async (): Promise<UserSettings> => {
    const res = await api.get('/settings');
    return res.data;
  },
  updateSettings: async (data: Partial<UserSettings>): Promise<UserSettings> => {
    const res = await api.put('/settings', data);
    return res.data;
  },
};
