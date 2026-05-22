import request from '@/utils/request'

export function update(data) {
  return request({

    url: '/market/warehouse/abs/update',
    method: 'post',
    data

  })
}

export function getInfo(data) {
  return request({

    url: '/market/warehouse/abs/getinfo',
    method: 'post',
    data

  })
}

export function sendRequest(data) {
  return request({

    url: '/market/warehouse/abs/sendrequest',
    method: 'post',
    data

  })
}