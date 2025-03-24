<!--  eslint-disable vue/no-mutating-props  -->
<template>
  <el-select
    v-model="filters[property]"
    size="mini"
    clearable
    filterable
    placeholder="список"
    @input="input"
  >
    <el-option
      v-for="item in getOptions(options)"
      :key="item"
      :value="item"
    />
  </el-select>
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
    options: {
      type: Object,
      default: () => {}
    }
  },
  methods: {
    input() {
      this.$emit('input', this.filters)
    },
    getOptions(options) {
      return options[this.property]
    }
  },

}
</script>

<style lang="scss" scoped>

</style>
