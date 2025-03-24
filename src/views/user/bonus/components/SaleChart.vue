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
        xAxes: [{ stacked: true }],
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
      UsersSale: state => state.user.ChartUsersSale
    })
  },

  async mounted() {
    this.loaded = false
    try {
      this.data = await this.$store.dispatch('dataForChartSale', { Users: this.UsersSale, MonthPerQuarter: this.monthPerQuarter })
      this.data = _.sortBy(this.data, o => o.pointsX)
      const emails = this.data.map(item => item.email).reverse()
      const names = emails.map(email => {
        return this.Jira_Users.find(user => user.email === email).display_name
      })
      this.chartdata = {
        labels: names,
        datasets: [
          {
            label: 'Факт',
            backgroundColor: 'rgba(120, 250, 120, 0.3)',
            borderColor: 'grey',
            borderWidth: 1,
            data: this.data.map(item => item.pointsX).reverse()
          },
          {
            label: 'Теория',
            backgroundColor: 'rgba(130, 210, 255, 0.3)',
            borderColor: 'grey',
            borderWidth: 1,
            data: this.data.map(item => item.points).reverse()
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
