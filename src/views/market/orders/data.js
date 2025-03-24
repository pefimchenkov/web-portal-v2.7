import JiraLink from '@/components/Formatters/jira-link.vue'

export {
  reference,
  exportFileName,
  templateHeaders,
  priceTypes,
  firms
}

const reference = 'ordersTable'
const exportFileName = 'orders_list.xls'

const priceTypes = ['Клиентская', 'Партнёрская', 'Оптовая']

const firms = [
  { id: 429, name: 'ТСД Сервис' },
  { id: 990, name: 'Атлас Про' },
]

const templateHeaders = [
  { text: 'Номер заказа', value: 'id', sortable: true, },
  { text: 'SALE', value: 'sale_id', sortable: true, formatter: JiraLink },
  { text: 'Комментарий', value: 'comment', sortable: true, },
  { text: 'Тип цены', value: 'price_type', sortable: true, },
  { text: 'Фирма исполнитель', value: 'firm', sortable: true, },
  { text: 'Скидка на заказ', value: 'sale_xl', sortable: true, },
  { text: 'Автор', value: 'reporter', sortable: true, },
  { text: 'Дата создания', value: 'created_date', sortable: true, },
  { text: 'Дата обновления', value: 'updated_date', sortable: true, },
  { text: 'Действия', value: 'actions', fixed: 'right', width: 90 }
]
