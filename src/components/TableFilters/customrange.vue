<!-- eslint-disable -->
<template>
  <div style="display: flex">
    <!-- v-if="isFilter" -->
    <el-input
      v-model.number="filters[property][0]"
      :min="0"
      :controls="false"
      size="mini"
      style="width: 60px; flex: auto;"
      @input="input"
    />
    <!-- v-if="isFilter" -->
    <el-input
      v-model.number="filters[property][1]"
      :min="0"
      :controls="false"
      size="mini"
      style="width: 60px; flex: auto;"
      @input="input"
    />
  </div>
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

  computed: {
    isFilter() {
      return this.filters[this.property]?.length
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
