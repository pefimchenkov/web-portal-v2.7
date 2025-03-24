// import { getPays } from '@/api/budget'
import { getPaysJira, getPays1c } from '@/api/budget/pays'

const state = {

  jira: [],
  oneC: []

}

const mutations = {

  SET_1C: (state, payload) => {
    state.oneC = payload
  },

  SET_JIRA: (state, payload) => {
    state.jira = payload
  }

}
const actions = {

  async oneC({ commit }) {
    const data = await getPays1c();
    commit('SET_1C', data)
    console.log(data)
    return data;
  },

  async jira({ commit }) {
    const data = await getPaysJira();
    commit('SET_JIRA', data);
    return data
  }

}

const getters = {

  oneC: (state) => {
    return state.oneC
  },

  jira: (state) => {
    return state.jira
  }

}

export default {

  namespaced: true,
  state,
  getters,
  mutations,
  actions

}
