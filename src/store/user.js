// just import firebase
import fb from '@/services/firabase'
const firebase = require('firebase')
import { Message } from 'element-ui'
import { translateToRussian } from '@/utils/translate-to-RU.js'

import {
  getBonusSale, getBonusSaleSum, getBonusProfit, getBonusProfitSC, getBonusProfitSCSum, getBonusProfitSum, getUsersWithBonus, dataForChartSale,
  dataForChartProfit, dataForChartProfitSC, usersForChartSale, usersForChartProfit } from '@/api/user'

import { setToken, removeToken, getToken } from '@/utils/auth'

class User {
  constructor(id) {
    this.id = id
  }
}

export default {

  state: {

    token: getToken(),
    user: null,
    currentUser: null,
    id: null,
    userRole: '',
    selectedUserRole: [],
    BonusSale: [],
    BonusProfit: [],
    BonusProfitSC: [],
    BonusSaleSum: {},
    BonusProfitSCSum: {},
    BonusProfitSum: {},
    UsersWithBonus: [],
    BonusChartSale: [],
    BonusChartProfit: [],
    BonusChartProfitSC: [],
    ChartUsersSale: [],
    ChartUsersProfit: [],

    info: {
      firstname: '',
      lastname: '',
      company: '',
      position: '',
      country: '',
      city: '',
      address: '',
      email: '',
      phone: '',
      aboutme: ''
    }

  },

  mutations: {
    SET_TOKEN: (state, payload) => {
      state.token = payload
    },

    setUser(state, payload) {
      state.user = payload
    },

    setCurrentUser(state, payload) {
      state.currentUser = payload
    },

    SET_USER_ROLES(state, payload) {
      state.userRole = payload
    },

    USER_ROLES_BY_UID(state, payload) {
      state.selectedUserRole = payload
    },

    setUserInfo(state, payload) {
      if (payload) {
        state.info = payload
      } else {
        state.info.email = state.currentUser.email
        console.log(state.info)
      }
    },

    CHANGE_INFO(state, { key, value }) {
      if (state.info.hasOwnProperty.call({ key, value }, 'key')) {
        state.info[key] = value
      }
    },

    GET_BONUS_SALE(state, payload) {
      state.BonusSale = payload
    },
    GET_BONUS_SALE_SUM(state, payload) {
      state.BonusSaleSum = payload
    },
    GET_BONUS_PROFIT(state, payload) {
      state.BonusProfit = payload
    },
    GET_BONUS_PROFIT_SC(state, payload) {
      state.BonusProfitSC = payload
    },
    GET_BONUS_PROFIT_SUM(state, payload) {
      state.BonusProfitSum = payload
    },
    GET_BONUS_PROFIT_SC_SUM(state, payload) {
      state.BonusProfitSCSum = payload
    },
    GET_USERS_WITH_BONUS(state, payload) {
      state.UsersWithBonus = payload
    },
    GET_CHART_DATA_SALE(state, payload) {
      state.BonusChartSale = payload
    },
    GET_CHART_DATA_PROFIT(state, payload) {
      state.BonusChartProfit = payload
    },
    GET_CHART_DATA_PROFIT_SC(state, payload) {
      state.BonusChartProfitSC = payload
    },
    SET_CHART_USERS_SALE(state, payload) {
      state.ChartUsersSale = payload
    },
    SET_CHART_USERS_PROFIT(state, payload) {
      state.ChartUsersProfit = payload
    }
  },

  
  actions: {
    async registerUser({ commit }, { email, password }) {
      commit('clearError')
      commit('setLoading', true)
      await fb
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(async userCredential => {
          await fb
            .database()
            .ref(`/users/${userCredential.user.uid}/config`)
            .child('userRole')
            .set('user')
          commit('setUser', new User(userCredential.user.uid))
          commit('setLoading', false)
        })
        .catch(error => {
          commit('setLoading', false)
          commit('setError', error.message)
          throw error
        })
    },

    async loginUser({ commit, dispatch }, { email, password }) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const data = await fb.auth().signInWithEmailAndPassword(email, password)
        const token = await data.user.getIdToken()
        commit('setUser', new User(data.user.uid))
        dispatch('getUserRole')
        setToken(token)
        commit('SET_TOKEN', token)
      } catch (err) {
        commit('setError', translateToRussian(err.message) ? translateToRussian(err.message) : err)
        throw err
      } finally {
        commit('setLoading', false)
      }
    },

    async getUsersKey() {
      const keys = [];
      fb.auth().onAuthStateChanged(async currentUser => {
        if (currentUser) {
          fb.database()
            .ref("users")
            .on("value", snapshot => {
              snapshot.forEach(childSnapshot => {
                keys.push(childSnapshot.key)
              })
            })

        }
      })
      return keys;
    },

    async getUserInfo({ commit }) {
      try {
        fb.auth().onAuthStateChanged(async currentUser => {
          if (currentUser) {
            const info = await fb
              .database()
              .ref(`users`)
              .child(currentUser.uid)
              .child(`info`)
              .once('value')
            commit('setUserInfo', info.val())
          }
        })
      } catch (error) {
        commit('setError', error.messsage)
        throw error
      }
    },

    getCurrentUser({ commit }) {
      const currentUser = fb.auth().currentUser
      if (currentUser) {
        commit('setCurrentUser', currentUser)
      }
    },

    getUserRole({ commit }) {
      commit('clearError')
      return new Promise(resolve => {
        fb.auth().onAuthStateChanged(async currentUser => {
          if (currentUser) {
            const snapshot = await fb
              .database()
              .ref(`/users/${currentUser.uid}/config`)
              .child('userRole')
              .once('value')
            commit('SET_USER_ROLES', snapshot.val().split('&'))
            resolve(snapshot.val().split('&'))
          } else resolve('public')
        })
      })
    },

    getUserRoleByUID({ commit }, uid) {
      return Promise.resolve(() => {
        const snapshot = fb
          .database()
          .ref(`/users/${uid}/config`)
          .child('userRole')
          .once('value')
        commit('USER_ROLES_BY_UID', snapshot.val())
      })
    },

    getSpecificUserRole({ commit }) {
      return new Promise(resolve => {
        fb.auth().onAuthStateChanged(async currentUser => {
          if (currentUser) {
            const snapshot = await fb
              .database()
              .ref(`/users/${currentUser.uid}/config`)
              .child('userRole')
              .once('value')
            commit('SET_USER_ROLES', snapshot.val().split('&') || 'public')
            resolve(snapshot.val().split('&'))
          }
        })
      })
    },

    changeInfo({ commit }, data) {
      commit('CHANGE_INFO', data)
    },

    async updateInfo({ state }) {
      const user = fb.auth().currentUser
      await fb
        .database()
        .ref(`users`)
        .child(user.uid)
        .child(`info`)
        .update(state.info)
      await user.updateProfile({
        displayName: state.info.lastname + ' ' + state.info.firstname
      })
    },

    setUserEmail({ commit, getters }, email) {
      commit('clearError')
      return new Promise((resolve) => {
        try {
          fb
            .database()
            .ref(`/users/${getters.user.id}/info`)
            .child('emailaddress')
            .set(email)
          resolve(email)
        } catch (error) {
          commit('setError', error.messsage)
          throw error
        }
      })
    },

    getBonusSale({ commit }, email) {
      return new Promise((resolve, reject) => {
        getBonusSale()
          .then(response => {
            response.forEach(item => {
              item.HeadManager && item.HeadManager === email ? item.hmp : item.hmp = 0
              item.Manager && item.Manager === email ? item.mp : item.mp = 0
              item.LocalManager && item.LocalManager === email ? item.lmp : item.lmp = 0
              item.LocalManager && item.LocalManager === email ? item.lmpX : item.lmpX = 0
            })
            commit('GET_BONUS_SALE', response)
            resolve()
          }).catch(error => {
            reject(error)
          })
      })
    },

    getBonusSaleSum({ commit, state }, payload) {
      state.BonusSaleSum = {}
      commit('setLoading', true)
      return new Promise((resolve, reject) => {
        if (payload.email === 'nouser@tsd-group.ru') {
          state.BonusSaleSum = { pointsX: 1, points: 1 }
          return resolve()
        }
        getBonusSaleSum(payload)
          .then(response => {
            commit('GET_BONUS_SALE_SUM', response)
            commit('setLoading', false)
            resolve()
          }).catch(error => {
            reject(error)
          })
      })
    },

    getBonusProfit({ commit }, email) {
      return new Promise((resolve, reject) => {
        getBonusProfit()
          .then(response => {
            response.forEach(item => {
              item.SM && item.SM === email ? item.smp : item.smp = 0
              item.VI && item.VI === email ? item.vip : item.vip = 0
              item.Buh && item.Buh === email ? item.buhp : item.buhp = 0
              item.SMBoss && item.SMBoss === email ? item.bsmp : item.bsmp = 0
              item.VIBoss && item.VIBoss === email ? item.bvip : item.bvip = 0
              if (item.pX === -1) {
                item.pX = item.smp + item.vip + item.buhp + item.bsmp + item.bvip
              } else {
                item.pX = (item.SM === email ? item.pX / 27 * 5 : 0) +
                  (item.VI === email ? item.pX / 27 * 12 : 0) +
                  (item.Buh === email ? item.pX / 27 * 3 : 0) +
                  (item.SMBoss === email ? item.pX / 27 * 2 : 0) +
                  (item.VIBoss === email ? item.pX / 27 * 5 : 0)
              }
            })
            commit('GET_BONUS_PROFIT', response)
            resolve()
          }).catch(error => {
            reject(error)
          })
      })
    },

    getBonusProfitSC({ commit }, payload) {
      return new Promise((resolve, reject) => {
        getBonusProfitSC(payload)
          .then(response => {
            response.forEach(item => {
              item.sm && item.sm === payload.email ? item.smp : item.smp = 0
              item.vi && item.vi === payload.email ? item.vip : item.vip = 0
              item.buh && item.buh === payload.email ? item.bp : item.bp = 0
              item.smboss && item.smboss === payload.email ? item.bsmp : item.bsmp = 0
              item.viboss && item.viboss === payload.email ? item.bvip : item.bvip = 0
              if (item.pX === -1) {
                item.pX = item.smp + item.vip + item.bp + item.bsmp + item.bvip
              } else {
                item.pX = (item.sm === payload.email ? item.pX / 27 * 5 + item.pX : 0) +
                (item.vi === payload.email ? item.pX / 27 * 12 + item.pX : 0) +
                (item.buh === payload.email ? item.pX / 27 * 3 + item.pX : 0) +
                (item.smboss === payload.email ? item.pX / 27 * 2 + item.pX : 0) +
                (item.viboss === payload.email ? item.pX / 27 * 5 + item.pX : 0)
              }
            })
            commit('GET_BONUS_PROFIT_SC', response)
            resolve()
          }).catch(error => {
            reject(error)
          })
      })
    },

    getBonusProfitSum({ commit, state }, payload) {
      state.BonusProfitSum = {}
      commit('setLoading', true)
      return new Promise((resolve, reject) => {
        if (payload.email === 'nouser@tsd-group.ru') {
          state.BonusProfitSum = { pointsX: 1, points: 1 }
          return resolve()
        }
        getBonusProfitSum(payload)
          .then(responseProfit => {
            getBonusProfitSCSum(payload)
              .then(responseProfitSC => {
                commit('GET_BONUS_PROFIT_SC_SUM', responseProfitSC)
                commit('GET_BONUS_PROFIT_SUM', { ...responseProfit, ...responseProfitSC })
                commit('setLoading', false)
                resolve()
              })
          }).catch(error => {
            reject(error)
          })
      })
    },

    getUsersWithBonus({ commit }) {
      return new Promise((resolve, reject) => {
        getUsersWithBonus()
          .then(response => {
            commit('GET_USERS_WITH_BONUS', response)
            resolve()
          }).catch(error => {
            reject(error)
          })
      })
    },
    async usersForChartSale({ commit }) {
      commit('setLoading', true)
      try {
        const res = await usersForChartSale()
        commit('setLoading', false)
        commit('SET_CHART_USERS_SALE', res)
        return res
      } catch (e) {
        if (e) throw e
        commit('setLoading', false)
        commit('setError', e.message)
      }
    },
    async usersForChartProfit({ commit }) {
      commit('setLoading', true)
      try {
        const res = await usersForChartProfit()
        commit('setLoading', false)
        commit('SET_CHART_USERS_PROFIT', res)
        return res
      } catch (e) {
        if (e) throw e
        commit('setLoading', false)
        commit('setError', e.message)
      }
    },
    async dataForChartSale({ commit }, users) {
      commit('setLoading', true)
      try {
        const res = await dataForChartSale(users)
        commit('GET_CHART_DATA_SALE', res)
        commit('setLoading', false)
        return res
      } catch (e) {
        if (e) throw e
        commit('setLoading', false)
        commit('setError', e.message)
      }
    },
    async dataForChartProfit({ commit }, users) {
      commit('setLoading', true)
      try {
        const res = await dataForChartProfit(users)
        commit('GET_CHART_DATA_PROFIT', res)
        commit('setLoading', false)
        return res
      } catch (e) {
        if (e) throw e
        commit('setLoading', false)
        commit('setError', e.message)
      }
    },

    async dataForChartProfitSC({ commit }, users) {
      commit('setLoading', true)
      try {
        const res = await dataForChartProfitSC(users)
        commit('GET_CHART_DATA_PROFIT_SC', res)
        commit('setLoading', false)
        return res
      } catch (e) {
        if (e) throw e
        commit('setLoading', false)
        commit('setError', e.message)
      }
    },

    autoLoginUser({ commit }, payload) {
      commit('setUser', new User(payload.uid))
    },

    reauthUser(currentPassword) {
      return new Promise((resolve, reject) => {
        const user = fb.auth().currentUser
        const cred = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword)
        user.reauthenticateWithCredential(cred)
          .then(() => {
            resolve(true)
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    setUserPassword(password) {
      const user = firebase.auth().currentUser
      user.updatePassword(password)
        .then(() => {
          Message({ message: 'Пароль успешно изменён!', type: 'success', duration: 4 * 1000 })
        })
        .catch(error => {
          Message({ message: error.message, type: 'error', duration: 4 * 1000 })
        })
    },

    LogoutUser({ commit }) {
      fb.auth().signOut()
      removeToken()
      commit('setUser', null)
      commit('setLoading', false)
    }
  },
  getters: {
    token(state) {
      return state.token
    },
    user(state) {
      return state.user
    },
    avatar(state) {
      return state.currentUser.photoURL || 'account_circle'
    },
    userRole(state) {
      return state.userRole
    },
    isUserLoggedIn(state) {
      return state.user !== null
    },
    currentUser(state) {
      return state.currentUser
    }
  }
}
