<!--  eslint-disable vue/no-mutating-props  -->
<template>
  <el-select
    v-model="filters[property]"
    size="mini"
    clearable
    filterable
    multiple
    collapse-tags
    placeholder="мульти-список"
    @change="select"
  >
    <div style="display: flex; justify-content: center; background: #e7e7e7;">
      <el-checkbox v-model="checked">Выбрать всё</el-checkbox>
    </div>
    
    <el-option
      v-for="item in getOptions(options)"
      :key="item"
      :value="item"
    >
      <span style="width: 300px; overflow: hidden">{{ item }}</span>
    </el-option>
  </el-select>

</template>

<script>
export default {
  props: {
    filters: {
      type: Object,
      default: () => {}
    },
    property: {
      type: String,
      default: () => null
    },
    options: {
      type: Object,
      default: () => {}
    }
  },

  watch: {
    checked(val) {
      if (val) {
        // eslint-disable-next-line vue/no-mutating-props
        this.filters[this.property] = [ ...this.options[this.property] ];
      } else {
        // eslint-disable-next-line vue/no-mutating-props
        this.filters[this.property] = [];
      }
    },

    'filters': {
      deep: true,
      handler(val) {
        if (!val[this.property]?.length) {
          this.checked = false;
        }
      }
    }
  },

  data() {
    return {
      checked: false
    }
  },

  methods: {

    select() {
      console.log('change from multiselect')
      this.$emit('input', this.filters);
    },

    getOptions(options) {
      return options[this.property];
    }
  },

}
</script>

<style lang="scss" scoped>

</style>
