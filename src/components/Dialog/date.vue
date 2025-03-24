<!-- eslint-disable vue/no-mutating-props -->
<template>
  <el-date-picker
    v-model="form[value]"
    format="dd.MM.yy"
    placeholder="Выбор даты"
    size="small"
    style="max-width: 190px"
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
  data() {
    return {
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
