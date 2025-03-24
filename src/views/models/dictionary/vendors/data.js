import Actions from '@/components/Actions'

export {
  reference,
  exportFileName,
  templateHeaders,
  dialogItems,
  dialogOptions
}

const reference = 'modelsVendorsTable'
const exportFileName = 'models_vendors_list.xls'

const templateHeaders = [
  { text: 'ID', value: 'id', sortable: true, width: 110, },
  { text: 'Название', value: 'name', sortable: true, },
  { text: 'Действия', value: 'actions', fixed: 'right', width: 90, formatter: Actions }
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
  add: 'Добавление производителя',
  update: 'Редактирование производителя',
}
