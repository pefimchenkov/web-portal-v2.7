<template>
  <div v-loading="!tableData.length" :style="`height: 80vh` || !tableData.length">

    <Dialog
      v-if="dialog"
      v-loading="loading"
      :show="dialog"
      :items="dialogItems"
      :options="dialogOptions"
      :action="action"
      :data="editedItem"
      @add="addModels"
      @update="updateModels"
      @closeDialog="close"
    />

    <v-toolbar color="#eaeff5" class="text-lg-right elevation-2 mb-1" dense style="width: 100%">
      <v-toolbar-title>Модели</v-toolbar-title>
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
          table-name="models"
      />

      <v-spacer />

      <!-- МЕНЮ ДЕЙСТВИЙ -->
      <el-dropdown trigger="click" :hide-on-click="false">
        <el-button size="mini" icon="el-icon-s-operation">
          Действия
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>
            <TableColumns
              :headers="tableHeaders"
              name="modelsColumn"
            />
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <v-divider class="mx-3" inset vertical />

      <el-button
        type="primary"
        size="mini"
        class="mr-5"
        @click="addItem"
      >
        Добавить
      </el-button>
    </v-toolbar>

    <!-- ТАБЛИЦА -->
    <el-table
      v-if="tableData.length"
      ref="modelsTable"
      :key="key"
      :data="paginatedTableData"
      :max-height="showHeader ? WindowHeight : ''"
      border
      stripe
      fit
      lazy
      row-key="ID"
      size="mini"
      :default-sort="{
        prop: 'ID',
        order: 'discending'
      }"
      :header-cell-style="{
        background: '#f3f3f3',
        color: '#6e6e6e'
      }"
      style="width: 100%; height: 100%"
      @sort-change="customSort"
    >
      <el-table-column
        v-for="(column, idx) in selectedHeaders"
        :key="column.id"
        :prop="column.value"
        :label="column.text"
        :align="textAlign ? 'center' : 'left'"
        :min-width="column.width"
        :fixed="column.fixed"
        resizable
        :sortable="
          Object.hasOwn(templateHeaders[idx], 'sortable') && showSortable
            ? column.sortable
            : false
        "
        show-overflow-tooltip
        :formatter="column.formatter ? null : formatterData"
      >
        <!-- слот для кастомного форматирования данных строки -->
        <template v-if="column.formatter" #default="{ row }">
          <component
            :is="column.formatter"
            v-if="column.formatter"
            :row="row"
            :column="column.value"
            @update="editItem"
            @remove="removeItem"
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
            :options="filtersOptions"
            :filters="filters"
            :types="{
              InputNumber: ['ID'],
              Input: ['MODEL'],
              MultiSelect: ['TYPE', 'VENDOR', 'EMAIL'],
              Date: ['DATE'],
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

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getPaginationData"
    />

  </div>
</template>

<script>

import { templateHeaders, reference, exportFileName, dialogItems, dialogOptions } from './data.js'
import { parseTime } from '@/utils'
import { getUserName } from '@/filters/jira-users.js'
import { createHeaders, createSelectOptionsFromTableData, headersToObject, setRemoteCustomSort } from '@/components/DataTable/utils.js'

import { addOne, updateOne, deleteOne } from '@/api/models/models.js'
// import { getAllByModel } from '@/api/models/engineers.js'
import { mapState } from 'vuex';

import { filterHandler } from '@/workers/filters.js'

