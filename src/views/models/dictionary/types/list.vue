<template>
  <div
    v-loading="!tableData.length"
    :style="`height: 90vh;` || !tableData.length"
    style="width: 85%; margin: 0 auto;"
  >
    <Dialog
      v-if="dialog"
      :show="dialog"
      :items="dialogItems"
      :options="dialogOptions"
      :action="action"
      :data="editedItem"
      @add="add"
      @update="update"
      @closeDialog="close"
    />

    <v-toolbar color="#eaeff5" class="text-lg-right elevation-2 mb-1" dense style="width: 100%">
      <v-toolbar-title>Типы оборудования</v-toolbar-title>
      <v-divider class="mx-3" inset vertical />

      <!-- ОТКРЕП / ЗАКРЕП -->
      <el-checkbox
        v-model="showHeader"
      >Заголовок
      </el-checkbox>
      <el-checkbox
        v-model="showSortable"
      >Сортировка
      </el-checkbox>
      <el-checkbox
        v-model="textAlign"
      >Текст по центру
      </el-checkbox>
      <v-divider class="mx-3" inset vertical />

      <v-spacer />

      <ExportExcel
          :list="filteredTableData"
          :header="selectedHeaders.map(header => header.value)"
          :ru-header="selectedHeaders.map(header => header.text)"
          table-name="model_types"
      />

      <v-spacer />

      <el-button
        type="primary"
        class="mr-5"
        size="mini"
        @click="addItem"
      >
        Добавить
      </el-button>

      <!-- МЕНЮ ДЕЙСТВИЙ -->
      <el-dropdown trigger="click" :hide-on-click="false">
        <el-button icon="el-icon-s-operation" size="mini">
          Действия
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>
            <TableColumns
              :headers="tableHeaders"
              name="modelsTypesColumn"
              @returnEmptyColumns="returnEmptyColumns"
            />
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </v-toolbar>

    <!-- ТАБЛИЦА ТИПОВ ОБОРУДОВАНИЯ -->
    <el-table
      v-if="tableData.length"
      :data="filteredTableData"
      :max-height="showHeader ? WindowHeight : ''"
      border
      stripe
      fit
      lazy
      row-key="id"
      size="mini"
      :default-sort="{
        prop: 'id',
        order: 'descending'
      }"
      :header-cell-style="{
        background: '#f3f3f3',
        color: '#6e6e6e'
      }"
      style="width: 100%; height: 100%"
    >
      <el-table-column
        v-for="(column, idx) in selectedHeaders"
        :key="column.id"
        :prop="column.value"
        :label="column.text"
        :align="textAlign ? 'center' : 'left'"
        :width="column.width"
        :fixed="column.fixed"
        resizable
        :sortable="(`sortable` in templateHeaders[idx]) ? showSortable : column.sortable"
        show-overflow-tooltip
        :formatter="column.formatter ? null : formatterData"
      >
        <template v-if="column.formatter" #default="{ row }">
          <component
            :is="column.formatter"
            v-if="column.formatter"
            :row="row"
            :column="column.value"
            @update="editItem"
            @remove="remove"
          />
          <div v-else>
            {{ row[column.value] }}
          </div>
        </template>

        <!-- Заголовок таблицы -->
        <template slot="header" slot-scope="scope">
          <div style="word-break: keep-all;">{{ column.text }}</div>
          <TableFilters
            v-if="tableData.length"
            :reference="reference"
            :data="tableData"
            :options="options"
            :filters="filters"
            :types="{
              Input: ['name'],
              Clear: ['actions']
            }"
            :formatters="formatters"
            :property="scope.column.property"
            @updateData="updateData"
            @updateFilters="updateFilters"
            @resetFilters="resetFilters"
          />
        </template>

      </el-table-column>
    </el-table>

  </div>
</template>

<script>

import { templateHeaders, reference, exportFileName, dialogOptions, dialogItems } from './data.js'
import { createHeaders, headersToObject } from '@/components/DataTable/utils.js'
import { getUserName } from '@/filters/jira-users.js'

import { addOne, updateOne, deleteOne } from '@/api/models/types.js'
import { getAll } from '@/api/models/types'

