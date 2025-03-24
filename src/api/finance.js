import request from '@/utils/request'

export function getSalary(data) {
  return request({
    url: '/user/finance/get_salary',
    method: 'post',
    data
  })
}
export function getDetailedSalary(params) {
  return request({
    url: '/user/finance/get_detailed_salary',
    method: 'get',
    params
  })
}
export function getCash(params) {
  return request({
    url: '/user/finance/get_cash',
    method: 'get',
    params
  })
}
export function getSaldo(params) {
  return request({
    url: '/user/finance/get_saldo',
    method: 'get',
    params
  })
}
export function getCashDetails(params) {
  return request({
    url: '/user/finance/get_cash_details',
    method: 'get',
    params
  })
}
export function getEmployeeSalary(data) {
  return request({
    url: '/user/finance/get_employee_salary',
    method: 'post',
    data
  })
}
export function getEmployeeSalaryDetail(data) {
  return request({
    url: '/user/finance/get_employee_salary_detail',
    method: 'post',
    data
  })
}
export function getIncomeDetail(data) {
  return request({
    url: '/user/finance/get_income_detail',
    method: 'post',
    data
  })
}
export function getIncomeCashDetail(data) {
  return request({
    url: '/user/finance/get_income_cash_detail',
    method: 'post',
    data
  })
}
export function getCostItems(params) {
  return request({
    url: '/user/finance/get_cost_items',
    method: 'get',
    params
  })
}
export function getHistory(params) {
  return request({
    url: '/user/finance/get_history',
    method: 'get',
    params
  })
}
export function getFinanceTypes(params) {
  return request({
    url: '/user/finance/get_finance_types',
    method: 'get',
    params
  })
}
export function addFinanceInfo(data) {
  return request({
    url: '/user/finance/add_finance_info',
    method: 'post',
    data
  })
}
export function deleteFinanceInfo(data) {
  return request({
    url: '/user/finance/delete_finance_info',
    method: 'post',
    data
  })
}
export function excelToDB(data) {
  return request({
    url: '/user/finance/excel_to_db',
    method: 'post',
    data
  })
}
