import request from '@/utils/request'

/* ******************* */

export function getCreatedAtlasRemonts(params) {
  return request({
    url: '/statistics/remonts/created_atlas',
    method: 'get',
    params
  })
}
export function getCreatedOtherRemonts(params) {
  return request({
    url: '/statistics/remonts/created_other',
    method: 'get',
    params
  })
}


export function getResolvedAtlasRemonts(params) {
  return request({
    url: '/statistics/remonts/resolved_atlas',
    method: 'get',
    params
  })
}
export function getResolvedOtherRemonts(params) {
  return request({
    url: '/statistics/remonts/resolved_other',
    method: 'get',
    params
  })
}

/* ****************** */

export function getCurrentCreatedRemonts(params) {
  return request({
    url: '/statistics/remonts/created/current',
    method: 'get',
    params
  })
}
