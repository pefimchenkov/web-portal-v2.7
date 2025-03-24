<template>
  <div class="container">

    <bar-chart
      v-if="loaded"
      :chartdata="chartdata"
      :options="options"
    />

    <Loader v-else :width="500" :qty="56" :grid="[14, 4]" />

  </div>
</template>

<script>
import Loader from '@/components/shared/Loader'
import BarChart from './Chart'
import _ from 'lodash'
import { mapState } from 'vuex'

export default {
  name: 'BarChartContainer',

  components: { BarChart, Loader },
  // eslint-disable-next-line vue/require-prop-types
  props: ['monthPerQuarter'],
  data: () => ({
    loaded: false,
    chartdata: null,
    data: [],
    options: {
      responsive: true,
      aspectRatio: 1,
      maintainAspectRatio: false,
      scales: {
        xAxes: [{
          stacked: true
        }],
        yAxes: [{
          ticks: {
            max: 350000
          }
        }]
      }
    }
  }),
  computed: {
    ...mapState({
      Jira_Users: state => state.jira_users.JIRA_USERS,
      UsersProfit: state => state.user.ChartUsersProfit,
      BonusProfitSum: state => state.user.BonusProfitSum
    })
  },

  async mounted() {
    this.loaded = false
    try {
      this.dataSC = await this.$store.dispatch('dataForChartProfitSC', { Users: this.UsersProfit, MonthPerQuarter: this.monthPerQuarter })
      this.data = await this.$store.dispatch('dataForChartProfit', { Users: this.UsersProfit, MonthPerQuarter: this.monthPerQuarter })
      this.data = _.sortBy(this.data, o => o.points)
      this.dataSC = _.sortBy(this.dataSC, o => o.Points)
      const emails = this.data.map(item => item.email).reverse()
      const names = emails.map(email => {
        return this.Jira_Users.find(user => user.email === email).display_name
      })
      const fakeNames = name.length <= 19 ? 19 - names.length : 0
      for (let i = 1; i <= fakeNames; i++) {
        names.push('пусто')
      }
      this.chartdata = {
        labels: names,
        datasets: [
          {
            label: 'Факт',
            backgroundColor: 'rgba(120, 250, 120, 0.3)',
            borderColor: 'grey',
            borderWidth: 1,
            data: this.data.map(item => {
              const pointsSC = this.dataSC.find(sc => sc.email === item.email).Points
              return item.points + pointsSC
            }).reverse()
          },
          {
            label: 'Теория',
            backgroundColor: 'rgba(130, 210, 255, 0.3)',
            borderColor: 'grey',
            borderWidth: 1,
            data: this.data.map(item => {
              const pointsSCX = this.dataSC.find(sc => sc.email === item.email).PointsX
              const pointsSC = this.dataSC.find(sc => sc.email === item.email).Points
              return item.pointsX + pointsSCX + pointsSC
            }).reverse()
          }
        ]
      }
      this.loaded = true
    } catch (e) {
      console.error(e)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
