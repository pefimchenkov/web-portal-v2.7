import request from '@/utils/request'

export function get(params) {
  return request({

    url: '/market/parts',
    method: 'get',
    params

  })
}
export function add(data) {
  return request({

    url: '/market/parts',
    method: 'post',
    data

  })
}
export function remove(data) {
  return request({

    url: '/market/parts',
    method: 'delete',
    data

  })
}
export function approve(data) {
  return request({

    url: '/market/parts/approve',
    method: 'post',
    data

  })
}
export function disapprove(data) {
  return request({

    url: '/market/parts/disapprove',
    method: 'post',
    data

  })
}
export function donors(params) {
  return request({

    url: '/market/parts/donors',
    method: 'get',
    params

  })
}
export function get_percents(params) {
  return request({

    url: '/parts/percents',
    method: 'get',
    params

  })
}
export function add_percents(data) {
  return request({

    url: '/market/parts/percents',
    method: 'post',
    data

  })
}
export function remove_percents(data) {
  return request({

    url: '/market/parts/percents',
    method: 'delete',
    data

  })
}

