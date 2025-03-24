import fb from '@/services/firabase'

export default {
  state: {
    filters: []
  },
  mutations: {
    loadFilters(state, payload) {
      state.filters = payload
    }
  },
  actions: {

    async createFilter({ commit, getters }, payload) {
      commit('clearError')
      commit('setLoading', true)
      const filterName = payload[0]
      const filterID = payload[1]
      const filterData = payload[2].Data
      const filterColumns = payload[2].Columns
      let filterDataName = ''
      let filterColumnsName = ''
      Object.keys(payload[2]).forEach(key => {
        if (key === 'Data') {
          filterDataName = key
        }
        if (key === 'Columns') {
          filterColumnsName = key
        }
      })

      try {
        await fb
          .database()
          .ref(`/users/${getters.user.id}/filters/` + filterID + '/' + filterName)
          .child(filterDataName)
          .set(filterData)
        await fb
          .database()
          .ref(`/users/${getters.user.id}/filters/` + filterID + '/' + filterName)
          .child(filterColumnsName)
          .set(filterColumns)
        await commit('setLoading', true)
        await commit('setData', 'Фильтр успешно сохранён!!!')
      } catch (error) {
        commit('setError', error.messsage)
        throw error
      }
    },

    async fetchFilters({ commit }, user) {
      commit('setLoading', true)
      commit('clearError')
      try {
        await fb
          .database()
          .ref(`/users/${user.uid}`)
          .child('filters')
          .once('value')
          .then(snapshot => {
            commit('loadFilters', snapshot.val())
            commit('setLoading', false)
          })
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.messsage)
        throw error
      }
    },

    delFilter({ commit, getters }, payload) {
      commit('setLoading', true)
      commit('clearError')
      return new Promise((resolve, reject) => {
        try {
          const data = fb
            .database()
            .ref(`/users/${getters.user.id}`)
            .child(`filters/${payload.filterName}`)
            .child(payload.childName)
            .remove()
          resolve(data)
        } catch (error) {
          commit('setLoading', false)
          commit('setError', error.messsage)
          reject(error)
          throw error
        }
      })
    },

    setFilterShare({ commit, getters }, payload) {
      commit('setLoading', true)
      commit('clearError')
      var id = payload.id
      var name = payload.name
      var iconColor = ''
      var shareStatus = true
      const ref = fb.database().ref(`/users/${getters.user.id}`).child(`filters/${id}`).child(name)
      return new Promise((resolve, reject) => {
        try {
          ref
            .once('value')
            .then(snapshot => {
              if (!snapshot.val().Share) {
                ref.child('Share').set(true)
                iconColor = 'green'
              } else if (snapshot.val().Share === true) {
                ref.update({ Share: false })
                iconColor = 'grey'
                shareStatus = false
              } else {
                ref.update({ Share: true })
                iconColor = 'green'
              }
              resolve({ name: name, iconColor: iconColor, shareStatus: shareStatus })
            })
        } catch (error) {
          commit('setLoading', false)
          commit('setError', error.messsage)
          reject(error)
          throw error
        }
      })
    },

    getSharedFilterNames({ commit }) {
      const ref = fb.database().ref(`/users`)
      return new Promise((resolve, reject) => {
        try {
          ref.once('value')
            .then((snapshot) => {
              resolve(snapshot.val())
            })
        } catch (error) {
          commit('setLoading', false)
          commit('setError', error.messsage)
          reject(error)
          throw error
        }
      })
    }
  },

  getters: {
    ls: (state) => state.ls,
    filters: (state) => state.filters
  }
}
