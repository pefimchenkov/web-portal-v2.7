import { createAssembly, createDisassembly } from "@/api/repairs/disassembly"
import {
    getAtlasGoods,
    getAtlasInvoice,
    postAtlasInvoice,
    getAtlasSales,
    postAtlasSales,
    getAtlasProjects,
    getAtlasCfAnalitics,
    getDebtOffset,
    getAtlasContractors,
    getAtlasWarehouses,
    getAtlasIncomingPayments,
    getAtlasOutgoingPayments,
  } from "@/api/1c/atlas_1c"

const state = {
  getAtlasGoods: [],
  getAtlasInvoice: [],
  getAtlasSales: [],
  getAtlasProjects: [],
  getAtlasCfAnalitics: [],
  getDebtOffset: [],
  warehouses: [],
  incomingPayments: [],
  outgoingPayments: [],
  getAtlasContractors: []
}

const mutations = {
  GET_GOODS: (state, payload) => {
    state.getAtlasGoods = payload
  },
  GET_INVOICE: (state, payload) => {
    state.getAtlasInvoice = payload
  },
  GET_SALES: (state, payload) => {
    state.getAtlasSales = payload
  },
  GET_PROJECTS: (state, payload) => {
    state.getAtlasProjects = payload
  },
  GET_CFANALITICS: (state, payload) => {
    state.getAtlasCfAnalitics = payload
  },
  GET_DEBTOFFSET: (state, payload) => {
    state.getDebtOffset = payload
  },
  GET_WAREHOUSES: (state, payload) => {
    state.warehouses = payload
  },
  GET_CONTRACTORS: (state, payload) => {
    state.getAtlasContractors = payload
  },

  GET_INCOMING_PAYMENTS: (state, payload) => {
    state.incomingPayments = payload
  },
  GET_OUTGOING_PAYMENTS: (state, payload) => {
    state.outgoingPayments = payload
  }
}

const actions = {
  async getAtlasGoods({ commit }) {
    const response = await getAtlasGoods();
    commit('GET_GOODS', response.data)
    return response.data;
  },

  async getAtlasInvoice({ commit }, payload={}) {

    if (payload?.method === "POST") {
      const data = await postAtlasInvoice(payload);
      commit('GET_INVOICE', data)
      return data;
    } else {
      const data = await getAtlasInvoice();
      commit('GET_INVOICE', data)
      console.log('GET_INVOICE', data)
      return data;
    }
  },

  async getAtlasSales({ commit }) {
    const response = await getAtlasSales();
    commit('GET_SALES', response.data)
    return response.data;
  },

  async postAtlasSales({ commit }, payload) {
    const response = await postAtlasSales(payload);
    commit('GET_SALES', response.data)
    return response.data;
  },

  async getAtlasProjects({ commit }) {
    const response = await getAtlasProjects();
    commit('GET_PROJECTS', response.data)
    return response.data;
  },

  async getAtlasCfAnalitics({ commit }) {
    const response = await getAtlasCfAnalitics();
    commit('GET_CFANALITICS', response.data)
    return response.data;
  },

  async getDebtOffset({ commit }, dates) {
    const response = await getDebtOffset(dates);
    commit('GET_DEBTOFFSET', response.data)
    return response.data;
  },


  async getAtlasIncomingPayments({ commit }, payload) {
    const response = await getAtlasIncomingPayments(payload);
    // console.log('GET_INCOMING_PAYMENTS', response.data);
    commit('GET_INCOMING_PAYMENTS', response.data)
    return response.data;
  },

  async getAtlasOutgoingPayments({ commit }, payload) {
    const response = await getAtlasOutgoingPayments(payload);
    // console.log('GET_OUTGOING_PAYMENTS', response.data);
    commit('GET_OUTGOING_PAYMENTS', response.data)
    return response.data;
  },


  async getAtlasWarehouses({ commit }) {
    const response = await getAtlasWarehouses();
    commit('GET_WAREHOUSES', response.data)
    return response.data;
  },

  async getAtlasContractors({ commit }) {
    const response = await getAtlasContractors();
    commit('GET_CONTRACTORS', response.data)
    return response.data;
  },

  async createDisassemble(_, payload) {
    const res = await createDisassembly(payload)
    return res
  },

  async createAssemble(_, payload) {
    const res = await createAssembly(payload)
    return res
  },

  async createMovement(_, payload) {

    const json = await fetch("/createMovement", {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    const response = await json.json();
    return response;
  },

  async salesReport(_, payload) {
    const { start, end } = payload
    const json = await fetch("/salesReport",
      {
        method: 'POST',
        body: JSON.stringify(
          {
            "dateStart": start,
            "dateEnd": end
          }
        ),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    const response = await json.json();
    console.log('aafsafasf', response);
    return response.data;
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

