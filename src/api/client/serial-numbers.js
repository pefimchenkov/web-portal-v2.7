import request from '@/utils/request'

export function getAll(params) {
  return request({

    url: '/client/sn',
    method: 'get',
    params

  })
}

export function getByClientId(data) {
  return request({

    url: '/client/sn/id',
    method: 'post',
    data

  })
}

export function add(data) {
  return request({

    url: '/client/sn',
    method: 'post',
    data

  })
}

export function update(data) {
  return request({

    url: '/client/sn/id',
    method: 'put',
    data

  })
}

export function remove(data) {
  return request({

    url: '/client/sn/id',
    method: 'delete',
    data

  })
}

