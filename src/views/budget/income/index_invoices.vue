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
      <v-toolbar-title>Реестр счетов</v-toolbar-title>
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
              name="budgetIncomeColumn"
            />
          </el-dropdown-item>

          <el-dropdown-item>
            <!-- Экспорт -->
            <ExportExcel
              :list="formattedFilteredTableData"
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

  
    <!-- ТАБЛИЦА --> <!-- :key="key" -->
    <el-table
      v-loading="loading"
      v-if="tableData.length"
      :ref="reference"
      :data="paginatedTableData"
      :key="paginatedTableData.length"
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
        <template #header="scope">
          <div style="word-break: keep-all;">{{ column.text }}</div>

          <TableFilters
            v-if="tableData.length"
            :reference="reference"
            :data="tableData"
            :options="filtersOptions"
            :filters="filters"
            :types="{
              InputNumber: ['sale_sum', 'sum', 'pay'],
              Input: ['num', 'sale_num', 'pay_dollar', 'iKey', 'comment',],
              MultiSelect: ['contractorName', 'project', 'om', 'sm'],
              Select: ['currency'],
              CheckBox: ['factoring', 'netting', 'dolg_red', 'dolg_orange', 'overpayment'],
              Date: ['date', 'pay_date', 'pay_date_fact', 'sale_date'],
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
            :options="{ project: Projects }"
            @update="editItem"
            @update-manual="updateManual"
            @removeCustoms="removeCustoms"
          >
          </component>

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



import { templateHeaders, reference, exportFileName, dialogItems, dialogOptions } from './data_invoices.js'
import { parseTime } from '@/utils'
import { getUserName } from '@/filters/jira-users.js'
import { createHeaders, createSelectOptionsFromTableData, headersToObject, setRemoteCustomSort, getSummariesRow } from '@/components/DataTable/utils.js'
import { mapState } from 'vuex'

