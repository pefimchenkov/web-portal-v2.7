import Actions from '@/components/Actions'
import ElementIconsPlusGotoZip from '@/components/Formatters/market-element-icons.vue'
import SkladUpdated from '@/components/Formatters/market-sklad.vue'
import Image from '@/components/Formatters/image.vue'
import MarketSebesColor from '@/components/Formatters/market-sebes-color.vue'
import EditSkladIm from '@/components/Formatters/edit-sklad-im.vue'

import { validateArt } from './utils.js'

export {
  reference,
  exportFileName,
  templateHeaders,
  dialogItems,
  dialogOptions,
  elementTypes
}

const reference = 'marketTable'
const exportFileName = 'market_list.xls'

const elementTypes = [
  { id: 1, name: 'ЗИП' },
  { id: 2, name: 'Модель' }
]

const actions = [
  { name: 'update', text: 'Редактировать', access: 'Nom' },
  { name: 'remove', text: 'Удалить', access: 'Nom' },
  { name: 'addToBasket', text: 'Добавить в заказ', access: [ 'Order', 'Manager', 'ServiceManager' ] },
  { name: 'openTH', text: 'Технические характеристики', access: 'Nom' },
  { name: 'detail', text: 'Подробнее', access: ['Nom', 'LeadEngineer', 'Financier', 'Agent'] },
]

const templateHeaders = [
  { text: 'Фото', value: 'marketPHOTO', sortable: false, width: 150, formatter: Image },
  { text: 'ID', value: 'marketid', sortable: 'custom', },
  { text: 'ID Элемента', value: 'marketID', sortable: 'custom', width: 80, align: 'right', formatter: ElementIconsPlusGotoZip },
  { text: 'Тип', value: 'marketTYPE', sortable: 'custom', },
  { text: 'Тип Элемента', value: 'elementTYPE', sortable: 'custom', },
  { text: 'Состав', value: 'marketPARTS', sortable: 'custom', },
  { text: 'Название', value: 'marketNAME', sortable: 'custom', },
  { text: 'Описание', value: 'marketDESC', sortable: 'custom', },
  { text: 'ТХ', value: 'marketTH', sortable: 'custom', },
  { text: 'Модели', value: 'marketMODELS', sortable: 'custom', },
  { text: 'PN', value: 'marketPN', sortable: 'custom', },
  { text: 'Производитель', value: 'marketSUPPLIER', sortable: 'custom', },
  { text: 'Состояние', value: 'marketCOND', sortable: 'custom', },
  { text: 'Артикул 1С', value: 'marketART', sortable: 'custom', },
  { text: 'Количество', value: 'marketPack', sortable: 'custom', },
  { text: 'Стоковая', value: 'marketPRICE', sortable: 'custom', },
  { text: 'Себ.(₽)', value: 'priceSTOCK', sortable: 'custom', formatter: MarketSebesColor },
  { text: 'Себ. 1c ТСД', value: 'sebT', sortable: 'custom', formatter: MarketSebesColor },
  { text: 'Себ. 1c Атлас', value: 'sebA', sortable: 'custom', formatter: MarketSebesColor },
  { text: 'Прод.(₽)', value: 'priceCLIENT', sortable: 'custom', },
  { text: 'Партн.(₽)', value: 'pricePART', sortable: 'custom', },
  { text: 'Опт.(₽)', value: 'priceOPT', sortable: 'custom', },
  { text: 'Склад ТСД', value: 'marketSKLAD', sortable: 'custom', formatter: SkladUpdated },
  { text: 'Склад Атлас', value: 'marketATLAS', sortable: 'custom', },
  { text: 'Заказ', value: 'marketZAKAZ', sortable: 'custom', },
  { text: 'Склад ABS', value: 'marketABS', sortable: 'custom', },
  { text: 'Склад ИМ', value: 'marketIM', sortable: 'custom', formatter: EditSkladIm },
  { text: 'Адрес на складе ИМ', value: 'marketIMAddress', sortable: 'custom', width: 120, },
  { text: 'Комментарий (склад ИМ)', value: 'marketIMComment', sortable: 'custom' },
  { text: 'Автор', value: 'marketEMAIL', sortable: 'custom', },
  { text: 'Дата', value: 'marketDATE', sortable: 'custom', },
  { text: 'На сайте', value: 'marketSITE', sortable: 'custom', },
  { text: 'Действия', value: 'actions', fixed: 'right', width: 90, formatter: Actions, actions: actions, },
]

