import request from '@/utils/request'

export function getAll(params) {
  return request({
    url: `models/profiles`,
    method: 'get',
    params
  })
}

export function addOne(data) {
  return request({
    url: 'models/profiles/add',
    method: 'post',
    data
  })
}

export function updateOne(data) {
  return request({
    url: 'models/profiles/update',
    method: 'post',
    data
  })
}

export function deleteOne(data) {
  return request({
    url: 'models/profiles/delete',
    method: 'post',
    data
  })
}

export function getCustomData(data) {
  const { method, path = '' } = data
  return request({
    url: `models/profiles/${path ? (path + '/' + method) : method}`,
    method: 'post',
    data
  })
}

