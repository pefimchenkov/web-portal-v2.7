import JiraLink from '@/components/Formatters/jira-link.vue'

export {
  reference,
  exportFileName,
  templateHeaders,
  priceTypes,
  firms
}

const reference = 'purchaseTable'
const exportFileName = 'orders_list.xls'

const priceTypes = ['Клиентская', 'Партнёрская', 'Оптовая']

const firms = [
  { id: 429, name: 'ТСД Сервис' },
  { id: 990, name: 'Атлас Про' },
]

const templateHeaders = [
  { text: 'JIRA', value: 'ikey', sortable: 'custom', width: 90, formatter: JiraLink },
  { text: 'Тема', value: 'summary', sortable: 'custom', width: 150, },
  { text: 'Дата создания', value: 'created', sortable: 'custom', width: 110, },
  { text: 'Дата крит.', value: 'date_crit', sortable: 'custom', width: 110, },
  { text: 'Статус', value: 'status', sortable: 'custom', width: 100, },
  { text: 'Подразделение', value: 'subdivision', sortable: 'custom', },
  { text: 'Тип элемента', value: 'type_element', sortable: 'custom', },
  { text: 'Товар', value: 'product_name', sortable: 'custom', width: 150 },
  { text: 'Артикул 1С', value: 'ART_1C', sortable: 'custom', },
  { text: 'PN', value: 'PN', sortable: 'custom', },
  { text: 'Кол-во', value: 'qty', sortable: 'custom', width: 50 },
  { text: 'Номер заказа', value: 'number_purchase', sortable: 'custom', width: 80,},
  { text: 'Организация', value: 'organization', sortable: 'custom', width: 150, },
  { text: 'Исполнитель', value: 'assigneer', sortable: 'custom', width: 160, },
  { text: 'Инициатор', value: 'iniciator', sortable: 'custom', width: 160, },

  { text: 'Действия', value: 'actions', width: 50 }
]
