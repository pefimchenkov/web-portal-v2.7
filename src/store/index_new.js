import Vue from 'vue'
import Vuex from 'vuex'
// import getters from './getters'

/* import ads from './ads'
import user from './user'
import shared from './shared'
import orders from './orders'
import zip from './zip'
import aliases from './aliases'
import clients from './clients'
import suppliers from './suppliers'
import brands from './brands'
import conditions from './conditions'
import currency from './currency'
import contracts from './contracts'
import specprices from './specprices'
import tech_properties from './tech_properties'
import models from './models'
import market from './market'
import parts from './parts'
import products_class from './products_class'
import products_type from './products_type'
import serial_numbers from './serial_numbers'
import stock_1c from './stock_1c'
import engineers_stock from './engineers-stock'
import deals from './CRM/deals'
import jira_users from './CRM/jira-users'
import nofact from './CRM/nofact'
import editprices from './editprices'
import marketImg from './marketImg'
import zipImg from './zipImg'
import config from './config'
import fb from './modules/fb'
import finance from './modules/finance'
import jira from './modules/jira'
import market_new from './modules/market'
import pays from './modules/budget/pays'
import income from './modules/budget/income'
import budget from './modules/budget'
import deals_new from './modules/deals' */

Vue.use(Vuex)

// https://webpack.js.org/guides/dependency-management/#requirecontext
const modulesFiles = require.context('./modules', true, /\.js$/)

// you do not need `import app from './modules/app'`
// it will auto require all vuex module from modules file
const modules = modulesFiles.keys().reduce((modules, modulePath) => {
  // set './app.js' => 'app'
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
  const value = modulesFiles(modulePath)
  modules[moduleName] = value.default
  return modules
}, {})

const store = new Vuex.Store({
  modules
})

export default store
