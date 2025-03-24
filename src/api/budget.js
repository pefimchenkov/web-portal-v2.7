import request from '@/utils/request'

export function getCurrent(params) {
  return request({

    url: '/budget/current',
    method: 'get',
    params

  })
}
export function getPrevious(params) {
  return request({

    url: '/budget/previous',
    method: 'get',
    params

  })
}
export function getPays(params) {
  return request({

    url: '/budget/pays',
    method: 'get',
    params

  })
}
export function getPays1c(params) {
  return request({

    url: '/budget/pays/1c',
    method: 'get',
    params

  })
}
export function getPaysJira(params) {
  return request({

    url: '/budget/pays/jira',
    method: 'get',
    params

  })
}
export function getPaysChartExpense(data) {
  return request({

    url: '/budget/charts/pays/expense',
    method: 'post',
    data

  })
}
export function getPaysChartPayment(data) {
  return request({

    url: '/budget/charts/pays/payment',
    method: 'post',
    data

  })
}
