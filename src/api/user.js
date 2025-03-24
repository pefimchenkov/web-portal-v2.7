import request from '@/utils/request'

// user from fb database //

export function getUserByEmail(data) {
  return request({
    url: '/fb/get_user_by_email',
    method: 'post',
    data
  })
}

// -------------------- //
export function getBonusSale(params) {
  return request({
    url: '/user/bonus_sale',
    method: 'get',
    params
  })
}
export function getBonusSaleSum(data) {
  return request({
    url: '/user/bonus_sale_sum',
    method: 'post',
    data
  })
}
export function getBonusProfit(params) {
  return request({
    url: '/user/bonus_profit',
    method: 'get',
    params
  })
}
export function getBonusProfitSC(data) {
  return request({
    url: '/user/bonus_profit_sc',
    method: 'post',
    data
  })
}
export function getBonusProfitSCSum(data) {
  return request({
    url: '/user/bonus_profit_sc_sum',
    method: 'post',
    data
  })
}
export function getBonusProfitSum(data) {
  return request({
    url: '/user/bonus_profit_sum',
    method: 'post',
    data
  })
}
export function getUsersWithBonus(params) {
  return request({
    url: '/user/users_with_bonus',
    method: 'get',
    params
  })
}
export function usersForChartSale(params) {
  return request({
    url: '/user/users_for_chart_sale',
    method: 'get',
    params
  })
}
export function usersForChartProfit(params) {
  return request({
    url: '/user/users_for_chart_profit',
    method: 'get',
    params
  })
}
export function dataForChartSale(data) {
  return request({
    url: '/user/data_for_chart_sale',
    method: 'post',
    data
  })
}
export function dataForChartProfit(data) {
  return request({
    url: '/user/data_for_chart_profit',
    method: 'post',
    data
  })
}
export function dataForChartProfitSC(data) {
  return request({
    url: '/user/data_for_chart_profit_sc',
    method: 'post',
    data
  })
}
