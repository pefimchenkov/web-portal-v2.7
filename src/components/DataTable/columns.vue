<template>
  <el-dropdown v-if="visible" placement="top" trigger="click" :hide-on-click="false">
    <div>Управление колонками</div>
    <el-dropdown-menu slot="dropdown" style="padding: 5px !important">

      <el-button size="small" type="warning" plain icon="el-icon-view" @click="showAllColumn">Выбрать все</el-button>
      <el-button size="small" type="success" plain icon="el-icon-finished" @click="saveColumnFB">Сохранить</el-button>

      <el-dropdown-item
        v-for="(header, i) in headers"
        :key="i"
        dense
      >
        <el-checkbox
          v-if="header.visible"
          v-model="header.selected"
          :label="header.text"
          :value="header.selected"
        />
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  name: 'TableColumns',
  props: {
    headers: {
      type: Array,
      required: true
    },

    name: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      visible: true
    }
  },

  created() {
    this.loadColumns()
  },

  methods: {

    async loadColumns() {
      const columns = await this.$store.dispatch('app/getTableColumns', this.name)
      if (!columns) return this.$emit('returnEmptyColumns', { type: 'warning', message: 'Конфигурация колонок отсутствует в базе данных, либо не выбрано ни одной!' })

      this.headers.forEach(header => {
        if (!header.visible) return
        for (var key in columns) {
          if (key === header.value) {
            header.selected = columns[key]
          }
        }
      })
    },

    showAllColumn() {
      this.headers.forEach(header => {
        header.selected = true
      })
    },

    saveColumnFB() {
      const columns = {};

      this.headers.forEach(header => {
        header.selected === null || header.selected === undefined
          ? columns[header.value] = false
          : columns[header.value] = header.selected
      })

      this.menu = false
      this.visible = false

      console.log({ columns, name: this.name })

      this.$store
        .dispatch('app/setTableColumns', { columns, name: this.name })
        .then(res => {
          console.log('response', res)

          this.$notify({ type: 'success', message: res })
          this.visible = true
        })
        .catch(e => this.$notify({ type: 'error', message: e }))
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
