// import Actions from '@/components/Actions'

export {
  reference,
  firms,
  exportFileName,
  templateHeadersItems,
  dialogItems,
  dialogOptions
}

const reference = 'b2bTable'
const exportFileName = 'b2b_list.xls'

const firms = [
  { label: 'Марвел', prop: 'marvel' },
  { label: 'Мерлион', prop: 'merlion' },
  { label: 'Треолан', prop: 'treolan' },
]

/* const actions = [
  { text: 'Получить артикулы от Марвел', name: 'getItemsFromMarvel', access: 'Admin' },
  { text: 'Получить данные от Треолан', name: 'getItemsFromTreolan', access: 'Admin' },
  { text: 'Получить данные от Мерлион', name: 'getItemsFromMerlion', access: 'Admin' }
] */

const templateHeadersItems = [
  // { text: 'Площадка', value: 'partner', sortable: true, },
  // { text: 'Артикул', value: 'WareArticle', sortable: true, },
  // { text: 'Вендор', value: 'WareVendor', sortable: true, },
  // { text: 'Товар', value: 'WareFullName', sortable: true, },
  { text: 'Склад', value: 'AvailableForB2BOrderQty', sortable: true, },
  { text: 'Транзит', value: 'InNearTransitCount', sortable: true, },
  { text: 'Цена', value: 'WarePrice', sortable: true, },
  // { text: 'Валюта', value: 'WarePriceCurrency', sortable: true, },
  // { text: "Результат", value: "ExternalItemIdError", sortable: true, visible: false }

  // { text: 'Упаковка', value: 'WarePackStatus', sortable: true, },
  // { text: 'Действия', value: 'actions', fixed: 'right', width: 150, formatter: Actions, actions: actions }
  // { text: 'Склад всего', value: 'TotalInventQty', sortable: true, },
  // { text: 'Транзит всего', value: 'InFarTransitCount', sortable: true, },
]

const dialogItems = [
  {
    type: 'customInput',
    label: 'Название',
    value: 'name',
    visible: true,
    rules: {
      required: true,
    }
  },
]
const dialogOptions = {
  labelWidth: '200px',
  add: 'Добавление',
  update: 'Редактирование',
}
