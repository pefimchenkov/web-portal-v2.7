import request from '@/utils/request'

export function getUsers(params) {
  return request({
    url: '/fb/get_users',
    method: 'get',
    params
  })
}
export function getSelectedUserData(data) {
  return request({
    url: '/fb/get_selected_user_data',
    method: 'post',
    data
  })
}
export function saveUserRoles(data) {
  return request({
    url: '/fb/save_user_roles',
    method: 'post',
    data
  })
}
