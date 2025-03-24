<!-- eslint-disable vue/no-mutating-props -->
<template>
  <el-input
    v-model="form[value]"
    :disabled="disabled"
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
    disabled: {
      type: Boolean,
      default: () => false
    },
    inputWidth: {
      type: String,
      default: () => ''
    }
  },
}
</script>
<style lang="scss" scoped>
  .customWidth{
    width: var(--inputWidth);
}
</style>