export default {

  filters: {
    parseTime,
    getUserName
  },

  components: {
    TableColumns: () => import('@/components/DataTable/columns.vue'),
    TableFilters: () => import('@/components/TableFilters/index.vue'),
    Pagination: () => import('@/components/Pagination'),
    // eslint-disable-next-line vue/no-reserved-component-names
    Dialog: () => import('@/components/Dialog'),

    ExportExcel: () => import('@/components/ExportExcel')
    
  },

  data() {
    return {

      /* Local data */
      tableData: [],
      editedItem: {},
      prevItem: {},
      filterOptions: {},
      filters: {},
      filteredTableData: [],
      paginatedTableData: [],
      tableHeaders: [],
      formatters: [],

      dialog: false,
      action: 'add',
      key: Math.random(1, 9) * 1000000,
      loading: false,
      WindowHeight: null,
      showHeader: true,
      showSortable: false,
      textAlign: true,
      total: 0,
      listQuery: {
        page: 1,
        limit: 25
      },

      /* From ext data */
      templateHeaders,
      headersToObject,
      reference,
      exportFileName,
      dialogItems,
      dialogOptions,
    }
  },

  computed: {
    selectedHeaders() { return this.tableHeaders.filter(header => header.selected) },
    user() { return this.$store.getters.currentUser },

    ...mapState({
      Models: state => state.models.models,
      ModelsCategory: state => state.models.categories,
      ModelsEngineers: state => state.models.engineers,
      ModelsProfile: state => state.models.profiles,
      ModelsType: state => state.models.types,
      ModelVendors: state => state.models.vendors,
    }),
  },

  watch: {
    filteredTableData: {
      immediate: true,
      deep: true,
      handler() {
        this.getPaginationData()
      }
    },
  },

  beforeMount() {
    this.WindowHeight = window.innerHeight - 150;
    this.filters = JSON.parse(localStorage.getItem(this.reference)) || {};
  },

  mounted() {
    window.addEventListener('resize', this.getWindowHeight)
  },

  async created() {
    this.tableHeaders = createHeaders(this.templateHeaders)
    if (!this.Models?.length) await this.$store.dispatch('models/models')
    if (!this.ModelVendors?.length) this.$store.dispatch('models/vendors')
    if (!this.ModelsCategory?.length) this.$store.dispatch('models/categories')
    if (!this.ModelsProfile?.length) this.$store.dispatch('models/profiles')
    if (!this.ModelsEngineers?.length) this.$store.dispatch('models/engineers')
    if (!this.ModelsType?.length) this.$store.dispatch('models/types')
    
    this.getModels();

    this.formatters = [
      { name: 'EMAIL', formatter: getUserName },
      { name: 'TYPE' },
      { name: 'VENDOR' }
    ]
    this.filtersOptions = createSelectOptionsFromTableData({ data: this.tableData, columns: this.formatters });

    /* Web Worker для фильтров */
    
    this.updateData();

    /* *********************** */
  },

  methods: {

    /* Форматирование входных данных */
    formatterData(row, column, cellValue) {
      if (column.property === 'DATE') {
        return cellValue ? new Date(cellValue).toLocaleDateString('ru') : null
      }
      if (column.property === 'EMAIL') {
        return cellValue ? getUserName(cellValue) : null
      }
      return cellValue
    },
    /* ------------------------------ */

    customSort({ prop, order }) {
      console.log(prop, order);
      if (!order) return
      this.filteredTableData = this.tableData.sort((a, b) => setRemoteCustomSort(a, b, prop, order))
    },

    getModels() {
      this.tableData = this.filteredTableData = [...this.Models]
    },

    getOptionsForSelect() {
      this.dialogItems.forEach(obj => {
        if (Object.prototype.hasOwnProperty.call(obj, 'options')) {
          if (obj.value === 'VENDOR' && !obj.options.length) obj.options = [...this.ModelVendors]
          if (obj.value === 'CAT_EQ' && !obj.options.length) obj.options = [...this.ModelsCategory]
          if (obj.value === 'BASIC' && !obj.options.length) obj.options = [...this.ModelsProfile]
          if (obj.value === 'TYPE' && !obj.options.length) obj.options = [...this.ModelsType]
          if (obj.value === 'EMAIL' && !obj.options.length) {
            obj.options = this.ModelsEngineers.map(item => {
              return { ...item, name: getUserName(item.engineer) }
            })
          }
        }
      })
    },

    getWindowHeight(event) {
      this.WindowHeight = event.target.innerHeight - 150
    },

    getPaginationData() {
      this.paginatedTableData = this.filteredTableData.filter((item, index) => index < this.listQuery.limit * this.listQuery.page && index >= this.listQuery.limit * (this.listQuery.page - 1))
      this.total = this.filteredTableData.length
    },

    /* updateData(data) {
      this.filteredTableData = data || this.tableData
    }, */

    updateData() {
      this.$worker.run(filterHandler , [JSON.stringify(this.filters), JSON.stringify(this.tableData), JSON.stringify(this.formatters)])
        .then(res => {
          this.filteredTableData = (res || this.tableData)
          localStorage.setItem(this.reference, JSON.stringify(this.filters))
        })
        .catch(console.error)
    },

    updateFilters(val) {
      if (val) this.filters = { ...val }
    },

    resetFilters() {
      this.filters = {}
      this.updateData()
    },

    addItem() {
      this.dialog = true
      this.action = 'add'
      this.getOptionsForSelect()
    },

    async editItem(item) {
      this.action = 'update'
      this.dialog = true
      this.loading = true
      this.getOptionsForSelect();
      /* const engineers = await getAllByModel({ id: item.ID })
      if (!engineers.length) this.$notify({ type: 'warning', message: 'Внимание! Ответственные инженеры не назначены.' }) */
      this.loading = false

      this.prevItem = {
        ...item,
        CAT_EQ: this.ModelsCategory.find(i => i.id === item.CATEGORY),
        BASIC: this.ModelsProfile.find(i => i.id === item.PROFILE),
        displayName: getUserName(item.EMAIL),
      }
      this.editedItem = {
        ...item,
        TYPE: this.ModelsType.find(i => i.name === item.TYPE),
        VENDOR: this.ModelVendors.find(i => i.name === item.VENDOR),
        CAT_EQ: this.ModelsCategory.find(i => i.id === item.CATEGORY),
        BASIC: this.ModelsProfile.find(i => i.id === item.PROFILE),
        /* EMAIL: engineers.length
          ? this.ModelsEngineers.filter(obj => engineers.map(item => item.engineer).includes(obj.engineer))
          : [], */

        user: this.user.email,
        displayName: getUserName(item.EMAIL),
      }
    },

    close() {
      this.dialog = false
      this.loading = false
      this.editedItem = {}
    },

    /*  Внешние CRUD методы с использованием API */

    async addModels(form) {
      addOne({ ...form, user: this.user.email, displayName: getUserName(this.user.email), })
        .then(async res => {
          if (!res.insertId) {
            return this.$notify({ type: 'error', message: 'Произошла ошибка в процессе добавления Модели.' })
          }
          await this.$store.dispatch('models/models')
          this.getModels()
          this.$notify({ type: 'success', message: 'Информация успешно добавлена.' })
          this.close()
        })
        .catch(err => {
          console.log(err)
          this.$notify({ type: 'error', message: err })
        })
    },

    async updateModels(form) {
      updateOne({ newData: form, prevData: this.prevItem })
        .then(async() => {
          await this.$store.dispatch('models/models')
          this.getModels()
          this.$notify({ type: 'success', message: 'Информация успешно обновлена.' })
          this.close()
        })
        .catch(err => {
          console.log(err)
          this.$notify({ type: 'error', message: err })
        })
    },

    removeItem(item) {
      const index = this.filteredTableData.indexOf(item)
      console.log(index)
      this.$confirm('Удаляем?', item.MODEL)
        .then(() => {
          deleteOne({
            ID: item.ID,
            DISPLAY_NAME: getUserName(this.user.email),
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

