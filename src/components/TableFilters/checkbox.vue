<!-- eslint-disable vue/no-mutating-props -->

<template>
  <el-checkbox
    v-model="filters[property]"
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
