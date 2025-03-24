<!-- eslint-disable vue/no-mutating-props -->
<template>
  <el-select
    v-model="form[value]"
    v-loading="loading"
    filterable
    clearable
    :loading="loading"
    remote
    loading-text="Загрузка..."
    :remote-method="getData"
    :multiple="multiple"
    :value-key="id"
    :style="{ width: width }"
  >
    <el-option
      v-for="item in localOptions"
      :key="setKey(item)"
      :value="item"
      :label="item[name]"
      :options="item"
    >
      {{ item[name] }}
    </el-option>
  </el-select>

</template>

<script>
export default {
  props: {
    form: {
      type: Object,
      required: true,
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
      type: Boolean,
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
      localOptions: []
    }
  },

  created() {
    if (this.form[this.value] && Array.isArray(this.form[this.value])) {
      this.form[this.value].forEach(item => this.getData(item[this.name]))
    }
    if (this.form[this.value]) {
      this.getData(this.form[this.value]?.name)
    }
  },

  methods: {
    setKey(item) {
      return typeof item === 'object'
        ? item[this.id]
        : item
    },
    getData(query) {
      if (query !== '') {
        this.loading = true
        setTimeout(() => {
          this.loading = false
          this.localOptions = this.options.filter(item => {
            return item[this.name]?.toLowerCase().indexOf(query?.toLowerCase()) > -1
          })
        }, 400)
      } else {
        this.localOptions = []
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
