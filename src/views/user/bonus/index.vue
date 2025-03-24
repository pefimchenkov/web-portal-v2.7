<template>
  <v-tabs
    v-model="active"
    centered
    fixed-tabs
    icons-and-text
    show-arrows
  >
    <v-tabs-slider />

    <v-tab href="#card">
      <v-icon>mdi-ticket-percent</v-icon>
    </v-tab>
    <v-tab href="#charts" :disabled="loading || $acl.not.check('Admin')">
      <v-icon>mdi-chart-bar</v-icon>
    </v-tab>

    <v-tab-item :value="'card'">
      <bonusCard />
    </v-tab-item>
    <v-tab-item :value="'charts'">
      <bonusCharts />
    </v-tab-item>

  </v-tabs>

</template>

<script>
import bonusCard from './components/bonusCard'
import bonusCharts from './components/bonusCharts'

export default {
  components: {
    bonusCard,
    bonusCharts
  },
  data() {
    return {
      active: true
    }
  },
  computed: {
    loading() {
      return this.$store.getters.loading
    }
  },
  beforeCreate() {
    this.$store.dispatch('usersForChartSale')
    this.$store.dispatch('usersForChartProfit')
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
</style>
