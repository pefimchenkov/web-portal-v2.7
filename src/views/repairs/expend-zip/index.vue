<template>
  <el-tabs v-model="activeTab" type="border-card">
    <el-tab-pane
      v-for="firm of firms"
      :key="firm.id"
      :label="`Сводная таблица по ${firm.name}`"
      :name="firm.name"
    >
      <Table
        v-if="activeTab === firm.name"
        :firm="firm"
        class="chart"
        style="height: 100%"
      />
    </el-tab-pane>
  </el-tabs>
</template>

<script>

import { firms } from './table/data.js'

export default {

  components: {
    Table: () => import('./table/index.vue')
  },

  data() {
    return {
      firms,
      activeTab: 'Атлас Про',
    }
  },
}
</script>

<style lang="scss" scoped>
  .chart {
    margin: 10px
  }
</style>
