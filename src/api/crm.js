import request from '@/utils/request'

export function getNoFactLegpers(params) {
  return request({
    url: '/crm/dictionaries/nofact_legpers',
    method: 'get',
    params
  })
}

export function getNoFactProjects(params) {
  return request({
    url: '/crm/dictionaries/nofact_projects',
    method: 'get',
    params
  })
}

export function getEditableCRM(id) {
  return request({
    url: '/client/crm/editable',
    method: 'get',
    params: { id }
  })
}
export function getReadonlyCRM(id) {
  return request({
    url: '/client/crm/readonly',
    method: 'get',
    params: { id }
  })
}
export function getLegPers(id) {
  return request({
    url: '/client/crm/legpers',
    method: 'get',
    params: { id }
  })
}
export function getClientsDomains(id) {
  return request({
    url: '/client/crm/clientsdomains',
    method: 'get',
    params: { id }
  })
}
export function getPercentCRM(params) {
  return request({
    url: '/client/crm/get_percent',
    method: 'get',
    params
  })
}
export function updateCurator(data) {
  return request({
    url: '/client/crm/curator',
    method: 'put',
    data
  })
}
export function updateManager(data) {
  return request({
    url: '/client/crm/manager',
    method: 'put',
    data
  })
}
export function updateSM(data) {
  return request({
    url: '/client/crm/sm',
    method: 'put',
    data
  })
}
export function updateLeadEng(data) {
  return request({
    url: '/client/crm/lead_eng',
    method: 'put',
    data
  })
}
export function updateBUH(data) {
  return request({
    url: '/client/crm/buh',
    method: 'put',
    data
  })
}
export function updateAIDC_SALE(data) {
  return request({
    url: '/client/crm/AIDC_SALE',
    method: 'put',
    data
  })
}
export function updateAIDC_SALE_ZIP(data) {
  return request({
    url: '/client/crm/AIDC_SALE_ZIP',
    method: 'put',
    data
  })
}
export function updateAIDC_SERV(data) {
  return request({
    url: '/client/crm/AIDC_SERV ',
    method: 'put',
    data
  })
}
export function updateIT(data) {
  return request({
    url: '/client/crm/IT',
    method: 'put',
    data
  })
}
export function activateCRM(data) {
  return request({
    url: '/client/crm/activate',
    method: 'put',
    data
  })
}
export function deactivateCRM(data) {
  return request({
    url: '/client/crm/deactivate',
    method: 'put',
    data
  })
}
export function addLegPers(payload) {
  return request({
    url: '/client/crm/add_legpers',
    method: 'post',
    data: payload
  })
}
export function updateLegPers(payload) {
  return request({
    url: '/client/crm/update_legpers',
    method: 'put',
    data: payload
  })
}
export function deleteLegPers(payload) {
  return request({
    url: '/client/crm/delete_legpers',
    method: 'delete',
    data: payload
  })
}
export function addDomains(payload) {
  return request({
    url: '/client/crm/add_domains',
    method: 'post',
    data: payload
  })
}
export function updateDomains(payload) {
  return request({
    url: '/client/crm/update_domains',
    method: 'put',
    data: payload
  })
}
export function deleteDomains(payload) {
  return request({
    url: '/client/crm/delete_domains',
    method: 'delete',
    data: payload
  })
}
export function setPercent(payload) {
  return request({
    url: '/client/crm/set_percent',
    method: 'put',
    data: payload
  })
}
export function setCustomPercent(payload) {
  return request({
    url: '/client/crm/set_custom_percent',
    method: 'put',
    data: payload
  })
}
export function deleteCustomPercent(payload) {
  return request({
    url: '/client/crm/delete_custom_percent',
    method: 'put',
    data: payload
  })
}

export function setDelay(payload) {
  return request({
    url: '/client/crm/set_delay',
    method: 'put',
    data: payload
  })
}

