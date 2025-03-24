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
      Category: ['Итого:']
    }
  },
  computed: {
    DataGrey() {
      return Object.values(this.Plans[0]).reduce((v, i) => (v + i), 0)
    },
    DataRed() {
      const green = Object.entries(this.Income[0]).filter(item => item[0].includes('_red')).map((item) => item[1])
      return green.reduce((v, i) => (v + i), 0)
    },
    DataGreen() {
      const green = Object.entries(this.Income[0]).filter(item => item[0].includes('_green')).map((item) => item[1])
      return green.reduce((v, i) => (v + i), 0)
    },
    DataYellow() {
      return Object.values(this.Fact[0]).reduce((v, i) => (v + i))
    }
  },
  async created() {
    this.Plans = await this.$store.dispatch('FETCH_PLANS', 6)
    this.Income = await this.$store.dispatch('FETCH_INCOME', 6)
    this.Fact = await this.$store.dispatch('FETCH_FACT', 6)

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
            borderWidth: 1,
            barPercentage: 0.5,
            categoryPercentage: 0.5,
            data: [Math.round(this.DataGrey)]
          },
          {
            label: 'В оплате',
            backgroundColor: 'red',
            fillColor: false,
            strokeColor: 'black',
            borderWidth: 1,
            barPercentage: 0.5,
            categoryPercentage: 0.5,
            data: [Math.round(this.DataRed)]
          },
          {
            label: 'Оплачено',
            backgroundColor: 'green',
            fill: false,
            borderWidth: 1,
            barPercentage: 0.5,
            categoryPercentage: 0.5,
            data: [Math.round(this.DataGreen)]
          },
          {
            label: 'Фактические расходы',
            backgroundColor: 'yellow',
            fill: false,
            borderWidth: 1,
            barPercentage: 0.5,
            categoryPercentage: 0.5,
            data: [Math.round(this.DataYellow)]
          }
        ] }, {
        title: {
          display: true,
          text: 'Суммарно за Июнь'
        },
        scales: {
          xAxes: [{
            stacked: false,
            ticks: {
              callback: function(value, index, values) {
                return '₽ ' + value.toLocaleString('ru')
              },
              beginAtZero: true,
              max: 60000000
            }
          }],
          yAxes: [{
            stacked: false
          }]
        },
        legend: {
          display: false
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
