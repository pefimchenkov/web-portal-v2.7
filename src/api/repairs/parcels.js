import request from '@/utils/request'

export function get(params) {
  return request({
    url: '/repairs/parcels',
    method: 'get',
    params
  })
}
export function getRepairsByParcel(data) {
  return request({
    url: '/repairs/parcels/repairs_by_parcel',
    method: 'post',
    data
  })
}
export function getAllRepairs(data) {
  return request({
    url: '/repairs/parcels/all_repairs',
    method: 'post',
    data
  })
}
export function getUsedParts(data) {
  return request({
    url: '/repairs/parcels/used_parts',
    method: 'post',
    data
  })
}
export function getParcelData(data) {
  return request({
    url: '/repairs/parcels/parcel',
    method: 'post',
    data
  })
}
export function divideParcel(data) {
  return request({
    url: '/repairs/parcels/divide_parcel',
    method: 'post',
    data
  })
}
