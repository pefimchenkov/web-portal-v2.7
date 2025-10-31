function calcTotals(client) {
  client.PLAN = client.AIDC_SALE + client.AIDC_SALE_ZIP + client.AIDC_SERV + client.IT
  client.FACT = client.FACT_AIDC_SALE + client.FACT_AIDC_SALE_ZIP + client.FACT_AIDC_SERV + client.FACT_IT

  if (client.PLAN >= 0) client.MARJA_PLAN = client.AIDC_SALE * client.P_SALE + client.AIDC_SALE_ZIP * client.P_SALE_ZIP + client.AIDC_SERV * client.P_SERV + client.IT * client.P_IT
  if (client.FACT >= 0) client.MARJA_FACT = (client.FACT_AIDC_SALE * client.P_SALE + client.FACT_AIDC_SALE_ZIP * client.P_SALE_ZIP + client.FACT_AIDC_SERV * client.P_SERV + client.FACT_IT * client.P_IT)
  if (client.PLAN >= 0) client.PERCENT = Math.round((client.MARJA_FACT / client.MARJA_PLAN) * 100).toFixed(1)
}

function createPayloadForDb(form, projects) {
  return new Promise((resolve) => {
    const project = projects.find(i => i.PROJECT === form.PROJECT)
    const legpers = form.LP_TYPE === 'ИП'
      ? form.LP_TYPE + ' ' + form.LP_NAME
      : form.LP_TYPE + ' «' + form.LP_NAME + '»'

    const dataForLegpers = { client_name: form.NAME, name: legpers, '1c_id': form.ART_1C }
    delete form['LP_TYPE']
    delete form['LP_NAME']
    delete form['ART_1C']
    const dataForClients = { ...form, ...project, 'ACTIVE': 1 }
    resolve({ dataForClients, dataForLegpers })
  })
}

function filterDataForUpdate(item) {
  return {
    NAME: item.NAME,
    LP_TYPE: item.LP_TYPE,
    LP_NAME: item.LP_NAME,
    ART_1C: item.ART_1C,
    PROJECT: item.PROJECT,
    EDO: !!item.EDO,
    ID: item.ID
  }
}

function hideDialogItems(data) {
  data.forEach(i => {
    if (['LP_TYPE', 'LP_NAME', 'ART_1C'].includes(i.value)) {
      i.visible = false
    }
  })
}
function showDialogItems(data) {
  data.forEach(i => { i.visible = true })
}

function translateCRMStatus(num) {
  switch (num) {
    case 1: return 'Активирован'
    case 2: return 'Деактивирован'
    case 7: return 'Неизвестный'
    case (null): return 'Не включен'
  }
}
function setColorCRM(item) {
  switch (true) {
    case item === 1: return 'success'
    case item === 2: return 'orange'
    default: return '#c3c3c3'
  }
}
const validateArt = (rule, value, callback) => {
  if (!value) {
    callback(new Error('Обязательно!'))
  } else {
    if (/^[Т0-9.]{8,8}$/.test(value)) callback()
    else callback('Правильно: Буква ` Т ` кириллицей и 7 цифр!')
  }
}

export {
  translateCRMStatus,
  createPayloadForDb,
  filterDataForUpdate,
  hideDialogItems,
  showDialogItems,
  setColorCRM,
  calcTotals,
  validateArt
}
