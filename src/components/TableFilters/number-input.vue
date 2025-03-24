<!-- eslint-disable -->
<template>
  <el-input-number
    v-model="filters[property]"
    size="mini"
    placeholder="числовой"
    clearable
    :controls="false"
    :min="1"
    :max="10000"
    style="width: 70px"
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
