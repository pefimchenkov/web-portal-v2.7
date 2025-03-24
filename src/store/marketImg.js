import Api from '@/services/Api'

export default {
  state: {
    loadMarketImg: [],
    MarketImg: []
  },
  mutations: {
    loadMarketImg(state, payload) {
      state.loadMarketImg = payload
    },
    getMarketImg(state, payload) {
      state.MarketImg = payload
    }
  },
  actions: {
    loadMarketImg({ commit }) {
      return new Promise(resolve => {
        Api().get('market/loadimages')
          .then(res => {
            commit('loadMarketImg', Object.values(res.data))
            return resolve(res.data)
          })
      })
    },
    getMarketImg({ commit }) {
      return new Promise(resolve => {
        Api().post('market/getimages')
          .then(res => {
            commit('getMarketImg', Object.values(res.data))
            return resolve(res.data)
          })
      })
    }
  },
  getters: {
    loadMarketImg(state) {
      return state.loadMarketImg
    },
    getMarketImg(state) {
      return state.MarketImg
    }
  }
}
