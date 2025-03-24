<template>
  <el-tabs v-model="activeTab" type="border-card">
    <el-tab-pane
      v-for="item of children"
      :key="item.id"
      :label="`${item.name}`"
      :name="item.value"
    >
      <component
        :is="item.value"
        :user="user"
        class="chart"
        style="height: 100%"
      />
    </el-tab-pane>
  </el-tabs>
</template>

<script>

export default {

  components: {
    Types: () => import('./types/list.vue'),
    Vendors: () => import('./vendors/list.vue')
  },

  data() {
    return {
      children: [
        { id: 1, name: 'Типы оборудования', value: 'Types' },
        { id: 2, name: 'Производители', value: 'Vendors' }
      ],
      activeTab: 'Types',
    }
  },

  computed: {
    user() { return this.$store.getters.currentUser }
  }
}
</script>

<style lang="scss" scoped>
  .chart {
    margin: 10px
  }
</style>
