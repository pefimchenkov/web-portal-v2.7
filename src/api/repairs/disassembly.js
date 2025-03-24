import request from '@/utils/request'

export function createDisassembly(data) {
  return request({
    url: '/repairs/disassembly/create',
    method: 'post',
    data
  })
}

export function createAssembly(data) {
  return request({
    url: '/repairs/assembly/create',
    method: 'post',
    data
  })
}

export function getStats(params) {
  return request({
    url: '/repairs/disassembly/stats/get',
    method: 'get',
    params
  })
}
export function getStatsParts(data) {
  return request({
    url: '/repairs/disassembly/stats/get_parts',
    method: 'post',
    data
  })
}
export function setStats(data) {
  return request({
    url: '/repairs/disassembly/stats/set',
    method: 'post',
    data
  })
}
