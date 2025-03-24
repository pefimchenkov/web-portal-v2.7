import Actions from '@/components/Actions'
// import BudgetInvoiceSM from '@/components/Formatters/budget-invoice-sm.vue'
import BudgetInvoiceManualSelect from '@/components/Formatters/budget-invoice-manual-select.vue'


export {
  reference,
  exportFileName,
  templateHeaders,
  dialogItems,
  dialogOptions,
}

const reference = 'budgetOutgoingPaymentsTable'
const exportFileName = 'pays_fact_list.xls'

const actions = [
  { name: 'update', text: 'Редактировать' },
  { name: 'remove', text: 'Удалить' },
]


const templateHeaders = [
  { text: 'Контрагент', value: 'contractorName', sortable: 'custom', fixed: 'left', width: 400 },
  { text: 'Статья расходов', value: 'cfAnalitic', sortable: 'custom', formatter: BudgetInvoiceManualSelect },
  { text: 'Оплаты', value: 'paymentNum', sortable: 'custom', },
  { text: 'Дата оплаты', value: 'paymentDate', sortable: 'custom', width: 185, align: 'center'},
  { text: 'Цель оплаты', value: 'paymentPurpose', sortable: 'custom', },
  { text: 'Сумма оплаты', value: 'paymentSum', sortable: 'custom', },
  { text: 'Валюта', value: 'currency', sortable: 'custom' },
  { text: 'Документ', value: 'subjectNum', sortable: 'custom' },
  { text: 'Дата документа', value: 'subjectDate',  sortable: 'custom', width: 185, },
  { text: 'Примечание', value: 'subjectPresentation', sortable: 'custom' },
  { text: 'Действия', value: 'actions', width: 90, align: 'center', formatter: Actions, actions: actions, fixed: 'right' }
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
      required: true,
    }
  },
]

const dialogOptions = {
  labelWidth: '200px',
  update: 'Редактирование ОПД',
}