<!-- eslint-disable vue/no-mutating-props -->
<template>
  <el-checkbox
    v-model="form[value]"
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
    }
  },
}
</script>

<style lang="scss" scoped>

</style>
