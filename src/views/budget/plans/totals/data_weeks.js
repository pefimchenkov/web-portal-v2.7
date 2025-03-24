export {
  reference,
  exportFileName,
  templateHeaders,
}

const reference = 'totalWeeksTable'
const exportFileName = 'total_weeks_list.xls'


const templateHeaders = [
  { text: 'Месяц', value: 'monthName', sortable: 'custom', },
  { text: '№ недели', value: 'weekId', sortable: 'custom', },
  { text: 'План. доходы', value: 'otgruzki', sortable: 'custom', },
  { text: 'План. расходы', value: 'buhs', sortable: 'custom', },
  { text: 'Факт. доходы', value: 'incomes', sortable: 'custom', },
  { text: 'Факт. расходы', value: 'outcomes', sortable: 'custom', }
]


