// import Api from '@/services/Api'
import { getZip } from '@/api/zip'

export default {
  state: {
    Zip: []
  },
  mutations: {
    loadZip(state, payload) {
      state.Zip = payload
    }
  },
  actions: {
    async fetchZip({ commit }) {
      console.time('ЗИП успешно загружен')

      return new Promise((resolve, reject) => {
        getZip()
          .then(({ data }) => {
            commit('loadZip', data)
            resolve(data)

            console.timeEnd('ЗИП успешно загружен')
          })
          .catch(error => {
            reject(error.message)
          })
      })
    }
  },
  getters: {
    zip(state) {
      return state.Zip
    }
  }
}
