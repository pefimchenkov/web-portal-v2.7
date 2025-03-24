import request from '@/utils/request'

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


export function updateBuh(data) {
  return request({

    url: '/budget/pays/update_buh',
    method: 'put',
    data

  })
}


export function updateStroki(data) {
  return request({

    url: '/budget/pays/update_stroki',
    method: 'put',
    data

  })
}
