
import fb from '@/services/firabase.js'
import store from '@/store'
import { setToken } from '@/utils/auth'

export function initApp() {
  console.time('Получение данных из FireBase')
  fb.auth().onAuthStateChanged(async user => {
    if (user) {
      await store.dispatch('getCurrentUser')
      await store.dispatch('autoLoginUser', user)
      user.getIdToken(true).then(idToken => {
        setToken(idToken)
        console.timeEnd('Получение данных из FireBase');
      })

      await store.dispatch('fetchJiraUsers');
      await store.dispatch('getCurrency');
    }
  })
}
