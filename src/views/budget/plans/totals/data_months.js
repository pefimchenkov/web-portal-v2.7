export {
  reference,
  exportFileName,
  templateHeaders,
}

const reference = 'totalMonthsTable'
const exportFileName = 'total_months_list.xls'


const templateHeaders = [
  { text: 'Месяц', value: 'monthName', sortable: 'custom', },
  { text: 'План. доходы', value: 'otgruzki', sortable: 'custom', },
  { text: 'План. доходы (сальдо)', value: 'otgruzki_saldo', sortable: 'custom', },
  { text: 'План. расходы', value: 'buhs', sortable: 'custom', },
  { text: 'План. расходы (сальдо)', value: 'buhs_saldo', sortable: 'custom', },
  { text: 'Факт. доходы', value: 'incomes', sortable: 'custom', },
  { text: 'Факт. расходы', value: 'outcomes', sortable: 'custom', }
]


