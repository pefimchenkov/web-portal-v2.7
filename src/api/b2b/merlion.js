import request from '@/utils/request_b2b.js'

export function getMerlion(data) {
  return request({
    url: 'automations/merlion/data',
    method: 'post',
    data
  })
}
