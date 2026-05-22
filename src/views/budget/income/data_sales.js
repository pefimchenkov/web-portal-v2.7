import Actions from '@/components/Actions'
import BudgetInvoiceManualInput from '@/components/Formatters/budget-invoice-manual-input.vue'
import BudgetInvoiceManualSelect from '@/components/Formatters/budget-invoice-manual-select.vue'
// import BudgetInvoiceSM from '@/components/Formatters/budget-invoice-sm.vue'
import JiraLink from '@/components/Formatters/jira-link.vue'


export {
  reference,
  exportFileName,
  templateHeaders,
  dialogItems,
  dialogOptions,
  local_projects
}

const reference = 'budgetIncomeSalesTable'
const exportFileName = 'budget_sales_list'

const actions = [
  /* { name: 'update', text: 'Редактировать' }, */
  { name: 'remove', text: 'Удалить' },
]

const local_projects = [
  { id: 'a0695496-b3ad-11ee-9e5f-00155d46f73b', name_1c: 'Ремонт', name_db: 'REMONT' },
  { id: '84543d8e-b3ad-11ee-9e5f-00155d46f73b', name_1c: 'Аренда', name_db: 'RENT' },
  { id: '895983de-b3ad-11ee-9e5f-00155d46f73b', name_1c: 'Продажа (склад)', name_db: 'SALE_STOCK' },
  { id: '8e2fcb20-b3ad-11ee-9e5f-00155d46f73b', name_1c: 'Продажа (новое)', name_db: 'SALE_NEW' },
  { id: '93b0a48e-b3ad-11ee-9e5f-00155d46f73b', name_1c: 'Продажа (ЗИП)', name_db: 'SALE_ZIP' },
  { id: 'a447e0a0-b3ad-11ee-9e5f-00155d46f73b', name_1c: 'Продажа (IT)', name_db: 'SALE_IT' },
  { id: '9c9be72a-b3ad-11ee-9e5f-00155d46f73b', name_1c: 'Производство', name_db: 'MANUFACTURE' },
  { id: 'a9f50dd4-b3ad-11ee-9e5f-00155d46f73b', name_1c: 'Сервисный контракт', name_db: 'SERVICE' },
  { id: '98262912-b3ad-11ee-9e5f-00155d46f73b', name_1c: 'Прочее', name_db: 'OTHER' }
]


const templateHeaders = [
  { text: 'Клиент', value: 'contractorName', sortable: 'custom', width: 300, },
  { text: 'JIRA', value: 'iKey', sortable: 'custom', align: 'left', width: 145, formatter: JiraLink },
  { text: 'Проект 1С', value: 'project', sortable: 'custom', width: 155, formatter: BudgetInvoiceManualSelect },
  { text: 'Примечание', value: 'comment', sortable: 'custom', align: 'left', width: 155, formatter: JiraLink },
  { text: '№ Cчета', value: 'invoiceNum', sortable: 'custom', },
  { text: '№ Отгрузки', value: 'sfnum', sortable: 'custom', width: 120, },
  { text: 'Дата отгрузки', value: 'sfdate', sortable: 'custom', width: 200, align: 'center'},
  { text: 'Сумма отгрузки', value: 'sum', sortable: 'custom', width: 135 },
  { text: 'Валюта', value: 'currency', sortable: 'custom' },
  { text: 'Курс', value: 'currencyRate', sortable: 'custom' },
  { text: 'Себестоимость', value: 'costPrice', sortable: 'custom', width: 125 },
  { text: 'ОМ', value: 'om', sortable: 'custom', width: 205, formatter: BudgetInvoiceManualSelect },
  { text: 'СМ', value: 'sm', sortable: 'custom', width: 205, formatter: BudgetInvoiceManualSelect },
  { text: 'Вед. инженер', value: 'lead_engineer', sortable: 'custom', width: 205, formatter: BudgetInvoiceManualSelect },
  { text: 'Инженер', value: 'engineer', sortable: 'custom', width: 205, formatter: BudgetInvoiceManualSelect },
  { text: 'Маржа, %', value: 'profit', sortable: 'custom', width: 150, formatter: BudgetInvoiceManualInput },
  { text: 'Маржа, (₽, без НДС)', value: 'profit_rub', sortable: 'custom', width: 150, },
  { text: '% премии ОМ', value: 'om_percent', sortable: 'custom', width: 100, formatter: BudgetInvoiceManualInput },
  { text: '% премии СМ', value: 'sm_percent', sortable: 'custom', width: 100, formatter: BudgetInvoiceManualInput },
  { text: 'Сумма ОМ', value: 'om_sum', sortable: 'custom', width: 100, },
  { text: 'Сумма СМ', value: 'sm_sum', sortable: 'custom', width: 100, },
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
  update: 'Редактирование ОПД',
}

