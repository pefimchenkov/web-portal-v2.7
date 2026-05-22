import Api from '@/services/___Api'
export default {

  state: {

    Stock1C: [],
    EngineersStock: []

  },

  mutations: {

    LOAD_STOCK_1C(state, payload) {
      state.Stock1C = payload
    }

  },
  actions: {
    async FETCH_STOCK_1C({ commit }) {
      await Api()
        .get('stock_1c')
        .then(res => {
          commit('LOAD_STOCK_1C', Object.values(res.data))
        })
        .catch(err => {
          commit('setError', err.messsage)
          throw err
        })
    }
  },
  getters: {

    Stock1C: (state) => state.Stock1C

  }
}
