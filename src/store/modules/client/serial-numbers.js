import { getByClientId, getAll } from '@/api/client/serial-numbers'

const state = {

  sn: [],
  sn_by_client: []

}

const mutations = {

  LOAD_ALL: (state, payload) => {
    state.sn = payload
  },
  LOAD_BY_CLIENT: (state, payload) => {
    state.sn_by_client = payload
  },
  UPDATE: (state, payload) => {
    state.sn_by_client.splice(payload, 1)
  },
  REMOVE: (state, payload) => {
    state.sn_by_client.splice(payload, 1)
  }

}

const actions = {

  async getAll({ commit }) {
    await getAll().then(res => {
      commit('LOAD_ALL', res)
    })
      .catch(err => {
        commit('setError', err.messsage)
      })
  },

  async getByClientId({ commit }, payload) {
    await getByClientId(payload).then(res => {
      commit('LOAD_BY_CLIENT', res)
    })
      .catch(err => {
        commit('setError', err.messsage)
      })
  }

}

const getters = {

  sn(state) {
    return state.sn
  },
  sn_by_client(state) {
    return state.sn_by_client
  }

}

export default {

  namespaced: true,
  state,
  getters,
  mutations,
  actions

}

