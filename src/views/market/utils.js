import { elementTypes } from './data.js'

export function calcStockPrice(data) {
  const { K1, marketPRICE, CUR: { rate = 1 }} = data
  return K1 * marketPRICE * rate
}
export function calcClientPrice(data) {
  const { K2, marketPRICE, CUR: { rate = 1 }} = data
  return K2 * marketPRICE * rate
}
export function calcPartnerPrice(data) {
  const { K2, marketPRICE, CUR: { rate = 1 }} = data
  return K2 * marketPRICE * rate * 0.9
}
export function calcOptPrice(data) {
  const { K2, marketPRICE, CUR: { rate = 1 }} = data
  return K2 * marketPRICE * rate * 0.8
}

export function getElementType(id) {
  return elementTypes.find(i => i.id === id)?.name
}

export function isPartsInElement(count) {
  return count > 0
    ? 'есть'
    : 'нет'
}

export function setTHInElement(row, data) {
  if (!data.length) return
  const ids = data.find(i => i.zip === row.marketid)?.ids
  return Array.isArray(ids) && ids.length
    ? ids.join(', ')
    : null
}

export function showElementTypeDialogItems(data, value) {
  if (!value) {
    const elementNames = elementTypes.map(i => i.name)
    data.forEach(item => {
      if (elementNames.includes(item.label)) {
        item.visible = false
      }
    })
    return
  }

  const visibleDialogItem = data.find(i => i.label === value.name)
  const elementForInvisible = elementTypes.filter(i => i.name !== visibleDialogItem.label)
  const invisibleDialogItem = data.find(i => i.label === elementForInvisible[0].name)

  visibleDialogItem.visible = true
  invisibleDialogItem.visible = false
}

export function showSomeDialogItems(data, values) {
  data.forEach(i => {
    if (values.includes(i.value)) {
      i.visible = true
    }
  })
}

export function hideSomeDialogItems(data, values) {
  data.forEach(i => {
    if (values.includes(i.value)) {
      i.visible = false
    }
  })
}

export const validateArt = (rule, value, callback) => {
  if (!value) callback()
  else if (/^[ТКА\-0-9.]{8,11}$/.test(value)) callback()
  else callback('Т или КА кириллицей, дефис, от 1 до 8 цифр')
}
