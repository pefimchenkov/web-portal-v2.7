<template>

  <list :engineers-stock="EngineersStock" :engineers-stock-archive="EngineersStockArchive" :engineers-stock-good="EngineersStockGood" />

</template>

<script>
import list from '@/views/engineers-stock/components/list'
import { mapGetters } from 'vuex'

export default {

  components: { list },

  computed: {

    ...mapGetters(['EngineersStock', 'EngineersStockGood', 'EngineersStockArchive', 'jira_users'])

  },

  async created() {
    if (this.EngineersStock.length === 0) await this.$store.dispatch('fetchEngineersStock')
    if (this.EngineersStockGood.length === 0) await this.$store.dispatch('fetchEngineersStockGood')
    if (this.EngineersStockArchive.length === 0) await this.$store.dispatch('fetchEngineersStockArchive')
    if (this.jira_users.length === 0) await this.$store.dispatch('fetchJiraUsers')
  }

}
</script>

<style lang="scss" scoped>
</style>
