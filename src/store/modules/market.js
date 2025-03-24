import { get, add, remove } from '@/api/market'

const state = {

  Market: []

}

const mutations = {

  SET_MARKET: (state, payload) => {
    state.Market = payload
  },

  DELETE_MARKET: (state, payload) => {
    state.Market = state.Market.filter(item => item.marketid !== payload.id)
  }

}
const actions = {

  get({ commit }) {
    return new Promise((resolve) => {
      get()
        .then(res => {
          commit('SET_MARKET', res)
          resolve(res)
        })
    })
  },

  add({ commit }, payload) {
    return new Promise((resolve) => {
      add(payload)
        .then(res => {
          if (res.affectedRows > 0) {
            commit('SET_MARKET', payload)
            resolve(res)
          }
        })
    })
  },

  remove({ commit }, payload) {
    return new Promise((resolve) => {
      remove(payload)
        .then(res => {
          console.log(res)

          if (res.affectedRows > 0) {
            commit('DELETE_MARKET', payload)
            resolve(res)
          }
        })
    })
  }

}

const getters = {

  market: (state) => state.Market

}

export default {

  namespaced: true,
  state,
  getters,
  mutations,
  actions

}
