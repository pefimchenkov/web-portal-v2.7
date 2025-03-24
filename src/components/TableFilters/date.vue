<!-- eslint-disable vue/no-mutating-props -->

<template>
  <el-date-picker
    v-model="filters[property]"
    format="dd.MM.yy HH:mm"
    placeholder="Выбор диапазона"
    type="daterange"
    :default-time="['00:00:00', '23:59:59']"
    value-format="timestamp"
    start-placeholder="От"
    end-placeholder="До"
    size="mini"
    style="max-width: 160px; font-size: 0.6rem !important;"
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
      pickerOptions: {
        disabledDate(time) {
          return (time.getTime()) > Date.now()
        },
      },
    }
  },
  methods: {
    input() {
      this.$emit('input', this.filters)
    }
  },

}
</script>

<style lang="scss">

</style>
