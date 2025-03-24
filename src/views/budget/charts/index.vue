<template>
  <v-tabs v-model="active" centered fixed-tabs icons-and-text class="mt-3">
    <v-tabs-slider />
    <v-tab href="#tab-curr">Текущий квартал
      <v-icon>list</v-icon>
    </v-tab>
    <v-tab href="#tab-prev">Предыдущий квартал
      <v-icon>list</v-icon>
    </v-tab>
    <v-tab href="#tab-period">Предыдущий период
      <v-icon>list</v-icon>
    </v-tab>
    <!--Текущий квартал -->
    <v-tab-item :value="'tab-curr'">
      <v-container fluid>
        <v-row
          align="center"
          justify="center"
          class="grey lighten-5"
        >
          <v-col cols="6">
            <QuarterCurrentMonth1 />
          </v-col>
          <v-col cols="6">
            <QuarterCurrentMonth1Sum />
          </v-col>
        </v-row>
        <v-row
          align="center"
          justify="center"
          class="grey lighten-5"
        >
          <v-col cols="6">
            <QuarterCurrentMonth2 />
          </v-col>
          <v-col cols="6">
            <QuarterCurrentMonth2Sum />
          </v-col>
        </v-row>
        <v-row
          align="center"
          justify="center"
          class="grey lighten-5"
        >
          <v-col cols="6">
            <QuarterCurrentMonth3 />
          </v-col>
          <v-col cols="6">
            <QuarterCurrentMonth3Sum />
          </v-col>
        </v-row>
      </v-container>
    </v-tab-item>
    <!-- Предыдущий квартал -->
    <v-tab-item :value="'tab-prev'">
      <v-container fluid>
        <v-row
          align="center"
          justify="center"
          class="grey lighten-5"
        >
          <v-col cols="9">
            <QuarterPrevMonth1 />
          </v-col>
        </v-row>
        <v-row
          align="center"
          justify="center"
          class="grey lighten-5"
        >
          <v-col cols="9">
            <QuarterPrevMonth2 />
          </v-col>
        </v-row>
        <v-row
          align="center"
          justify="center"
          class="grey lighten-5"
        >
          <v-col cols="9">
            <QuarterPrevMonth3 />
          </v-col>
        </v-row>
      </v-container>
    </v-tab-item>
    <!--Предыдущий период-->
    <v-tab-item :value="'tab-period'">
      <v-container fluid>
        <v-row
          align="center"
          justify="center"
          class="grey lighten-5"
        >
          <v-col cols="9">
            <QuarterCurrentPrevious />
          </v-col>
        </v-row>
      </v-container>
    </v-tab-item>
  </v-tabs>
</template>

<script>
import QuarterPrevMonth1 from './quarter-previous/month-1'
import QuarterPrevMonth2 from './quarter-previous/month-2'
import QuarterPrevMonth3 from './quarter-previous/month-3'
import QuarterCurrentMonth1 from './quarter-current/month-1'
import QuarterCurrentMonth1Sum from './quarter-current/month-1-sum'
import QuarterCurrentMonth2 from './quarter-current/month-2'
import QuarterCurrentMonth2Sum from './quarter-current/month-2-sum'
import QuarterCurrentMonth3 from './quarter-current/month-3'
import QuarterCurrentMonth3Sum from './quarter-current/month-3-sum'
import QuarterCurrentPrevious from './quarter-current/quarter-prev'

export default {
  components: {
    QuarterPrevMonth1,
    QuarterPrevMonth2,
    QuarterPrevMonth3,
    QuarterCurrentMonth1,
    QuarterCurrentMonth1Sum,
    QuarterCurrentMonth2,
    QuarterCurrentMonth2Sum,
    QuarterCurrentMonth3,
    QuarterCurrentMonth3Sum,
    QuarterCurrentPrevious
  },
  data() {
    return {
      window: {
        width: 0,
        height: 0
      },
      active: 'tab-curr'
    }
  },
  computed: {
  },
  watch: {
  },
  created() {
    window.addEventListener('resize', this.handleResize)
    this.handleResize()
  },
  destroyed() {
    window.removeEventListener('resize', this.handleResize)
  },
  mounted() {
  },
  methods: {
    handleResize() {
      this.window.width = window.innerWidth
      this.window.height = window.innerHeight
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
