import fb from './firabase'
import store from '../store'

export default {

  getColumn(id) {
    return new Promise((resolve, reject) => {
      if (localStorage && localStorage[id]) return resolve(JSON.parse(localStorage[id]))
      else {
        fb.auth().onAuthStateChanged(user => {
          if (user) {
            store.dispatch('autoLoginUser', user)
            store.dispatch('fetchLocalStorage', user)
              .then((res) => {
                if (res !== null && res[id]) {
                  localStorage.setItem(id, JSON.stringify(res[id]))
                  return resolve(res[id])
                } else {
                  return reject(new Error(`Сохранённая конфигурация отсутствует на сервере.
											Выберите необходимые Вам колонки колонки и нажмите кнопку 'Сохранить' ( для продолжения работы кликните мышью ).`))
                }
              })
          } else {
            reject(new Error('Не удаётся получить данные о пользователе. Сообщите о проблеме администратору портала'))
          }
        })
      }
    })
  },
  getMyFilters(userID, filterName, payload) {
    return new Promise((resolve) => {
      fb.auth().onAuthStateChanged(user => {
        if (user) {
          if (userID && filterName && payload) {
            var arr = [userID, filterName, payload]
          }
          store.dispatch('fetchFilters', user)
            .then(() => {
              if (store.getters.filters !== null) {
                const filters = store.getters.filters
                if (arr) {
                  filters[userID] = arr
                }
                resolve(filters)
              } else {
                return resolve(arr)
              }
            })
        }
      })
    })
  },
  getSharedFilterNames() {
    return new Promise((resolve, reject) => {
      fb.auth().onAuthStateChanged(user => {
        if (user) {
          store.dispatch('getSharedFilterNames')
            .then((data) => {
              if (data) {
                return resolve(data)
              } else {
                reject(new Error('В БД отсутствуют сохранённые пользовательские фильтры'))
              }
            })
        }
      })
    })
  }

}
