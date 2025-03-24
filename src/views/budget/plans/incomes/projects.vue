<template>
  <div>
    <canvas id="myChart" ref="canvas" />
  </div>
</template>

<script>
import { HorizontalBar } from 'vue-chartjs'
import { getIncomesProjects } from '@/api/budget/plans'

export default {
  extends: HorizontalBar,
  data() {
    return {
      dynHeight: 50,
      Dept: [],
      Plan: [],
      clientHeigh: null,
      Project1c: []

    }
  },

  async created() {
    await this.getData()
    this.init()
  },

  methods: {

    async getData() {
      await getIncomesProjects()
        .then(res => {
          this.Plan = res.map(item => item.plan)
          this.Dept = res.map(item => item.dept)
          this.Project1c = res.map(item => item.project_1c)
        })
    },

    init() {
      this.renderChart({
        labels: this.Project1c,

        datasets: [
          {
            backgroundColor: 'lightblue',
            fill: false,
            borderWidth: 2,
            label: 'Планы (сумма): ' + this.Plan.reduce((acc, item) => {
              return (acc + item)
            }, 0).toLocaleString(),
            data: this.Plan
          },
          {
            backgroundColor: 'darkred',
            fill: false,
            borderWidth: 2,
            label: 'Долг (сумма): ' + this.Dept.reduce((acc, item) => {
              return (acc + item)
            }, 0).toLocaleString(),
            data: this.Dept
          }
        ]
      },
      {
        title: {
          display: true,
          text: 'Планируемые поступления по `Проект 1С` (период 1 год)'
        },
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            fontSize: 16,
            padding: 20
          }
        },
        tooltips: {
          callbacks: {
            label: function(tooltipItem, data) {
              return '  ' + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].toLocaleString('ru')
            }
          }
        },
        responsive: true,
        aspectRatio: 1.1,
        maintainAspectRatio: true,
        scales: {
          xAxes: [{
            stacked: false,
            ticks: {
              callback: function(value) {
                return '₽ ' + value.toLocaleString('ru')
              },
              max: 30000000
            }
          }],
          yAxes: [{
            stacked: false
          }]
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
