function rangeDateFilter(value, filterData) {
  const date = new Date(value)

  const formatted = `${date.getFullYear()}-${(date.getMonth() + 1) < 10
    ? '0' + (date.getMonth() + 1)
    : (date.getMonth() + 1)}-${date.getDate() < 10
    ? '0' + date.getDate()
    : date.getDate()}`

  const time = Math.round(new Date(formatted).getTime() / 1000.0)

  return Math.min(...filterData) === Math.max(...filterData) || filterData.length < 2
    ? time === Math.min(...filterData) || time === Math.max(...filterData)
    : (time >= Math.min(...filterData) && time <= Math.max(...filterData))
}

export { rangeDateFilter }
