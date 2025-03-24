import { getAll as getAllModels } from '@/api/models/models.js'
import { getAll as getAllVendors } from '@/api/models/vendors.js'
import { getAll as getAllTypes } from '@/api/models/types.js'
import { getAll as getAllProfiles } from '@/api/models/profiles.js'
import { getAll as getAllCategories } from '@/api/models/categories.js'
import { getAll as getAllEngineers } from '@/api/models/engineers.js'

const state = {
  models: [],
  categories: [],
  types: [],
  vendors: [],
  profiles: [],
  engineers: []
}

const mutations = {

  MODELS: (state, payload) => {
    state.models = payload
  },
  CATEGORIES: (state, payload) => {
    state.categories = payload
  },
  TYPES: (state, payload) => {
    state.types = payload
  },
  PROFILES: (state, payload) => {
    state.profiles = payload
  },
  VENDORS: (state, payload) => {
    state.vendors = payload
  },
  ENGINEERS: (state, payload) => {
    state.engineers = payload
  },

}
const actions = {

  async models({ commit }) {
    const res = await getAllModels()
    commit('MODELS', res)
    return res
  },

  async categories({ commit }) {
    const res = await getAllCategories()
    commit('CATEGORIES', res)
    return res
  },
  async types({ commit }) {
    const res = await getAllTypes()
    commit('TYPES', res)
    return res
  },
  async profiles({ commit }) {
    const res = await getAllProfiles()
    commit('PROFILES', res)
    return res
  },
  async vendors({ commit }) {
    const res = await getAllVendors()
    commit('VENDORS', res)
    return res
  },
  async engineers({ commit }) {
    const res = await getAllEngineers()
    commit('ENGINEERS', res)
    return res
  },

}

const getters = {
}

export default {

  namespaced: true,
  state,
  getters,
  mutations,
  actions

}
