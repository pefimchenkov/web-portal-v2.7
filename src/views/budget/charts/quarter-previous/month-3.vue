<template>
  <canvas ref="canvas" />
</template>

<script>
import { HorizontalBar } from 'vue-chartjs'

export default {
  extends: HorizontalBar,
  data() {
    return {
      dynHeight: 50,
      Budget: [],
      Income: [],
      Fact: [],
      Plans: [],
      clientHeigh: null,
      Category: ['Зарплата', 'Закупки', 'Кредит', 'Офис', 'Прочее']
    }
  },
  watch: {
  },
  async created() {
    const plans = this.$store.dispatch('FETCH_PLANS', 3)
    const income = this.$store.dispatch('FETCH_INCOME', 3)
    const fact = this.$store.dispatch('FETCH_FACT', 3)

    this.Plans = [...await plans]
    this.Income = [...await income]
    this.Fact = [...await fact]

    await this.init()
  },
  updated() {
  },
  methods: {
    handle(point, event) {
      const item = event[0]
      const props = {
        index: item._index,
        backgroundColor: item._view.backgroundColor,
        value: item._chart.data.datasets[0].data[item._index]
      }
      this.$store.commit('setInfo', props.value)
    },
    init() {
      this.renderChart({
        labels: this.Category,
        datasets: [
          {
            label: 'Планы',
            backgroundColor: '#ddd',
            fill: false,
            borderWidth: 2,
            barPercentage: 0.7,
            categoryPercentage: 1,
            data: Object.values(this.Plans[0])
          },
          {
            label: 'В оплате',
            backgroundColor: 'red',
            borderWidth: 2,
            barPercentage: 0.7,
            categoryPercentage: 1,
            data: Object.entries(this.Income[0]).filter(item => item[0].includes('_red')).map((item) => {
              return item[1]
            })
          },
          {
            label: 'Оплачено',
            backgroundColor: 'green',
            borderWidth: 2,
            barPercentage: 0.7,
            categoryPercentage: 1,
            data: Object.entries(this.Income[0]).filter(item => item[0].includes('_green')).map((item) => {
              return item[1]
            })
          },
          {
            label: 'Фактические расходы',
            backgroundColor: 'yellow',
            fill: false,
            borderWidth: 2,
            barPercentage: 0.7,
            categoryPercentage: 1,
            data: Object.values(this.Fact[0])
          }
        ] }, {
        title: {
          display: true,
          text: 'Сентябрь'
        },
        scales: {
          xAxes: [{
            stacked: false,
            ticks: {
              callback: function(value, index, values) {
                return '₽ ' + value.toLocaleString('ru')
              },
              maxTicksLimit: 6,
              autoSkip: true,
              max: 25000000
            }
          }],
          yAxes: [{
            stacked: false
          }]
        },
        responsive: true,
        aspectRatio: 1,
        maintainAspectRatio: false,
        onClick: this.handle
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
