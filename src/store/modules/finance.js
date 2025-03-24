import { getSalary, getDetailedSalary, getCash, getHistory, getFinanceTypes, getEmployeeSalary, getEmployeeSalaryDetail, getIncomeDetail, getIncomeCashDetail, addFinanceInfo, deleteFinanceInfo, excelToDB } from '@/api/finance'

const state = {
  Salary: [],
  DetailedSalary: [],
  IncomeDetail: [],
  IncomeCashDetail: [],
  Cash: [],
  History: [],
  FinanceTypes: [],
  employeeSalary: [],
  employeeSalaryDetail: []
}

const mutations = {
  SALARY: (state, payload) => {
    state.Salary = payload
  },
  DETAILED_SALARY: (state, payload) => {
    state.DetailedSalary = payload
  },
  CASH: (state, payload) => {
    state.Cash = payload
  },
  HISTORY: (state, payload) => {
    state.History = payload
  },
  FINANCE_TYPES: (state, payload) => {
    state.FinanceTypes = payload
  },
  EMPLOYEE_SALARY: (state, payload) => {
    state.employeeSalary = payload
  },
  EMPLOYEE_SALARY_DETAIL: (state, payload) => {
    state.employeeSalaryDetail = payload
  },
  INCOME_DETAIL: (state, payload) => {
    state.IncomeDetail = payload
  },
  INCOME_CASH_DETAIL: (state, payload) => {
    state.IncomeCashDetail = payload
  },
  ADD_FINANCE_INFO: (state, payload) => {
    const { user, date, quarter, summa, finalIncome, operation_type, cash_type, type } = payload
    let period, year
    if (date) {
      period = date.split('-')[1]
      year = date.split('-')[0]
    } else {
      period = quarter.id
      year = quarter.year
    }
    const { user_name } = user
    let row

    if (cash_type === 5 && operation_type !== 'Доход') state.Cash[0].CASH -= +summa
    if (cash_type === 6 && operation_type !== 'Доход') state.Cash[1].CASH -= +summa

    if (operation_type === 'Поступление') {
      if (type === 5) state.Cash[0] ? state.Cash[0].CASH += +summa : state.Cash.push({ CASH: +summa })
      if (type === 6) state.Cash[1] ? state.Cash[1].CASH += +summa : state.Cash.push({ CASH: +summa })
    } else if (type === 27) {
      if (user_name === 5) state.Cash[0] ? state.Cash[0].CASH += +summa : state.Cash.push({ CASH: +summa })
      if (user_name === 6) state.Cash[1] ? state.Cash[1].CASH += +summa : state.Cash.push({ CASH: +summa })
    } else {
      if (type === 9 || type === 10) return
      row = state.Salary.find(item => item.USER === user_name && item.PERIOD === +period && item.YEAR === +year)
      if (row && (operation_type === 'Расход')) {
        row.Paid += +summa
        row.Debt -= +summa
      } else if (row && operation_type === 'Доход') {
        row.Total += +summa
        row.Debt += +summa
        row.Final = finalIncome || null
      } else {
        state.Salary.push({
          Debt: +summa,
          PERIOD: period,
          YEAR: year,
          USER: user_name,
          Paid: 0,
          Total: +summa,
          Final: finalIncome || null
        })
      }
    }
  },
  DELETE_FINANCE_INFO: (state, payload) => {
    const parent = state.History.find(item => item.ID === payload.id)
    const idx_parent = state.History.indexOf(parent)
    state.History.splice(idx_parent, 1)

    const child = state.History.find(item => item.PARENT_ID === payload.id)
    if (child) {
      const idx_child = state.History.indexOf(child)
      state.History.splice(idx_child, 1)
    }
  }
}

const actions = {
  getSalary({ commit }, payload) {
    return new Promise((resolve) => {
      getSalary(payload).then(response => {
        commit('SALARY', response)
        resolve(response)
      })
    })
  },
  getDetailedSalary({ commit }) {
    return new Promise((resolve) => {
      getDetailedSalary().then(response => {
        commit('DETAILED_SALARY', response)
        resolve(response)
      })
    })
  },
  getCash({ commit }) {
    return new Promise((resolve) => {
      getCash().then(response => {
        commit('CASH', response)
        resolve(response)
      })
    })
  },
  getHistory({ commit }) {
    return new Promise((resolve) => {
      getHistory().then(response => {
        commit('HISTORY', response)
        resolve(response)
      })
    })
  },
  getFinanceTypes({ commit }) {
    return new Promise((resolve) => {
      getFinanceTypes().then(response => {
        commit('FINANCE_TYPES', response)
        resolve(response)
      })
    })
  },
  getEmployeeSalary({ commit }, payload) {
    return new Promise((resolve) => {
      getEmployeeSalary(payload).then(response => {
        commit('EMPLOYEE_SALARY', response)
        resolve(response)
      })
    })
  },
  getEmployeeSalaryDetail({ commit }, payload) {
    return new Promise((resolve) => {
      getEmployeeSalaryDetail(payload).then(response => {
        commit('EMPLOYEE_SALARY_DETAIL', response)
        resolve(response)
      })
    })
  },
  getIncomeDetail({ commit }, payload) {
    return new Promise((resolve) => {
      getIncomeDetail(payload).then(response => {
        commit('INCOME_DETAIL', response)
        resolve(response)
      })
    })
  },
  getIncomeCashDetail({ commit }, payload) {
    return new Promise((resolve) => {
      getIncomeCashDetail(payload).then(response => {
        commit('INCOME_CASH_DETAIL', response)
        resolve(response)
      })
    })
  },
  addFinanceInfo({ commit }, payload) {
    return new Promise((resolve, reject) => {
      addFinanceInfo(payload)
        .then(response => {
          commit('ADD_FINANCE_INFO', payload)
          resolve(response)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  deleteFinanceInfo({ commit }, payload) {
    return new Promise((resolve, reject) => {
      deleteFinanceInfo(payload)
        .then(() => {
          commit('DELETE_FINANCE_INFO', payload)
          setTimeout(() => {
            resolve()
          }, 1000)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  excelToDB(_, payload) {
    return new Promise((resolve, reject) => {
      console.log(payload)
      excelToDB(payload)
        .then(response => {
          resolve(response)
        })
        .catch(err => {
          reject(err)
        })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
