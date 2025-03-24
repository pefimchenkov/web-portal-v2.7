
<template>
  <div>
    <v-row justify="center">

      <v-radio-group
        v-model="quarter"
        row
      >
        <v-radio
          :label="getQuarter[0].label"
          :value="getQuarter[0].value"
        />
        <v-radio
          :label="getQuarter[1].label"
          :value="getQuarter[1].value"
        />
      </v-radio-group>

    </v-row>
    <v-row justify="center" align="center">

      <v-col cols="12" align="center">
        <SaleChart
          :key="quarter"
          :month-per-quarter="MonthPerQuarter"
        />
      </v-col>
      <v-col cols="12" align="center">
        <ProfitChart
          :key="quarter"
          :month-per-quarter="MonthPerQuarter"
        />
      </v-col>

    </v-row>
  </div>
</template>

<script>
import SaleChart from './SaleChart'
import ProfitChart from './ProfitChart'
import moment from 'moment'

export default {
  components: {
    SaleChart,
    ProfitChart
  },
  data() {
    return {
      quarter: moment().quarter()
    }
  },
  computed: {
    getQuarter() {
      return [
        { label: 'Текущий квартал', value: moment().quarter() },
        { label: 'Предыдущий квартал', value: moment().quarter() - 1 }
      ]
    },
    // eslint-disable-next-line vue/return-in-computed-property
    MonthPerQuarter() {
      const year = new Date().getFullYear()
      if (this.quarter === 1) return { months: [1, 2, 3], year }
      else if (this.quarter === 2) return { months: [4, 5, 6], year }
      else if (this.quarter === 3) return { months: [7, 8, 9], year }
      else if (this.quarter === 4) return { months: [10, 11, 12], year }
      else if (this.quarter === 0) return { months: [10, 11, 12], year: year - 1 }
    }
  }
}
</script>
