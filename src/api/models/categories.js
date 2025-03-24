import request from '@/utils/request'

export function getAll(params) {
  return request({
    url: `models/categories`,
    method: 'get',
    params
  })
}

export function addOne(data) {
  return request({
    url: 'models/categories/add',
    method: 'post',
    data
  })
}

export function updateOne(data) {
  return request({
    url: 'models/categories/update',
    method: 'post',
    data
  })
}

export function deleteOne(data) {
  return request({
    url: 'models/categories/delete',
    method: 'post',
    data
  })
}

export function getCustomData(data) {
  const { method, path = '' } = data
  return request({
    url: `models/categories/${path ? (path + '/' + method) : method}`,
    method: 'post',
    data
  })
}

