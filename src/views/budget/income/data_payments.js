import Actions from '@/components/Actions'
import JiraLink from '@/components/Formatters/jira-link.vue'


export {
  reference,
  exportFileName,
  templateHeaders,
  dialogItems,
  dialogOptions,
  profits_retail,
  profits_partner
}

const reference = 'budgetIncomePaymentsTable'
const exportFileName = 'budget_payments_list'

const actions = [
  /* { name: 'update', text: 'Редактировать' }, */
  { name: 'remove', text: 'Удалить' },
]

const profits_retail = [
  { id: 0, project: 'Ремонт', value: 50 },
  { id: 1, project: 'Аренда', value: 50 },
  { id: 2, project: 'Продажа (склад)', value: 50 },
  { id: 3, project: 'Продажа (новое)', value: 16 },
  { id: 4, project: 'Продажа (ЗИП)', value: 50 },
  { id: 5, project: 'Продажа (IT)', value: 10 },
  { id: 6, project: 'Производство', value: 50 },
  { id: 7, project: 'СКС (Wi-Fi)', value: 30 },
  { id: 8, project: 'Серв. Контракт', value: 50 },
  { id: 9, project: 'Прочее', value: 10 }
]

const profits_partner = [
  { id: 0, project: 'Ремонт', value: 35 },
  { id: 1, project: 'Аренда', value: 35 },
  { id: 2, project: 'Продажа (склад)', value: 35 },
  { id: 3, project: 'Продажа (новое)', value: 10 },
  { id: 4, project: 'Продажа (ЗИП)', value: 35 },
  { id: 5, project: 'Продажа (IT)', value: 10 },
  { id: 6, project: 'Производство', value: 35 },
  { id: 7, project: 'СКС (Wi-Fi)', value: 30 },
  { id: 8, project: 'Серв. Контракт', value: 35 },
  { id: 9, project: 'Прочее', value: 10 }
]


const templateHeaders = [
  { text: 'Клиент', value: 'contractorName', sortable: 'custom', width: 300,},
  { text: 'JIRA', value: 'iKey', sortable: 'custom', align: 'left', width: 145, formatter: JiraLink },
  { text: 'Проект 1С', value: 'project', sortable: 'custom', width: 155 },

  { text: '№ Оплаты', value: 'paymentNum', sortable: 'custom', width: 115},
  { text: '№ Отгрузки', value: 'sfnum', sortable: 'custom', width: 115},
  { text: '№ Cчета', value: 'orderNum', sortable: 'custom', width: 125},
  { text: 'Основание', value: 'paymentPurpose', sortable: 'custom', width: 165},

  { text: 'Дата опл. факт', value: 'paymentDate', sortable: 'custom', width: 200, align: 'center', },
  { text: 'Сумма оплаты', value: 'paymentSum', sortable: 'custom', width: 135, },
  { text: 'Факторинг', value: 'factoring', sortable: 'custom' },
  { text: 'Взаимозачёт', value: 'netting', sortable: 'custom' },
  { text: 'ОМ', value: 'om', sortable: 'custom', width: 205, },
  { text: 'СМ', value: 'sm', sortable: 'custom', width: 205, },
  { text: 'Действия', value: 'actions', width: 90, align: 'center', formatter: Actions, actions: actions, }
]

const dialogItems = [
  {
    type: 'customSelect',
    label: 'Ответственный менеджер',
    value: 'om',
    visible: true,
    span: 12,
    width: '100%',
    options: [],
    rules: {
      required: false,
    }
  },
  {
    type: 'customSelect',
    label: 'Сервисный менеджер',
    value: 'sm',
    visible: true,
    span: 12,
    width: '100%',
    options: [],
    rules: {
      required: false,
    }
  },
  {
    type: 'customSelect',
    label: 'Проект 1С',
    value: 'project',
    visible: true,
    span: 12,
    width: '100%',
    options: [],
    rules: {
      required: false,
    }
  },

]

const dialogOptions = {
  labelWidth: '200px',
  update: 'Редактирование УПД',
}

