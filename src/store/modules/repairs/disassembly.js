import { createDisassembly, createAssembly, getStats, getStatsParts, setStats } from '@/api/repairs/disassembly'

const state = {

  stats: [],
  stats_parts: []

}

const mutations = {

  GET_STATS: (state, payload) => {
    state.stats = payload
  },
  GET_STATS_PARTS: (state, payload) => {
    state.stats_parts = payload
  },

}

const actions = {

  async createDisassembly({ commit }, payload) {
    await createDisassembly(payload)
      .then(res => {
        console.log(res)
      })
      .catch(err => {
        commit('setError', err.messsage)
      })
  },

  async createAssembly({ commit }, payload) {
    await createAssembly(payload)
      .then(res => {
        console.log(res)
      })
      .catch(err => {
        commit('setError', err.messsage)
      })
  },

  async getStats({ commit }) {
    await getStats()
      .then(res => {
        commit('GET_STATS', res)
    })
      .catch(err => {
        commit('setError', err.messsage)
      })
  },

  async getStatsParts({ commit }, id) {
    return await getStatsParts(id)
      .then(res => {
        commit('GET_STATS_PARTS', res)
        return res
      })
      .catch(err => {
        commit('setError', err.messsage)
      })
  },

  async setStats({ commit }, payload) {
    await setStats(payload)
      .then(res => {
        console.log(res)
    })
      .catch(err => {
        commit('setError', err.messsage)
      })
  }

}

const getters = {}

export default {

  namespaced: true,
  state,
  getters,
  mutations,
  actions

}

