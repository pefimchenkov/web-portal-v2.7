<template>
  <v-container v-loading="loading" fluid :fill-height="loading">

    <ProgressDialog :show="show" :info-text="infoText" />

    <EditDialog :show="dialog" :item="editedItem" @closeDialog="(dialog = false)" />

    <v-toolbar v-show="!loading" :prominent="$vuetify.breakpoint.name === 'xs'" color="grey lighten-4" class="elevation-2 mb-1" width="100%" dense>
      <v-toolbar-title>Контроль поступлений</v-toolbar-title>
      <v-divider inset vertical class="mx-2" />

      <v-row justify="center" align="center">
        <v-col xs="1">
          <v-checkbox
            v-model="checkBox"
            hide-details
            :label="checkBox ? 'Открепить' : 'Закрепить'"
            class="pl-2"
          />
        </v-col>

        <v-spacer />

        <!-- МЕНЮ ДЕЙСТВИЙ -->

        <el-dropdown trigger="click" :hide-on-click="false" class="mr-1">
          <el-button icon="el-icon-s-operation">
            Действия
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>
              <TableColumns :headers="headers" name="budgetPrevColumn" />
            </el-dropdown-item>
            <el-dropdown-item>
              <download-excel
                :fields="json_fields"
                :fetch="getExel"
                name="budget_list_prev.xls"
              >
                Экспорт в excel
              </download-excel>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

      </v-row>

    </v-toolbar>

    <v-spacer />

    <v-data-table
      ref="dataTable"
      :headers="computedHeaders"
      :items="Data"
      :items-per-page="50"
      item-key="id"
      sort-by="id"
      :fixed-header="checkBox"
      :height="checkBox ? WindowHeight : null"
      :mobile-breakpoint="750"
      dense
      sort-desc
      :footer-props="{
        itemsPerPageText: 'Строк на странице',
        itemsPerPageOptions: [50,250,500],
        showFirstLastPage: true
      }"

      class="elevation-2"
    >

      <template #[`body.prepend`]>

        <!-- СТРОКА " ИТОГО " -->

        <tr class="hidden-sm-and-down">
          <td v-for="item of computedHeaders" :key="item.value" colspan="1">
            <span v-if="item.value === 'id'">ИТОГО:</span>
            <v-text-field
              v-if="$refs.dataTable && item.value === 'bill_sum'"
              v-model="budgetSum"
              type="text"
              readonly
              outlined
              disabled
              dense
              hide-details
              class="py-1"
            />
            <v-text-field
              v-if="$refs.dataTable && item.value === 'DolgRed'"
              v-model="budgetSumDolgRed"
              type="text"
              readonly
              outlined
              disabled
              dense
              hide-details
              class="py-1"
            />
            <v-text-field
              v-if="$refs.dataTable && item.value === 'DolgOrange'"
              v-model="budgetSumDolgOrange"
              type="text"
              readonly
              outlined
              disabled
              dense
              hide-details
              class="py-1"
            />
          </td>
        </tr>

        <!-- СТРОКА ФИЛЬТРОВ -->

        <tr class="hidden-sm-and-down">
          <td v-for="column of computedHeaders" :key="column.value" colspan="1">
            <v-text-field
              v-if="column.value === 'client_1c'"
              v-model="filters.client1C"
              clearable type="text"
              dense
              outlined
              hide-details
            />

            <v-autocomplete
              v-if="column.value === 'project_1c'"
              v-model="filters.project1C"
              multiple
              :items="project1C"
              deletable-chips
              clearable
              chips
              outlined
              dense
              hide-details
            />
            <v-text-field
              v-if="column.value === 'client_name'"
              v-model="filters.client_name"
              clearable
              outlined
              dense
              type="text"
              hide-details
            />

            <v-autocomplete
              v-if="column.value === 'bill_1c'"
              v-model="filters.bill1C"
              multiple
              dense
              outlined
              :items="bill1C"
              clearable
              hide-details
            >
              <template #selection="{ item, index }">
  
                <span v-if="index === 0">{{ item }}</span>
                <span
                  v-if="index === 1"
                  class="grey--text text-caption"
                >
                  (+{{ filters.bill1C.length - 1 }} ещё...)
                </span>
              </template>
            </v-autocomplete>

            <DatePicker
              v-if="column.value === 'bill_date'"
              :filter="filters.billDate"
              @resetFilter="filters.billDate = []"
              @updateFilter="updateDateFilter"
            />

            <DatePicker
              v-if="column.value === 'od'"
              :filter="filters.od"
              @resetFilter="filters.od = []"
              @updateFilter="updateODFilter"
            />

            <v-autocomplete
              v-if="column.value === 'firm'"
              v-model="filters.firm"
              multiple
              :items="firm"
              deletable-chips
              clearable
              outlined
              dense
              chips
              hide-details
            />

            <v-text-field
              v-if="column.value === 'bill_sum'"
              v-model="filters.billSum"
              clearable
              outlined
              dense
              type="text"
              hide-details
            />

            <v-select
              v-if="column.value === 'bill_pay'"
              v-model="filters.billPay"
              clearable
              dense
              outlined
              hide-details
              :items="['не оплачено', 'частично оплачено', 'полностью оплачено']"
            />

            <v-switch v-if="column.value === 'DolgRed'" v-model="filters.DolgRed" />
            <v-switch v-if="column.value === 'DolgOrange'" v-model="filters.DolgOrange" />
            <v-switch v-if="column.value === 'DolgSR'" v-model="filters.DolgSR" />
            <v-switch v-if="column.value === 'Wait'" v-model="filters.Wait" />
          </td>
        </tr>

      </template>

      <template #[`item.bill_sum`]="{ item }">
        {{ item.bill_sum.toLocaleString('ru') }}<v-icon v-if="item.bill_sum" color="primary" x-small>mdi-currency-rub</v-icon>
      </template>
      <template #[`item.DolgRed`]="{ item }">
        {{ item.DolgRed ? item.DolgRed.toLocaleString('ru') : null }}<v-icon v-if="item.DolgRed" color="primary" x-small>mdi-currency-rub</v-icon>
      </template>
      <template #[`item.DolgOrange`]="{ item }">
        {{ item.DolgOrange ? item.DolgOrange.toLocaleString('ru') : null }}<v-icon v-if="item.DolgOrange" color="primary" x-small>mdi-currency-rub</v-icon>
      </template>
      <template #[`item.DolgSR`]="{ item }">
        {{ item.DolgSR.toLocaleString('ru') }}<v-icon v-if="item.DolgSR" color="primary" x-small>mdi-currency-rub</v-icon>
      </template>
      <template #[`item.Wait`]="{ item }">
        {{ item.Wait.toLocaleString('ru') }}<v-icon v-if="item.Wait" color="primary" x-small>mdi-currency-rub</v-icon>
      </template>
      <template #[`item.od`]="{ item }">
        <v-tooltip top>
          <template #activator="{ on }">
            <span @mouseover="getDetails(item)" v-on="on">{{ parseDateFromString(item.od) }}</span>
          </template>
          <span v-html="templateForDetails" />
        </v-tooltip>
      </template>
      <template #[`item.doc_date`]="{ item }">
        {{ parseDateFromString(item.doc_date) }}
      </template>
      <template #[`item.bill_date`]="{ item }">
        {{ new Date(item.bill_date).toLocaleDateString('ru') }}
      </template>
      <template #[`item.rnh`]="{ item }">
        {{ item.rnh | formatRNH }}
      </template>
      <template #[`item.bill_pay`]="{ item }">
        <span dark :class="getColorSum(item.bill_pay)" style="padding: 3px 10px; color: #fff">{{ item.bill_pay }}<v-icon x-small dark>mdi-percent</v-icon></span>
      </template>
      <template #[`item.Jira`]="{ item }">
        <div v-if="item.Jira">
          <a v-for="jira in item.Jira.split(',')" :key="jira" :href="$options._SETTINGS.jira_url + jira" target="_blank">{{ jira }}<br></a>
        </div>
      </template>
      <template #[`item.Buhs`]="{ item }">
        <div v-if="item.Buhs">
          <a v-for="buh in item.Buhs.split(',')" :key="buh" :href="$options._SETTINGS.jira_url + buh" target="_blank">{{ buh }}<br></a>
        </div>
      </template>

      <template #[`item.contracts`]="{ item }">
        <div v-if="item.contracts">
          <a v-for="contracts in item.contracts.split(',')" :key="contracts" :href="$options._SETTINGS.jira_url + contracts" target="_blank">{{ contracts }}<br></a>
        </div>
      </template>

      <template #[`item.action`]="{ item }">
        <v-icon small @click="edit(item)">edit</v-icon>
      </template>
    </v-data-table>

  </v-container>
