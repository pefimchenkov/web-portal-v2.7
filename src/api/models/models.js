import request from '@/utils/request'

export function getAll(params) {
  return request({
    url: `/models`,
    method: 'get',
    params
  })
}

export function getCustomData(data) {
  const { method, path = '' } = data
  return request({
    url: `/models/${path ? (path + '/' + method) : method}`,
    method: 'post',
    data
  })
}

export function addOne(data) {
  return request({
    url: '/models/add',
    method: 'post',
    data
  })
}

export function updateOne(data) {
  return request({
    url: '/models/update',
    method: 'put',
    data
  })
}

export function deleteOne(data) {
  return request({
    url: '/models/delete',
    method: 'delete',
    data
  })
}

