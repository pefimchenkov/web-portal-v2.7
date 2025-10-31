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
      @update="updateSale"
      @closeDialog="close"
    >
    </Dialog>


    <v-toolbar color="#eaeff5" class="text-lg-right elevation-2 mb-1" dense style="width: 100%">
      <v-toolbar-title>Реестр поступлений</v-toolbar-title>
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

      <div>
        <AccountBalances />
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
              name="budgetIncomePaymentsColumn"
            />
          </el-dropdown-item>

          <el-dropdown-item>
            <!-- Экспорт -->
            <ExportExcel
              :list="filteredTableData"
              type="plain"
              :header="selectedHeaders.map(header => header.value)"
              :ru-header="selectedHeaders.map(header => header.text)"
              :table-name="exportFileName"
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
      v-loading="loading"
      ref="budgetIncomePaymentsTable"
      :key="tableData.length"
      :data="paginatedTableData"
      :max-height="showHeader ? WindowHeight : ''"
      show-summary
      border
      :summary-method="getSummaries"
      row-key="id"
      size="mini"
      :header-cell-style="{
        background: '#f3f3f3',
        color: '#6e6e6e'
      }"
      style="width: 100%"
      @sort-change="customSort"
    >
      <!-- Список столбцов таблицы -->
      <el-table-column
        v-for="(column, idx) in selectedHeaders"
        :key="column.id"
        :prop="column.value"
        :label="column.text"
        :align="column.align || (textCenter ? 'center' : 'left')"
        :min-width="column.width"
        :fixed="column.fixed"
        :resizable="column.resizable"
        show-overflow-tooltip
        :formatter="column.formatter ? null : formatterData"
        :sortable="Object.hasOwn(templateHeaders[idx], 'sortable') && showSortable
          ? column.sortable
          : false
        "
      >
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
              Input: ['paymentNum', 'orderNum', 'sfnum'],
              MultiSelect: ['contractorName'],
              Select: ['project', 'om', 'sm'],
              CheckBox: ['factoring', 'netting',],
              Date: ['paymentDate',],
              Clear: ['actions']
            }"
            :formatters="formatters"
            :property="scope.column.property"
            @updateData="updateData"
            @updateFilters="updateFilters"
            @resetFilters="resetFilters"
          />
        </template>

        <!-- слот для кастомного форматирования данных строки -->
        <template v-if="column.formatter" #default="{ row }">
          <component
            v-if="column.formatter"
            :is="column.formatter"
            :row="row"
            :column="column.value"
            :actions="column.actions"
            :options="{
              om: OM,
              sm: SM,
              project: Projects
            }"
            @update="editItem"
            @remove="removePayments"
          ></component>
          <div v-else>
            {{ row[column.value] + column.fix }}
          </div>
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

import { templateHeaders, reference, exportFileName, dialogItems, dialogOptions, } from './data_payments.js'
import { parseTime } from '@/utils'
import { getUserName } from '@/filters/jira-users.js'
import { getOrders,} from '@/api/budget/income'

