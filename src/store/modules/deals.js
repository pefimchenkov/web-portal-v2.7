import { getWithBills } from '@/api/deals'

const state = {

  withBills: []

}

const mutations = {

  SET_WITH_BILLS: (state, payload) => {
    state.withBills = payload
  }

}
const actions = {

  getWithBills({ commit }) {
    return new Promise((resolve) => {
      getWithBills()
        .then(res => {
          commit('SET_WITH_BILLS', res)
          resolve(res)
        })
    })
  }

}

const getters = {

  withBills: (state) => {
    return state.withBills
  }

}

export default {

  namespaced: true,
  state,
  getters,
  mutations,
  actions

}
