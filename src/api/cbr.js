import request from '@/utils/request'

export function getHistoricalRates(data) {
  return request({
    url: '/api/cbr/historical/rates',
    method: 'post',
    data
  })
}