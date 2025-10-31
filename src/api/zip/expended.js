import request from '@/utils/request'

export function getExpendedZip(data) {
  return request({
    url: '/zip/expended',
    method: 'post',
    data
  })
}


export function getCurrentNeedForExpendedZip(data) {
  return request({
    url: '/zip/expended/current_need',
    method: 'post',
    data
  })
}


export function getFiltersForExpendedZip(params) {
  return request({
    url: '/zip/filters_for_expended',
    method: 'get',
    params
  })
}


export function insertSalesReportToDB(data) {
  return request({
    url: '/zip/expended/insert_sales_report',
    method: 'post',
    data
  })
}