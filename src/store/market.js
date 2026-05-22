import Api from '@/services/___Api'
import settings from '@/settings.js'

import { sendOrderToSite } from '@/api/barcodespace'

import { Message } from 'element-ui'

export default {

  state: {

    TechProps: [],
    Basket: [],
    Orders: []

  },

  mutations: {

    LOAD_MARKET(state, payload) {
      state.Market = payload
    },
    loadTechProps(state, payload) {
      state.TechProps = payload
    },
    loadTechPropValue(state, payload) {
      const Item = state.TechProps.find(prop => prop.mainID === payload.id)
      Item.TH2 = payload.value.name
      Item.elementID = payload.value.id
    },
    SET_BASKET(state, payload) {
      state.Basket = payload.CurrentOrder
    },
    DEL_FROM_BASKET(state, id) {
      state.Basket = state.Basket.filter(item => item.marketid !== id)
    },
    SET_ORDERS(state, payload) {
      state.Orders = payload
    },
    SAVE_ORDERS(state, payload) {
      state.Orders.push(payload)
    },
    UPDATE_COUNT(state, { id, count }) {
      const Item = state.Basket.find(item => item.marketid === id)
      Item.Count = count
    },
    UPDATE_PRICE(state, { id, deviation }) {
      const Item = state.Basket.find(item => item.marketid === id)
      Item.Deviation = deviation
    },
    UPDATE_DISCOUNT(state, payload) {
      const { objId, id, discount } = payload
      const Item = state.Orders[objId].order.find(item => item.marketid === id)
      Item.Discount = discount
    },
    UPDATE_COMMENT(state, payload) {
      const { objId, comment } = payload
      const Order = state.Orders[objId]
      Order.comment = comment
    },
    MOVE_TO_BASKET(state, order) {
      state.Basket = order
    },
    DEL_BASKET(state) {
      state.Basket = []
    },
    DEL_ORDERS(state) {
      state.Orders = []
    },
    REMOVE_ORDER_FROM_LIST(state, order) {
      const index = state.Orders.indexOf(order)
      state.Orders.splice(index, 1)
    },
    SEND_ORDER_TO_SITE(state, index) {
      const Order = state.Orders[index]
      Order.isOnSite = true
    }

  },

  actions: {

    async fetchMarket({ commit }) {
      await Api()
        .get('zip_prices')
        .then(res => {
          commit('LOAD_MARKET', Object.values(res.data))
        })
        .catch(err => {
          commit('setError', err.messsage)
          throw err
        })
    },

    async fetchTechProps({ commit }, payload) {
      commit('clearError')
      let resultTechProps = []
      try {
        const res = await Api()
          .post('market/get_tech_props', payload)
        resultTechProps = Object.values(res.data)
        commit('loadTechProps', resultTechProps)
        return resultTechProps
      } catch (err) {
        commit('setLoading', false)
        commit('setError', err.messsage)
        if (err) {
          throw err
        }
      }
    },

    async fetchTechPropValues({ commit }, payload) {
      let resultTechPropValues = []

      try {
        const res = await Api()
          .post('market/get_tech_prop_values', [payload])
        resultTechPropValues = Object.values(res.data)
        return resultTechPropValues
      } catch (err) {
        commit('setLoading', false)
        commit('setError', err.messsage)
        if (err) {
          throw err
        }
      }
    },

    async addTechPropValue({ commit, dispatch }, payload) {
      let resultTechPropValue = []
      await Api()
        .post('market/add_tech_prop_value', payload)
        .then(res => {
          console.log(res)
          resultTechPropValue = { value: payload.TechPropValue, id: payload.item.mainID }
          commit('loadTechPropValue', resultTechPropValue)
          dispatch('fetchTechPropertiesFit')
          commit('setData', 'Для свойства `' + payload.item.TH1 + '` успешно добавлено значение `' + payload.TechPropValue.name + '`')
          if (!res.data.data.email.success) {
            Message({
              message: 'Уведомление не отправлено! Почтовый сервер не отвечает.',
              type: 'error',
              duration: 5 * 1000
            })
          }
        })
        .catch(err => {
          commit('setLoading', false)
          commit('setError', err.messsage)
          if (err) console.log(err)
        })
    },

    async deleteTechPropFit({ commit }, payload) {
      try {
        const res = await Api().post('market/delete_tech_prop_fit', payload)
        console.log(res)
        commit('setLoading', false)
        return res.data
      } catch (err) {
        commit('setLoading', false)
        commit('setError', err.messsage)
        if (err) {
          throw err
        }
      }
    },

    getBasket({ commit }) {
      if (localStorage.getItem('marketBasket')) {
        const marketBasket = JSON.parse(localStorage.getItem('marketBasket'))
        commit('SET_BASKET', marketBasket)
      } else {
        return false
      }
    },

    setBasket({ commit }, payload) {
      commit('SET_BASKET', payload)
    },

    delFromBasket({ commit }, id) {
      const marketBasket = JSON.parse(localStorage.getItem('marketBasket'))
      const obj = marketBasket.CurrentOrder.find(item => item.marketid === id)
      const index = marketBasket.CurrentOrder.indexOf(obj)
      marketBasket.CurrentOrder.splice(index, 1)
      localStorage.setItem('marketBasket', JSON.stringify({ CurrentOrder: marketBasket.CurrentOrder }))
      commit('DEL_FROM_BASKET', id)
    },

    removeBasket({ commit }) {
      return new Promise((resolve, reject) => {
        if (localStorage.getItem('marketBasket')) {
          localStorage.removeItem('marketBasket')
          commit('DEL_BASKET')
          resolve()
        } else {
          reject()
          return false
        }
      })
    },

    getOrders({ commit }) {
      if (localStorage.getItem('marketOrders')) {
        const marketOrders = JSON.parse(localStorage.getItem('marketOrders'))
        commit('SET_ORDERS', marketOrders)
      } else {
        return false
      }
    },

    saveOrders({ commit }, payload) {
      return new Promise((resolve) => {
        let Order = []
        if (localStorage.getItem('marketOrders')) {
          Order = JSON.parse(localStorage.getItem('marketOrders'))
        }
        Order.push(payload)
        localStorage.setItem('marketOrders', JSON.stringify(Order))
        commit('SAVE_ORDERS', payload)
        resolve()
      })
    },

    updateCount({ commit }, payload) {
      return new Promise((resolve) => {
        const { id, count } = payload
        const basket = JSON.parse(localStorage.getItem('marketBasket'))
        const item = basket.CurrentOrder.find(i => i.marketid === id)
        item.Count = count
        localStorage.setItem('marketBasket', JSON.stringify(basket))
        commit('UPDATE_COUNT', payload)
        resolve()
      })
    },

    updatePrice({ commit }, payload) {
      return new Promise((resolve) => {
        const { id, deviation } = payload
        const basket = JSON.parse(localStorage.getItem('marketBasket'))
        const item = basket.CurrentOrder.find(i => i.marketid === id)
        item.Deviation = deviation
        localStorage.setItem('marketBasket', JSON.stringify(basket))
        commit('UPDATE_PRICE', payload)
        resolve()
      })
    },

    updateDiscount({ state, commit }, payload) {
      return new Promise((resolve, reject) => {
        if (payload) {
          const { objId, id, discount } = payload
          if (objId) {
            const Orders = JSON.parse(localStorage.getItem('marketOrders'))
            const Item = Orders[objId].order.find(item => item.marketid === id)
            Item.Discount = discount
            localStorage.setItem('marketOrders', JSON.stringify(Orders))
            commit('UPDATE_DISCOUNT', payload)
            resolve()
          } else {
            const Item = state.Basket.find(item => item.marketid === id)
            Item.Discount = discount
          }
        } else {
          reject()
        }
      })
    },

    updateComment({ commit }, payload) {
      return new Promise((resolve, reject) => {
        if (payload) {
          const { objId, comment } = payload
          const Orders = JSON.parse(localStorage.getItem('marketOrders'))
          const Order = Orders[objId]
          Order.comment = comment
          localStorage.setItem('marketOrders', JSON.stringify(Orders))
          commit('UPDATE_COMMENT', payload)
          resolve()
        } else {
          reject()
        }
      })
    },

    moveToBasket({ commit }, order) {
      return new Promise((resolve) => {
        if (localStorage.getItem('marketBasket')) localStorage.removeItem('marketBasket')
        localStorage.setItem('marketBasket', JSON.stringify({ CurrentOrder: order }))
        commit('MOVE_TO_BASKET', order)
        resolve()
      })
    },

    removeOrders({ commit }) {
      return new Promise((resolve, reject) => {
        if (localStorage.getItem('marketOrders')) {
          localStorage.removeItem('marketOrders')
          commit('DEL_ORDERS')
          resolve()
        } else {
          reject()
          return false
        }
      })
    },

    removeOrderFromList({ state }, payload) {
      return new Promise((resolve) => {
        const Order = state.Orders[payload]
        const Index = state.Orders.indexOf(Order)
        state.Orders.splice(Index, 1)
        localStorage.setItem('marketOrders', JSON.stringify(state.Orders))
        resolve()
      })
    },

    sendOrderToSite({ state, commit }, index) {
      const Order = state.Orders[index].order
      const url = settings.barcodespace_url + JSON.stringify(Order).replace(/["']/g, '')
      commit('SEND_ORDER_TO_SITE', index)
      sendOrderToSite(url).then((res) => {
        if (res.status === 200) {
          localStorage.removeItem('marketOrders')
          localStorage.setItem('marketOrders', JSON.stringify(state.Orders))
        } else {
          commit('setError', 'Ошибка при загрузке заказа на сайт barcodespace.ru')
          console.log(res)
        }
      })
    }

  },

  getters: {

    TechProps: (state) => state.TechProps

  }

}
