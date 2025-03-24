<!--  eslint-disable vue/no-mutating-props  -->
<template>
  <el-input
    v-model="filters[property]"
    size="mini"
    placeholder="текстовый"
    clearable
    @input="input"
  />
</template>

<script>
export default {
  props: {
    property: {
      type: String,
      default: () => null
    },
    filters: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
    }
  },
  methods: {
    input() {
      this.$emit('input', this.filters)
    }
  },

}
</script>

<style lang="scss" scoped>

</style>
