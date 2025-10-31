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
  />

  <v-toolbar color="#eaeff5" class="text-lg-right elevation-2 mb-1" dense style="width: 100%">
    <v-toolbar-title>Планируемые расходы</v-toolbar-title>
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
            name="budgetPlannedCostsColumn"
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
    ref="budgetOutgoingTable"
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
      :width="column.width"
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
            Input: ['isummary', 'pp', 'pplp', 'ikey',],
            MultiSelect: ['firma', 'ci'],
            Select: ['currency', 'istatus', 'forma', 'subdivision'],
            CheckBox: ['sum', 'stroki', 'total', 'bills'],
            Date: ['created', 'date_plan', 'date_crit', 'expense_period'],
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
          :options="{ }"
          :actions="column.actions"
          @update="editItem"
          @update-manual="updateManual"
          @remove="removePayment"
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
  />

</div>
</template>

<script>

  import { templateHeaders, reference, exportFileName, dialogItems, dialogOptions } from './data_plan.js'
  import { parseTime } from '@/utils'
  import { getUserName } from '@/filters/jira-users.js'
  import { getHistoricalRates } from '@/api/cbr.js'
  import { createHeaders, createSelectOptionsFromTableData, headersToObject, setRemoteCustomSort, getSummariesRow } from '@/components/DataTable/utils.js'

  import { /* updateOutgoingPayments */ } from '@/api/1c/atlas_1c.js'
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
        CfAnalitics: state => state.atlas_1c.getAtlasCfAnalitics,
        Users: state => state.jira.users,
        Cbr_Dollar: state => state.currency.Cbr_Dollar,
        Jira: state => state["budget/pays"].jira
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

      this.tableHeaders = createHeaders(this.templateHeaders);
  
      /******** Блок получение данных по API *********/
      
      if (!this.CfAnalitics?.length)
        await this.$store.dispatch('atlas_1c/getAtlasCfAnalitics');
      if (!this.Jira?.length)
        await this.$store.dispatch('budget/pays/jira');
      if (!this.Users?.length)
        await this.$store.dispatch('jira/users');

      await this.$store.dispatch('getRatefromCB');
  
  
      /* ******************************************** */
  
      const dollar_rate = await getHistoricalRates({ currency: 'dollar' });
      const euro_rate = await getHistoricalRates({ currency: 'euro' });
  
      if (!dollar_rate && !euro_rate) return this.$notify({ type: "error", message: "Не удалось получить историю курсов валюты. Попробуйте ещё раз." })
  
  
  
      /*******  Наполнение данными и основное форматирование всех столбцов таблицы  *********/

      console.log('this.CfAnalitics', this.CfAnalitics)

  
      const commonData = this.Jira
        ? this.Jira.map((item) => {
          return {
            ...item,

            ci: this.CfAnalitics.find(c => c.id === item.ci)?.name,
            }
        })
        : []
      
      
  
  
      this.tableData = this.filteredTableData = [ ...commonData ].filter(i => i)
      this.customSort({ prop: "created", order: "ascending" })
  
      this.formatters = [
        { name: 'currency' },
        { name: 'istatus' },
        { name: 'forma' },
        { name: 'firma' },
        { name: 'ci' },
        { name: 'subdivision' },
      ]
      this.filtersOptions = createSelectOptionsFromTableData({ data: this.tableData, columns: this.formatters })
      

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
          /* { name: 'om', value: this.OM },
          { name: 'sm', value: this.SM }, */
          { name: 'cfAnalitic', value: this.CfAnalitics }
        ]);
  
        this.action = 'update'
        this.dialog = true
  
      },
      
  
      // **************************************************** /
  
      /* updatePayment(item) {
        const data = {
          rlz_1c: item.num,
          om: this.Users.find(user => user.display_name === item.om)?.user_name,
          sm: this.Users.find(user => user.display_name === item.sm)?.user_name,
          om_percent: +item.om_percent,
          sm_percent: +item.sm_percent,
          om_sum: +item.om_sum,
          sm_sum: +item.sm_sum,
          profit: +item.profit,
          active: 1,
          date: (new Date()).toISOString(),
          email: this.email
        }
  
        console.log(data)
  
        let row = this.paginatedTableData.find(data => data.num === item.num);
        row.om = item.om;
        row.sm = item.sm;
        row.om_percent = item.om_percent,
        row.sm_percent = item.sm_percent,
        row.om_sum = item.om_sum,
        row.om_sum = item.om_sum,
        row.profit = item.profit,
        row.is_manual = true;
  
        this.dialog = false;
      }, */

      updateManual({ column, row, value }) {
        this.loading = true;

        switch (true) {
          case column === 'cfAnalitic': {
            const data = {
                docId: row.docId,
                rowId: row.rowId,
                cfAnaliticId: value?.id,
                plAnaliticId: row.plAnaliticId
              }
              
              console.log(data)

              /* updateOutgoingPayments(data)
                .then(res => {
                  console.log('manual cfAnalitic', res)
                  this.$notify({ type: "success", message: "Статья расходов успешно обновлена!" });
                  row.cfAnalitic = typeof value === 'string' ? value : value.name;
                })
                .catch(err => {
                  console.log(err.message)
                  this.$notify({ type: "error", message: "Ошибка при обновлении статьи расхода" })
                })
                .finally(() => this.loading = false) */

              return
          }
        }
    },
  
  
  
  
      removePayment(item) {
        console.log('remove', item)
        /* removeManualPayment()
          .then(res => {
            if (res.affectedRows) {
              let row = this.paginatedTableData.find(data => data.num === item.num);
              console.log('deleted row', row)
              this.$notify({ type: "success", message: "Данные успешно удалены" })
            }
          })
          .catch(err => this.$notify({ type: "error", message: err.message }))
          .finally(() => this.dialog = false) */
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
          { name: 'sum' },
          { name: 'total' },
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
      },





       /* ======== Форматирование входных данных ======== */
       formatterData(row, column, cellValue) {
        if (column.property === 'created' || column.property === 'date_plan' || column.property === 'date_crit' || column.property === 'expense_period' ) {
          return cellValue ? new Date(cellValue).toLocaleDateString('ru') : null;
        }
  
        if (column.property === 'sum' || column.property === 'total') {
          return cellValue ? cellValue.toLocaleString('ru') : null;
        }
  
  
        return cellValue;
      },
      /* ================================================= */ 
  
    }
  
}
</script>

<style lang="scss" scoped>

</style>
