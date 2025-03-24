import request from '@/utils/request_b2b.js'

export function getTreolan(data) {

  return request({
    url: 'automations/treolan/data',
    method: 'post',
    timeout: 60000,
    data
  })
}
