import Api from '@/services/___Api'
export default {
  state: {
    Aliases: []
  },
  mutations: {
    loadAliases(state, payload) {
      state.Aliases = payload
    }
  },
  actions: {
    async fetchAliases({ commit }) {
      // commit('setLoading', true)
      commit('clearError')

      let resultAliases = []
      await Api()
        .get('aliases')
        .then(res => {
          resultAliases = Object.values(res.data)
          commit('loadAliases', resultAliases)
          // commit('setLoading', false)
        })
        .catch(err => {
          // commit('setLoading', false)
          commit('setError', err.messsage)
          throw err
        })
    }
  },
  getters: {
    aliases(state) {
      return state.Aliases
    }
  }
}
