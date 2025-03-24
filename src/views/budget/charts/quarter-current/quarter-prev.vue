<template>
  <div>
    <canvas id="myChart" ref="canvas" />
  </div>
</template>

<script>
import { Bar } from 'vue-chartjs'

export default {
  extends: Bar,
  data() {
    return {
      dynHeight: 50,
      Plans: [],
      Income: [],
      Budget: [],
      clientHeigh: null,
      Category: ['Зарплата', 'Закупки', 'Кредит', 'Офис', 'Прочее'],
      PlansTotal: null,
      TeoriaTotal: null,
      DolgTotal: null,
      PaidTotal: null,
      ShippedTotal: null

    }
  },

  async created() {
    this.Plans = await this.$store.dispatch('FETCH_PLANS', 0)
    this.Income = await this.$store.dispatch('FETCH_INCOME', 0)

    this.totalSum()
    this.init()
  },
  mounted() {
  },
  methods: {
    totalSum() {
      this.PlansTotal = Object.values(this.Plans[0]).reduce((sum, item) => (sum + item), 0)
      this.TeoriaTotal = Object.entries(this.Income[0]).filter(item => item[0].includes('_orange')).map((item) => item[1]).reduce((prev, curr) => (prev + curr), 0)
      this.DolgTotal = Object.entries(this.Income[0]).filter(item => item[0].includes('_darkred')).map((item) => item[1]).reduce((prev, curr) => (prev + curr), 0)
      this.PaidTotal = Object.entries(this.Income[0]).filter(item => item[0].includes('_green')).map((item) => item[1]).reduce((prev, curr) => (prev + curr), 0)
      this.ShippedTotal = Object.entries(this.Income[0]).filter(item => item[0].includes('_brown')).map((item) => item[1]).reduce((prev, curr) => (prev + curr), 0)
    },
    init() {
      const self = this
      var handle = function(element) {
        if (element.length > 0) {
          var dataLabel = element[0]._model.datasetLabel

          if (dataLabel.includes('Долг')) {
            self.$router.replace({ name: 'budget_list_prev', params: { dolg: true }})
          }
          if (dataLabel.includes('Теория')) {
            self.$router.replace({ name: 'budget_list_prev', params: { teoria: true }})
          }
        }
      }
      this.renderChart({
        labels: this.Category,
        datasets: [
          {
            type: 'bar',
            label: 'Планы (сумма): ' + this.PlansTotal.toLocaleString('ru') + ' ₽',
            backgroundColor: '#ddd',
            fill: false,
            borderWidth: 2,
            barPercentage: 0.6,
            categoryPercentage: 1,
            data: Object.values(this.Plans[0])
          },
          {
            type: 'bar',
            label: 'Теория (сумма): ' + this.TeoriaTotal.toLocaleString('ru') + ' ₽',
            backgroundColor: 'orange',
            borderWidth: 2,
            barPercentage: 0.6,
            categoryPercentage: 1,
            data: Object.entries(this.Income[0]).filter(item => item[0].includes('_orange')).map((item) => {
              return item[1]
            })
          },
          {
            type: 'bar',
            label: 'Долг (сумма): ' + this.DolgTotal.toLocaleString('ru') + ' ₽',
            backgroundColor: 'red',
            borderWidth: 2,
            barPercentage: 0.6,
            categoryPercentage: 1,
            data: Object.entries(this.Income[0]).filter(item => item[0].includes('_darkred')).map((item) => {
              return item[1]
            })
          },
          {
            type: 'bar',
            label: 'Оплаченно (сумма): ' + this.PaidTotal.toLocaleString('ru') + ' ₽',
            backgroundColor: 'green',
            borderWidth: 2,
            barPercentage: 0.6,
            categoryPercentage: 1,
            data: Object.entries(this.Income[0]).filter(item => item[0].includes('_green')).map((item) => {
              return item[1]
            })
          },
          {
            type: 'bar',
            label: 'Отгруженно (сумма): ' + this.ShippedTotal.toLocaleString('ru') + ' ₽',
            backgroundColor: 'brown',
            borderWidth: 2,
            barPercentage: 0.6,
            categoryPercentage: 1,
            data: Object.entries(this.Income[0]).filter(item => item[0].includes('_brown')).map((item) => {
              return item[1]
            })
          }
        ] }, {
        title: {
          display: true,
          text: 'Предыдущий период ( Cчета до октября 2019 неоплаченные или частично оплаченные, ТСД-СЕРВИС (ВЕКТОР) )'
        },
        scales: {
          yAxes: [{
            stacked: false,
            position: 'top',
            ticks: {
              callback: function(value, index, values) {
                return '₽ ' + value.toLocaleString('ru')
              }
            }
          }],
          xAxes: [{
            stacked: false
          }]
        },
        legend: {
          display: true,
          position: 'right',
          labels: {
            fontSize: 16,
            padding: 20
          }
        },
        tooltips: {
          callbacks: {
            label: function(tooltipItem, data) {
              // return data.datasets[tooltipItem.datasetIndex].label + ': ' + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].toLocaleString('ru')
              return '  ' + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].toLocaleString('ru')
            }
          }
        },
        responsive: true,
        aspectRatio: 2,
        maintainAspectRatio: true,
        onClick: function(event, array) {
          const element = this.getElementAtEvent(event)
          handle(element)
          /*  if (element.length > 0) {
						var dataLabel = element[0]._model.datasetLabel
						var label = element[0]._model.label
						var value = this.data.datasets[element[0]._datasetIndex].data[element[0]._index]
						console.log(dataLabel)
						console.log(label)
						console.log(value)
						console.log(array)
					} */
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
