<!-- eslint-disable -->
<template>
  <el-input-number
    v-model="filters[property]"
    size="mini"
    placeholder="числовой"
    :precision="2"
    :controls="false"
    style="width: 90px"
    @change="change"
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

  methods: {
    change() {
      //console.log('change from InputNumber ', this.filters)
      this.$emit('input', this.filters)
    }
  },

}
</script>

<style lang="scss" scoped>

</style>
