<template>
  <div v-loading="!tableData.length" :style="`height: 84vh` || !tableData.length">

    <Dialog
      v-if="dialog"
      v-loading="loading"
      :show="dialog"
      :items="dialogItems"
      :options="dialogOptions"
      :action="action"
      :data="editedItem"
      @update="updateInvoice"
      @closeDialog="close"
    />

    <v-toolbar color="#eaeff5" class="text-lg-right elevation-2 mb-1" dense style="width: 100%">
      <v-toolbar-title>Неактивные счета</v-toolbar-title>
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
        v-model="textCenter"
      >Текст по центру
      </el-checkbox>
      <v-divider class="mx-3" inset vertical />

      <v-spacer />

      <div style="min-width: 100px;">
        <el-tag>ЦБ: {{ Cbr_Dollar?.toFixed(2) }} $</el-tag>
      </div>

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
              name="budgetIncomeColumn"
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
      ref="budgetIncomeTable"
      :key="key"
      :data="paginatedTableData"
      :max-height="showHeader ? WindowHeight : ''"
      border
      stripe
      fit
      lazy
      show-summary
      :summary-method="getSummaries"
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
        :align="column.align || (textCenter ? 'center' : 'left')"
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
            v-if="column.formatter"
            :is="column.formatter"
            :row="row"
            :column="column.value"
            :options="{ project: Projects }"
            :actions="column.actions"
            @update="editItem"
            @update-manual="updateManual"
            @removeCustoms="removeCustoms"
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
              Input: ['num', 'pay', 'sum'],
              MultiSelect: ['contractorName'],
              Select: ['currency', 'project'],
              CheckBox: ['sale_num'],
              Date: ['date', 'pay_date', 'sale_date'],
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
    >
    </pagination>

  </div>
</template>

<script>

import { templateHeaders, reference, exportFileName, dialogItems, dialogOptions } from './data_invoices.js'
import { parseTime } from '@/utils'
import { getUserName } from '@/filters/jira-users.js'
import { createHeaders, createSelectOptionsFromTableData, headersToObject, setRemoteCustomSort, getSummariesRow } from '@/components/DataTable/utils.js'
import { mapState } from 'vuex'

import { getHistoricalRates } from '@/api/cbr.js'
import { getManualBills, setManualBills, removeManualBills, setActive } from '@/api/budget/income'

import { filterHandler } from '@/workers/filters.js'

