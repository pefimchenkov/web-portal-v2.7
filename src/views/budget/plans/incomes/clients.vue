<template>
  <div>
    <canvas id="myChart" ref="canvas" />
  </div>
</template>

<script>
import { HorizontalBar } from 'vue-chartjs'
import { getIncomesClients } from '@/api/budget/plans'

export default {
  extends: HorizontalBar,
  data() {
    return {
      dynHeight: 50,
      Data: [],
      Dept: [],
      Plan: [],
      Shipped: [],
      Percent: [],
      OtherPlan: [],
      OtherDept: [],
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
      await getIncomesClients()
        .then(res => {
          this.Data = [...res]

          this.OtherPlan = res.map(item => {
            if (item.plan < 50000 && item.dept < 50000) return item.plan
          }).filter(i => i !== undefined).reduce((a, i) => (a + i))

          this.Plan = res.map(item => {
            if (item.plan >= 50000 || item.dept > 50000) return item.plan
          })
          this.Plan.push(this.OtherPlan)

          this.OtherDept = res.map(item => {
            if (item.plan < 50000 && item.dept < 50000) return item.DolgRed
          }).filter(i => i !== undefined).reduce((a, i) => (a + i))

          this.Dept = res.map(item => {
            if (item.plan >= 50000 || item.dept > 50000) return item.DolgRed
          })

          this.Dept.push(this.OtherDept)

          this.OtherShipped = res.map(item => {
            if (item.plan < 50000 && item.dept < 50000) return item.DolgOrange
          }).filter(i => i !== undefined).reduce((a, i) => (a + i))

          this.Shipped = res.map(item => {
            if (item.plan >= 50000 || item.dept > 50000) return item.DolgOrange
          })

          this.Shipped.push(this.OtherShipped)

          this.Project1c = res.map(item => {
            if (item.plan >= 50000 || item.dept > 50000) return item.client_name
          })

          this.Project1c.push('Другие')

          this.Percent = res.map(item => {
            return { name: item.client_name, percent: (item.percent || 0) }
          })
        })
    },

    init() {
      this.renderChart({
        labels: this.Project1c.filter(item => item !== undefined),

        datasets: [
          {
            backgroundColor: 'lightblue',
            fill: false,
            borderWidth: 2,
            label: 'Планы (сумма): ' + this.Plan.filter(i => i !== undefined).reduce((acc, item) => {
              return (acc + item)
            }, 0).toLocaleString(),
            data: this.Plan.filter(item => item !== undefined)
          },
          {
            backgroundColor: 'orange',
            fill: false,
            borderWidth: 2,
            label: 'Отгруженные (сумма): ' + this.Shipped.filter(i => i !== undefined).reduce((acc, item) => {
              return (acc + item)
            }, 0).toLocaleString(),
            data: this.Shipped.filter(item => item !== undefined)
          },
          {
            backgroundColor: 'darkred',
            fill: false,
            borderWidth: 2,
            label: 'Долг (сумма): ' + this.Dept.filter(i => i !== undefined).reduce((acc, item) => {
              return (acc + item)
            }, 0).toLocaleString(),
            data: this.Dept.filter(item => item !== undefined)
          }
        ]
      },
      {
        title: {
          display: true,
          text: 'Планируемые поступления по `Организация` (период 1 год)'
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
              max: 14000000
            }
          }],
          yAxes: [{
            stacked: false,
            ticks: {
              callback: (value) => {
                const item = this.Percent.find(item => item.name === value)
                return `${value} (${item ? Math.round(item.percent * 100) : 0}%)`
              },
              max: 14000000,
              fontColor: '#000'
            }
          }]
        },
        onClick: this.handle
      })
    },

    handle(_, event) {
      if (event[0]) {
        const item = this.Data.find(i => i.client_name === event[0]._view.label)
        this.$router.push({ name: 'budget_income', query: { query: item.bills }})
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
