import request from '@/utils/request'

export function getTotals(params) {
  return request({

    url: '/finances/get_totals',
    method: 'get',
    params

  })
}


