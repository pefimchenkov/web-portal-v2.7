import { get } from '@/api/budget/income'

const state = {
  data: [],
}

const mutations = {

  SET_CURRENT: (state, payload) => {
    state.data = payload
  }

}
const actions = {

  get({ commit }) {
    return new Promise((resolve) => {
      get()
        .then(res => {
          commit('SET_CURRENT', res)
          resolve(res)
        })
    })
  },

}

const getters = {

  data: (state) => {
    return state.data
  }

}

export default {

  namespaced: true,
  state,
  getters,
  mutations,
  actions

}