const dialogItems = [
  {
    type: 'customSelect',
    label: 'Тип элемента',
    value: 'elementTYPE',
    visible: true,
    span: 24,
    width: '100%',
    options: [],
    rules: {
      required: true
    }
  },
  {
    type: 'customInput',
    label: 'Цена сток',
    value: 'marketPRICE',
    visible: true,
    span: 12,
    width: '100%',
    options: [],
    rules: {
      required: true
    }
  },
  {
    type: 'customSelect',
    label: 'Валюта',
    value: 'CUR',
    name: 'sign',
    visible: true,
    width: '100%',
    options: [],
    span: 12,
    rules: {
      required: true
    }
  },
  {
    type: 'customInput',
    label: 'Коэф. себес',
    value: 'K1',
    visible: true,
    span: 12,
    width: '100%',
    rules: {
      required: true
    }
  },
  {
    type: 'customInput',
    label: 'Коэф. продажа',
    value: 'K2',
    visible: true,
    readonly: 'custom',
    span: 12,
    width: '100%',
    rules: {
      required: true
    }
  },
  {
    type: 'customInput',
    label: 'PN',
    value: 'marketPN',
    visible: true,
    span: 12,
    width: '100%',
    rules: {
    }
  },
  {
    type: 'customSelect',
    label: 'Производитель',
    value: 'marketSUPPLIER',
    key: 'id',
    visible: true,
    span: 12,
    width: '100%',
    options: [],
    rules: {
      required: true
    }
  },
  {
    type: 'customInput',
    label: 'Описание ТХ',
    value: 'marketDESC',
    visible: true,
    span: 24,
    width: '100%',
    rules: {
    }
  },
  {
    type: 'customInput',
    label: 'Артикул 1С',
    value: 'marketART',
    visible: true,
    span: 12,
    rules: {
      validator: validateArt,
    }
  },
  {
    type: 'customSelect',
    label: 'Состояние',
    value: 'marketCOND',
    key: 'id',
    visible: true,
    width: '100%',
    name: 'name_ru',
    span: 12,
    options: [],
    rules: {
      required: true
    }
  },
  {
    type: 'customRemoteSelect',
    label: 'ЗИП',
    value: 'ZIP',
    key: 'zipID',
    visible: false,
    span: 24,
    width: '100%',
    options: [],
    rules: {
      required: true
    }
  },
  {
    type: 'customRemoteSelect',
    label: 'Модель',
    value: 'MODEL',
    key: 'ID',
    visible: false,
    width: '100%',
    span: 24,
    options: [],
    rules: {
      required: true
    }
  },
  {
    type: 'customRemoteSelect',
    label: 'Состав',
    value: 'Parts',
    key: 'marketid',
    visible: true,
    multiple: true,
    span: 24,
    width: '100%',
    options: [],
    rules: {
    }
  },
  {
    type: 'customInput',
    label: 'Кол-во в упаковке',
    value: 'marketPACK',
    visible: true,
    span: 12,
    rules: {
    }
  },
  {
    type: 'customCheckbox',
    label: 'На сайте',
    value: 'marketSITE',
    visible: true,
    span: 12,
    rules: {
    }
  },
]
const dialogOptions = {
  labelWidth: '170px',
  dividerAfter: [
  ],
  add: 'Добавление Маркета',
  update: 'Редактирование Маркета',
}
