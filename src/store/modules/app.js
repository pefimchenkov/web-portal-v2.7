import Cookies from 'js-cookie'
import fb from '@/services/firabase'

const state = {
  sidebar: {
    opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
    withoutAnimation: false
  },
  device: 'desktop',
  size: Cookies.get('size') || 'medium'
}

const mutations = {
  TOGGLE_SIDEBAR: state => {
    state.sidebar.opened = !state.sidebar.opened
    state.sidebar.withoutAnimation = false
    if (state.sidebar.opened) {
      Cookies.set('sidebarStatus', 1)
    } else {
      Cookies.set('sidebarStatus', 0)
    }
  },
  CLOSE_SIDEBAR: (state, withoutAnimation) => {
    Cookies.set('sidebarStatus', 0)
    state.sidebar.opened = false
    state.sidebar.withoutAnimation = withoutAnimation
  },
  TOGGLE_DEVICE: (state, device) => {
    state.device = device
  },
  SET_SIZE: (state, size) => {
    state.size = size
    Cookies.set('size', size)
  },
  SET_TABLE_COLUMNS: (state, { name, columns }) => {
    if (localStorage.getItem(name)) localStorage.removeItem(name)
    localStorage.setItem(name, JSON.stringify(columns))
  }
}

const actions = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  closeSideBar({ commit }, { withoutAnimation }) {
    commit('CLOSE_SIDEBAR', withoutAnimation)
  },
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device)
  },
  setSize({ commit }, size) {
    commit('SET_SIZE', size)
  },
  async setTableColumns({ commit, rootGetters }, payload) {
    const data = {}
    const { name, columns } = payload
    data[name] = columns
    try {
      await fb.database().ref(`/users/${rootGetters.user.id}/config`).update(data)
      commit('SET_TABLE_COLUMNS', payload)
      return 'Настройки успешно сохранены.'
    } catch (e) {
      return e.messsage
    }
  },
  async getTableColumns({ rootGetters, commit }, name) {
    try {
      const data = localStorage.getItem(name)
      if (data) return JSON.parse(data)

      const res = await fb.database().ref(`/users/${rootGetters.user.id}/config/${name}`).once('value')
      commit('SET_TABLE_COLUMNS', { name, columns: res.val() })
      return res.val()
    } catch (e) {
      return e.message
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
