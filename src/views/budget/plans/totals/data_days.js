export {
  reference,
  exportFileName,
  templateHeaders,
}

const reference = 'totalDaysTable'
const exportFileName = 'total_days_list.xls'


const templateHeaders = [
  { text: 'Дата', value: 'date', sortable: 'custom', },
  { text: 'Месяц', value: 'monthName', sortable: 'custom', },
  { text: '№ недели', value: 'weekId', sortable: 'custom', },
  { text: 'День недели', value: 'weekDay', sortable: 'custom', },
  { text: 'План. доходы', value: 'otgruzki', sortable: 'custom', },
  { text: 'План. расходы', value: 'buhs', sortable: 'custom', },
  { text: 'Факт. доходы', value: 'incomes', sortable: 'custom', },
  { text: 'Факт. расходы', value: 'outcomes', sortable: 'custom', }
]


