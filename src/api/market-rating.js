import request from '@/utils/request'

export function get(params) {
  return request({

    url: '/market/rating',
    method: 'get',
    params

  })
}
export function add(data) {
  return request({

    url: '/market/rating',
    method: 'post',
    data

  })
}
export function remove(data) {
  return request({

    url: '/market/rating',
    method: 'delete',
    data

  })
}
