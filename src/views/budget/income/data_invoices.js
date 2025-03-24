import Actions from '@/components/Actions'
import BudgetInvoicePayments from '@/components/Formatters/budget-invoice-payments.vue'
import BudgetInvoicePayDate from '@/components/Formatters/budget-invoice-paydate.vue'
import BudgetInvoiceSaleDate from '@/components/Formatters/budget-invoice-saledate.vue'
import BudgetInvoicePayDolg from '@/components/Formatters/budget-invoice-dolg.vue'
import BudgetInvoiceStatus from '@/components/Formatters/budget-invoice-status.vue'
import DivideByNewLines from '@/components/Formatters/divide-by-new-lines.vue'
import JiraLink from '@/components/Formatters/jira-link.vue'
import BudgetInvoiceManualSelect from '@/components/Formatters/budget-invoice-manual-select.vue'

export {
  reference,
  exportFileName,
  templateHeaders,
  dialogItems,
  dialogOptions
}

const reference = 'budgetInvoicesTable'
const exportFileName = 'budget_invoices_list'

const actions = [
  /* { name: 'update', text: 'Редактировать' }, */
  { name: 'removeCustoms', text: 'Удалить ручные правки' },
]


const templateHeaders = [
  { text: 'ID', value: 'id', sortable: 'custom', width: 60, },
  { text: 'Клиент', value: 'contractorName', sortable: 'custom', width: 300, fixed: 'left' },
  { text: 'JIRA', value: 'iKey', sortable: 'custom', align: 'left', width: 155, formatter: JiraLink },
  { text: 'Проект 1С', value: 'project', sortable: 'custom', width: 155, formatter: BudgetInvoiceManualSelect },
  { text: 'Примечание', value: 'comment', sortable: 'custom', align: 'left', width: 145, formatter: JiraLink },
  { text: '№ счёта', value: 'num', width: 135, sortable: 'custom', },
  { text: 'Дата счёта', value: 'date', sortable: 'custom', width: 200, align: 'center'},
  { text: 'Сумма по счёту', value: 'sum', sortable: 'custom', width: 135 },
  { text: 'Валюта', value: 'currency', sortable: 'custom' },
  { text: 'Курс', value: 'currencyRate', sortable: 'custom' },
  { text: '№ отгрузки', value: 'sale_num', sortable: 'custom', width: 135, formatter: DivideByNewLines },
  { text: 'Дата отгрузки', value: 'sale_date', sortable: 'custom', width: 200, align: 'center', formatter: BudgetInvoiceSaleDate },
  { text: 'Сумма отгрузки', value: 'sale_sum', sortable: 'custom', width: 120 },
  { text: 'Неоплаченные отгрузки', value: 'dolg_orange',  sortable: 'custom', width: 120, formatter: BudgetInvoicePayDolg },
  { text: 'Неотгруженные платежи', value: 'overpayment',  sortable: 'custom', width: 120,},
  { text: 'Дата опл. план', value: 'pay_date', sortable: 'custom', width: 200, align: 'center', formatter: BudgetInvoicePayDate },
  { text: 'Отсрочка', value: 'otsrochka', sortable: 'custom' },
  { text: 'Оплата просрочена', value: 'dolg_red', sortable: 'custom', width: 100, formatter: BudgetInvoicePayDolg },
  { text: 'Дата опл. факт', value: 'pay_date_fact', sortable: 'custom', width: 200, align: 'center', },
  { text: 'Сумма оплаты, р.', value: 'pay', sortable: 'custom', width: 135, formatter: BudgetInvoicePayments },
  { text: 'Сумма оплаты, $', value: 'pay_dollar', sortable: 'custom', width: 135 },
  { text: 'Факторинг', value: 'factoring', sortable: 'custom' },
  { text: 'Взаимозачёт', value: 'netting', sortable: 'custom' },
  { text: 'ОМ', value: 'om', sortable: 'custom', width: 155, },
  { text: 'СМ', value: 'sm', sortable: 'custom', width: 155, },
  { text: 'Статус счёта', value: 'num_status', sortable: 'custom', align: 'center', formatter: BudgetInvoiceStatus, },
  { text: 'Действия', value: 'actions', width: 90, align: 'center', formatter: Actions, actions: actions, fixed: 'right' }
]

const dialogItems = [
  {
    type: 'customDate',
    label: 'Дата отгрузки',
    value: 'sale_date',
    visible: true,
    width: '100%',
    rules: {
      required: false
    }
  },
  {
    type: 'customDate',
    label: 'Дата оплаты планируемая',
    value: 'pay_date',
    visible: true,
    width: '100%',
    rules: {
      required: false
    }
  },
  {
    type: 'customSelect',
    label: 'Проект 1С',
    value: 'project',
    visible: true,
    width: '50%',
    options: [],
    rules: {
      required: true,
    }
  },
  {
    type: 'customCheckbox',
    label: 'Статус активности',
    value: 'num_status',
    visible: true,
    rules: {}
  },
]

const dialogOptions = {
  labelWidth: '200px',
  update: 'Редактирование счёта',
}

