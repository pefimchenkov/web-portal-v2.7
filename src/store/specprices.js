import Api from '@/services/Api'
export default {
  state: {
    Specprices: [],
    ContractKey: []
  },
  mutations: {
    loadSpecprices(state, payload) {
      state.Specprices = payload
    },
    loadContractKey(state, payload) {
      state.ContractKey = payload
    }
  },
  actions: {
    async fetchSpecprices({ commit }) {
      commit('clearError')

      let resultSpecprices = []
      let resultContractKey = []

      await Api()
        .get('specprices')
        .then(res => {
          resultSpecprices = Object.values(res.data)
          commit('loadSpecprices', resultSpecprices)
        })
        .catch(err => {
          commit('setLoading', false)
          commit('setError', err.messsage)
          throw err
        })

      await Api()
        .get('specprices/key')
        .then(res => {
          resultContractKey = Object.values(res.data)
          commit('loadContractKey', resultContractKey)
        })
        .catch(err => {
          commit('setError', err.messsage)
          throw err
        })
    }
  },

  getters: {

    specprices(state) {
      return state.Specprices
    },

    contractkey(state) {
      return state.ContractKey
    }

  }
}
