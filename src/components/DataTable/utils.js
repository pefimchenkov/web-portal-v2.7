export function createHeaders(headers) {
  if (headers.length) {
    return headers.reduce((acc, header) => {
      const data = {
        text: header.text,
        value: header.value,
        actions: header.actions,
        width: header.width || '',
        divider: true,
        visible: true,
        fixed: header.fixed,
        selected: false,
        align: header.align,
        sortable: header.sortable || false,
        maxRange: header.maxRange || null,
        formatter: header.formatter,
        filter: () => true
      }
      return acc.concat(data)
    }, [])
  } else return []
}

export function setRemoteCustomSort(a, b, prop, order) {
  const stringSort = (a, b, order) => {
    return order === 'descending'
      ? a === null ? -1 : b === null ? 1 : a.toString().localeCompare(b)
      : b === null ? -1 : a === null ? 1 : b.toString().localeCompare(a)
  }
  const numberSort = (a, b, order) => {
    if (a === b) return 0
    if (a === null) return 1
    if (b === null) return -1

    return order === 'descending'
        ? a < b ? -1 : 1
        : a < b ? 1 : -1
  }
  const objectSort = (a, b, prop, order) => {
    if (a === b) return 0
    if (a === null) return 1
    if (b === null) return -1

    return order === 'descending'
      ? a[prop] < b[prop] ? -1 : 1
      : a[prop] < b[prop] ? 1 : -1
  }

  if (typeof a[prop] === 'string') return stringSort(a[prop], b[prop], order)
  if (typeof a[prop] === 'number') return numberSort(a[prop], b[prop], order)
  if (typeof a[prop] === 'object') return objectSort(a[prop], b[prop], 'data', order)

}

export function createSelectOptionsFromTableData({ data, columns }) {
  const obj = {}

  for (const column of columns) {
    obj[column?.name] = [... new Set(data.map(item => {
      return typeof column?.formatter === 'function'
        ? (column?.formatter(item[column?.name]) || 'нет данных')
        : (item[column?.name] || 'нет данных')
    }))] // .filter(i => i)
  }
  
  return obj
}



export function createSelectOptionsFromSpecificData({ data, columns }) {
  const obj = {}
  for (const column of columns) {
    obj[column?.name] = [... new Set(data.map(item => {
      return typeof column?.formatter === 'function'
        ? column?.formatter(item[column?.prop])
        : item[column?.prop]
    }))]
  }
  return obj
}



export function headersToObject(headers) {
  return headers.reduce((prev, curr) => {
    const { value, text } = curr
    return { ...prev, [text]: value }
  }, {})
}



export function getSummariesRow(columns, data, props = []) {
  const sums = [];

  columns.forEach((column, index) => {
    if (index === 0) return (sums[index] = 'Итого:')
    if (!props.includes(column.property) && !props.find(item => item.name === column.property)) return

    const values = data.map(item => {
      const prop = props.find(item => item.name === column.property)

      if (typeof item[column.property] === 'string') {
        return prop && (item.currency === prop.currencyUSD || item.currency === prop.currencyEUR) && item.currencyRate
          ? Number(item[column.property]) * item.currencyRate
          : Number(item[column.property])
      }

      if (typeof item[column.property] === 'number') {
        return prop && (item.currency === prop.currencyUSD || item.currency === prop.currencyEUR) && item.currencyRate
          ? item[column.property] * item.currencyRate
          : item[column.property]
      }

      if (Array.isArray(item[column.property])) {
        const obj = props.find(prop => prop.name === column.property);
        return item[column.property]
          .map(i => i[obj.value])
          .reduce((a, b) => { return a + b }, 0)
      }
    })

    if (!values.every(value => isNaN(value))) {
      sums[index] = values.reduce((prev, curr) => {
        const value = Number(curr)
        if (!isNaN(value)) return prev + curr
        else return prev
      }, 0).toLocaleString('ru', { style: 'currency', currency: 'RUB' })
    } else {
      sums[index] = null
    }
  })

  return sums
}



export function filterForInput(value, search) {

  if (!search) return true
  if (!value) return false

  /* костыль для адресов склада Атласа */
  if (Array.isArray(value) && value[0] && Object.hasOwn(value[0], 'adress')) {
    return (value[0].adress.toString()).toLowerCase().includes((search.toString()).toLowerCase())
  }

  if (typeof value === 'object' && ('data' in value || 'value' in value)) {
    if (!value.data && !value.value) return false
    return (value['data' || 'value'].toString()).toLowerCase().includes((search.toString()).toLowerCase())
  }
  return (value.toString()).toLowerCase().includes((search.toString()).toLowerCase())
}



export function filterForObjectInput(value, search) {
  if (!search) return true
  if (!Object.keys(value).length) return false
  return (value.data.toString()).toLowerCase().includes((search.toString()).toLowerCase())
}



export function filterForSelect(value, search, transformFunc = false) {
  if (!search) return true
  if (value === undefined) return false
  return transformFunc
    ? transformFunc(value) === search.toString()
    : value === search
}



export function filterForMultipleSelect(value, search) {
  if (Array.isArray(search) && !search.length) return true
  if (!value) return false
  return Array.isArray(search) ? search.includes(value) : true
}


export function filterForSwitch(value, search) {
  if (!search) return true
  if (!value) return false
  return search ? value : false
}



export function filterForDate(value, search) {
  if (!search) return true
  if (!value) return false

  const searchPlusThreeOurs = search.map(i => i + 10800000)
  const date = new Date(value)

  const time = Math.round(new Date(date).getTime())
  return (time >= searchPlusThreeOurs[0] && time <= searchPlusThreeOurs[1])
}


export function filterForCustomRange(value, search) {
  if (!search || !search.length || (!search[0] && !search[1])) return true
  if (!value) return false
  if (search[0] && !search[1]) return value.data >= search[0]
  if (!search[0] && search[1]) return value.data <= search[1]
  else return (value.data >= search[0] && value.data <= search[1])
}
