import Actions from '@/components/Actions'
export {
  reference,
  entities,
  exportFileName,
  templateHeaders,
  dialogItems,
  dialogOptions
}

const reference = 'modelsTable'
const exportFileName = 'models_list.xls'

const entities = ['Models', 'Categories', 'Engineers', 'Profiles', 'Types', 'Vendors']

const templateHeaders = [
  { text: 'ID', value: 'ID', sortable: 'custom', },
  { text: 'Тип', value: 'TYPE', sortable: 'custom', },
  { text: 'Бренд', value: 'VENDOR', sortable: 'custom', },
  { text: 'Название', value: 'MODEL', sortable: 'custom', },
  { text: 'Автор', value: 'EMAIL', sortable: 'custom', },
  { text: 'Дата', value: 'DATE', sortable: 'custom', },
  { text: 'Действия', value: 'actions', fixed: 'right', width: 90, formatter: Actions }
]

const dialogItems = [
  {
    type: 'customSelect',
    label: 'Тип',
    value: 'TYPE',
    visible: true,
    width: '100%',
    options: [],
    rules: {
      required: true,
    }
  },
  {
    type: 'customSelect',
    label: 'Бренд',
    value: 'VENDOR',
    visible: true,
    width: '100%',
    options: [],
    rules: {
      required: true
    }
  },
  {
    type: 'customInput',
    label: 'Название',
    value: 'MODEL',
    visible: true,
    width: '100%',
    rules: {
      required: true
    }
  },
  {
    type: 'customSelect',
    label: 'Категория',
    value: 'CAT_EQ',
    visible: true,
    width: '100%',
    options: [],
    rules: {
      required: true
    }
  },
  {
    type: 'customSelect',
    label: 'Профильность',
    value: 'BASIC',
    visible: true,
    width: '100%',
    options: [],
    rules: {
      required: true
    }
  },
  /* {
    type: 'customSelect',
    label: 'Ответственный',
    value: 'EMAIL',
    multiple: true,
    visible: true,
    width: '100%',
    options: [],
    rules: {
      required: true
    }
  }, */
]
const dialogOptions = {
  labelWidth: '200px',
  add: 'Добавление модели',
  update: 'Редактирование модели',
}

