import request from '@/utils/request'

export function getAll(params) {
  return request({

    url: '/client/contracts',
    method: 'get',
    params

  })
}

export function getByClientId(data) {
  return request({

    url: '/client/contracts/getByClientId',
    method: 'post',
    data

  })
}
