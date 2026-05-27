import JiraLink from '@/components/Formatters/jira-link.vue'
import Coloration from '@/components/Formatters/coloration.vue'
import ColorationPlusJiraLink from '@/components/Formatters/coloration-plus-jiralink.vue'
import RemontsJiraLink from '@/components/Formatters/remonts-jiralink.vue'
import Actions from '@/components/Actions'

export {
  tableName,
  exportFileName,
  templateHeaders,
  firms,
  periods,
  reference
}

const reference = 'expendedZipTable'
const tableName = 'ЗИП за год'
const exportFileName = 'expended_zip_list.xls'

const firms = [
  {
    id: 990,
    name: 'Атлас Про',
    reference: 'expendedZipTableAtlas'
  },


  /* {
    id: 429,
    name: 'ТСД Сервис',
    reference: 'expendedZipTableTSD'
  } */


]

const periods = [
  {
    id: 3,
    name: '3 месяца',
    value: 'INTERVAL 3 MONTH'
  },
  {
    id: 6,
    name: '6 месяцев',
    value: 'INTERVAL 6 MONTH'
  },
  {
    id: 9,
    name: '9 месяцев',
    value: 'INTERVAL 9 MONTH'
  }
]

const actions = [
  { name: 'basket', text: 'Положить в корзину', access: 'Engineer' }
]

const templateHeaders = [
  { text: 'ID элемента', value: 'Zip_ID', sortable: 'custom', width: 150 },
  { text: 'Название', value: 'Zip_Name', sortable: 'custom' },
  { text: 'Артикулы', value: 'Arts', sortable: 'custom' },
  { text: 'PN', value: 'PNs', sortable: 'custom' },
  { text: 'Модели', value: 'Models', sortable: 'custom' },
  { text: 'Клиенты', value: 'Clients', sortable: 'custom', },
  { text: 'Инженеры', value: 'eng', sortable: 'custom', },
  { text: 'Кол-во JIRA', value: 'Q', sortable: 'custom' },
  { text: 'Кол-во 1C', value: 'qtiIn', sortable: 'custom' },
  { text: 'Цена за шт.', value: 'Price', sortable: 'custom' },
  { text: 'Расход в месяц', value: 'QtyM', sortable: 'custom' },
  { text: 'Неснижаемый остаток', value: 'Qmin', sortable: 'custom' },
  { text: 'Необходимо заказать', value: 'toOrder', sortable: 'custom' },
  { text: 'Необходимо заказать всего', value: 'commonToOrder', sortable: 'custom', width: 150 },
  { text: '% остатка', value: 'percent', sortable: 'custom', formatter: Coloration },
  { text: 'Количество', value: 'QtyA', sortable: 'custom' },
  { text: 'Мин. себес.', value: 'MinSebA', sortable: 'custom' },
  { text: 'Макс. себес.', value: 'MaxSebA', sortable: 'custom' },
  { text: 'Кол-во в закупках', value: 'QtyZ', sortable: 'custom' },
  { text: 'Закупки', value: 'Zakupki', sortable: 'custom', formatter: JiraLink },
  { text: 'Ожидание ремонта', value: 'currentNeed', sortable: 'custom', width: 150, formatter: RemontsJiraLink },
  { text: 'Ожидание ремонта всего', value: 'commonCurrentNeed', sortable: 'custom', width: 150, formatter: ColorationPlusJiraLink },
  { text: 'Общая потребность', value: 'Total', sortable: 'custom', width: 150, },
  { text: 'Сумма потребности', value: 'SumPriceNeed', sortable: 'custom', },
  { text: 'Действия', value: 'actions', fixed: 'right', formatter: Actions, actions }
]
