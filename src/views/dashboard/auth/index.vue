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

    <div style="height: 70dvh; overflow: auto">
      <el-row style="background:#fff; padding:16px 16px 0; margin-bottom:32px;">
        <line-chart-atlas
          :chart-data="created_Atlas_resolved"
        />
      </el-row>

      <el-row style="background:#fff; padding:16px 16px 0; margin-bottom:32px;">
        <line-chart-warehouse
          :chart-data="warehouse"
        />
      </el-row>
    </div>

  </div>
</template>

<script>
import PanelGroup from './components/PanelGroup'
import LineChartAtlas from './components/LineChartAtlas'
import LineChartWarehouse from './components/LineChartWarehouse'

import {
    getCreatedAtlasRemonts,
    getResolvedAtlasRemonts,
    getCreatedOtherRemonts,
    getResolvedOtherRemonts,
    getCurrentCreatedRemonts,
    getClosedPresales,
    getClosedAcceptance,
    getClosedDelivery,
    getClosedTemporaryUsed,
    getClosedIssuance,
    getClosedNoms
  } from '@/api/statistics/remonts'

import { getCurrentCreatedComments } from '@/api/statistics/comments'
import { getJiraActiveUsers } from '@/api/statistics/jira'

import { mapGetters } from 'vuex'

export default {

  name: 'DashboardAdmin',
  components: {

    PanelGroup,
    LineChartAtlas,
    LineChartWarehouse
  },

  data() {
    return {

      createdAtlasRemonts: [],
      resolvedAtlasRemonts: [],
      createdOtherRemonts: [],
      resolvedOtherRemonts: [],
      closedPresales: [],
      closedAcceptance: [],
      closedDelivery: [],
      closedTemporaryUsed: [],
      closedIssuance: [],
      closedNoms: [],

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

    warehouse() {
      return {
        presalesData: this.closedPresales,
        acceptanceData: this.closedAcceptance,
        deliveryData: this.closedDelivery,
        temporaryUsedData: this.closedTemporaryUsed,
        issuanceData: this.closedIssuance,
        nomsData: this.closedNoms,
        interval: this.interval

      }
    },

    ...mapGetters(['cbr_dollar', 'cbr_euro'])

  },

  created() {
    this.getCreatedAtlasRemonts();
    this.getResolvedAtlasRemonts();
    this.getCreatedOtherRemonts();
    this.getResolvedOtherRemonts();
    this.getClosedPresales();
    this.getClosedAcceptance();
    this.getClosedDelivery();
    this.getClosedTemporaryUsed();
    this.getClosedIssuance();
    this.getClosedNoms();

    this.getCurrentCreatedRemonts();
    this.getCurrentCreatedComments();
    this.getJiraActiveUsers();

    this.$store.dispatch('getRatefromCB');
  },

  methods: {

    handleSetLineChartData() {
      // this.lineChartData = this.lineChartData[type]
    },

    /* ********************************** */
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

    async getClosedPresales() {
      const res = await getClosedPresales()
      //console.log('closedPresales', res)
      this.closedPresales = res.map(i => i.Qty)
    },

    async getClosedAcceptance() {
      const res = await getClosedAcceptance()
      //console.log('closedAcceptance', res)
      this.closedAcceptance = res.map(i => i.Qty)
    },

    async getClosedDelivery() {
      const res = await getClosedDelivery()
      //console.log('closedDelivery', res)
      this.closedDelivery = res.map(i => i.Qty)
    },

    async getClosedTemporaryUsed() {
      const res = await getClosedTemporaryUsed()
      //console.log('closedTemporaryUsed', res)
      this.closedTemporaryUsed = res.map(i => i.Qty)
    },

    async getClosedIssuance() {
      const res = await getClosedIssuance()
      //console.log('closedIssuance', res)
      this.closedIssuance = res.map(i => i.Qty)
    },

    async getClosedNoms() {
      const res = await getClosedNoms()
      //console.log('closedNoms', res)
      this.closedNoms = res.map(i => i.Qty)
    },

    /* ********************************* */

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
