import request from '@/utils/request'

export function getWithBills(params) {
  return request({
    url: '/deals/get_with_bills',
    method: 'get',
    params
  })
}
