<!-- eslint-disable vue/no-mutating-props -->
<template>
  <el-switch
    v-model="form[value]"
    active-text="Наличие"
    inactive-text="Всё"
  >
  </el-switch>
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
