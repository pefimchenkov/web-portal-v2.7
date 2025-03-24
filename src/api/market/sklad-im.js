import request from '@/utils/request'

export function update(data) {
  return request({

    url: '/market/warehouse/im/update',
    method: 'post',
    data

  })
}

export function getInfo(data) {
  return request({

    url: '/market/warehouse/im/getinfo',
    method: 'post',
    data

  })
}

export function sendRequest(data) {
  return request({

    url: '/market/warehouse/im/sendrequest',
    method: 'post',
    data

  })
}