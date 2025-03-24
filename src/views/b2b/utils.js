export function createTableHeadersFromResponse(data) {
  if (!Array.isArray(data) || !data.length) return

  const headers = []
  let row = typeof data[1] !== 'object'
    ? data[data.length - 1]
    : data[1]
  const keys = Object.keys(row)
  keys.forEach(key => {
    headers.push(
      { text: key, value: key, sortable: true }
    )
  })
  return headers
}

export function getArrayOfArticuls(data) {
  return data.split(/[ , \n]+/).filter(i => i)
}

export function xformPayloadForMarvel(arr) {

  const data = arr.map(item => {
    return { 'ItemId': item }
  })
  const res = { 'WareItem': data }
  const encoded = encodeURI(JSON.stringify(res))
  return encoded
}

export function xformPayloadForTreolan(arr) {
  return arr.join(' || ')
}

export function firmSpanMethod({ columnIndex, rowIndex }) {
  if (columnIndex === 0) {
    if (rowIndex % 3 === 0) {
      return {
        rowspan: 3,
        colspan: 1
      }
    } else {
      return {
        rowspan: 0,
        colspan: 0
      }
    }
  }
}