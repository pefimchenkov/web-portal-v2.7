<template>
  <span :style="getColor(row, column)">
    {{ row[column]?.toLocaleString('ru', { style: 'currency', currency: 'RUB' }) }}
  </span>
</template>

<script>

export default {
  name: 'MarketSebesColor',
  props: ['row', 'column'],

  methods: {
    getColor(row, column) {
      const { priceSTOCK, sebA, /* sebT */ } = row

      if (column === 'priceSTOCK') {
        if (!sebA || !priceSTOCK) return
        if ((+sebA / +priceSTOCK) >= 1.2 || (+sebA / +priceSTOCK) <= 0.8 ) return 'color: red'
        else return ''
      }
      if (column === 'sebA') {
        if (!sebA || !priceSTOCK) return
        if ((+sebA / +priceSTOCK) >= 1.2 || (+sebA / +priceSTOCK) <= 0.8 ) return 'color: red'
        else return ''
      }
      /* if (column === 'sebT') {
        if ((+sebT / +priceSTOCK) >= 1.3) return 'color: red'
        else return ''
      } */
    }
  }
}
</script>
