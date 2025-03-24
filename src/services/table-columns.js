import fb from './firabase'
import store from '../store'

async function getColumnsFromFire(tableName) {
  return new Promise((resolve, reject) => {
    fb.auth().onAuthStateChanged(async user => {
      if (user) {
        const res = await store.dispatch('fetchLocalStorage', user)
        if (res && res[tableName]) {
          localStorage.setItem(tableName, JSON.stringify(res[tableName]))
          return resolve(res[tableName])
        } else return resolve(false)
      } else {
        return reject(new Error('Не удаётся получить данные о пользователе. Сообщите о проблеме администратору портала'))
      }
    })
  })
}

export async function getColumns(tableName, headers) {
  const columns = localStorage[tableName]
    ? JSON.parse(localStorage[tableName])
    : await getColumnsFromFire(tableName)

  return new Promise((resolve, reject) => {
    if (!columns) return reject(new Error(`Сохранённая конфигурация отсутствует на сервере. Выберите необходимые Вам колонки колонки и нажмите кнопку 'Сохранить' ( для продолжения работы кликните мышью ).`))

    headers.forEach(header => {
      for (var key in columns) {
        if (key === header.value) header.selected = columns[key]
      }
    })

    return resolve('// Данные о сохранённых колонках успешно загружены //')
  })
}
