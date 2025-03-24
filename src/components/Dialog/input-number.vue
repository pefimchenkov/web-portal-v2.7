<!-- eslint-disable vue/no-mutating-props -->
<template>
  <el-input
    v-model.number="form[value]"
    clearable
    :class="inputWidth ? `customWidth` : ''"
  />
</template>

<script>
export default {
  props: {
    form: {
      type: Object,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    width: {
      type: String,
      default: () => ''
    },
    inputWidth: {
      type: String,
      default: () => ''
    }
  }
}
</script>
<style lang="scss" scoped>
  .customWidth{
    width: var(--inputWidth);
}
</style>
