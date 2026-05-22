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

export function getPurchases(params) {
  return request({

    url: '/market/orders/purchases',
    method: 'get',
    params

  })
}

export function getClientTasks(data) {
  return request({ 

    url: '/market/orders/client_tasks',
    method: 'post',
    data

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


export function createPurchase(data) {
  return request({

    url: '/market/orders/purchase',
    method: 'post',
    data

  })
}


/* ************ */

export function linkOrder(data) {
  return request({

    url: '/market/orders/order',
    method: 'put',
    data

  })
}
export function unlinkOrder(data) {
  return request({

    url: '/market/orders/order',
    method: 'delete',
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


export function remove(data) {
  return request({

    url: '/market/orders',
    method: 'delete',
    data

  })
}