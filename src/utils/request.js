import axios from 'axios'
import axiosRetry from 'axios-retry'
import store from '@/store'
import router from 'vue-router'
import { getToken } from '@/utils/auth.js'
import { MessageBox, Notification } from 'element-ui'

// create an axios instance
const service = axios.create({
  // baseURL: process.env.API_ENDPOINT, // url = base url + request url
  baseURL: process.env.VUE_APP_BASE_API,
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 15000 // request timeout
})

axiosRetry(service, {
  retries: 0,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return error // return error.code === 'ECONNABORTED'
  }})
  
// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    // console.log(store.getters.token)
    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation

      // config.headers['X-Token'] = getToken()
      config.headers.authorization = `Bearer ${getToken()}`
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data

    // if the custom code is not 20000, it is judged as an error.
    if (res?.code !== 20000) {
      Notification({
        message: res?.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })
      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res?.code === 50008 || res?.code === 50012 || res?.code === 50014) {
        // to re-login
        MessageBox.confirm('Вы вышли из системы, вы можете нажать «Отмена», чтобы остаться на этой странице, или войти снова.', {
          confirmButtonText: 'Войти снова',
          cancelButtonText: 'Отмена',
          type: 'warning'
        }).then(async () => {
          await store.dispatch('LogoutUser')
        })
      }
      return Promise.reject(new Error(res?.message || 'Ошибка:'))
    } else {
      return res.data || res
    }
  },

  error => {
    if (error.response?.status) {
      switch (error.response.status) {
        case 400:
          Notification({
            message: error.response.data?.message,
            type: 'warning',
            duration: 5 * 1000,
            showClose: true
          })
          break
        case 404:
          Notification({
            message: error.response.data?.message,
            type: 'warning',
            duration: 7 * 1000,
            showClose: true
          })
          break
        case 500:
          Notification({
            message: error.response.data?.message,
            type: 'error',
            duration: 5 * 1000
          })
          break
        case 502:
          setTimeout(() => {
            router.replace({
              path: '/login',
              query: { redirect: router.currentRoute.fullPath }
            })
          }, 1000)
      }
      return Promise.reject(error.response)
    } else {
      return Notification({
        message: 'Ошибка получения данных (сервер не доступен или превышен интервал ожидания запроса). Попробуте ещё раз или немного позже. ',
        type: 'error',
        duration: 5000,
        showClose: true
      })
    }
  }

)

export default service
