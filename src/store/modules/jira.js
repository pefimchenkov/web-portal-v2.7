import { setCrmSubscribe, getCrmData } from '@/api/jira'
import { getJiraUsers } from '@/api/jira-users'

const state = {
  users: [],
  CrmSubscribe: [],
  CrmData: {}
}

const mutations = {
  USERS: (state, payload) => {
      state.users = payload;
  },
  SET_CRM_SUBCRIBE: (state, payload) => {
    state.CrmSubscribe = payload;
  },
  GET_CRM_DATA: (state, payload) => {
    state.CrmData = payload;
  },
  CLEAR_CRM_DATA: () => {
    state.CrmData = {};
  }
}

const getters = {
  users: (state) => {
    return state.users
  }
}



const actions = {
  users({ commit }) {
    return new Promise((resolve) => {
      getJiraUsers()
        .then(users => {
          commit('USERS', users)
          console.log('dwdawdwdaw', users)
          resolve(users)
        })
    })
  },

  setCrmSubscribe({ commit }, payload) {
    return new Promise((resolve) => {
      setCrmSubscribe(payload)
        .then(res => {
          commit('SET_CRM_SUBCRIBE', res)
          resolve(res)
        })
    })
  },

  async getCrmData({ commit }, payload) {
    return new Promise((resolve) => {
      getCrmData(payload)
        .then(res => {
          commit('GET_CRM_DATA', res)
          resolve(res)
        })
    })

  },
  

  clearCrmData({ commit }) {
    return new Promise((resolve) => {
      commit('CLEAR_CRM_DATA')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
