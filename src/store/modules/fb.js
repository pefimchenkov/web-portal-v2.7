import { getUserByEmail } from '@/api/user'
import { getUsers, getSelectedUserData, saveUserRoles } from '@/api/fb'

const state = {
  user: [],
  users: [],
  selectedUserData: []
}

const mutations = {
  SET_USER: (state, user) => {
    state.user = user
  },
  SET_USERS: (state, users) => {
    state.users = users
  },
  SET_SELECTED_USER_DATA: (state, data) => {
    state.selectedUserData = data
  }
}

const actions = {

  getUsers({ commit }) {
    return new Promise((resolve, reject) => {
      getUsers().then(response => {
        commit('SET_USERS', JSON.parse(response))
        resolve(JSON.parse(response))
      }).catch(error => {
        reject(error)
      })
    })
  },

  getUserByEmail({ commit }, email) {
    return new Promise((resolve, reject) => {
      getUserByEmail(email).then(response => {
        if (response.code) {
          commit('setError', 'Email в БД Firabse не соответсвует email в Jira, роль пользователя не определена!', { root: true })
          resolve()
        }
        commit('SET_USER', JSON.parse(response))
        resolve(JSON.parse(response))
      }).catch(error => {
        reject(error)
      })
    })
  },

  getSelectedUserData({ commit }, uid) {
    return new Promise((resolve, reject) => {
      getSelectedUserData(uid).then(response => {
        commit('SET_SELECTED_USER_DATA', JSON.parse(response))
        resolve(JSON.parse(response))
      }).catch(error => {
        reject(error)
      })
    })
  },
  saveUserRoles({ commit }, payload) {
    return new Promise((resolve, reject) => {
      saveUserRoles(payload).then(response => {
        commit('setData', response, { root: true })
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
