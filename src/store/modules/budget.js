import { getCurrent, getPrevious, getPays } from '@/api/budget'

const state = {

  current: [],
  previous: [],
  pays: []

}

const mutations = {

  SET_CURRENT: (state, payload) => {
    state.current = payload
  },

  SET_PREVIOUS: (state, payload) => {
    state.previous = payload
  },

  SET_PAYS: (state, payload) => {
    state.pays = payload
  }

}
const actions = {

  current({ commit }) {
    return new Promise((resolve) => {
      getCurrent()
        .then(res => {
          commit('SET_CURRENT', res)
          resolve(res)
        })
    })
  },

  previous({ commit }) {
    return new Promise((resolve) => {
      getPrevious()
        .then(res => {
          commit('SET_PREVIOUS', res)
          resolve(res)
        })
    })
  },

  pays({ commit }) {
    return new Promise((resolve) => {
      getPays()
        .then(res => {
          commit('SET_PAYS', res)
          resolve(res)
        })
    })
  }

}

const getters = {

  current: (state) => {
    return state.current
  },

  previous: (state) => {
    return state.previous
  },

  pays: (state) => {
    return state.pays
  }

}

export default {

  namespaced: true,
  state,
  getters,
  mutations,
  actions

}
