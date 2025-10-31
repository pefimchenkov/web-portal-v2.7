import Actions from '@/components/Actions'
import JiraLink from '@/components/Formatters/jira-link.vue'
// import BudgetInvoiceSM from '@/components/Formatters/budget-invoice-sm.vue'


export {
  reference,
  exportFileName,
  templateHeaders,
  dialogItems,
  dialogOptions,
}

const reference = 'budgetPlannedCostsTable'
const exportFileName = 'pays_plan_list.xls'

const actions = [
  { name: 'update', text: 'Редактировать' },
  { name: 'remove', text: 'Удалить' },
]



const templateHeaders = [
  { text: 'JIRA', value: 'ikey', sortable: 'custom', fixed: 'left', formatter: JiraLink },
  { text: 'Описание', value: 'isummary', sortable: 'custom', },
  { text: 'Создан', value: 'created', sortable: 'custom', align: 'center', width: 185, },
  { text: 'Дата план.', value: 'date_plan', sortable: 'custom', align: 'center', width: 185},
  { text: 'Дата крит.', value: 'date_crit', sortable: 'custom', align: 'center', width: 185, },
  { text: 'Фирма', value: 'firma', sortable: 'custom', },
  { text: 'Статус', value: 'istatus', sortable: 'custom' },
  { text: 'Статья расходов', value: 'ci',  sortable: 'custom', },
  { text: 'Форма оплаты', value: 'forma', sortable: 'custom' },
  { text: 'Получатель платежа', value: 'pp', sortable: 'custom' },
  { text: 'Юрлицо', value: 'pplp', sortable: 'custom' },
  { text: 'Сумма', value: 'sum', sortable: 'custom', width: 120  },
  { text: 'Валюта', value: 'currency', sortable: 'custom' },
  { text: 'Итого', value: 'total', sortable: 'custom', width: 120  },
  { text: 'Оплаты', value: 'paid', sortable: 'custom' },
  { text: 'Строки выписки', value: 'stroki', sortable: 'custom' },
  { text: 'Счета', value: 'bills', sortable: 'custom' },
  { text: 'Период расходов', value: 'expense_period', sortable: 'custom', width: 185 },
  { text: 'Подразделение', value: 'subdivision', sortable: 'custom', width: 200 },
  { text: 'Действия', value: 'actions', width: 90, align: 'center', formatter: Actions, actions: actions, fixed: 'right' }
]

const dialogItems = [
  
]

const dialogOptions = {
  labelWidth: '200px',
  update: 'Редактирование ОПД',
}


