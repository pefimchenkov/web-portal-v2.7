<template>
  <el-dropdown v-if="visible" placement="bottom" trigger="click" :hide-on-click="false">
    <el-button size="mini" icon="el-icon-s-operation">
      Настройки
    </el-button>
    <el-dropdown-menu slot="dropdown" style="padding: 5px !important">
      <el-dropdown-item dense>
        <el-checkbox :value="showHeader" @change="setShowHeader">Заголовок </el-checkbox>
        <el-checkbox :value="showSortable" @change="setShowSortable">Сортировка </el-checkbox>
        <el-checkbox :value="textAlign" @change="setTextAlign">Текст по центру </el-checkbox>
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: true,
    },
    showHeader: {
      type: Boolean,
      default: () => true
    },
    showSortable: {
      type: Boolean,
      default: () => false
    },
    textAlign: {
      type: Boolean,
      default: () => true
    }
  },

  methods: {
    setShowHeader(val) { return this.$emit('setShowHeader', val) },
    setShowSortable(val) { return this.$emit('setShowSortable', val) },
    setTextAlign(val) { return this.$emit('setTextAlign', val)  },
  },
}
</script>

<style lang="scss" scoped></style>
