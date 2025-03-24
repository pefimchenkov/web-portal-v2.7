import moment from 'moment'

function getQuarterName(number) {
  switch (number) {
    case -1: return 'I квартал'
    case -2: return 'II квартал'
    case -3: return 'III квартал'
    case -4: return 'IV квартал'
  }
}

export function getMonthNameByNumber(number) {
  moment.locale('ru')
  return Math.sign(number) === -1
    ? getQuarterName(number)
    : moment(`${number}`, 'M').format('MMMM')
}
