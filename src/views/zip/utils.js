
import { formatDate } from '../../services/helpers'
import { zipFields, marketFields } from './data.js'

const isDate = (_date) => {
  const _regExp = new RegExp('^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$')
  return _regExp.test(_date)
}


const setPhoto = (photo, data) => {
  photo.forEach(item => {
    data.find(row => {
      return +row.zipID === +item.id && (row.zipPHOTO = true)
    })
  })
}
const setDateFormat = (data) => {
  data.forEach(item => {
    if (item.zipdate) item.zipdate = formatDate(item.zipdate)
  })
}
const setImgSrc = (data, id) => {
  return data.find(img => +img.id === +id)?.url
}
const modelPlusName = (item) => {
  return item.MODEL + ' (' + item.ID + ')'
}
const gotoMarket = (router, id) => {
  return router.push({ path: `/market/list/#${id}` })
}
const idNameTypeArtPNModels = (item) => {
  return '(' + item.marketid + ') ' + '[' + item.marketART + ', ' + item.marketCOND + ', ' + item.marketSUPPLIER + '] ' + item.marketNAME + ' (' + item.marketPN + ') - ' + item.marketMODELS
}
const checkModels = (data, models) => {
  if (!data || !data?.length) return
  const arr = [...data]
  const lastItem = arr.pop()
  let checker = false

  arr.forEach(a => {
    if (typeof a !== 'object') checker = true
  })

  if (lastItem.MODEL) {
    const obj = models.filter(m => lastItem.MODEL === m.MODEL)
    if (obj.length && checker === false) return true
    else return false
  } else return
}
function showAllDialogItems(data) {
  data.forEach(i => {
    i.visible = true
  })
}
function showDialogItems(data, template) {
  data.forEach(i => {
    if (template.includes(i.value)) {
      i.visible = true
    }
  })
}
function hideDialogItems(data, template) {
  data.forEach(i => {
    if (template.includes(i.value)) {
      i.visible = false
    }
  })
}

function arrayDiff(a, b) {
  return [
    ...a.filter(x => !b.includes(x)),
    ...b.filter(x => !a.includes(x))
  ]
}

const validateArt = (rule, value, callback) => {
  if (!value) callback()
  else if (/^[ТКА\-0-9.]{8,11}$/.test(value)) callback()
  else callback('Т или КА кириллицей, дефис, от 1 до 8 цифр')
}

/* Валидируем оба блока данных, ЗИП - обязательно все поля, Маркет - либо всё заполнено, либо ничего */

function validateData(form) {
  // if (form['zipCLASS']?.id === 7) return true

  const entries = Object.entries(form)

  /* удаляем пустые данные формы */
  const idx = []
  entries.forEach((el, i) => {
    if ((Array.isArray(el[1]) && !el[1].length) || (el[1] === undefined || el[1] === null || el[1] === '')) {
      idx.push(i)
    }
  })
  idx.forEach(i => delete entries[i])
  /* -------------------------- */

  const keys = entries.map(i => i[0])

  /* забираем поля формы, которые присутствуют в общем списке полей ЗИП */
  const zipForm = keys.filter((a) => zipFields.indexOf(a) > -1)
  /* забираем поля формы, которые присутствуют в общем списке полей Маркета */
  const marketForm = keys.filter((a) => marketFields.indexOf(a) > -1)

  const ZipBlock = zipForm.length
    ? arrayDiff(zipFields, zipForm)
    : []
  const MarketBlock = marketForm.length
    ? arrayDiff(marketFields, marketForm)
    : []

  const allZipAndMarketFilled = !ZipBlock.length && !MarketBlock.length
  const allZipFilled = !ZipBlock.length
  const marketFilledOrEmpty = MarketBlock.length === marketFields.length

  return (allZipAndMarketFilled || (allZipFilled && marketFilledOrEmpty))
}

export {
  isDate,
  setPhoto,
  setDateFormat,
  setImgSrc,
  modelPlusName,
  gotoMarket,
  idNameTypeArtPNModels,
  checkModels,
  showDialogItems,
  hideDialogItems,
  showAllDialogItems,
  validateData,
  validateArt
}
