import request from '@/utils/request'

export function getIncomesProjects(params) {
  return request({

    url: '/budget/plans/incomes/projects',
    method: 'get',
    params

  })
}
export function getIncomesClients(params) {
  return request({

    url: '/budget/plans/incomes/clients',
    method: 'get',
    params

  })
}