export default {

  components: {
    TableColumns: () => import('@/components/DataTable/columns.vue'),
    TableFilters: () => import('@/components/TableFilters/index.vue'),
    Dialog: () => import('@/components/Dialog'),
    ExportExcel: () => import('@/components/ExportExcel')
  },

  props: {
    user: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    return {

      /* Local data */
      tableData: [],
      options: {},
      filteredTableData: [],
      tableHeaders: [],
      filters: {},
      formatters: [],
      editedItem: {},
      prevItem: {},

      dialog: false,
      action: 'add',
      loading: false,
      WindowHeight: null,
      showHeader: true,
      showSortable: false,
      textAlign: false,

      /* From ext data */
      templateHeaders,
      headersToObject,
      reference,
      exportFileName,
      dialogItems,
      dialogOptions
    }
  },

  computed: {
    selectedHeaders() { return this.tableHeaders.filter(header => header.selected) },
  },

  beforeMount() {
    this.WindowHeight = window.innerHeight - 210
  },

  mounted() {
    window.addEventListener('resize', this.getWindowHeight)
  },

  async created() {
    this.tableHeaders = createHeaders(this.templateHeaders)
    await this.$store.dispatch('fetchJiraUsers')
    await this.getData()
  },

  methods: {
    /* Форматирование входных данных */
    formatterData(row, column, cellValue) {
      return cellValue
    },
    /* ------------------------------ */

    async getData() {
      await getAll()
        .then(res => {
          this.tableData = [...res]
          this.filteredTableData = [...res]
        })
    },

    async add(form) {
      addOne({ ...form, displayName: getUserName(this.user.email), })
        .then(async res => {
          if (!res.insertId) {
            return this.$notify({ type: 'error', message: 'Произошла ошибка в процессе добавления Типа оборудования.' })
          }
          await this.$store.dispatch('models/types')
          this.getData()
          this.$notify({ type: 'success', message: 'Информация успешно добавлена.' })
          this.close()
        })
        .catch(err => {
          console.log(err)
          this.$notify({ type: 'error', message: err })
        })
    },

    async update(form) {
      updateOne({ newData: form, prevData: this.prevItem })
        .then(async() => {
          await this.$store.dispatch('models/types')
          this.getData()
          this.$notify({ type: 'success', message: 'Информация успешно обновлена.' })
          this.close()
        })
        .catch(err => {
          console.log(err)
          this.$notify({ type: 'error', message: err })
        })
    },
    remove(item) {
      const index = this.filteredTableData.indexOf(item)
      console.log(index)
      this.$confirm('Удаляем?', item.name)
        .then(() => {
          deleteOne({
            id: item.id,
            displayName: getUserName(this.user.email),
          })
            .then(() => {
              this.filteredTableData.splice(index, 1)
              this.$message({ type: 'success', message: 'Успешно удалено.' })
            })
            .catch(err => this.$message({ type: 'error', message: err }))
        })
        .catch(() => {
          this.$notify({ type: 'error', message: 'Отменено пользователем' })
        })
    },

    addItem() {
      this.dialog = true
      this.action = 'add'
    },

    editItem(item) {
      this.action = 'update'
      this.dialog = true
      this.editedItem = { ...item, displayName: getUserName(this.user.email) }
      this.prevItem = { ...item, displayName: getUserName(this.user.email) }
    },

    close() {
      this.dialog = false
      this.editedItem = {}
    },

    getWindowHeight(event) {
      this.WindowHeight = event.target.innerHeight - 210
    },

    updateData(data) {
      if (data) this.filteredTableData = data
      else this.filteredTableData = this.tableData
    },

    updateFilters(val) {
      if (val) this.filters = { ...val }
    },

    resetFilters() {
      this.filters = {}
      this.updateData()
    },

    returnEmptyColumns(val) {
      if (val) this.$notify(val)
    }
  }
}
</script>

<style scoped>
.cursor_btn {
	cursor: pointer;
	touch-action: none;
}
.resizeCheckbox {
    max-width: 120px !important;
	margin-top: 20px !important;
}
.el-dropdown {
  margin-right: 10px !important;
}
.v-input {
  font-size: 1.1em !important;
}
</style>

