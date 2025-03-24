export function ruFormatCurrency(cur) {
  const formatter = new Intl.NumberFormat('ru', {
    style: 'currency',
    currency: 'RUB'
  })
  return formatter.format(cur)
}
