import { jira_jql } from '@/settings.js'
export {
  getMinimunBalance,
  getTotalSklad,
  getCurrentNeed,
  getRemonts,
  getClients,
  getSumPriceNeed,
  getBalancePercent,
  getToOrder,
  getTotal,
  getCommonToOrder,
  getCommonCurrentNeed,
  getBalancePerMonth,
  clearFiltersInLocalStorage
}

/** Расход в месяц */
function getBalancePerMonth(obj, period = 12) {
  return Math.round(obj.Q / period)
}


/** Неснижаемый остаток */
function getMinimunBalance(item, period = 12) {
  return Math.round((item?.Q / period) * 2)
}

/** Процент остатка */
function getBalancePercent(item) {
  const sklad = getTotalSklad(item)
  const balance = getMinimunBalance(item)
  const percent = (typeof sklad === 'number' && sklad > 0) && (typeof balance === 'number' && balance > 0)
    ? sklad / balance * 100
    : 0
  return {
    data: `${percent.toFixed(1) + '%'}`,
    color: percent < 100 ? 'red' : 'green'
  }
}

/** Необходимо заказать */
function getToOrder(obj) {
  return Math.sign(getMinimunBalance(obj) - Number(getTotalSklad(obj))) === 1
    ? getMinimunBalance(obj) - Number(getTotalSklad(obj))
    : 0
}

/**  Необходимо заказать Всего */
function getCommonToOrder(obj, data) {
  if (!data.length) return getToOrder(obj)
  const count = data.find(i => i.id === obj.Zip_ID)?.qty
  return count || 0
}


function getSumPriceNeed(obj, currentNeed, commonToOrder) {
  return obj.Price * (getCommonCurrentNeed(obj, currentNeed).data + getCommonToOrder(obj, commonToOrder))
}

function getTotal(obj, currentNeed, commonToOrder) {
  return (getCommonCurrentNeed(obj, currentNeed).data + getCommonToOrder(obj, commonToOrder))
}


/*  ================= */

function getTotalSklad(item) {
  const total = item?.QtyA + item?.QtyT + item?.QtyZ
  return (isNaN(total) || !total || total === undefined)
    ? 0
    : total
}

/** Текущая потребность */
function getCommonCurrentNeed(item, totalCurrentNeed) {

  const zip = totalCurrentNeed?.find(i => i.ZIP_id === item.Zip_ID)?.Waitq
  const data = -Number((getTotalSklad(item)) - (zip || 0))
  const color = Number(((getTotalSklad(item)) / (zip || 0))).toFixed(1)

  return {
      data: (isNaN(data) || !data || Math.sign(data) === -1) ? 0 : data,
      color: () => {
        if (color >= 0 && color < 0.5) return 'color: darkred; font-weight: bold'
        if (color >= 0.5 && color < 1) return 'color: red'
        if (color >= 1) return 'color: green'
      }
    }
}

function getCurrentNeed(item, currentNeed) {

  const zip = currentNeed?.find(i => i.ZIP_id === item.Zip_ID)?.Waitq
  const data = -Number((getTotalSklad(item)) - (zip || 0))
  const color = Number(((getTotalSklad(item)) / (zip || 0))).toFixed(1)

  return {
    data: (isNaN(data) || !data || Math.sign(data) === -1) ? 0 : data,
    color: () => {
      if (color >= 0 && color < 0.5) return 'color: darkred; font-weight: bold'
      if (color >= 0.5 && color < 1) return 'color: red'
      if (color >= 1) return 'color: green'
    }
  }
}

function getRemonts(item, currentNeed) {
  const remonts = currentNeed?.find(i => i.ZIP_id === item.Zip_ID)?.Remonts
  if (remonts) return `${jira_jql}id in (${remonts})`
}

function getClients(item, currentNeed) {
  const clients = currentNeed?.find(i => i.ZIP_id === item.Zip_ID)?.Clients
  if (clients) return clients
}


/** Очищаем customrange фильтры в localstorage  */

function clearFiltersInLocalStorage(reference, columnsName) {
  const fromLocalStorage = JSON.parse(localStorage.getItem(reference))

  if (fromLocalStorage) {
    Object.keys(fromLocalStorage).forEach(key => {
      if (columnsName.includes(key)) fromLocalStorage[key] = []
    })
    localStorage.setItem(reference, JSON.stringify(fromLocalStorage))
  }
}

