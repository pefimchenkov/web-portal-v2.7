<template>
  <div style="display: flex">
    <el-tooltip class="item" effect="dark" content="Сбросить фильтры" placement="top">
      <i
        class="el-icon-delete"
        style="font-size: 1.3em; cursor: pointer; margin: auto"
        :class="{
          isFiltersEmpty: dataInFilters,
          isFiltersNotEmpty: dataInFilters,
        }"
        @click="reset"
      />
    </el-tooltip>
  </div>
</template>

<script>
export default {
  props: {
    filters: {
      type: Object,
      default: () => {}
    },
    property: {
      type: String,
      default: () => null
    },
  },

  computed: {
    dataInFilters() {
      return Object.values(this.filters).some((item) => {
        if (Array.isArray(item) && item.every(i => !i)) return
        if (Array.isArray(item)) return item.length > 0
        else return item
      })
    },
  },

  methods: {
    reset() {
      this.$emit('resetFilters')
    },
  },

}
</script>

<style lang="scss" scoped>
.isFiltersEmpty {
  color: #999;
}
.isFiltersNotEmpty {
  color: red;
}
</style>
