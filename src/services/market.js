import store from '../store'

export function transformPriceWithRate(item) {
  const dollar = store.getters.dollar
  const euro = store.getters.euro

  function finishPrice(val) {
    switch (val) {
      case '₽': return item.marketPRICE * 1
      case '€': return item.marketPRICE * euro
      case '$': return item.marketPRICE * dollar
    }
  }

  const price = finishPrice(item.CUR)

  item['priceSTOCK'] = Math.round(price * item.RATIO_1)
  item['priceCLIENT'] = Math.round(price * item.RATIO_2)
  item['pricePART'] = Math.round(price * item.RATIO_2 - price * item.RATIO_2 * 0.1)
  item['priceOPT'] = Math.round(price * item.RATIO_2 - price * item.RATIO_2 * 0.2)

  return item
}
