<template>

  <el-dropdown trigger="click">
    <span>
      Сохранённые фильтры
    </span>
    <el-dropdown-menu slot="dropdown" disabled>
      <div class="box-card">
        <el-dropdown-item
          v-for="(filter, i) of filters"
          :key="i"
          v-model="parentFilters"
          style="text-align: center; font-size: 1.1em;"
          disabled
        >
          {{ filter.name }}
        </el-dropdown-item>
        <el-dropdown-item divided />

        <el-button plain type="success" size="mini" disabled @click="showFilterName = true">Создать</el-button> <!-- disabled ="$acl.not.check('Edit')" -->
        <el-button plain type="warning" size="mini" @click="$emit('reset-filter')">Сбросить</el-button>
      </div>

    </el-dropdown-menu>
  </el-dropdown>

</template>

<script>
export default {

  props: {

    filters: {

      type: Array,
      default: () => []

    }

  },

  data() {
    return {

      parentFilters: [],
      showFilterName: false,
      loading: false,
      show: false

    }
  },

  watch: {

    parentFilters(val) {
      console.log(val)
      this.$emit('set-parent-filters', val)
    }

  },

  methods: {

  }

}
</script>

<style lang="scss" scoped>
  .box-card {
    padding: 15px;
  }
  .el-dropdown-link {
    cursor: pointer;
    color: #409EFF;
  }
</style>
