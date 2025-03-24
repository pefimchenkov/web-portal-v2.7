<template>
  <v-container v-loading="loading" fluid :fill-height="Previous.length === 0">

    <ProgressDialog :show="show" :info-text="infoText" />

    <!-- <BudgetDialog @closeDialog="close" :dialog='dialog' :item="editItem" :weeks="Weeks" :user="user"></BudgetDialog> -->

    <v-toolbar v-show="!loading" :prominent="$vuetify.breakpoint.name === 'xs'" color="grey lighten-4" class="elevation-2 mb-1" width="100%" dense>
      <v-toolbar-title>Предыдущий реестр</v-toolbar-title>
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

        <v-col xs="2">
          <v-btn width="95" color="success" small>
            <download-excel
              :fields="json_fields"
              :fetch="getExel"
              class="btn btn-default xlsx_btn"
              name="budget_list_prev.xls"
            >
              <v-icon>save_alt</v-icon> excel
            </download-excel>
          </v-btn>
        </v-col>

        <v-col xs="2">

          <TableColumns :headers="headers" name="budgetPrevColumn" />

        </v-col>

        <v-col xs="2">
          <v-menu
            v-model="menu_filter"
            :close-on-content-click="false"
            offset-y
          >
            <template #activator="{ on }">
              <v-btn small color="#fff" v-on="on">
                <v-icon dark class="mr-2">filter_list</v-icon>
                Фильтры
              </v-btn>
            </template>
            <v-card class="text-center">
              <v-menu
                bottom
                transition="scale-transition"
                :close-on-content-click="false"
              />
              <v-list class="text-center">
                <v-list-item>
                  <v-btn text @click="resetFilter">Сбросить фильтр</v-btn>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </v-col>

      </v-row>

    </v-toolbar>

    <v-spacer />

    <div v-show="!loading" class="data_table_wrapper">
      <v-data-table
        ref="dataTable"
        :headers="computedHeaders"
        :items="Previous"
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

          <tr class="hidden-sm-and-down">
            <td><span>ИТОГО:</span></td>
            <td v-for="i of 7" :key="(i+1)**2" colspan="1" />
            <td>
              <v-text-field
                v-if="$refs.dataTable"
                v-model="budgetSum"
                type="text"
                readonly
                outlined
                disabled
                dense
                hide-details
                class="py-1"
              />
            </td>
            <td v-for="i of 6" :key="(i+1)**10" colspan="1" />
          </tr>

          <tr class="hidden-sm-and-down">
            <td v-if="computedHeaders.find(header => header.value === 'id')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'client_1c')">
              <v-text-field v-model="filters.client1C" clearable type="text" />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'project_1c')">
              <v-autocomplete
                v-model="filters.project1C"
                multiple
                :items="project1C"
                deletable-chips
                clearable
                chips
              />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'name')">
              <v-text-field v-model="filters.name" clearable type="text" />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'bill_1c')">
              <v-text-field v-model="filters.bill1C" clearable type="text" />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'bill_date')">
              <v-menu
                ref="menuBillDate"
                v-model="menuBillDate"
                :close-on-content-click="false"
                transition="scale-transition"
              >
                <template #activator="{ on }">
                  <v-icon :color="filters.billDate !== null && filters.billDate.length > 0 ? `green darken-2` : ``" v-on="on">event</v-icon>
                </template>
                <v-date-picker v-model="filters.billDate" multiple no-title>
                  <div class="flex-grow-1" />
                  <v-btn text color="primary" @click="menuBillDate = false">Отмена</v-btn>
                  <v-btn text color="primary" @click="$refs.menuBillDate.save(filters.billDate)">OK</v-btn>
                </v-date-picker>
              </v-menu>
              <v-icon v-if="filters.billDate !== null && filters.billDate.length > 0" @click="filters.billDate = []">clear</v-icon>
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'firm')">
              <v-autocomplete
                v-model="filters.firm"
                multiple
                :items="firm"
                deletable-chips
                clearable
                chips
              />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'rnh')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'bill_sum')" colspan="1">
              <v-text-field
                v-model="filters.billSum"
                clearable
                type="text"
              />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'bill_pay')">
              <v-select
                v-model="filters.billPay"
                clearable
                :items="['не оплачено', 'частично оплачено', 'полностью оплачено']"
              />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'Dolg')">
              <v-switch v-model="filters.Dolg" />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'DolgSR')">
              <v-switch v-model="filters.DolgSR" />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'Wait')">
              <v-switch v-model="filters.Wait" />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'Jira')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'action')" colspan="1" />
          </tr>

        </template>

        <template #[`item.bill_sum`]="{ item }">
          {{ item.bill_sum.toLocaleString('ru') }}<v-icon v-if="item.bill_sum" color="primary" x-small>mdi-currency-rub</v-icon>
        </template>
        <template #[`item.Dolg`]="{ item }">
          <span :style="(item.K === 'bold') ? 'font-weight: bold' : ''">{{ item.Dolg.toLocaleString('ru') }}</span><v-icon v-if="item.Dolg" color="primary" x-small>mdi-currency-rub</v-icon>
        </template>
        <template #[`item.DolgSR`]="{ item }">
          {{ item.DolgSR.toLocaleString('ru') }}<v-icon v-if="item.DolgSR" color="primary" x-small>mdi-currency-rub</v-icon>
        </template>
        <template #[`item.Wait`]="{ item }">
          {{ item.Wait.toLocaleString('ru') }}<v-icon v-if="item.Wait" color="primary" x-small>mdi-currency-rub</v-icon>
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
          <span :class="setColor()">{{ item.Jira }}</span>
        </template>
        <template #[`item.action`]="{ item }">
          <v-icon small @click="edit(item)">edit</v-icon>
        </template>
      </v-data-table>
    </div>

  </v-container>
