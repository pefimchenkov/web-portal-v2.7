import request from '@/utils/request'

export function getAll(params) {
  return request({
    url: `models/types`,
    method: 'get',
    params
  })
}

export function addOne(data) {
  return request({
    url: 'models/types/add',
    method: 'post',
    data
  })
}

export function updateOne(data) {
  return request({
    url: 'models/types/update',
    method: 'put',
    data
  })
}

export function deleteOne(data) {
  return request({
    url: 'models/types/delete',
    method: 'delete',
    data
  })
}

export function getCustomData(data) {
  const { method, path = '' } = data
  return request({
    url: `models/types/${path ? (path + '/' + method) : method}`,
    method: 'post',
    data
  })
}