</template>

<script>

import settings from '@/settings'

// import moment from 'moment'
import { AclRule } from 'vue-acl'
import { getColumns } from '@/services/table-columns'
import { formatDate } from '@/services/helpers'
import _ from 'lodash'

import { getBillShips } from '@/api/budget/income'

import ProgressDialog from '@/components/shared/ProgressDialog.vue'
import EditDialog from './edit_income.vue'
import DatePicker from '@/components/DatePicker/index.vue'
import { rangeDateFilter } from '@/helpers/shared/index.js'
import TableColumns from '@/components/DataTable/columns.vue'

export default {

  _SETTINGS: settings,

  filters: {

    formatRNH: (value) => {
      return parseInt(value)
    },

    moneyToPercent: (item, id) => {
      if (item) {
        if (id === 0 || id === null) return 0
        return parseFloat((id / item.bill_sum) * 100).toFixed() + ' %'
      } else {
        return null
      }
    }
  },

  components: {

    ProgressDialog,
    EditDialog,
    DatePicker,
    TableColumns,

  },
  data() {
    return {

      filters: {

        client1C: '',
        project1C: [],
        client_name: '',
        bill1C: '',
        firm: [],
        od: [],
        billSum: null,
        billPay: null,
        billDate: [],
        DolgRed: null,
        DolgOrange: null,
        DolgSR: null

      },

      multiSelects: {

        project1C: [],
        firm: [],
        bill1C: []

      },

      show: false,
      menu: false,
      loading: false,
      dialog: false,
      menuBillDate: false,
      localloading: false,
      menu_filter: false,
      checkBox: true,
      showForFilter: false,
      infoText: '',

      templateForDetails: [],

      Filters: [],
      Weeks: [],
      editedItem: {},
      json_fields: {},

      headers: [
        { text: 'id',
          value: 'id',
          selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['id'] : false,
          visible: true,
          divider: true
        },
        { text: 'Код контрагента',
          value: 'client_1c',
          selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['client_1c'] : false,
          visible: true,
          divider: true,
          filter: value => {
            if (!this.filters.client1C) return true
            if (!value) return false
            return value.toLowerCase().includes(this.filters.client1C.toLowerCase())
          }
        },
        { text: 'Проект 1С',
          value: 'project_1c',
          selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['project_1c'] : false,
          visible: true,
          divider: true,
          filter: value => {
            if (this.filters.project1C.length === 0) return true
            if (!value) return false
            return value.includes(this.filters.project1C.find(item => item === value))
          }
        },
        { text: 'Клиент',
          value: 'client_name',
          selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['client_name'] : false,
          visible: true,
          divider: true,
          filter: value => {
            if (!this.filters.client_name) return true
            if (!value) return false
            return value.toLowerCase().includes(this.filters.client_name.toLowerCase())
          }
        },
        { text: 'Счёт',
          value: 'bill_1c',
          selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['bill_1c'] : false,
          visible: true,
          divider: true,
          filter: value => {
            if (!this.filters.bill1C || !this.filters.bill1C.length) return true
            if (!value) return false
            return value.includes(this.filters.bill1C.find(item => item === value))
          }
        },
        { text: 'Дата счёта',
          value: 'bill_date',
          selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['bill_date'] : false,
          visible: true,
          divider: true,
          width: 250,
          filter: value => {
            if (this.filters.billDate.length === 0) return true
            if (!value || isNaN(Date.parse(value))) return false
            const dateToTime = this.filters.billDate.map(item => Math.round(new Date(item).getTime() / 1000.0))

            return rangeDateFilter(value, dateToTime)
          }
        },
        { text: 'Фирма',
          value: 'firm',
          selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['firm'] : false,
          visible: true,
          divider: true,
          filter: value => {
            if (this.filters.firm.length === 0) return true
            if (!value) return false
            return value.includes(this.filters.firm.find(item => item === value))
          }
        },
        { text: 'РНХ',
          value: 'rnh',
          divider: true,
          selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['rnh'] : false,
          visible: true
        },
        { text: 'Cумма (₽)',
          value: 'bill_sum',
          selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['bill_sum'] : false,
          visible: true,
          divider: true,
          width: 165,
          filter: value => {
            if (!this.filters.billSum) return true
            if (!value) return false
            return value.toString().includes(this.filters.billSum.toString())
          }
        },
        { text: 'Оплата (%)',
          value: 'bill_pay',
          selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['bill_pay'] : false,
          visible: true,
          divider: true,
          width: 100,
          filter: value => {
            if (!this.filters.billPay) return true
            if (this.filters.billPay === 'не оплачено') return (value === 0 || value <= 5)
            if (this.filters.billPay === 'полностью оплачено') return ((parseInt(value) + 5) >= 100)
            if (this.filters.billPay === 'частично оплачено') return (parseInt(value) <= 94 && parseInt(value) >= 6)
          }
        },
        { text: 'Долг (₽)',
          value: 'DolgRed',
          selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['DolgRed'] : false,
          visible: true,
          divider: true,
          width: 145,
          filter: value => {
            if (!this.filters.DolgRed) return true
            if (this.filters.DolgRed) {
              return value
            }
          }
        },
        { text: 'Ещё не долг (₽)',
          value: 'DolgOrange',
          selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['DolgOrange'] : false,
          visible: true,
          divider: true,
          width: 145,
          filter: value => {
            if (!this.filters.DolgOrange) return true
            if (this.filters.DolgOrange) {
              return value !== 0
            }
          }
        },
        { text: 'Дата отгрузки',
          value: 'doc_date',
          selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['doc_date'] : false,
          visible: true,
          divider: true
        },
        { text: 'Отсрочка по договору',
          value: 'otsrochka',
          selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['otsrochka'] : false,
          visible: true,
          divider: true
        },
        { text: 'Дата оплаты по договору',
          value: 'od',
          selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['od'] : false,
          visible: true,
          divider: true,
          width: 250,
          filter: value => {
            if (this.filters.od.length === 0) return true
            if (!value || isNaN(Date.parse(value))) return false
            const dateToTime = this.filters.od.map(item => Math.round(new Date(item).getTime() / 1000.0))

            return rangeDateFilter(value, dateToTime)
          }
        },
        { text: 'Договоры',
          value: 'contracts',
          selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['contracts'] : false,
          visible: true,
          divider: true,
          width: 200
        },
        { text: 'Теория',
          value: 'Wait',
          selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['Wait'] : false,
          visible: true,
          divider: true,
          width: 135,
          filter: value => {
            if (!this.filters.Wait) return true
            if (this.filters.Wait) {
              return value !== 0
            }
          }
        },
        { text: 'JIRA',
          value: 'Jira',
          selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['Jira'] : false,
          visible: true,
          divider: true,
          width: 200
        },
        { text: 'Связанные оплаты',
          value: 'Buhs',
          selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['Buhs'] : false,
          visible: true,
          divider: true,
          width: 200
        },
        { text: 'Ред.',
          value: 'action',
          selected: true,
          visible: true
        }
      ],

      textRules: [v => !!v || 'Обязательный параметр!'],

      customRules: [
        function(v) {
          if (v === undefined || v === '' || v === null) {
            return true
          } else {
            return true
          }
        }
      ],

      digitRules: [
        v => !!v || 'Обязательный параметр!',
        v => /^[0-9]+$/.test(v) || 'Допускаются только числа!'
      ]

    }
  },

  computed: {

    Data() {
      return this.$store.getters['budget/income/data'] || []
    },

    computedHeaders() {
      return this.headers.filter(header => header.selected)
    },

    Edit() {
      return new AclRule('user').and('engineer').or('admin').generate()
    },

    user() {
      return this.$store.getters.currentUser
    },

    project1C() {
      return _.uniq(this.multiSelects.project1C)
    },

    firm() {
      return _.uniq(this.multiSelects.firm)
    },

    bill1C() {
      return _.uniq(this.multiSelects.bill1C)
    },

    budgetSum() {
      const filteredSum = this.$refs.dataTable.$children[0].filteredItems.map(arr => arr.bill_sum)
      return Math.round(_.sum(filteredSum)).toLocaleString('ru')
    },

    budgetSumDolgRed() {
      const filteredSum = this.$refs.dataTable.$children[0].filteredItems.map(arr => arr.DolgRed)
      return Math.round(_.sum(filteredSum)).toLocaleString('ru')
    },

    budgetSumDolgOrange() {
      const filteredSum = this.$refs.dataTable.$children[0].filteredItems.map(arr => arr.DolgOrange)
      return Math.round(_.sum(filteredSum)).toLocaleString('ru')
    }

  },

  watch: {

    '$route.params.dolg': {
      deep: true,
      immediate: true,
      handler(val) {
        if (val) return (this.filters.DolgRed = true)
      }
    },

    '$route.params.teoria': {
      deep: true,
      immediate: true,
      handler(val) {
        if (val) return (this.filters.Wait = true)
      }
    }

  },

  // ================================= ХУКИ ===================================== //

  beforeMount() {
    this.WindowHeight = window.innerHeight - 210
  },

  async created() {
    this.loading = true

    await this.getColumns()

    if (this.Data.length === 0) {
      await this.$store.dispatch('budget/income/get')
    }

    console.log(this.Data)

    const MultiSelects = Object.keys(this.multiSelects).filter(item => !this.multiSelects[item].length)
    if (MultiSelects.length !== 0) this.transformData(this.Data, this.multiSelects)

    this.filters.bill1C = this.$route.query?.query?.split(',')

    this.loading = false
  },

  mounted() {
    const obj = {}
    for (const key in this.filters) {
      this.$watch(['filters', key].join('.'), val => {
        obj[key] = val || ''
        localStorage.setItem('filtersBudgetPrev', JSON.stringify(obj))
      })
    }

    this.setFiltersFromLocalStorage()
    window.addEventListener('resize', this.getWindowHeight)
  },

  // =============================== МЕТОДЫ =================================== //

  methods: {

    async getDetails(item) {
      const templateForDetails = []

      const data = await getBillShips({ bill: item.bill_1c }) || []

      if (data.length > 0) {
        templateForDetails.push('<table style="border-collapse:separate; border-spacing: 7px;">')

        data.forEach(el => {
          templateForDetails.push(`<tr><td>&nbsp;${el.doc_type}</td><td>&nbsp;${el.doc_num}</td><td>&nbsp;${new Date(el.doc_date).toLocaleDateString()}</td><td>&nbsp;${el.doc_sum.toLocaleString('ru', { style: 'currency', currency: 'RUB' })}</td></tr>`)
        })

        templateForDetails.push('</table>')

        this.templateForDetails = templateForDetails.join('<tr>')
      }
    },

    async getColumns() {
      await getColumns('budgetPrevColumn', this.headers)
        .then(data => console.log(data))
        .catch(error => {
          this.show = true
          this.infoText = error.message
        })
    },

    transformData(data, multiSelects) {
      data.forEach(item => {
        if (item.bill_pay === null) {
          item.bill_pay = 0
        } else {
          if (item.bill_sum === 0) item.bill_pay = 0
          else item.bill_pay = ((parseFloat(item.bill_pay) / parseFloat(item.bill_sum)) * 100).toFixed()
        }
        if (item.bill_date) item.bill_date = formatDate(item.bill_date)
        if (item.project_1c) multiSelects.project1C.push(item.project_1c)
        if (item.firm) multiSelects.firm.push(item.firm)
        if (item.bill_1c) multiSelects.bill1C.push(item.bill_1c)
      })
    },

    async getExel() {
      const filtered = await this.headers.filter(header => header.selected === true)
      filtered.forEach(item => {
        this.json_fields[item.text] = item.value
      })
      return this.$refs.dataTable.$children[0].filteredItems
    },

    setFiltersFromLocalStorage() {
      if (localStorage.filtersBudgetPrev) {
        Object.keys(this.filters).forEach(key => {
          Object.entries(JSON.parse(localStorage.filtersBudgetPrev)).forEach((item) => {
            if (JSON.parse(localStorage.getItem('filtersBudgetPrev'))[item[0]] && JSON.parse(localStorage.getItem('filtersBudgetPrev'))[item[0]] !== 'null' && item[0] === key) {
              this.filters[item[0]] = JSON.parse(localStorage.getItem('filtersBudgetPrev'))[item[0]]
            }
          })
        })
      }
    },

    getColorSum(sum) {
      if (sum >= 96) return 'green'
      else if (sum >= 5 && sum <= 95) return 'orange'
      else return 'red'
    },

    loadFilter() {
      return []
    },

    setParentFilters(val) {
      this.filters = [...val]
    },

    resetFilter() {
      for (const key in this.filters) {
        if (typeof this.filters[key] === 'object' && (this.filters[key] instanceof Array)) {
          this.filters[key] = []
        } else if (typeof this.filters[key] === 'object' && this.filters[key] !== null) {
          this.filters[key] = {}
        } else {
          this.filters[key] = ''
        }
      }
      this.menu_filter = false
      this.$router.replace({
        ...this.$router.currentRoute,
        query: {}
      })
    },

    /* saveColumnFB() {

      const budgetPrevColumn = {}
      const id = 'budgetPrevColumn'
      this.headers.forEach(header => {

        header.selected === null || header.selected === undefined ? budgetPrevColumn[header.value] = false : budgetPrevColumn[header.value] = header.selected

      })
      this.menu = false
      this.$store.dispatch('createLocalStorage', [budgetPrevColumn, id])

    },

    showAllColumn() {

      this.headers.forEach(header => {

        header.selected = true

      })

    }, */

    parseDateFromString(string) {
      if (!string) return null

      const arr = string.split(',')

      if (arr.length === 1) return new Date(string).toLocaleDateString('ru')
      if (arr.length > 1) return new Date(arr[arr.length - 1]).toLocaleDateString('ru') + ' *'
    },

    close() {
      this.dialog = false
    },

    edit(item) {
      this.editedItem = { ...item }
      this.dialog = true
    },

    updateDateFilter(val) {
      this.filters.billDate = [...val]
    },

    updateODFilter(val) {
      this.filters.od = [...val]
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