//import { getHistoricalRates } from '@/api/cbr.js'
import { getManualBills, getDataFromCrm, setManualBills, removeManualBills, getOrders, setProject, setSaleDate, setPayDate, setActive, setPaySum } from '@/api/budget/income'

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
    AccountBalances: () => import('../account-balances.vue'),

    Test: () => import('@/components/Test/index.vue'),
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
      dialogOptions,

      a: 100,
      b: 50

    }
  },

  computed: {
    selectedHeaders() { return this.tableHeaders.filter(header => header.selected) },

    ...mapState({
      Invoice: state => state.atlas_1c.getAtlasInvoice,
      Sales: state => state.atlas_1c.getAtlasSales,
      Projects: state => state.atlas_1c.getAtlasProjects,
      DebtOffset: state => state.atlas_1c.getDebtOffset,
      IncomingPayments: state => state.atlas_1c.incomingPayments,
      OutgoingPayments: state => state.atlas_1c.outgoingPayments,
      Contractors: state => state.atlas_1c.getAtlasContractors,
      Cbr_Dollar: state => state.currency.Cbr_Dollar,
      Users: state => state.jira.users
    }),

    formattedFilteredTableData() {
      return this.filteredTableData.map(item => {
        return { ...item, pay: item.pay.length >= 2
            ? item.pay.reduce((a, b) => {
                return a + b.paymentSum
              }, 0)
            : item.pay.length === 1
              ? item.pay[0].paymentSum
              : 0
        }
      })
    },

    currentUser() {
      return this.Users.find(item => item.email === this.email)
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
        this.getPaginationData();
      }
    },

    listQuery: {
      deep: true,
      handler(val) {
        localStorage.setItem('incomeInvoiceListQuery', JSON.stringify(val))
      }
    }
  },


  // ================================= ХУКИ ===================================== //

  beforeMount() {
    this.WindowHeight = window.innerHeight - 220;
    this.filters = JSON.parse(localStorage.getItem(this.reference)) || {};

    const incomeInvoiceListQuery = localStorage.getItem('incomeInvoiceListQuery');
    if (incomeInvoiceListQuery) {
      this.listQuery = JSON.parse(incomeInvoiceListQuery);
    }
    
  },

  mounted() {
    window.addEventListener('resize', this.getWindowHeight);

  },


  async created() {
    const dateStart = "2023-01-01";
    const dateEnd = parseTime(new Date(), '{y}-{m}-{d}');
    const dates = { dateStart, dateEnd }

    this.tableHeaders = createHeaders(this.templateHeaders);
    
    await this.$store.dispatch('getRatefromCB');

    if (!this.Invoice?.length)
      await this.$store.dispatch('atlas_1c/getAtlasInvoice', { method: 'POST', dates });
    if (!this.Sales?.length)
      await this.$store.dispatch('atlas_1c/postAtlasSales', dates);
    if (!this.Projects?.length)
      await this.$store.dispatch('atlas_1c/getAtlasProjects');
    if (!this.DebtOffset?.length)
      await this.$store.dispatch('atlas_1c/getDebtOffset', dates);
    if (!this.Contractors?.length)
      await this.$store.dispatch('atlas_1c/getAtlasContractors');
    if (!this.IncomingPayments?.length)
      await this.$store.dispatch('atlas_1c/getAtlasIncomingPayments', dates);
    if (!this.Users?.length)
      await this.$store.dispatch('jira/users')

    const Orders = await getOrders();
    this.manualBills = await getManualBills();

    const CrmData = await getDataFromCrm();


    const inactiveManualBills = this.manualBills.filter(item => item.active === 0).map(item => item.bill_1c)
    
    const FormattedCrmData = CrmData.map(data => {
        const requiredContractor = this.Contractors.find(item => item.id === data.contractor_id);
        return { ...data, contractorName: requiredContractor?.contractor  }
      }) 


    const filteredInvoices = this.Invoice
      .filter(invoice => !inactiveManualBills.includes(invoice.num))
      .filter(invoice => !invoice.isDeleted);


    const debtOffset = [ ...new Set(this.DebtOffset.map(item => {
      return item.operations.map(i => {
        if (i.arm === 'debit') return i;
      })
    }).flat())]



    /* Общее форматирование данных для таблицы */

    const commonData = filteredInvoices.map((item, i) => {
      const manualBill = this.manualBills.find(data => data.bill_1c === item.num);
      const factoring = debtOffset.filter(debt => debt?.subjectNum === item.num && debt?.contractorCreditName === "Альфа Банк Факторинг");
      const netting = debtOffset.filter(debt => debt?.subjectNum === item.num && debt?.contractorCreditName !== "Альфа Банк Факторинг");
      const factoringAndNetting = debtOffset.filter(debt => debt?.subjectNum === item.num);
      const sales = this.Sales.filter(sale => sale.invoiceNum.trim() === item.num.trim());

      const sale_date = manualBill?.sale_date 
            ? manualBill.sale_date
            : (sales[sales.length - 1]?.sfdate || sales[sales.length - 1]?.date)

      const sale_nums = sales.map(sale => sale?.sfnum);

      const incomingPayments = this.IncomingPayments?.filter(payment => payment.orderNum === item.num);

      const factoring_sum_arr = factoring.map(debt => debt?.paymentSum);
      const netting_sum_arr = netting.map(debt => debt?.paymentSum);
      const factoringAndNetting_sum_arr = factoringAndNetting.map(debt => debt?.paymentSum);
      const incomingPaymentsSum = incomingPayments?.reduce((a, { paymentSum }) =>  (a + paymentSum), 0);


      const om = FormattedCrmData.find(data => data.contractor_id === item.contractorId)?.MANAGER;
      const sm = FormattedCrmData.find(data => data.contractor_id === item.contractorId)?.SM_SERV;
      const iKey = Orders.find(m => m.Invoice === item.docid)?.iKey;

      const otsrochka = FormattedCrmData.find(data => data.contractor_id === item.contractorId)?.PAY_DELAY;

      const pay_date = manualBill?.sale_date
        ? manualBill?.sale_date
        : sale_date
          ? this.addDays(sale_date, (otsrochka || 14))
          : this.addMonths(new Date(), 1);

      const factoring_sum = factoring_sum_arr.reduce((a, b) => (a + b), 0);
      const netting_sum = netting_sum_arr.reduce((a, b) => (a + b), 0);
      const factoringAndNetting_sum = factoringAndNetting_sum_arr.reduce((a, b) => (a + b), 0);


      const factoringAndNetting_Ruble = factoringAndNetting.map(data => {
        return { 
          ...data,
          paymentSum: (data.paymentSum * data.currencyRate)
        }
          /* this.getSumWithRate(data.paymentSum, data.subjectDate, data.currency, (data.currency === 'USD' ? dollar_rate.ValCurs.Record : euro_rate.ValCurs.Record)) } */
      })

      const incomingPaymentsWithDebtOffset = (incomingPaymentsSum === item.sum)
        ? incomingPayments
        : factoringAndNetting_sum > 0
          ? factoringAndNetting_Ruble
          : incomingPayments
      

      const pay_date_fact = this.setFactPayDate(incomingPaymentsWithDebtOffset);

      const pay_dollar = factoringAndNetting_sum > 0 && factoringAndNetting.every(item => item.currencyRate > 1)
        ? factoringAndNetting.reduce((a, { paymentSum }) => (a + paymentSum), 0)
        : incomingPayments?.reduce((a, { paymentSum, currencyRate }) => (a + (paymentSum / currencyRate)), 0);



      const saleSumWithRate =  manualBill?.sale_date
        ? sales && sales.length
          ? sales.reduce((acc, { sum, currencyRate }) => (acc + (sum * currencyRate)), 0).toFixed(2)
          : incomingPayments?.reduce((a, { paymentSum, currencyRate }) => (a + (paymentSum / currencyRate)), 0)
        : sales.reduce((acc, { sum, currencyRate }) => (acc + (sum * currencyRate)), 0).toFixed(2)
      
      const dolg_orange = manualBill?.pay_sum
        ? this.setDolgOrange(saleSumWithRate, manualBill?.pay_sum, pay_date)
        : (Number(pay_dollar.toFixed(2)) - item.sum) === 0
          ? 0
          : this.setDolgOrange(saleSumWithRate, incomingPaymentsWithDebtOffset )

      
      if (item.num.includes("27022610")) {
        console.log(item)
        console.log('pay_dollar', pay_dollar)
        console.log("saleSumWithRate", Number(saleSumWithRate))
        console.log("sales", sales)
        console.log('incomingPaymentsWithDebtOffset', incomingPaymentsWithDebtOffset)
        console.log('manualBill', manualBill)
        console.log('dolg_orange', dolg_orange)
      }



      return {
          id: i+1,
          sale_num: sale_nums.join(),
          sale_date: sale_date,
          sale_sum: saleSumWithRate,
          om: this.getDisplayName(om),
          sm: this.getDisplayName(sm),
          otsrochka: otsrochka,
          factoring: factoring_sum > 0 ? 'да' : null,
          netting: netting_sum > 0 ? 'да' : null,
          pay_date_fact: pay_date_fact,
          manual_pay_date: Boolean(manualBill?.pay_date),
          manual_sale_date: Boolean(manualBill?.sale_date),
          iKey: iKey,
          num_status: manualBill ? manualBill.active : 1,
          is_manual: !!manualBill,

          pay: manualBill?.pay_sum
            ? [ { paymentSum: manualBill?.pay_sum } ]
            : incomingPaymentsWithDebtOffset,

          pay_dollar: item.currency === 'USD'
            ? pay_dollar.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : null,

          pay_date: manualBill?.pay_date
              ? new Date(manualBill.pay_date)
              : pay_date,

          dolg_orange: dolg_orange,
            
          dolg_red: manualBill?.pay_sum
            ? this.setDolgRed(saleSumWithRate, manualBill?.pay_sum, pay_date)
            : (Number(pay_dollar.toFixed(2)) - item.sum) === 0
              ? 0
              : this.setDolgRed(saleSumWithRate, incomingPaymentsWithDebtOffset, pay_date, item),
          

          overpayment: manualBill?.pay_sum
            ? this.setOverpayment(saleSumWithRate, manualBill?.pay_sum, pay_date)
            : Number(saleSumWithRate) === 0 && dolg_orange === 0
              ? incomingPaymentsWithDebtOffset.reduce((a, { paymentSum }) => { return (a + (paymentSum)) }, 0)
              : sales.every(item => item.currencyRate > 1)
                ? (Number(pay_dollar.toFixed(2)) - item.sum) === 0
                  ? 0
                  : this.setOverpayment(saleSumWithRate, incomingPaymentsWithDebtOffset, pay_date)
                : this.setOverpayment(saleSumWithRate, incomingPaymentsWithDebtOffset, pay_date),




              /* ? sales.every(item => item.currencyRate > 1)
                ? (Number(pay_dollar.toFixed(2)) - item.sum) === 0
                  ? 0
                  : incomingPaymentsWithDebtOffset.reduce((a, { paymentSum }) => { a + paymentSum }, 0) - Number(saleSumWithRate)
                :this.setOverpayment(saleSumWithRate, incomingPaymentsWithDebtOffset, pay_date)
              : this.setOverpayment(saleSumWithRate, incomingPaymentsWithDebtOffset, pay_date) */


             // && sales.every(item => item.currencyRate > 1)

            /*   ? incomingPaymentsWithDebtOffset.reduce((a, { paymentSum }) => { (a + paymentSum) }, 0) - dolg_orange
              : sales.every(item => item.currencyRate > 1)
                ? Math.abs(pay_dollar - sales.reduce((a, { sum }) => (a + sum), 0))
                : this.setOverpayment(saleSumWithRate, incomingPaymentsWithDebtOffset, pay_date), */

          ...item,
        
        }
    })


    this.tableData = this.filteredTableData = [...commonData].filter(i => i)
    this.customSort({ prop: "date", order: "ascending" });

    this.formatters = [
      { name: 'currency' },
      { name: 'project' },
      { name: 'om' },
      { name: 'sm' },
      { name: 'contractorName' },
      { name: 'pay', formatter: this.objToString }
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
      this.filteredTableData = this.tableData
      //this.updateData()
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
          let row = this.paginatedTableData.find(data => data.num === item.num);

          if (res.updatedBills && res.updatedProject) {
            console.log(res)
            row.num_status = +item.num_status;
            row.pay_date = new Date(item.pay_date);
            row.sale_date = new Date(item.sale_date);
            row.manual_pay_date = true;
          }
          if (res.updatedProject.data.docId) {
            row.project = typeof item.project === 'string' ? item.project : item.project.name;
          }
          this.$notify({ type: "success", message: "Данные успешно обновлены" })
        })
        .catch(err => this.$notify({ type: "error", message: err.message }))
        .finally(() => this.dialog = false)
    },

    removeCustoms(item) {
      removeManualBills({ bill_1c: item.num })
      .then(res => {
          if (res.affectedRows) {
            let row = this.paginatedTableData.find(data => data.num === item.num);
            row.num_status = 1;
            row.pay_date = this.addDays(new Date(item.sale_date), (row.otsrochka || 14));
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
        case column === 'project': {
          const data = {
              rlz_1c: null,
              project: value?.id,
              date: (new Date()).toISOString(),
              email: this.email,
              contractorName: row.contractorName,
              docid: row?.docid
            }

          setProject(data)
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

        case column === 'sale_date': {
          const data = {
              bill_1c: row.num,
              sale_date: (new Date(value)).toISOString(),
              date: (new Date()).toISOString(),
              email: this.email
            }

          setSaleDate(data)
            .then(res => {
              console.log('manual sale_date', res)
              this.$notify({ type: "success", message: "Дата отгрузки успешно обновлена" });
            })
            .catch(err => {
              console.log(err.message)
              this.$notify({ type: "error", message: "Ошибка при обновлении Даты отгрузки" })
            })
            .finally(() => this.loading = false)
          return
        }

        case column === 'pay_date': {
          const data = {
            bill_1c: row.num,
            pay_date: (new Date(value)).toISOString(),
            date: (new Date()).toISOString(),
            email: this.email
          }

          setPayDate(data)
            .then(res => {
              console.log('manual pay_date', res)
              this.$notify({ type: "success", message: "Дата планируемой оплаты успешно обновлена" });
            })
            .catch(err => {
              console.log(err.message)
              this.$notify({ type: "error", message: "Ошибка при обновлении Даты планируемой оплаты" })
            })
            .finally(() => this.loading = false)
          return
        }

        case column === 'num_status': {
          const data = {
            bill_1c: row.num,
            active: +value,
            date: (new Date()).toISOString(),
            email: this.email
          }


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

        case column === 'pay': {
          const data = {
            bill_1c: row.num,
            pay_sum: Number(value),
            date: (new Date()).toISOString(),
            email: this.email
          }

          setPaySum(data)
            .then(res => {
              console.log('manual pay sum', res)
              this.$notify({ type: "success", message: "Сумма оплаты успешно обновлен" });
              row.pay = [];
              row.pay.push({ paymentSum: Number(value) });
            })
            .catch(err => {
              console.log(err.message)
              this.$notify({ type: "error", message: "Ошибка при обновлении Суммы оплаты" })
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
      const { columns } = params;

      const props = [
        'sale_sum',
        'dolg_red',
        'dolg_orange',
        'overpayment',
        { name: 'sum', currencyUSD: 'USD', currencyEUR: 'EUR' },
        { name: 'pay', value: 'paymentSum' }
      ]
      return getSummariesRow(columns, this.filteredTableData, props)
    },



    setSelectOptionsForEdit(data) {
      this.dialogItems.forEach(obj => {
        data.forEach(item => {
          if (Object.prototype.hasOwnProperty.call(obj, 'options')) {
            if (obj.value === item.name) obj.options = item.value;
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



    setDolgOrange(sale_sum, pays) {
      const pay_sum = Array.isArray(pays)
        ? pays.map(i => i.paymentSum).reduce((a, b) => { return a + b }, 0)
        : pays

      const result = sale_sum - pay_sum;
      return Math.sign(result) === -1
        ? 0
        : result
    },



    setDolgRed(sales_sum, pays, pay_date, invoice) {
      const pay_date_time = new Date(pay_date).getTime();
      const now_time = new Date().getTime();

      const pays_sum = Array.isArray(pays)
        ? pays.map(i => i.paymentSum).reduce((a, b) => { return a + b }, 0)
        : pays

      const result = sales_sum - pays_sum;


      if (Math.sign(pay_date_time - now_time) === -1) {
        if (
          invoice?.contractorId === "ed05dd3b-0697-11ee-a2aa-ac1f6b67576f" || // Вимм-Билль-Данн
          invoice?.contractorId ===  "f863d754-0b74-11ee-a2aa-ac1f6b67576f" || // ПепсиКо
          invoice?.contractorId ===  "94807e3c-a9cf-11ec-a2a7-ac1f6b67576f" // Купишуз
        ) { return 0 }


        return sales_sum
          ? Math.sign(result) === -1
            ? 0
            : result
          : null;
      }
    },


    setOverpayment(sale_sum, pays) {
      const pay_sum = Array.isArray(pays)
        ? pays.map(i => i.paymentSum).reduce((a, b) => { return a + b }, 0)
        : pays

      const result = sale_sum - pay_sum;
      return Math.sign(result) === -1
        ? Math.abs(result)
        : 0
    },


    setFactPayDate(payments) {
      const lastElement = payments[payments?.length - 1];
      return lastElement?.paymentDate || lastElement?.subjectDate;
    },

    getDisplayName(data) {
      return this.Users.find(user => user.user_name === data)?.display_name;
    },



     /* Форматирование входных данных */
    formatterData(row, column, cellValue) {
      if (column.property === 'date' || column.property === 'sale_date' ) {
        return cellValue ? new Date(cellValue).toLocaleDateString('ru') : null
      }

      if (column.property === 'sale_sum' || column.property === 'sum' || column.property === 'overpayment') {
        return cellValue ? cellValue.toLocaleString('ru') : null
      }

      if (column.property === 'currencyRate') {
        return (row['currency'] === 'USD' || row['currency'] === 'EUR') ? cellValue : null;
      }

      if (column.property === 'pay_date_fact') {
        return cellValue ? new Date(cellValue).toLocaleDateString('ru') : null
      }

      return cellValue
    },
    /* ------------------------------ */



    /* getRateFromHistory(data, day, x) {
      if (x === 5) return;
      const res = data
        .find(obj => obj.$.Date === new Date(new Date(day).setDate(new Date(day).getDate() - x))
        .toLocaleDateString('ru'))
      if (res) return res
      else return this.getRateFromHistory(data, day, x+1)
    }, */



    /* getSumWithRate(sum, date, curr, rate) {
      switch (true) {
        case curr === 'USD': return (+(sum * (this.getRateFromHistory(rate, date, 0)?.Value[0].replace(',', '.')))?.toFixed(2))
        case curr === 'EUR': return (+(sum * (this.getRateFromHistory(rate, date, 0)?.Value[0].replace(',', '.')))?.toFixed(2))
        default: return sum
      }
    } */

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