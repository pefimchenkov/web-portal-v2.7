<template>
  <div class="dashboard-editor-container">

    <panel-group
      :current-created-remonts="currentCreatedRemonts"
      :current-created-comments="currentCreatedComments"
      :jira-active-users="jiraActiveUsers"
      :cbr-dollar="cbr_dollar"
      :cbr-euro="cbr_euro"
      @handleSetLineChartData="handleSetLineChartData"
    />

    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart-atlas
        :chart-data="created_Atlas_resolved"
      />
    </el-row>

    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart-other
        :chart-data="created_Other_resolved"
      />
    </el-row>

  </div>
</template>

<script>
import PanelGroup from './components/PanelGroup'
import LineChartAtlas from './components/LineChartAtlas'
import LineChartOther from './components/LineChartOther'

import { getCreatedAtlasRemonts, getResolvedAtlasRemonts, getCreatedOtherRemonts, getResolvedOtherRemonts, getCurrentCreatedRemonts } from '@/api/statistics/remonts'
import { getCurrentCreatedComments } from '@/api/statistics/comments'
import { getJiraActiveUsers } from '@/api/statistics/jira'

import { mapGetters } from 'vuex'

export default {

  name: 'DashboardAdmin',
  components: {

    PanelGroup,
    LineChartAtlas,
    LineChartOther
  },

  data() {
    return {

      createdAtlasRemonts: [],
      resolvedAtlasRemonts: [],
      createdOtherRemonts: [],
      resolvedOtherRemonts: [],

      currentCreatedRemonts: null,
      currentCreatedComments: null,
      jiraActiveUsers: null,
      interval: []

    }
  },

  computed: {

    created_Atlas_resolved() {
      
      return {
        createdData: this.createdAtlasRemonts,
        resolvedData: this.resolvedAtlasRemonts,
        interval: this.interval

      }
    },

    created_Other_resolved() {
      
      return {
        createdData: this.createdOtherRemonts,
        resolvedData: this.resolvedOtherRemonts,
        interval: this.interval

      }
    },

    ...mapGetters(['cbr_dollar', 'cbr_euro'])

  },

  created() {
    this.getCreatedAtlasRemonts();
    this.getResolvedAtlasRemonts();
    this.getCreatedOtherRemonts()
    this.getResolvedOtherRemonts()

    this.getCurrentCreatedRemonts();
    this.getCurrentCreatedComments();
    this.getJiraActiveUsers();
    this.$store.dispatch('getRatefromCB');
  },

  methods: {

    handleSetLineChartData() {
      // this.lineChartData = this.lineChartData[type]
    },

    /* ***** */
    async getCreatedAtlasRemonts() {
      const res = await getCreatedAtlasRemonts()
      this.createdAtlasRemonts = res.map(i => i.Qty)
      this.interval = res.map(i => i.Month)
    },

    async getCreatedOtherRemonts() {
      const res = await getCreatedOtherRemonts()
      this.createdOtherRemonts = res.map(i => i.Qty)
      this.interval = res.map(i => i.Month)
    },

    async getResolvedAtlasRemonts() {
      const res = await getResolvedAtlasRemonts()
      this.resolvedAtlasRemonts = res.map(i => i.Qty)
    },

    async getResolvedOtherRemonts() {
      const res = await getResolvedOtherRemonts()
      this.resolvedOtherRemonts = res.map(i => i.Qty)
    },

    /* ***** */

    async getCurrentCreatedRemonts() {
      const res = await getCurrentCreatedRemonts()
      this.currentCreatedRemonts = res[0].Remonts
    },

    async getCurrentCreatedComments() {
      const res = await getCurrentCreatedComments()
      this.currentCreatedComments = res[0].Comments
    },

    async getJiraActiveUsers() {
      const res = await getJiraActiveUsers()
      this.jiraActiveUsers = res[0].Logins
    }

  }

}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}

</style>
