import request from '@/utils/request'

export function createRequest(data) {
  return request({
    url: '/jira/api/create_request',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data',
      'X-Atlassian-Token': 'no-check'
    },
    data
  })
}
export function getScreenFields(data) {
  return request({
    url: '/jira/api/get_screen_fields',
    method: 'post',
    headers: {
      'X-Atlassian-Token': 'no-check'
    },
    data
  })
}
export function getCrmData(data) {
  return request({
    url: '/jira/api/get_crm_data',
    method: 'post',
    data
  })
}
export function setCrmSubscribe(data) {
  return request({
    url: '/jira/api/set_crm_subscribe',
    method: 'post',
    headers: {
      'X-Atlassian-Token': 'no-check'
    },
    data
  })
}
export function activateCrm(data) {
  return request({
    url: '/jira/api/activate_crm',
    method: 'post',
    headers: {
      'X-Atlassian-Token': 'no-check'
    },
    data
  })
}

export function deactivateCrm(data) {
  return request({
    url: '/jira/api/deactivate_crm',
    method: 'post',
    headers: {
      'X-Atlassian-Token': 'no-check'
    },
    data
  })
}

