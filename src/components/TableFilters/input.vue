<!--  eslint-disable vue/no-mutating-props  -->
<template>
  <div class="el-input el-input-number el-input-number--mini is-without-controls">
  <input
    v-model="filters[property]"
    size="mini"
    placeholder="текстовый"
    clearable
    class="el-input__inner el-input--mini"
    style="height: 28px"
    @change="change($event)"
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

  methods: {
    change(e) {
      e.stopPropagation();
      //console.log('change from Input')
      this.$emit('input', this.filters)
    }
  },

}
</script>

<style lang="scss" scoped>

</style>
