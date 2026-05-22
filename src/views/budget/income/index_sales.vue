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
      <v-toolbar-title>Реестр реализаций</v-toolbar-title>
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
              name="budgetIncomeSalesColumn"
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
      ref="budgetIncomeTable"
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
              Input: ['num', 'sfnum', 'sum', 'invoiceNum', 'iKey'],
              MultiSelect: ['contractorName', 'om', 'sm', 'lead_engineer', 'engineer', 'project'],
              Select: ['currency'],
              CheckBox: ['factoring', 'netting', 'dolg_red', 'dolg_orange', 'sale_sum'],
              Date: ['date', 'sfdate'],
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
              engineer: Engineer,
              project: Projects
            }"
            @update="editItem"
            @update-manual="updateManual"
            @remove="removeSale"
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

import { templateHeaders, reference, exportFileName, dialogItems, dialogOptions, local_projects } from './data_sales.js'
import { parseTime } from '@/utils'
import { getUserName } from '@/filters/jira-users.js'
import { getManualSales, getDataFromCrm, setManualSale, removeManualSale, setProfit, setOmPercent, setSmPercent, setProject, setOm, setSm, setEngineer } from '@/api/budget/income'
import { createHeaders, createSelectOptionsFromTableData, headersToObject, setRemoteCustomSort, getSummariesRow } from '@/components/DataTable/utils.js'

import { mapState } from 'vuex'
import { getOrders } from '@/api/budget/income'

import { filterHandler } from '@/workers/filters.js'

