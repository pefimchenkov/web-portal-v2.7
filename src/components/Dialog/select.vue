<!-- eslint-disable vue/no-mutating-props -->
<template>
  <el-select
    v-loading="!options.length"
    v-model="form[value]"
    filterable
    clearable
    :loading="loading"
    :multiple="multiple"
    :value-key="id"
    :style="{ width: width }"
  >
    <el-option
      v-for="item in options"
      :key="setKey(item)"
      :value="item"
      :label="item[name]"
      :options="item"
    >
      {{ setName(item) }}
    </el-option>
  </el-select>
</template>

<script>
export default {
  props: {
    form: {
      type: Object,
      required: true
    },
    id: {
      type: String,
      default: 'id'
    },
    value: {
      type: [String, Object],
      required: true
    },
    name: {
      type: String,
      default: 'name'
    },
    options: {
      type: Array,
      default: () => []
    },
    multiple: {
      type: [Boolean, String],
      default: false
    },
    width: {
      type: String,
      default: () => ''
    },
  },

  data() {
    return {
      loading: false,
    }
  },

  methods: {
    setKey(item) {
      return typeof item === 'object'
        ? item[this.id]
        : item
    },
    setName(item) {
      return typeof item === 'object'
        ? item[this.name]
        : item
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
