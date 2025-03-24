import request from '@/utils/request'

export function getAll(params) {
  return request({
    url: '/clients',
    method: 'get',
    params
  })
}

export function getLinked(params) {
  return request({
    url: '/clients/linked',
    method: 'get',
    params
  })
}

export function addOne(data) {
  return request({
    url: '/client/add',
    method: 'post',
    data
  })
}

export function updateOne(data) {
  return request({
    url: '/client/update',
    method: 'post',
    data
  })
}

export function deleteOne(data) {
  return request({
    url: '/client/delete',
    method: 'post',
    data
  })
}

