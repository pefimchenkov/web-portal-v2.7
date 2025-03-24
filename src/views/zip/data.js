import { validateArt } from './utils.js'
export {
  reference,
  exportFileName,
  templateHeaders,
  dialogItems,
  dialogOptions,
  zipFields,
  marketFields
}

const reference = 'zipTable'
const exportFileName = 'zip_list.xls'

const templateHeaders = [
  { text: 'Фото', value: 'zipPHOTO', sortable: true },
  { text: 'id', value: 'zipID', sortable: true  },
  { text: 'Имя', value: 'zipNAME', sortable: true  },
  { text: 'Класс', value: 'zipCLASS', sortable: true  },
  { text: 'Тип', value: 'zipTYPE', sortable: true  },
  { text: 'Модели', value: 'zipMODELS', sortable: true  },
  { text: 'PN', value: 'zipPN', sortable: true  },
  { text: 'Артикул', value: 'zipART', sortable: true  },
  { text: 'Время установки (мин.)', value: 'zipTIME', sortable: true  },
  { text: 'Редактор', value: 'zipemail', sortable: true  },
  { text: 'Изменён', value: 'zipdate', sortable: true  },
  { text: 'Действия', value: 'actions', align: 'center' },
]

const zipFields = ['SHORTNAME', 'zipCLASS', 'zipTYPE', 'zipTIME', 'zipMODELS']
const marketFields = ['zipSUPPLIERS', 'zipCONDITIONS', 'zipPN', 'zipART', 'zipPack'/* 'Parts' */] // Parts не включаю, чтобы сделать не обязательным при проверке.

const dialogItems = [
  {
    type: 'customSelect',
    label: 'Класс',
    value: 'zipCLASS',
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
    type: 'customSelect',
    label: 'Тип',
    value: 'zipTYPE',
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
    label: 'Наименование',
    value: 'SHORTNAME',
    visible: true,
    span: 24,
    rules: {
      required: true
    }
  },
  {
    type: 'customInputNumber',
    label: 'Время на установку',
    value: 'zipTIME',
    visible: true,
    span: 12,
    width: '100%',
    rules: {
      required: true,
      number: true
    }
  },
  {
    type: 'customRemoteSelect',
    label: 'Модели',
    value: 'zipMODELS',
    multiple: true,
    name: 'MODEL',
    key: 'ID',
    visible: true,
    span: 24,
    width: '100%',
    options: [],
    rules: {
      required: true
    }
  },
  {
    type: 'customSelect',
    label: 'Производитель',
    value: 'zipSUPPLIERS',
    key: 'id',
    visible: true,
    span: 12,
    width: '100%',
    options: [],
    rules: {
    }
  },
  {
    type: 'customSelect',
    label: 'Состояние',
    value: 'zipCONDITIONS',
    key: 'id',
    visible: true,
    width: '100%',
    name: 'name_ru',
    span: 12,
    options: [],
    rules: {
    }
  },
  {
    type: 'customInput',
    label: 'Партномер',
    value: 'zipPN',
    visible: true,
    span: 12,
    rules: {
    }
  },
  {
    type: 'customInput',
    label: 'Артикул 1С',
    value: 'zipART',
    visible: true,
    span: 12,
    rules: {
      validator: validateArt
    }
  },
  {
    type: 'customInputNumber',
    label: 'Кол-во в упаковке',
    value: 'zipPack',
    visible: true,
    span: 12,
    width: '100%',
    rules: {
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
]
const dialogOptions = {
  labelWidth: '170px',
  dividerAfter: [
    { value: 'zipMODELS', text: 'Совместимости' },
    { value: 'zipSUPPLIERS', text: 'Маркет' }
  ],
  add: 'Добавление ЗИП',
  update: 'Редактирование ЗИП',
}