// import { getHistoricalRates } from '@/api/cbr.js'


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
      Users: state => state.jira.users,
      Contractors: state => state.atlas_1c.getAtlasContractors,
      Cbr_Dollar: state => state.currency.Cbr_Dollar,
    }),

    currentUser() {
      return this.Users.find(item => item.email === this.email)
    },

    userRole() {
      return this.$store.getters["auth/currentUser"]?.roles
    },

    email() {
      return this.$store.getters["auth/currentUser"]?.email
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
        localStorage.setItem('incomeSalesListQuery', JSON.stringify(val))
      }
    }

  },


  // ================================= ХУКИ ===================================== //

  beforeMount() {
    this.WindowHeight = window.innerHeight - 220;
    this.filters = JSON.parse(localStorage.getItem(this.reference)) || {};

    const incomeSalesListQuery = localStorage.getItem('incomeSalesListQuery');
    if (incomeSalesListQuery) {
      this.listQuery = JSON.parse(incomeSalesListQuery);
    }
  },

  mounted() {
    window.addEventListener('resize', this.getWindowHeight)
  },


  async created() {
    console.time('Сomponent creation time')

    const dateStart = "2024-01-01";
    const dateEnd = parseTime(new Date(), '{y}-{m}-{d}');
    const dates = { dateStart, dateEnd }

    this.tableHeaders = createHeaders(this.templateHeaders);

    /******** Блок получение данных по API *********/
    
    if (!this.Invoices.length)
      await this.$store.dispatch('atlas_1c/getAtlasInvoice');

    if (!this.Sales.length)
      await this.$store.dispatch('atlas_1c/postAtlasSales', dates);

    if (!this.Users.length)
      await this.$store.dispatch('jira/users');

    if (!this.Contractors.length)
      await await this.$store.dispatch('atlas_1c/getAtlasContractors');

    if (!this.Projects.length)
      await this.$store.dispatch('atlas_1c/getAtlasProjects');

    //await this.$store.dispatch('getRatefromCB');

    const CrmData = await getDataFromCrm();

    const FormattedCrmData = CrmData.map(data => {
        const requiredContractor = this.Contractors.find(item => item.id === data.contractor_id);
        return { ...data, contractorName: requiredContractor?.contractor  }
      })  

    const ManualSales = await getManualSales();
    const Orders = await getOrders();

    /* ******************************************** */

    const filteredSales = this.Sales.filter(sale => !sale.isDeleted);

    //const dollar_rate = await getHistoricalRates({ currency: 'dollar' });
    //const euro_rate = await getHistoricalRates({ currency: 'euro' });
    

    //if (!dollar_rate && !euro_rate) return this.$notify({ type: "error", message: "Не удалось получить историю курсов валюты. Попробуйте ещё раз." })

    this.OM = [ ...new Set(Orders.map(order => this.Users.find(user => user.user_name === order.om)?.display_name)) ] // .filter(Boolean)
      .map((name, i) => {
        return {
          id: i,
          name,
          username: this.Users.find(user => user.display_name === name)?.user_name,
          disabled: this.userRole.includes("admin")
            ? false
            : this.Users.find(user => user.display_name === name)?.email !== this.email
        }
      });

    this.SM = [ ...new Set(Orders.map(order => this.Users.find(user => user.user_name === order.sm)?.display_name)) ] // .filter(Boolean)
      .map((name, i) => {
        return {
          id: i,
          name,
          username: this.Users.find(user => user.display_name === name)?.user_name,
          disabled: this.userRole.includes("admin")
            ? false
            : this.Users.find(user => user.display_name === name)?.email !== this.email
        }
      });

      this.Engineer = [ ...new Set(Orders.map(order => this.Users.find(user => user.user_name === order.engineer)?.display_name)) ] // .filter(Boolean)
      .map((name, i) => {
        return {
          id: i,
          name,
          username: this.Users.find(user => user.display_name === name)?.user_name,
          disabled: this.userRole.includes("admin")
            ? false
            : this.Users.find(user => user.display_name === name)?.email !== this.email
        }
      });

    // console.log('Invoices.', this.Invoices)
    // console.log('Sales', this.Sales.filter(item => item.currency === 'USD'))



  /*******  Наполнение данными и основное форматирование всех столбцов таблицы  *********/

    const commonData = filteredSales.map(item => {
      const invoice = this.Invoices.find(invoice => invoice.num === item.invoiceNum);

      const client = invoice
        ? FormattedCrmData.find(crm => crm?.contractorName === invoice?.contractorName)
        : null;
      
      const is_manual = ManualSales.find(sale => sale.rlz_1c.trim() === item?.sfnum.trim());


      /* Забираем данные ручных правок менеджеров
          и %, если они есть в локальной таблице */
      const om_manual = is_manual?.om;
      const sm_manual = is_manual?.sm;
      const engineer_manual = is_manual?.engineer;
      const lead_engineer_manual = is_manual?.lead_engineer;
      const manual_project = this.Projects.find(item => item.id === is_manual?.project);
      const om_percent_manual = is_manual?.om_percent;
      const sm_percent_manual = is_manual?.sm_percent;
      const profit_manual = is_manual?.profit;


      /* if (item.sfnum.includes('09062521')) {
        console.log('item', item)
         console.log(client?.MANAGER || Orders.find(om => om.Invoice === invoice?.docid)?.om)
         console.log(client)
         console.log(invoice)
       } */

      const om = client?.MANAGER || Orders.find(om => om.Invoice === invoice?.docid)?.om;
      const sm = client?.SM_SERV || Orders.find(om => om.Invoice === invoice?.docid)?.sm;
      const engineer = Orders.find(eng => eng.Invoice === invoice?.docid)?.engineer;
      const lead_engineer = Orders.find(eng => eng.Invoice === invoice?.docid)?.lead_engineer;

      const iKey = Orders.find(om => om.Invoice === invoice?.docid)?.iKey;
      const project = (manual_project?.name || invoice?.project);

      const project_name_db = local_projects.find(local_project => local_project.name_1c === project)?.name_db;
      const profit = client
        ? client[project_name_db]
        : null;

      // this.getSumWithRate(item.sum, item.date, item.currency, (item.currency === 'USD' ? dollar_rate.ValCurs.Record : euro_rate.ValCurs.Record))

      const om_sum = ((item.sum * item.currencyRate) - ((item.sum * item.currencyRate) * 22 / 122))
        * ((profit_manual ? (profit_manual / 100) : null) || profit)
        * ((om_percent_manual || this.calcOmPercent((item.sum * profit), project, (sm_manual || sm))) / 100)

      const sm_sum = ((item.sum * item.currencyRate) - ((item.sum * item.currencyRate) * 22 / 122))
        * ((profit_manual ? (profit_manual / 100) : null) || profit)
        * ((sm_percent_manual || this.calcSmPercent(project, (om_manual || om))) / 100)


      return {
        ...item,
          contractorName: (invoice?.contractorName || 'МВМ ООО'),
          project: project,
          profit: (profit_manual || (profit * 100)),
          comment: invoice?.comment,
          
          om_percent: ( om_percent_manual || this.calcOmPercent((item.sum * profit), project, (sm_manual || sm)) ),
          sm_percent: ( sm_percent_manual || this.calcSmPercent(project, (om_manual || om)) ),

          om_sum: om_sum,
          sm_sum: sm_sum,
          om: this.getDisplayName(om_manual || om),
          sm: this.getDisplayName(sm_manual || sm),
          lead_engineer: this.getDisplayName(lead_engineer_manual || lead_engineer),
          engineer: this.getDisplayName(engineer_manual || engineer),
          is_manual: !!is_manual,
          iKey: iKey,
          sum: (item.sum * item.currencyRate),
          profit_rub: ((item.sum * item.currencyRate) * profit) - (((item.sum * item.currencyRate) * profit) * 22 / 122)
        }
    })
    
    /* item.currency === 'USD'
            ? +this.getRateFromHistory(dollar_rate.ValCurs.Record, item.date, 0)?.Value[0].replace(',', '.')
            : +this.getRateFromHistory(euro_rate.ValCurs.Record, item.date, 0)?.Value[0].replace(',', '.'), */



    this.tableData = this.filteredTableData = [...commonData].filter(i => i)
    this.customSort({ prop: "date", order: "ascending" })

    this.formatters = [
      { name: 'currency' },
      { name: 'project' },
      { name: 'om' },
      { name: 'sm' },
      { name: 'lead_engineer' },
      { name: 'engineer' },
      { name: 'contractorName' },
    ]
    
    this.filtersOptions = createSelectOptionsFromTableData({ data: this.tableData, columns: this.formatters });


    if (!this.userRole.includes("admin")) {
      const current_display_name = this.Users.find(user => user.email === this.email)?.display_name;
      const robot = this.Users.find(user => user.display_name === 'R2-D2')?.display_name;

      this.filtersOptions['om'] = this.filtersOptions['om']
        .filter(item => [current_display_name, robot, 'нет данных'].includes(item));
      this.filtersOptions['sm'] = this.filtersOptions['sm']
        .filter(item => [current_display_name, robot, 'нет данных'].includes(item));
    }

     /* Web Worker для фильтров */
    
     this.updateData();

    /* *********************** */

    console.timeEnd('Сomponent creation time')
    

  },

  // =============================================== МЕТОДЫ ================================================ //

  methods: {

    calcOmPercent(sum, project, sm) {

      if (project === 'Продажа (склад)' || project === 'Продажа (ЗИП)' || project === 'Продажа (IT)') {

        if (sum <= 1500000) return 8;
        if (sum > 1500000 && sum <= 5000000) return 8;
        if (sum > 5000000 && sum <= 15000000) return 7.5;
        if (sum > 15000000) return 7;

      } else {

        if (sm) return 8;
        else {
          if (sum <= 1500000) return 10;
          if (sum > 1500000 && sum <= 5000000) return 8;
          if (sum > 5000000 && sum <= 15000000) return 7.5;
          if (sum > 15000000) return 7;
        }

      }
    },

    calcSmPercent(project, om) {

      if (!om) return 4;
      if (project === 'Сервисный контракт' || project === 'Ремонт') return 2;
      else return 0;
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


    updateFilters(val) {
      if (val) this.filters = { ...val }
    },

    resetFilters() {
      this.filters = {};
      this.filteredTableData = this.tableData;
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
        { name: 'engineer', value: this.Engineer },
        { name: 'project', value: this.Projects }
      ]);

      this.action = 'update'
      this.dialog = true

    },

    updateManual({ column, row, value }) {
      this.loading = true;

      switch (true) {
        case column === 'profit': {
          setProfit({ rlz_1c: row.sfnum, profit: +value, date: (new Date()).toISOString(), email: this.email })
            .then(res => {
              console.log('manual profit', res);
              this.$notify({ type: "success", message: "Маржа успешно обновлена" });
              row.om_sum = ((row.sum * (+value / 100) * (row.om_percent) / 100)).toFixed(2);
              row.sm_sum = ((row.sum * (+value / 100) * (row.sm_percent) / 100)).toFixed(2);
            })
            .catch(err => {
              console.log(err.message)
              this.$notify({ type: "error", message: "Ошибка при обновлении маржи" })
            })
            .finally(() => this.loading = false)
          return
        }
        case column === 'om_percent': {
          setOmPercent({ rlz_1c: row.sfnum, om_percent: +value, date: (new Date()).toISOString(), email: this.email })
            .then(res => {
              console.log('manual om_percent', res)
              this.$notify({ type: "success", message: "Процент ОМ успешно обновлен" });
              row.om_sum = ((row.sum * (row.profit / 100) * (+value) / 100)).toFixed(2);
            })
            .catch(err => {
              console.log(err.message)
              this.$notify({ type: "error", message: "Ошибка при обновлении маржи" })
            })
          return
        }
        case column === 'sm_percent': {
          setSmPercent({ rlz_1c: row.sfnum, sm_percent: +value, date: (new Date()).toISOString(), email: this.email })
            .then(res => {
              console.log('manual sm_percent', res)
              this.$notify({ type: "success", message: "Процент СМ успешно обновлен" });
              row.sm_sum = ((row.sum * (row.profit / 100) * (+value) / 100)).toFixed(2);
            })
            .catch(err => {
              console.log(err.message)
              this.$notify({ type: "error", message: "Ошибка при обновлении маржи" })
            })
            .finally(() => this.loading = false)
          return
        }
        case column === 'project': {
            const invoice = this.Invoices.find(invoice => invoice.num === row.invoiceNum);

          setProject({ rlz_1c: row.sfnum, project: value?.id, date: (new Date()).toISOString(), email: this.email, contractorName: row.contractorName, docid: invoice?.docid})
            .then(res => {
              console.log('manual project', res)
              this.$notify({ type: "success", message: "Проект успешно обновлен" });
              row.project = typeof value === 'string' ? value : value.name;
            })
            .catch(err => {
              console.log(err.message)
              this.$notify({ type: "error", message: "Ошибка при обновлении проекта" })
            })
            .finally(() => this.loading = false)
          return
        }
        case column === 'om': {
          setOm({ rlz_1c: row.sfnum, om: value?.username, date: (new Date()).toISOString(), email: this.email })
            .then(res => {
              console.log('manual ОМ', res)
              this.$notify({ type: "success", message: "ОМ успешно обновлен" });
              row.om = value;
            })
            .catch(err => {
              console.log(err.message)
              this.$notify({ type: "error", message: "Ошибка при обновлении ОМ" })
            })
            .finally(() => this.loading = false)
          return
        }
        case column === 'sm': {
          setSm({ rlz_1c: row.sfnum, sm: value?.username, date: (new Date()).toISOString(), email: this.email })
            .then(res => {
              console.log('manual СМ', res)
              this.$notify({ type: "success", message: "СМ успешно обновлен" });
              row.sm = value;
            })
            .catch(err => {
              console.log(err.message)
              this.$notify({ type: "error", message: "Ошибка при обновлении СМ" })
            })
            .finally(() => this.loading = false)
          return
        }
        case column === 'engineer': {
          setEngineer({ rlz_1c: row.sfnum, engineer: value?.username, date: (new Date()).toISOString(), email: this.email })
            .then(res => {
              console.log('manual Engineer', res)
              this.$notify({ type: "success", message: "Инженер успешно обновлен" });
              row.sm = value;
            })
            .catch(err => {
              console.log(err.message)
              this.$notify({ type: "error", message: "Ошибка при обновлении СМ" })
            })
            .finally(() => this.loading = false)
          return
        }
      }
    },



    // **************************************************** //


    updateSale(item) {
      const data = {
        rlz_1c: item.sfnum,
        bill_1c: item.invoiceNum,
        project: typeof item.project === 'string' ? this.Projects.find(project => project.name === item.project) : item.project,
        om: this.Users.find(user => user.display_name === item.om)?.user_name,
        sm: this.Users.find(user => user.display_name === item.sm)?.user_name,
        engineer: this.Users.find(user => user.display_name === item.engineer)?.user_name,
        om_percent: +item.om_percent,
        sm_percent: +item.sm_percent,
        om_sum: +item.om_sum,
        sm_sum: +item.sm_sum,
        profit: +item.profit,
        active: 1,
        date: (new Date()).toISOString(),
        email: this.email
      }

      console.log('updateSale', data)

      setManualSale(data)
        .then(res => {
          console.log('setManualSale', res)
          this.$notify({ type: "success", message: "Данные успешно обновлены" })
        })

      let row = this.paginatedTableData.find(data => data.num === item.num);
      row.project = typeof item.project === 'string' ? item.project : item.project.name;
      row.om = item.om;
      row.sm = item.sm;
      row.engineer = item.engineer;
      row.om_percent = item.om_percent,
      row.sm_percent = item.sm_percent,
      row.om_sum = item.om_sum,
      row.sm_sum = item.sm_sum,
      row.profit = item.profit,
      row.is_manual = true;

      this.tableData.length = this.tableData.length + Math.floor(Math.random() * 98) + 2;

      this.dialog = false;
    },




    removeSale(item) {
      console.log('removeSale', item)
      removeManualSale()
        .then(res => {
          if (res.affectedRows) {
            let row = this.paginatedTableData.find(data => data.num === item.num);
            console.log('deleted row', row)
            this.$notify({ type: "success", message: "Данные успешно удалены" })
          }
        })
        .catch(err => this.$notify({ type: "error", message: err.message }))
        .finally(() => this.dialog = false)
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
        { name: 'profit_rub' },
        { name: 'pay', value: 'paymentSum' },
        { name: 'om_sum' },
        { name: 'sm_sum' },
        { name: 'costPrice' }
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

    setFactPayDate(payments) {
      return payments[payments.length - 1]?.paymentDate;
    },

    setDolgOrange(sale_sum, pay_sum_arr, /* pay_date */) {
      // const pay_date_time = new Date(pay_date).getTime();
      // const now_time = new Date().getTime();
      const pay_sum = pay_sum_arr
        .map(i => i.paymentSum)
        .reduce((a, b) => { return a + b }, 0)
        .toFixed(2)

        return (sale_sum - pay_sum);
    },

     /* Форматирование входных данных */
    formatterData(row, column, cellValue) {
      if (column.property === 'date' || column.property === 'sale_date' ) {
        return cellValue ? new Date(cellValue).toLocaleDateString('ru') : null;
      }

      if (column.property === 'rate') {
        return row['currency'] === 'USD' ? cellValue : null;
      }

      if (column.property === 'om_percent' || column.property === 'sm_percent') {
        return cellValue ? cellValue + '%' : null;
      }

      if (column.property === 'sale_sum' || column.property === 'sum' || column.property === 'om_sum' || column.property === 'sm_sum' || column.property === 'costPrice' || column.property === 'profit_rub') {
        return cellValue ? cellValue.toLocaleString('ru') : null;
      }

      if (column.property === 'profit') {
        return cellValue ? cellValue + `%  (${(row["sum"] * (cellValue / 100)).toLocaleString('ru')})` : null;
      }

      if (column.property === 'pay_date_fact' || column.property === 'sfdate') {
        return cellValue ? new Date(cellValue).toLocaleDateString('ru') : null;
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
