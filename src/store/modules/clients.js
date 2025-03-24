import { getAll, getLinked } from '@/api/clients'

const state = {
  all: [],
  linked: []
}

const mutations = {
  SET_CLIENTS: (state, payload) => {
    state.all = payload
  },
  SET_LINKED: (state, payload) => {
    state.linked = payload
  }
}
const actions = {
  getClients({ commit }) {
    return new Promise((resolve, reject) => {
      getAll()
        .then(res => {
          commit('SET_CLIENTS', res)
          resolve(res)
        })
        .catch(err => {
          reject(err)
        })
    })
  },

  getLinked({ commit }) {
    return new Promise((resolve, reject) => {
      getLinked()
        .then(res => {
          commit('SET_LINKED', res)
          resolve(res)
        })
        .catch(err => {
          reject(err)
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