</template>

<script>
import moment from 'moment'
import { AclRule } from 'vue-acl'
import { getColumns } from '@/services/table-columns'
import { formatDate } from '../../services/helpers'
import ProgressDialog from '@/components/shared/ProgressDialog.vue'
import _ from 'lodash'
import TableColumns from '@/components/DataTable/columns.vue'

export default {

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
    TableColumns

  },
  data() {
    return {

      filters: {

        client1C: '',
        project1C: [],
        name: '',
        bill1C: '',
        firm: [],
        billSum: null,
        billPay: null,
        billDate: [],
        Dolg: null,
        DolgSR: null

      },

      multiSelects: {

        project1C: [],
        firm: []

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

      Filters: [],
      Weeks: [],
      editItem: {},
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
          value: 'name',
          selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['name'] : false,
          visible: true,
          divider: true,
          filter: value => {
            if (!this.filters.name) return true
            if (!value) return false
            return value.toLowerCase().includes(this.filters.name.toLowerCase())
          }
        },
        { text: 'Счёт',
          value: 'bill_1c',
          selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['bill_1c'] : false,
          visible: true,
          divider: true,
          filter: value => {
            if (!this.filters.bill1C) return true
            if (!value) return false
            return value.toLowerCase().includes(this.filters.bill1C.toLowerCase())
          }
        },
        { text: 'Дата счёта',
          value: 'bill_date',
          selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['bill_date'] : false,
          visible: true,
          divider: true,
          width: 120,
          filter: value => {
            if (!this.filters.billDate || this.filters.billDate.length === 0) return true
            if (!value || isNaN(Date.parse(value))) return false
            const Arr = this.filters.billDate.map(item => moment(item).unix())
            const first = Math.min(...Arr)
            const last = Math.max(...Arr)
            return (moment(value).unix() >= first && moment(value).unix() <= last)
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
          width: 160,
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
        { text: 'Долг',
          value: 'Dolg',
          selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['Dolg'] : false,
          visible: true,
          divider: true,
          width: 135,
          filter: value => {
            if (!this.filters.Dolg) return true
            if (this.filters.Dolg) {
              return value !== 0
            }
          }
        },
        { text: 'Долг СР',
          value: 'DolgSR',
          selected: localStorage.budgetPrevColumn ? localStorage.budgetPrevColumn['DolgSR'] : false,
          visible: true,
          divider: true,
          width: 135,
          filter: value => {
            if (!this.filters.DolgSR) return true
            if (this.filters.DolgSR) {
              return value !== 0
            }
          }
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
          width: 300
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

    Previous() {
      return this.$store.getters['budget/previous']
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

    budgetSum() {
      const filteredSum = this.$refs.dataTable.$children[0].filteredItems.map(arr => arr.bill_sum)
      return Math.round(_.sum(filteredSum)).toLocaleString('ru')
    }

  },

  watch: {

    '$route.params.dolg': {
      deep: true,
      immediate: true,
      handler(val) {
        if (val) return (this.filters.Dolg = true)
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

    if (this.Previous.length === 0) {
      await this.$store.dispatch('budget/previous', { root: true })
      this.transformData()
    }

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

    async getColumns() {
      await getColumns('budgetPrevColumn', this.headers)
        .then(data => console.log(data))
        .catch(error => {
          this.show = true
          this.infoText = error.message
        })
    },

    transformData() {
      this.Previous.forEach((item) => {
        if (item.bill_pay === null) {
          item.bill_pay = 0
        } else {
          if (item.bill_sum === 0) item.bill_pay = 0
          else item.bill_pay = ((parseFloat(item.bill_pay) / parseFloat(item.bill_sum)) * 100).toFixed()
        }
        if (item.bill_date) item.bill_date = formatDate(item.bill_date)
        if (item.project_1c) this.multiSelects.project1C.push(item.project_1c)
        if (item.firm) this.multiSelects.firm.push(item.firm)
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

    setColor(item) {
      return 'grey--text lighten-3'
    },

    getColorSum(sum) {
      if (sum >= 96) return 'green'
      else if (sum >= 5 && sum <= 95) return 'orange'
      else return 'red'
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

    close() {
      this.dialog = false
    },

    edit(item) {
      this.editItem = { ...item }
      this.dialog = true
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
