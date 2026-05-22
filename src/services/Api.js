// services/api.js — Axios с автообновлением токена
import axios from 'axios';
import store from '@/store';
import router from '@/router';

const api = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 10000,
});

// ─── Request interceptor: добавляем access-токен ───────────────────────────
api.interceptors.request.use(async (config) => {
  const token = await store.state.auth.accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }


  return config;
});


// ─── Response interceptor: обрабатываем 401 и обновляем токен ─────────────
let isRefreshing = false;
let failedQueue = []; // очередь запросов, ожидающих обновления токена

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    error ? prom.reject(error) : prom.resolve(token);
  });
  failedQueue = [];
};



api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isExpired =
      error.response?.status === 401 &&
      error.response?.data?.expired &&
      !originalRequest._retry;

    if (!isExpired) return Promise.reject(error);

    if (isRefreshing) {
      // Ждём пока другой запрос обновит токен
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch(Promise.reject);
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newToken = await store.dispatch('auth/refreshTokens');
      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      store.commit('auth/CLEAR_AUTH');
      router.push('/login');
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
