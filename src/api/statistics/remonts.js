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

export function getClosedPresales(params) {
  return request({
    url: '/statistics/remonts/closed_presales',
    method: 'get',
    params
  })
}

export function getClosedAcceptance(params) {
  return request({
    url: '/statistics/remonts/closed_acceptance',
    method: 'get',
    params
  })
}

export function getClosedDelivery(params) {
  return request({
    url: '/statistics/remonts/closed_delivery',
    method: 'get',
    params
  })
}

export function getClosedTemporaryUsed(params) {
  return request({
    url: '/statistics/remonts/closed_temporary_used',
    method: 'get',
    params
  })
}

export function getClosedIssuance(params) {
  return request({
    url: '/statistics/remonts/closed_issuance',
    method: 'get',
    params
  })
}

export function getClosedNoms(params) {
  return request({
    url: '/statistics/remonts/closed_noms',
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
