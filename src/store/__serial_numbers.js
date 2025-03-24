import { get /* add, update, remove */ } from '@/api/client/serial-numbers'

export default {

  state: {

    data: []

  },

  mutations: {

    load: (state, payload) => {
      state.data = payload
    }

  },

  actions: {

    async get({ commit }) {
      await get().then(res => {
        commit('load', Object.values(res.data))
      })
        .catch(err => {
          commit('setError', err.messsage)
          throw err
        })
    }
  },

  getters: {

    sn: (state) => state.data

  }

}
