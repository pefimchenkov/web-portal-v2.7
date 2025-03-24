import { priceTypes, firms } from './data.js'

export function getFirmNameById(id) {
  return firms.find(i => i.id === id)?.name
}
export function getPriceTypeNameById(id) {
  return priceTypes[id - 1]
}
