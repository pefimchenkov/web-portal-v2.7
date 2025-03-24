import Api from '@/services/Api'
export default {
  state: {
    Conditions: []
  },
  mutations: {
    loadConditions(state, payload) {
      state.Conditions = payload
    }
  },
  actions: {
    async fetchConditions({ commit }) {
      commit('clearError')

      let resultConditions = []
      await Api()
        .get('conditions')
        .then(res => {
          resultConditions = Object.values(res.data)
          commit('loadConditions', resultConditions)
        })
        .catch(err => {
          commit('setError', err.messsage)
          throw err
        })
    }
  },
  getters: {
    conditions(state) {
      return state.Conditions
    }
  }
}

