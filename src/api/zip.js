import request from '@/utils/request'

export function getZip(params) {
  return request({
    url: '/zip',
    method: 'get',
    params
  })
}
export function addOne(data) {
  return request({
    url: '/zip/add',
    method: 'post',
    data
  })
}

export function updateOne(data) {
  return request({
    url: '/zip/update',
    method: 'post',
    data
  })
}

export function deleteOne(data) {
  return request({
    url: '/zip/delete',
    method: 'post',
    data
  })
}

export function uploadData(url, data) {
  return request({
    url: url,
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
export function excelToDB(url, data) {
  return request({
    url: url,
    method: 'post',
    data
  })
}

