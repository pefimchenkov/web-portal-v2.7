// store/auth.js — Vuex модуль аутентификации
import api from '@/services/api';


export default {
  namespaced: true,


  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    users: []
  }),



  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    currentUser: (state) => state.user,
    users: (state) => state.users,
    isAdmin: (state) => state.user?.roles.includes('admin'),
  },



  mutations: {
    SET_AUTH(state, { user, accessToken, refreshToken }) {
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    },

    SET_TOKENS(state, { accessToken, refreshToken }) {
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    },
    
    CLEAR_AUTH(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;

      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },

    SET_USERS(state, { users }) {
      state.users = users
    }
  },




  actions: {
    async register({ commit }, credentials) {
      const { data } = await api.post('/register', credentials);
      commit('SET_AUTH', data);
      return data;
    },

    async login({ commit }, credentials) {
      const { data } = await api.post('/login', credentials);
      commit('SET_AUTH', data);
      return data;
    },

    async logout({ commit, state }) {
      try {
        await api.post('/logout', { refreshToken: state.refreshToken });
      } finally {
        commit('CLEAR_AUTH');
      }
    },

    async refreshTokens({ commit, state }) {
      const { data } = await api.post('/refresh', {
        refreshToken: state.refreshToken,
      });
      commit('SET_TOKENS', data);
      return data.accessToken;
    },

    async getUsers({ commit }) {
      const { data } = await api.get('/users');
      commit('SET_USERS', data);
      return data.users;
    },

    async saveUserRoles(_, payload) {
      const { data } = await api.post('/user/save_roles', payload);
      return data?.user
    }
  },
};
