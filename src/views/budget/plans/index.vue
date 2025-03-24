<template>

  <el-tabs type="border-card" v-model="active">

    <el-tab-pane label="Расходы" name="Расходы">
      <Payments />
    </el-tab-pane>

    <el-tab-pane label="График планирования" name="График планирования">
      <ChartWeeks
        v-loading="!isTotalsAvailable"
        v-if="isTotalsAvailable"
        :chart-data="totals"
      />
    </el-tab-pane>

    <el-tab-pane label="По дням в году" style="height: 87vh;" name="По дням в году">
      <Days
        v-loading="!isTotalsAvailable"
        v-if="isTotalsAvailable"
        :totals="totals"
      />
    </el-tab-pane>

    <el-tab-pane label="По неделям в году" name="По неделям в году">
      <Weeks
        v-loading="!isTotalsAvailable"
        v-if="isTotalsAvailable"
        :totals="totals"
      />
    </el-tab-pane>

    <el-tab-pane label="По месяцам в году" name="По месяцам в году">
      <Months
        v-loading="!isTotalsAvailable"
        v-if="isTotalsAvailable"
        :totals="totals"
      />
    </el-tab-pane>



  </el-tabs>
</template>

<script>
//import Depts from './depts'
import ChartWeeks from './totals/chart_weeks.vue'
import Payments from './payments/index.vue'
import Days from './totals/days'
import Weeks from './totals/weeks'
import Months from './totals/months'

import { getTotals } from "@/api/budget/finances"


export default {

  components: {
    /* Depts, */
    ChartWeeks,
    Payments,
    Days,
    Weeks,
    Months
  },


  data() {
    return {
      totals: {},
      active: 'График планирования'

    }
  },

  computed: {
    isTotalsAvailable() {
      return Object.keys(this.totals).length
    },
  },

  async mounted() {

    this.totals = await getTotals();

  },



}
</script>

<style lang="scss" scoped>

  .el-tabs__content {
    height: 90vh !important;
  }

</style>