export default {

  filters: {
    parseTime,
    getUserName
  },

  components: {
    TableColumns: () => import('@/components/DataTable/columns.vue'),
    TableFilters: () => import('@/components/TableFilters/index.vue'),
    Pagination: () => import('@/components/Pagination/index.vue'),
    Dialog: () => import('@/components/Dialog/index.vue'),
  },

  data() {
    return {

      tableData: [],
      editedItem: {},
      prevItem: {},
      filterOptions: {},
      filters: {},
      filteredTableData: [],
      paginatedTableData: [],
      tableHeaders: [],
      formatters: [],
      manualBills: [],

      dialog: false,
      action: 'add',
      key: Math.random(1, 9) * 1000000,
      loading: false,
      WindowHeight: null,
      showHeader: true,
      showSortable: false,
      textCenter: false,
      total: 0,
      listQuery: {
        page: 1,
        limit: 27
      },

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

    ...mapState({
      Invoice: state => state.atlas_1c.getAtlasInvoice,
      Sales: state => state.atlas_1c.getAtlasSales,
      IncomingPayments: state => state.atlas_1c.incomingPayments,
      Projects: state => state.atlas_1c.getAtlasProjects,
      Cbr_Dollar: state => state.currency.Cbr_Dollar
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


  // ================================= ХУКИ ===================================== //

  beforeMount() {
    this.WindowHeight = window.innerHeight - 220;
    this.filters = JSON.parse(localStorage.getItem(this.reference)) || {};
  },

  mounted() {
    window.addEventListener('resize', this.getWindowHeight)
  },


  async created() {
    const dateStart = "2023-09-01";
    const dateEnd = parseTime(new Date(), '{y}-{m}-{d}');
    const dates = { dateStart, dateEnd }

    this.tableHeaders = createHeaders(this.templateHeaders);
    
    await this.$store.dispatch('getRatefromCB');
    
    if (!this.Invoice?.length)
      await this.$store.dispatch('atlas_1c/getAtlasInvoice', { method: 'POST', dates });
    if (!this.Sales?.length)
      await this.$store.dispatch('atlas_1c/postAtlasSales', dates);
    if (!this.IncomingPayments?.length)
      await this.$store.dispatch('atlas_1c/getAtlasIncomingPayments', dates);

    this.manualBills = await getManualBills();
    const dollar_rate = await getHistoricalRates({ currency: 'dollar' });

    const inactiveManualBills = this.manualBills.map(i => {
      return i.active === 0 ? i : null
    }).filter(i => i)

    const filteredInvoices = this.Invoice.filter(invoice => inactiveManualBills.some(bill => bill.bill_1c === invoice.num));


    const commonData = filteredInvoices.map((item, i) => {
      const manualBill = this.manualBills.find(data => data.bill_1c === item.num);
      const incomingPaymentsArr = this.IncomingPayments.filter(payment => payment.orderNum === item.num);
      const sales = this.Sales.filter(sale => sale.invoiceNum === item.num);


      const sale_nums = sales.map(sale => sale?.num);
      const sale_sum_arr = sales.map(sale => {
        return item.currency === 'USD'
          ? (sale?.sum * (+this.getRateFromHistory(dollar_rate.ValCurs.Record, sale?.date, 0)?.Value[0].replace(',', '.')))
          : sale?.sum
      })

      const sale_sum = sale_sum_arr.reduce((a,b) => (a+b),0)
      const pay_date = sales[sales.length - 1]?.date ? this.addDays(sales[sales.length - 1]?.date, 14) : this.addMonths(new Date(), 1);


      return {
          id: i+1,
          sale_num: sale_nums.join(),
          sale_date: sales[sales.length - 1]?.date,
          sale_sum: sale_sum,
          pay: incomingPaymentsArr,
          pay_date: manualBill?.pay_date ? new Date(manualBill.pay_date) : pay_date,
          manual_pay_date: Boolean(manualBill?.pay_date),
          rate: +this.getRateFromHistory(dollar_rate.ValCurs.Record, item.date, 0)?.Value[0].replace(',', '.'),
          dolg_red: this.setDolgRed(sale_sum, incomingPaymentsArr, pay_date),
          dolg_orange: this.setDolgOrange(sale_sum, incomingPaymentsArr, pay_date),
          num_status: manualBill ? manualBill.active : 1,
          
          ...item,
        }
    })


    this.tableData = this.filteredTableData = [...commonData].filter(i => i)
    this.customSort({ prop: "date", order: "ascending" })

    this.formatters = [
      { name: 'currency' },
      { name: 'contractorName' },
      { name: 'project' },
      { name: 'pay', formatter: this.objToString }
    ]
    this.filtersOptions = createSelectOptionsFromTableData({ data: this.tableData, columns: this.formatters });

    /* Web Worker для фильтров */
    this.updateData();
    /* *********************** */

  },

  // =============================================== МЕТОДЫ ================================================ //

  methods: {

    getWindowHeight(event) {
      this.WindowHeight = event.target.innerHeight - 220;
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
      this.action = 'add'
      this.dialog = true
    },

    async editItem(item) {
      this.editedItem = {
        ...item,
        num_status: Boolean(item.num_status),
      };

      this.setSelectOptionsForEdit([
        { name: 'project', value: this.Projects }
      ]);
      
      this.action = 'update'
      this.dialog = true

    },

    updateInvoice(item) {
      console.log(item)
      setManualBills(item)
        .then(res => {
          console.log(res)
          if (res.affectedRows) {
            let row = this.paginatedTableData.find(data => data.num === item.num);
            row.num_status = +item.num_status;
            row.pay_date = new Date(item.pay_date);
            row.manual_pay_date = true;
            this.$notify({ type: "success", message: "Данные успешно обновлены" })
          }
        })
        .catch(err => this.$notify({ type: "error", message: err.message }))
        .finally(() => this.dialog = false)
    },

    removeCustoms(item) {
      removeManualBills({ bill_1c: item.num })
      .then(res => {
          console.log(res)
          if (res.affectedRows) {
            let row = this.paginatedTableData.find(data => data.num === item.num);
            row.num_status = 1;
            row.pay_date = this.addDays(new Date(item.sale_date), 14);
            row.manual_pay_date = false;
            this.$notify({ type: "success", message: "Данные успешно удалены" })
          }
        })
        .catch(err => this.$notify({ type: "error", message: err.message }))
        .finally(() => this.dialog = false)
    },



    updateManual({ column, row, value }) {
      this.loading = true;

      switch (true) {
        case column === 'num_status': {
          const data = {
            bill_1c: row.num,
            active: +value,
            date: (new Date()).toISOString(),
            email: this.email
          }

          console.log(data)

          setActive(data)
            .then(res => {
              console.log('manual active', res)
              this.$notify({ type: "success", message: "Статус счёта успешно обновлен" });
            })
            .catch(err => {
              console.log(err.message)
              this.$notify({ type: "error", message: "Ошибка при обновлении Статуса счёта" })
            })
            .finally(() => this.loading = false)
          return
        }
      }
    },





    close() {
      this.dialog = false
      this.loading = false
      this.editedItem = {}
    },

    objToString(val) {
      return JSON.stringify(val
        .map(i => i.paymentSum)
        .reduce((a, b) => { return a + b }, 0))
    },

    getSummaries(params) {
      const { columns } = params
      const props = [
        'sale_sum',
        'dolg_red',
        'dolg_orange',
        { name: 'sum', currency: 'USD' },
        { name: 'pay', value: 'paymentSum' }
      ]
      return getSummariesRow(columns, this.filteredTableData, props)
    },

    addMonths(date, months) {
      var d = date.getDate();
      date.setMonth(date.getMonth() + +months);
      if (date.getDate() !== d) {
        date.setDate(0);
      }
      return date;
    },

    addDays(date, days) {
      var today = new Date(date);
      var plusOneWeek = new Date();
      return new Date(plusOneWeek.setTime( today.getTime()+(days*24*3600*1000) ))
    },

    setDolgRed(sale_sum, pay_sum_arr, pay_date) {
      const pay_date_time = new Date(pay_date).getTime();
      const now_time = new Date().getTime();
      const pay_sum = pay_sum_arr
        .map(i => i.paymentSum)
        .reduce((a, b) => { return a + b }, 0)
        .toFixed(2)


      if (Math.sign(pay_date_time - now_time) === -1) {
        return sale_sum ? (sale_sum - pay_sum) : null;
      }
    },

    setDolgOrange(sale_sum, pay_sum_arr, pay_date) {
      const pay_date_time = new Date(pay_date).getTime();
      const now_time = new Date().getTime();
      const pay_sum = pay_sum_arr
        .map(i => i.paymentSum)
        .reduce((a, b) => { return a + b }, 0)
        .toFixed(2)

      if (Math.sign(pay_date_time - now_time) === 1) {
        return sale_sum ? (sale_sum - pay_sum) : null;
      }
    },

     /* Форматирование входных данных */
    formatterData(row, column, cellValue) {
      if (column.property === 'date' || column.property === 'sale_date' ) {
        return cellValue ? new Date(cellValue).toLocaleDateString('ru') : null
      }

      if (column.property === 'sale_sum' || column.property === 'sum') {
        return cellValue ? cellValue.toLocaleString('ru') : null
      }

      if (column.property === 'rate') {
        return row['currency'] === 'USD' ? cellValue : null;
      }

      return cellValue
    },
    /* ------------------------------ */

    getRateFromHistory(data, day, x) {
      if (x === 5) return;
      const res = data
        .find(obj => obj.$.Date === new Date(new Date(day).setDate(new Date(day).getDate() - x))
        .toLocaleDateString('ru'))
      if (res) return res
      else return this.getRateFromHistory(data, day, x+1)
    }

  }

}
</script>

<style scoped>
.models {
	word-break: break-all
}
.cursor_btn {
	cursor: pointer;
	touch-action: none;
}
.maxWidth {
	max-width: 100px !important;
}
</style>
./data_invoice.js/index.js