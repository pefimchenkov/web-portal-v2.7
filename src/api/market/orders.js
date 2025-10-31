import request from '@/utils/request'

export function get(params) {
  return request({

    url: '/market/orders',
    method: 'get',
    params

  })
}
export function getParts(params) {
  return request({

    url: '/market/orders/parts',
    method: 'get',
    params

  })
}
export function getSales(params) {
  return request({

    url: '/market/orders/sales',
    method: 'get',
    params

  })
}
export function add(data) {
  return request({

    url: '/market/orders',
    method: 'post',
    data

  })
}
export function update(data) {
  return request({

    url: '/market/orders',
    method: 'put',
    data

  })
}
export function updateParts(data) {
  return request({

    url: '/market/orders/parts',
    method: 'put',
    data

  })
}





export function createSale(data) {
  return request({

    url: '/market/orders/sale',
    method: 'post',
    data

  })
}
export function linkSale(data) {
  return request({

    url: '/market/orders/sale',
    method: 'put',
    data

  })
}
export function unlinkSale(data) {
  return request({

    url: '/market/orders/sale',
    method: 'delete',
    data

  })
}
export function remove(data) {
  return request({

    url: '/market/orders',
    method: 'delete',
    data

  })
}


export function createPurchase(data) {
  return request({

    url: '/market/orders/purchase',
    method: 'post',
    data

  })
}
export function linkPurchase(data) {
  return request({

    url: '/market/orders/purchase',
    method: 'put',
    data

  })
}
export function unlinkPurchase(data) {
  return request({

    url: '/market/orders/purchase',
    method: 'delete',
    data

  })
}
