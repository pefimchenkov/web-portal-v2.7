import request from '@/utils/request_1C'

export function getDataFrom1C() {
  return request({
    method: 'get'
  })
}
