<template>
  <v-tabs
    v-model="active"
    centered
    fixed-tabs
    icons-and-text
    show-arrows
  >
    <v-tabs-slider />

    <v-tab href="#cards">
      <v-icon normal>mdi-cash</v-icon>
    </v-tab>
    <v-tab href="#history">
      <v-icon>mdi-history</v-icon>
    </v-tab>

    <v-tab-item :value="'cards'">
      <Cards />
    </v-tab-item>
    <v-tab-item :value="'history'">
      <History />
    </v-tab-item>

  </v-tabs>

  <!-- <el-tabs v-model="active" @tab-click="handleClick">
    <el-tab-pane label="Текущие" name="first"><Cards /></el-tab-pane>
    <el-tab-pane label="История" name="second"><History /></el-tab-pane>
    <el-tab-pane label="Импорт" name="third">Role</el-tab-pane>
  </el-tabs> -->

</template>

<script>
import Cards from './components/Cards'
import History from './components/History'

export default {
  components: {
    Cards,
    History
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
  methods: {
  }
}
</script>

<style lang="scss" scoped>
</style>
