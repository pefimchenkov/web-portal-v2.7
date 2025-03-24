import request from '@/utils/request'

export function getJiraActiveUsers(params) {
  return request({
    url: '/statistics/jira/users/active',
    method: 'get',
    params
  })
}
