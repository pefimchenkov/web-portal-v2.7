<template>

  <el-tabs v-model="active" @tab-click="handleClick">
    <el-tab-pane label="Текущие" name="first"><Cards /></el-tab-pane>
    <el-tab-pane label="История" name="second"><History /></el-tab-pane>
  </el-tabs>

</template>

<script>
import Cards from './cards'
import History from './history'

export default {

  components: {

    Cards,
    History

  },

  data() {
    return {
      active: true
    }
  }

}
</script>

<style lang="scss" scoped>
</style>
