import Actions from '@/components/Actions'
export {
  reference,
  exportFileName,
  templateHeaders,
  dialogItems,
  dialogOptions
}

const reference = 'modelsTypesTable'
const exportFileName = 'models_types_list.xls'

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
  add: 'Добавление типа оборудования',
  update: 'Редактирование типа оборудования',
}
