<template>
  <v-container fluid>

    <el-tabs
      v-model="active"
      stretch
      @tab-click="handleClick"
    >
      <el-tab-pane name="list">
        <span slot="label"><i class="el-icon-money" /> Текущие</span>
        <FinanceList />
      </el-tab-pane>
      <el-tab-pane v-if="!roles.find(role => role === 'limitedFinancier')" name="history" @click.stop="getData">
        <v-row v-if="loading" :key="loading" style="height: 90vh">
          <v-col v-loading="loading" />
        </v-row>
        <span v-else slot="label"><i class="el-icon-refresh-left" /> История</span>
        <FinanceHistory
        />
      </el-tab-pane>
      <el-tab-pane v-if="!roles.find(role => role === 'limitedFinancier')" label="Импорт" name="excel">
        <span slot="label"><i class="el-icon-upload" /> Импорт</span>
        <UploadExcel
        />
      </el-tab-pane>
    </el-tabs>

  </v-container>
</template>

<script>
import FinanceList from './components/FinanceList'
import FinanceHistory from './components/FinanceHistory'
import UploadExcel from './components/upload-excel.vue'

export default {

  components: {
    FinanceList,
    FinanceHistory,
    UploadExcel
  },

  data() {
    return {
      active: 'list',
      updated: false,
      loading: false,
      key: 1
    }
  },
  computed: {

    roles() {
      return this.$store.getters.userRole
    }

  },
  methods: {

    handleClick(tab) {
      if (tab.name === 'history') this.getData()
    },

    getData() {
      this.loading = true

      this.$store.dispatch('finance/getHistory', { root: true })
        .then(() => {
          setTimeout(() => {
            this.loading = false
          }, 1000)
        })
    },

  }
}
</script>

<style lang="scss" scoped>
</style>
