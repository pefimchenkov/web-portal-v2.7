import { getByClientId, getAll } from '@/api/client/contracts'

const state = {

  contracts: [],
  contracts_by_client: []

}

const mutations = {

  LOAD_ALL: (state, payload) => {
    state.contracts = payload
  },
  LOAD_BY_CLIENT: (state, payload) => {
    state.contracts_by_client = payload
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

  contracts(state) {
    return state.contracts
  },
  contracts_by_client(state) {
    return state.contracts_by_client
  }

}

export default {

  namespaced: true,
  state,
  getters,
  mutations,
  actions

}

