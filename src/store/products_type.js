import Api from '@/services/___Api'
export default {
  state: {
    ProductsType: []
  },
  mutations: {
    loadProductsType(state, payload) {
      state.ProductsType = payload
    }
  },
  actions: {
    async fetchProductsType({ commit }) {
      let resultProductsType = []
      await Api()
        .get('products_type')
        .then(res => {
          resultProductsType = Object.values(res.data)
          commit('loadProductsType', resultProductsType)
        })
        .catch(err => {
          throw err
        })
    }
  },
  getters: {
    productstype(state) {
      return state.ProductsType
    }
  }
}
