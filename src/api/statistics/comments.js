import request from '@/utils/request'

export function getCurrentCreatedComments(params) {
  return request({
    url: '/statistics/comments/created/current',
    method: 'get',
    params
  })
}
