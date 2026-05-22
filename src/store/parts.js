import Api from '@/services/___Api'

export default {
  state: {
    Parts: []
  },
  mutations: {
    loadParts(state, payload) {
      state.Parts = payload
    }
  },
  actions: {
    async fetchParts({ commit }) {

      const res = await Api().get('/parts');
      commit('loadParts', res.data);
      return res.data
    }
  },
  getters: {
    Parts(state) {
      return state.Parts
    }
  }
}
