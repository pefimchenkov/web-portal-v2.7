import Vue from 'vue'
import Vuex from 'vuex'

import auth from './auth'
import user from './user'
import shared from './shared'
import orders from './__orders'
import zip from './zip'
import aliases from './aliases'
import crm from './crm'
import suppliers from './suppliers'
import brands from './brands'
import conditions from './conditions'
import currency from './currency'
import specprices from './specprices'
import tech_properties from './tech_properties'
// import models from './models'
import market from './market'
import parts from './parts'
import products_class from './products_class'
import products_type from './products_type'
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
import deals_new from './modules/deals'

import getters from './getters'

const modulesFiles = require.context('./modules', true, /\.js$/)

const namedModules = modulesFiles.keys().reduce((modules, modulePath) => {
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
  const value = modulesFiles(modulePath)
  modules[moduleName] = value.default
  return modules
}, {})

Vue.use(Vuex)

export default new Vuex.Store({

  modules: {

    ...namedModules,
    auth,
    user,
    shared,
    orders,
    zip,
    crm,
    aliases,
    suppliers,
    brands,
    conditions,
    currency,
    specprices,
    tech_properties,
    market,
    parts,
    products_class,
    products_type,
    stock_1c,
    engineers_stock,
    deals,
    editprices,
    marketImg,
    zipImg,
    jira_users,
    nofact,
    config,
    fb,
    finance,
    jira,
    market_new,
    deals_new
  },

  getters

})

