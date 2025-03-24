import request from '@/utils/request'

// export function getExpendedZipForTable(data) {
//   return request({
//     url: '/statistics/zip/expended/table',
//     method: 'post',
//     data
//   })
// }
export function getExpendedZipPerYear(params) {
  return request({
    url: '/statistics/zip/expended',
    method: 'get',
    params
  })
}
export function getExpendedZipPerYear2(params) {
  return request({
    url: '/statistics/zip/expended2',
    method: 'get',
    params
  })
}
