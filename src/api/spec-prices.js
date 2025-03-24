import request from '@/utils/request'

// на сервере запросы ловит файл routes/specprices.js //

export function getNds(data) {
  return request({
    url: '/specprices/nds',
    method: 'post',
    data
  })
}

export function getModels(data) {
  return request({
    url: '/specprices/models',
    method: 'post',
    data
  })
}

export function add(data) {
  return request({
    url: '/specprices',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/specprices',
    method: 'put',
    data
  })
}

export function remove(data) {
  return request({
    url: '/specprices',
    method: 'delete',
    data
  })
}
