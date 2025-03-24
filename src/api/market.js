import request from '@/utils/request'

export function get(params) {
  return request({
    url: '/market',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: '/market',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/market',
    method: 'put',
    data
  })
}

export function remove(data) {
  return request({
    url: '/market',
    method: 'delete',
    data
  })
}

export function checkInRemonts(data) {
  return request({
    url: '/market/check_in_remonts',
    method: 'post',
    data
  })
}

export function getMarketParts(data) {
  return request({
    url: '/market/get_market_parts',
    method: 'post',
    data
  })
}
