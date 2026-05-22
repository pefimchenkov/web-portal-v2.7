import request from '@/utils/request'

export function getAtlasGoods(params) {
  return request({

    url: '/api/1c/goods/get',
    method: 'get',
    params

  })
}

export function updateAtlasGoods(data) {
  return request({

    url: '/api/1c/goods/update',
    method: 'post',
    data

  })
}

export function getAtlasInvoice(params) {
  return request({

    url: '/api/1c/invoice/get',
    method: 'get',
    params

  })
}

export function postAtlasInvoice(data) {
  return request({

    url: '/api/1c/invoice/post',
    method: 'post',
    data

  })
}

export function getAtlasSales(params) {
  return request({

    url: '/api/1c/sales/get',
    method: 'get',
    params

  })
}

export function postAtlasSales(data) {
  return request({

    url: '/api/1c/sales/post',
    method: 'post',
    data

  })
}

export function getAtlasProjects(params) {
  return request({

    url: '/api/1c/projects/get',
    method: 'get',
    params

  })
}

export function getAtlasCfAnalitics(params) {
  return request({

    url: '/api/1c/cfanalitics/get',
    method: 'get',
    params

  })
}

export function getAccountBalances(data) {
  return request({

    url: '/api/1c/bankaccountbalances/get',
    method: 'post',
    data

  })
}

export function getDebtOffset(data) {
  return request({

    url: '/api/1c/debtoffset/get',
    method: 'post',
    data

  })
}

export function getAtlasWarehouses(params) {
  return request({

    url: '/api/1c/warehouses/get',
    method: 'get',
    params

  })
}

export function getAtlasContractors(params) {
  return request({

    url: '/api/1c/contractors/get',
    method: 'get',
    params

  })
}

export function getAtlasIncomingPayments(data) {
  return request({

    url: '/api/1c/payments/incoming',
    method: 'post',
    data

  })
}

export function getAtlasOutgoingPayments(data) {
  return request({

    url: '/api/1c/payments/outgoing',
    method: 'post',
    data

  })
}

export function getMovements(data) {
  return request({

    url: '/api/1c/movements/get',
    method: 'post',
    data

  })
}


///////////////////////////////
///////////////////////////////
///////////////////////////////



export function updateOutgoingPayments(data) {
  return request({

    url: '/api/1c/payments/outgoing/update',
    method: 'post',
    data

  })
}

export function createAssembly(data) {
  return request({

    url: '/repairs/assembly/create',
    method: 'post',
    data

  })
}

export function createDisassembly(data) {
  return request({

    url: '/repairs/disassembly/create',
    method: 'post',
    data

  })
}

export function createMovement(data) {
  return request({

    url: '/automations/movement/create',
    method: 'post',
    data

  })
}