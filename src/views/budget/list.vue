<template>
  <v-container v-loading="loading" fluid :fill-height="Current.length === 0">

    <ProgressDialog :show="show" :info-text="infoText" />
    <Dialog :dialog="dialog" :edited-item="editedItem" :weeks="Weeks" :user="user" @closeDialog="close" />

    <v-toolbar v-show="!loading" :prominent="$vuetify.breakpoint.name === 'xs'" color="grey lighten-4" class="elevation-2 mb-1" width="100%" dense>
      <v-toolbar-title>Текущий реестр</v-toolbar-title>
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

        <v-col xs="2" sm="2">
          <v-btn width="95" color="success" small>
            <download-excel
              :fields="json_fields"
              :fetch="getExel"
              class="btn btn-default xlsx_btn"
              name="budget_list.xls"
            >
              <v-icon>save_alt</v-icon> excel
            </download-excel>
          </v-btn>
        </v-col>

        <v-spacer />

        <v-col xs="2" sm="2">
          <v-menu
            v-model="menu"
            bottom
            transition="scale-transition"
            :close-on-content-click="false"
          >
            <template #activator="{on}">
              <v-btn small color="#fff" v-on="on">
                <v-icon left>list</v-icon>
                Колонки ..
              </v-btn>
            </template>

            <v-list class="pa-3">
              <v-btn
                @click="saveColumnFB"
              ><v-icon color="success" class="mr-1">save</v-icon>
                Сохранить
              </v-btn>
              <v-btn
                @click="showAllColumn"
              ><v-icon color="warning" class="mr-1">mdi-eye</v-icon>
                Включить всё
              </v-btn>
              <v-list-item
                v-for="(header, i) in headers"
                :key="i"
                dense
              >
                <v-checkbox
                  v-if="header.visible"
                  v-model="header.selected"
                  :label="header.text"
                  :value="header.selected"
                  hide-details
                />
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>

        <v-spacer />

        <v-col xs="2" sm="2">
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
        :items="Current"
        item-key="id"
        sort-by="id"
        :mobile-breakpoint="750"
        :fixed-header="checkBox"
        :height="checkBox ? WindowHeight : null"
        sort-desc
        dense
        :footer-props="{
          itemsPerPageText: 'Строк на странице',
          itemsPerPageOptions: [50,250,500],
          showFirstLastPage: true
        }"

        class="elevation-2"
      >
        <template #[`body.prepend`]>

          <!-- СТРОКА ИТОГО -->

          <tr class="hidden-sm-and-down">
            <td v-if="computedHeaders.find(header => header.value === 'id')"><span>ИТОГО:</span></td>
            <td v-if="computedHeaders.find(header => header.value === 'client_1c')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'project_1c')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'name')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'bill_1c')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'bill_date')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'firm')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'rnh')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'bill_sum')">
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
            <td v-if="computedHeaders.find(header => header.value === 'bill_pay')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'Jira')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'action')" colspan="1" />
          </tr>

          <!-- СТРОКА ФИЛЬТРОВ -->

          <tr class="hidden-sm-and-down">
            <td v-if="computedHeaders.find(header => header.value === 'id')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'client_1c')">
              <v-text-field v-model="filters.client1C" clearable type="text" />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'project_1c')">
              <v-autocomplete
                v-model="filters.project1C"
                multiple
                dense
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
              <v-autocomplete
                v-model="filters.bill1C"
                multiple
                dense
                :items="bill1C"
                clearable
              >
                <template #selection="{ item, index }">
                  <v-chip
                    v-if="index === 0"
                  >
                    <span>{{ item }}</span>
                  </v-chip>
                  <span
                    v-if="index === 1"
                    class="grey--text text-caption"
                  >
                    (+{{ filters.bill1C.length - 1 }} ещё...)
                  </span>
                </template>
              </v-autocomplete>
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
              <v-text-field v-model="filters.billSum" clearable type="text" />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'bill_pay')">
              <v-select
                v-model="filters.billPay"
                clearable
                :items="['не оплачено', 'частично оплачено', 'полностью оплачено']"
              />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'Jira')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'action')" colspan="1" />
          </tr>

        <!-- //////////////////////////////////////// -->

        </template>
        <template #[`item.bill_sum`]="{ item }">
          {{ item.bill_sum.toLocaleString('ru') }}<v-icon color="primary" x-small>mdi-currency-rub</v-icon>
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
          <span class="grey--text lighten-3">{{ item.Jira }}</span>
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
import { getColumns } from '@/services/table-columns'
import { formatDate } from '../../services/helpers'
import ProgressDialog from '@/components/shared/ProgressDialog.vue'
import Dialog from './dialog.vue'
import _ from 'lodash'

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
    Dialog
  },
  data() {
    return {

      filters: {
        client1C: '',
        project1C: [],
        name: '',
        firm: [],
        billPay: null,
        billDate: [],
        bill1C: []
      },

      multiSelects: {
        project1C: [],
        firm: [],
        bill1C: []
      },

      loading: false,
      show: false,
      menu: false,
      dialog: false,
      menuBillDate: false,
      localloading: false,
      menu_filter: false,
      checkBox: true,
      infoText: '',
      showForFilter: false,
      WindowHeight: null,

      Filters: [],
      Weeks: [],
      editedItem: {},

      headers: [
        { text: 'id',
          value: 'id',
          divider: true,
          selected: localStorage.budgetColumn ? localStorage.budgetColumn['id'] : false,
          visible: true
        },
        { text: 'Код контрагента',
          value: 'client_1c',
          selected: localStorage.budgetColumn ? localStorage.budgetColumn['client_1c'] : false,
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
          selected: localStorage.budgetColumn ? localStorage.budgetColumn['project_1c'] : false,
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
          selected: localStorage.budgetColumn ? localStorage.budgetColumn['name'] : false,
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
          selected: localStorage.budgetColumn ? localStorage.budgetColumn['bill_1c'] : false,
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
          selected: localStorage.budgetColumn ? localStorage.budgetColumn['bill_date'] : false,
          visible: true,
          width: 120,
          divider: true,
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
          selected: localStorage.budgetColumn ? localStorage.budgetColumn['firm'] : false,
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
          selected: localStorage.budgetColumn ? localStorage.budgetColumn['rnh'] : false,
          visible: true,
          divider: true
        },
        { text: 'Сумма (₽)',
          value: 'bill_sum',
          selected: localStorage.budgetColumn ? localStorage.budgetColumn['bill_sum'] : false,
          visible: true,
          width: 150,
          divider: true,
          filter: value => {
            if (!this.filters.billSum) return true
            if (!value) return false
            return value.toString().includes(this.filters.billSum.toString())
          }
        },
        { text: 'Оплата (%)',
          value: 'bill_pay',
          selected: localStorage.budgetColumn ? localStorage.budgetColumn['bill_pay'] : false,
          visible: true,
          width: 100,
          divider: true,
          align: 'center',
          filter: value => {
            if (!this.filters.billPay) return true
            if (this.filters.billPay === 'не оплачено') return (value === 0 || value <= 5)
            if (this.filters.billPay === 'полностью оплачено') return ((parseInt(value) + 5) >= 100)
            if (this.filters.billPay === 'частично оплачено') return (parseInt(value) <= 94 && parseInt(value) >= 6)
          }
        },
        { text: 'JIRA',
          value: 'Jira',
          selected: localStorage.budgetColumn ? localStorage.budgetColumn['Jira'] : false,
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
      ],
      json_fields: {}
    }
  },

  computed: {

    Current() {
      return this.$store.getters['budget/current']
    },

    computedHeaders() {
      return this.headers.filter(header => header.selected)
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
    }

  },

  // ============================================= ХУКИ ==================================================== //

  beforeMount() {
    this.WindowHeight = window.innerHeight - 210
  },

  async created() {
    this.loading = true

    await this.getColumns()

    if (this.Current.length === 0) {
      await this.$store.dispatch('budget/current', { root: true })
    }

    const MultiSelects = Object.keys(this.multiSelects).filter(item => !this.multiSelects[item].length)
    if (MultiSelects.length !== 0) this.transformData(this.Current, this.multiSelects)

    this.filters.bill1C = this.$route.query?.query?.split(',')

    this.loading = false
  },

  mounted() {
    const obj = {}
    for (const key in this.filters) {
      this.$watch(['filters', key].join('.'), val => {
        obj[key] = val || ''
        localStorage.setItem('filtersBudget', JSON.stringify(obj))
      })
    }

    this.setFiltersFromLocalStorage()
    window.addEventListener('resize', this.getWindowHeight)
  },

  // ============================================= МЕТОДЫ ================================================ //

  methods: {

    getWindowHeight(event) {
      this.WindowHeight = event.target.innerHeight - 210
    },

    async getColumns() {
      await getColumns('budgetColumn', this.headers)
        .then(data => console.log(data))
        .catch(error => {
          this.show = true
          this.infoText = error.message
        })
    },

    setFiltersFromLocalStorage() {
      if (localStorage.filtersBudget) {
        Object.keys(this.filters).forEach(key => {
          Object.entries(JSON.parse(localStorage.filtersBudget)).forEach((item) => {
            if (JSON.parse(localStorage.getItem('filtersBudget'))[item[0]] && JSON.parse(localStorage.getItem('filtersBudget'))[item[0]] !== 'null' && item[0] === key) {
              this.filters[item[0]] = JSON.parse(localStorage.getItem('filtersBudget'))[item[0]]
            }
          })
        })
      }
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

    saveColumnFB() {
      const budgetColumn = {}
      const id = 'budgetColumn'
      this.headers.forEach(header => {
        header.selected === null || header.selected === undefined ? budgetColumn[header.value] = false : budgetColumn[header.value] = header.selected
      })
      this.menu = false
      this.$store.dispatch('createLocalStorage', [budgetColumn, id])
    },

    showAllColumn() {
      this.headers.forEach(header => {
        header.selected = true
      })
    },

    close() {
      this.dialog = false
    },

    edit(item) {
      this.editedItem = { ...item }
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
