import request from '@/utils/request'

export function getAll(params) {
  return request({
    url: `models/engineers`,
    method: 'get',
    params
  })
}

export function getAllByModel(data) {
  return request({
    url: `models/model/engineers`,
    method: 'post',
    data
  })
}

export function addOne(data) {
  return request({
    url: 'models/engineers/add',
    method: 'post',
    data
  })
}

export function updateOne(data) {
  return request({
    url: 'models/engineers/update',
    method: 'post',
    data
  })
}

export function deleteOne(data) {
  return request({
    url: 'models/engineers/delete',
    method: 'post',
    data
  })
}