import { createHeaders, createSelectOptionsFromTableData, headersToObject, setRemoteCustomSort, getSummariesRow } from '@/components/DataTable/utils.js'
import { mapState } from 'vuex'

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
    ExportExcel: () => import('@/components/ExportExcel'),
    AccountBalances: () => import('../account-balances.vue')
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
      OM: [],
      SM: [],

      dialog: false,
      action: 'add',
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
      dialogOptions,

    }
  },

  computed: {
    selectedHeaders() { return this.tableHeaders.filter(header => header.selected) },

    ...mapState({
      Invoices: state => state.atlas_1c.getAtlasInvoice,
      Sales: state => state.atlas_1c.getAtlasSales,
      IncomingPayments: state => state.atlas_1c.incomingPayments,
      Projects: state => state.atlas_1c.getAtlasProjects,
      DebtOffset: state => state.atlas_1c.getDebtOffset,
      Users: state => state.jira.users,
      Contractors: state => state.atlas_1c.getAtlasContractors,
      Cbr_Dollar: state => state.currency.Cbr_Dollar,
    }),

    currentUser() {
      return this.Users.find(item => item.email === this.email)
    },

    email() {
      return this.$store.state.user.currentUser.email
    },

  },

   watch: {
    filteredTableData: {
      immediate: true,
      deep: true,
      handler() {
        this.getPaginationData()
      }
    },

    listQuery: {
      deep: true,
      handler(val) {
        localStorage.setItem('incomePaymentsListQuery', JSON.stringify(val))
      }
    }

  },


  // ================================= ХУКИ ===================================== //

  beforeMount() {
    this.WindowHeight = window.innerHeight - 220;
    this.filters = JSON.parse(localStorage.getItem(this.reference)) || {};

    const incomePaymentsListQuery = localStorage.getItem('incomePaymentsListQuery');
    if (incomePaymentsListQuery) {
      this.listQuery = JSON.parse(incomePaymentsListQuery);
    }
  },

  mounted() {
    window.addEventListener('resize', this.getWindowHeight)
  },


  async created() {
    const dateStart = "2024-01-01";
    const dateStartForDebt = "2024-01-01";
    const dateEnd = parseTime(new Date(), '{y}-{m}-{d}');
    const dates = { dateStart, dateEnd }
    const datesForDebt = { dateStart: dateStartForDebt, dateEnd }

    this.tableHeaders = createHeaders(this.templateHeaders);

    /************** Блок получение данных по API ****************/
    
    if (!this.Invoices?.length)
      await this.$store.dispatch('atlas_1c/getAtlasInvoice');

    if (!this.Sales?.length)
      await this.$store.dispatch('atlas_1c/postAtlasSales', dates);

    if (!this.IncomingPayments?.length)
      await this.$store.dispatch('atlas_1c/getAtlasIncomingPayments', dates);

    if (!this.Users?.length)
      await this.$store.dispatch('jira/users');

    if (!this.LinkedClients?.length)
      await this.$store.dispatch('clients/getLinked')

    if (!this.Contractors?.length)
      await await this.$store.dispatch('atlas_1c/getAtlasContractors');

    if (!this.Projects?.length)
      await this.$store.dispatch('atlas_1c/getAtlasProjects');

    if (!this.DebtOffset?.length)
      await this.$store.dispatch('atlas_1c/getDebtOffset', datesForDebt);



    const Orders = await getOrders();

    


    /* ******************************************************** */


    this.OM = [...new Set(Orders?.map(order => this.Users.find(user => user.user_name === order.om)?.display_name).filter(Boolean))]
      .map((item, i) => {
        return { id: i, name: item, username: this.Users.find(user => user.display_name === item)?.user_name, }
      });

    this.SM = [...new Set(Orders?.map(order => this.Users.find(user => user.user_name === order.sm)?.display_name).filter(Boolean))]
      .map((item, i) => {
        return { id: i, name: item, username: this.Users.find(user => user.display_name === item)?.user_name, }
      });

    const debtOffset = [ ...new Set(this.DebtOffset.map(item => {
      return item.operations.map(i => {
        if (i.arm === 'debit') return i;
      })
    }).flat())]

    //console.log('IncomingPayments', this.IncomingPayments)
    //console.log('this.Sales', this.Sales)
    // console.log(debtOffset)
    // console.log('BASE', this.IncomingPayments.filter(pay => pay.orderNum.includes("23090000077"))) //77



    /*******  Наполнение данными и основное форматирование всех столбцов таблицы  *********/

    const commonData = this.IncomingPayments.map((item) => {
      const invoice = this.Invoices.find(invoice => invoice.num === item.orderNum);
      const sale = this.Sales.find(sale => sale.invoiceNum === item.orderNum);

      const factoring = debtOffset.filter(debt => debt?.subjectNum === item.orderNum && debt?.contractorCreditName === "Альфа Банк Факторинг");
      const netting = debtOffset.filter(debt => debt?.subjectNum === item.orderNum && debt?.contractorCreditName !== "Альфа Банк Факторинг");

      const factoring_sum_arr = factoring.map(debt => debt?.paymentSum);
      const netting_sum_arr = netting.map(debt => debt?.paymentSum);

      const factoring_sum = factoring_sum_arr.reduce((a, b) => (a + b), 0);
      const netting_sum = netting_sum_arr.reduce((a, b) => (a + b), 0);


      const om = Orders.find(m => m.Invoice === invoice?.docid)?.om;
      const sm = Orders.find(m => m.Invoice === invoice?.docid)?.sm;
      const iKey = Orders.find(m => m.Invoice === invoice?.docid)?.iKey;



      return {
        ...item,
          contractorName: (item?.contractorName || 'МВМ ООО'),
          project: invoice?.project,
          factoring: factoring_sum > 0 ? 'да' : null,
          netting: netting_sum > 0 ? 'да' : null,
          iKey,
          sfnum: sale?.sfnum,
          om: this.getDisplayName(om),
          sm: this.getDisplayName(sm),
        
        }
    })


    this.tableData = this.filteredTableData = [...commonData].filter(i => i)
    this.customSort({ prop: "paymentDate", order: "ascending" })

    this.formatters = [
      { name: 'project' },
      { name: 'om' },
      { name: 'sm' },
      { name: 'contractorName' },
    ]
    this.filtersOptions = createSelectOptionsFromTableData({ data: this.tableData, columns: this.formatters })
    

     /* Web Worker для фильтров */
    
     this.updateData();

    /* *********************** */

  },

  // =============================================== МЕТОДЫ ================================================ //

  methods: {

      calcManagerPercent(sum) {

        switch(true) {
          case sum <= 1500000: return 10;
          case sum > 1500000 && sum <= 5000000: return 8;
          case sum > 5000000: return 7;
        }
      },


    getWindowHeight(event) {
      this.WindowHeight = event.target.innerHeight - 220;
    },

    getPaginationData() {
      this.paginatedTableData = this.filteredTableData.filter((item, index) => index < this.listQuery.limit * this.listQuery.page && index >= this.listQuery.limit * (this.listQuery.page - 1))
      this.total = this.filteredTableData.length
    },

    customSort({ prop, order }) {
      if (!order) return
      this.filteredTableData = this.tableData.sort((a, b) => setRemoteCustomSort(a, b, prop, order))
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
      this.filteredTableData = data || this.tableData
    }, */

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
      this.editedItem = { ...item };
    
      this.setSelectOptionsForEdit([
        { name: 'om', value: this.OM },
        { name: 'sm', value: this.SM },
        { name: 'project', value: this.Projects }
      ]);

      this.action = 'update'
      this.dialog = true

    },

    updateManual({ column, row, value }) {
      console.log(column, row, value)
    },



    // **************************************************** //



    removePayments(item) {
      console.log('removePayments', item)
    },



    // ************************************************* //

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
        { name: 'paymentSum' },
      ]
      return getSummariesRow(columns, this.filteredTableData, props)
    },

    setSelectOptionsForEdit(data) {
      this.dialogItems.forEach(dialog_item => {
        data.forEach(item => {
          if (Object.prototype.hasOwnProperty.call(dialog_item, 'options')) {
            if (dialog_item.value === item.name) dialog_item.options = item.value;
          }
        })
      })
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


    setFactPayDate(payments) {
      return payments[payments.length - 1]?.paymentDate;
    },


     /* Форматирование входных данных */
    formatterData(row, column, cellValue) {
      if (column.property === 'paymentDate') {
        return cellValue ? new Date(cellValue).toLocaleDateString('ru') : null;
      }

      if (column.property === 'paymentSum') {
        return cellValue ? cellValue.toLocaleString('ru') : null;
      }

      if (column.property === 'rate') {
        return row['currency'] === 'USD' ? cellValue : null;
      }


      return cellValue;
    },
    /* ======================================================== */

    getRateFromHistory(data, day, x) {
      if (x === 5) return;
      const res = data
        .find(obj => obj.$.Date === new Date(new Date(day).setDate(new Date(day).getDate() - x))
        .toLocaleDateString('ru'))
      if (res) return res
      else return this.getRateFromHistory(data, day, x+1)
    },

    getDisplayName(data) {
      return this.Users.find(user => user.user_name === data || user.email === data)?.display_name;
    },

    getSumWithRate(sum, date, curr, rate) {
      switch (true) {
        case curr === 'USD': return (sum * (+this.getRateFromHistory(rate, date, 0)?.Value[0].replace(',', '.')))
        case curr === 'EUR': return (sum * (+this.getRateFromHistory(rate, date, 0)?.Value[0].replace(',', '.')))
        default: return sum
      }
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
