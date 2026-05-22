<template>
  <div v-loading="!tableData.length" fluid :style="`height: 80vh` || !tableData.length">

    <v-toolbar color="#eaeff5" class="text-lg-right elevation-2 mb-1" dense style="width: 100%">
      <v-toolbar-title>Закупки</v-toolbar-title>
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

      <!-- МЕНЮ ДЕЙСТВИЙ -->
      <el-dropdown
        trigger="click"
        :hide-on-click="false">
        <el-button icon="el-icon-s-operation">
          Действия
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>
            <TableColumns
              :headers="tableHeaders"
              name="purchasesColumn"
            />
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </v-toolbar>

    <!-- ТАБЛИЦА ЗАКАЗОВ -->
    <el-table
      v-if="tableData.length"
      :data="paginatedTableData"
      :max-height="showHeader ? WindowHeight : ''"
      border
      stripe
      fit
      lazy
      row-key="id"
      size="mini"
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
            :url="jira_url"
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
              Input: ['summary', 'product_name', 'ART_1C', 'PN', 'number_purchase', 'ikey'],
              MultiSelect: ['status', 'subdivision', 'organization', 'iniciator', 'assigneer'],
              Select: ['type_element'],
              CheckBox: ['qty'],
              Date: ['created', 'date_crit'],
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

import { templateHeaders, reference, exportFileName } from './data.js'
import { parseTime } from '@/utils'
import { getFirmNameById, getPriceTypeNameById } from './utils'
import { getUserName } from '@/filters/jira-users.js'
import { createHeaders, createSelectOptionsFromTableData, headersToObject, setRemoteCustomSort } from '@/components/DataTable/utils.js'

import { getPurchases } from '@/api/market/orders'
import { jira_url } from '@/settings.js'

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
  },

  data() {
    return {

      /* Local data */
      tableData: [],
      options: {},
      filteredTableData: [],
      paginatedTableData: [],
      tableHeaders: [],
      filters: {},
      formatters: [],

      jira_url,
      menu: false,
      toggle: true,
      loading: false,
      WindowHeight: null,
      showHeader: true,
      showSortable: false,
      textAlign: true,

      /* From ext data */
      templateHeaders,
      headersToObject,
      reference,
      exportFileName,

      total: 0,
      listQuery: {
        page: 1,
        limit: 26
      },
    }
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


  computed: {
    selectedHeaders() { return this.tableHeaders.filter(header => header.selected) },
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
    await this.getData()

    this.formatters = [
      { name: 'status'},
      { name: 'type_element' },
      { name: 'subdivision' },
      { name: 'organization' },
      { name: 'assigneer' },
      { name: 'iniciator' }
    ]

    this.options = createSelectOptionsFromTableData({ data: this.tableData, columns: this.formatters })

    this.customSort({ prop: "created", order: "ascending" })

    /* Web Worker для фильтров */

      this.updateData();

    /* *********************** */
  },

  methods: {
    async getData() {
      await getPurchases()
        .then(res => {
          this.tableData = [...res]
          this.filteredTableData = [...res]
        })
    },

    getWindowHeight(event) {
      this.WindowHeight = event.target.innerHeight - 150
    },

    updateData() {
      this.$worker.run(filterHandler , [JSON.stringify(this.filters), JSON.stringify(this.tableData), JSON.stringify(this.formatters)])
        .then(res => {
          this.filteredTableData = (res || this.tableData)
          localStorage.setItem(this.reference, JSON.stringify(this.filters))
        })
        .catch(console.error)
    },

    /* updateData(data) {
      if (data) this.filteredTableData = data
      else this.filteredTableData = this.tableData
    }, */

    updateFilters(val) {
      if (val) this.filters = { ...val }
    },

    resetFilters() {
      this.filters = {}
      this.updateData()
    },

    getPaginationData() {
      this.paginatedTableData = this.filteredTableData.filter((item, index) => index < this.listQuery.limit * this.listQuery.page && index >= this.listQuery.limit * (this.listQuery.page - 1))
      this.total = this.filteredTableData.length
    },

    customSort({ prop, order }) {
      console.log(prop, order);
      if (!order) return
      this.filteredTableData = this.tableData.sort((a, b) => setRemoteCustomSort(a, b, prop, order))
    },


    /* Форматирование входных данных */

    formatterData(row, column, cellValue) {
      if (column.property === 'created' || column.property === 'date_crit') {
        return cellValue ? new Date(cellValue).toLocaleDateString('ru') : null
      }
      if (column.property === 'reporter') {
        return cellValue ? getUserName(cellValue) : null
      }
      if (column.property === 'firm') {
        return getFirmNameById(cellValue)
      }
      if (column.property === 'price_type') {
        return getPriceTypeNameById(cellValue)
      }
      return cellValue
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

