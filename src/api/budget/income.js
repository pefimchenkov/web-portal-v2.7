import request from '@/utils/request'

export function get(params) {
  return request({

    url: '/budget/income',
    method: 'get',
    params

  })
}
export function getBillShips(data) {
  return request({

    url: '/budget/income/get_bill_ships',
    method: 'post',
    data

  })
}

export function getOrders(params) {
  return request({

    url: '/budget/income/orders',
    method: 'get',
    params

  })
}

export function getManualBills(params) {
  return request({

    url: '/budget/income/get_manual_bills',
    method: 'get',
    params

  })
}

export function setManualBills(data) {
  return request({

    url: '/budget/income/set_manual_bills',
    method: 'post',
    data

  })
}

export function removeManualBills(data) {
  return request({

    url: '/budget/income/remove_manual_bills',
    method: 'post',
    data

  })
}

export function setSaleDate(data) {
  return request({

    url: '/budget/income/set_sale_date',
    method: 'post',
    data

  })
}

export function setPayDate(data) {
  return request({

    url: '/budget/income/set_pay_date',
    method: 'post',
    data

  })
}

export function setPaySum(data) {
  return request({

    url: '/budget/income/set_pay_sum',
    method: 'post',
    data

  })
}

export function setActive(data) {
  return request({

    url: '/budget/income/set_active',
    method: 'post',
    data

  })
}




/* ************************************************** */



export function getManualSales(params) {
  return request({

    url: '/budget/income/get_manual_sales',
    method: 'get',
    params

  })
}

export function setManualSale(data) {
  return request({

    url: '/budget/income/set_manual_sale',
    method: 'post',
    data

  })
}

export function setProfit(data) {
  return request({

    url: '/budget/income/set_profit',
    method: 'post',
    data

  })
}

export function setOmPercent(data) {
  return request({

    url: '/budget/income/set_om_percent',
    method: 'post',
    data

  })
}

export function setSmPercent(data) {
  return request({

    url: '/budget/income/set_sm_percent',
    method: 'post',
    data

  })
}

export function setSm(data) {
  return request({

    url: '/budget/income/set_sm',
    method: 'post',
    data

  })
}

export function setEngineer(data) {
  return request({

    url: '/budget/income/set_engineer',
    method: 'post',
    data

  })
}

export function setOm(data) {
  return request({

    url: '/budget/income/set_om',
    method: 'post',
    data

  })
}

export function setProject(data) {
  return request({

    url: '/budget/income/set_project',
    method: 'post',
    data

  })
}

export function removeManualSale(data) {
  return request({

    url: '/budget/income/remove_manual_sale',
    method: 'post',
    data

  })
}

export function updateBuh(data) {
  return request({

    url: '/budget/income/update_buh',
    method: 'put',
    data

  })
}

/* ***************************** */

export function getDataFromCrm(params) {
  return request({

    url: '/budget/income/get_data_from_crm',
    method: 'get',
    params

  })
}
