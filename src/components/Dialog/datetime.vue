<!-- eslint-disable vue/no-mutating-props -->
<template>
  <el-date-picker
    v-model="form[value]"
    format="dd.MM.yy"
    placeholder="Выбор диапазона"
    type="daterange"
    :picker-options="pickerOptions"
    value-format="timestamp"
    :default-time="['00:00:00', '23:59:59']"
    start-placeholder="От"
    end-placeholder="До"
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
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        },
      },
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
