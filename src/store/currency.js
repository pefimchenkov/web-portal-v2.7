import Api from '@/services/Api'
import axios from 'axios'

// const { convertXML } = require("simple-xml-to-json");

export default {

  state: {

    Currency: [],
    Rate: [],
    Dollar: null,
    Euro: null,
    Cbr_Dollar: null,
    Cbr_Euro: null

  },

  mutations: {

    SET_CURRENCY(state, payload) {
      state.Currency = payload
    },

    SET_RATE(state, payload) {
      state.Rate = payload
    },

    SET_DOLLAR(state, payload) {
      state.Dollar = payload
    },

    SET_EURO(state, payload) {
      state.Euro = payload
    },

    SET_CBR_DOLLAR(state, payload) {
      state.Cbr_Dollar = payload
    },

    SET_CBR_EURO(state, payload) {
      state.Cbr_Euro = payload
    }

  },

  actions: {

    async getCurrency({ commit, state }) {
      if (state.Currency.length > 0) return

      await Api()
        .get('currency')
        .then(res => {
          const values = Object.values(res.data)
          commit('SET_CURRENCY', values)

          values.forEach(valute => {
            if (valute.sign === '$') commit('SET_DOLLAR', valute.rate)
            if (valute.sign === '€') commit('SET_EURO', valute.rate)
          })
        })
        .catch(err => {
          console.log(err)
          commit('setError', err.messsage)
        })
    },

    async getRatefromCB({ commit, state }) {
      if (state.Rate.length > 0) return

      await axios
        .get('https://www.cbr-xml-daily.ru/daily_json.js')
        .then(res => {
          const values = Object.values(res.data)
          commit('SET_RATE', values)

          if (!values) return false

          values.forEach(r => {
            for (const key in r.USD) {
              if (key === 'Value') {
                commit('SET_CBR_DOLLAR', r.USD[key])
              }
            }
            for (const key in r.EUR) {
              if (key === 'Value') {
                commit('SET_CBR_EURO', r.EUR[key])
              }
            }
          })
        })
        .catch(err => {
          console.log(err)
          if (err.Error === 'Network') return null
        })
    },

  },

  getters: {

    currency(state) {
      return state.Currency
    },

    rate(state) {
      return state.Rate
    },

    dollar(state) {
      return state.Dollar
    },

    euro(state) {
      return state.Euro
    },

    cbr_dollar(state) {
      return state.Cbr_Dollar
    },

    cbr_euro(state) {
      return state.Cbr_Euro
    }

  }

}
