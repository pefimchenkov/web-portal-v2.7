//import request from '@/utils/request'

import api from '@/services/api';

export function getZip(params) {
  return api({
    url: '/zip',
    method: 'get',
    params
  })
}
export function addOne(data) {
  return api({
    url: '/zip/add',
    method: 'post',
    data
  })
}

export function updateOne(data) {
  return api({
    url: '/zip/update',
    method: 'post',
    data
  })
}

export function deleteOne(data) {
  return api({
    url: '/zip/delete',
    method: 'post',
    data
  })
}

export function uploadData(url, data) {
  return api({
    url: url,
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
export function excelToDB(url, data) {
  return api({
    url: url,
    method: 'post',
    data
  })
}

