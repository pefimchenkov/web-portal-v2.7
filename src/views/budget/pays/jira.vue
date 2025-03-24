<template>
  <v-container v-loading="!Data.length" fluid>

    <ProgressDialog :show="show" :info-text="infoText" />
    <EditDialog :show="dialog" :item="editedItem" @closeDialog="dialog = false" @addUpdatedStroki="addUpdatedStroki" />

    <v-toolbar v-show="!loading" :prominent="$vuetify.breakpoint.name === 'xs'" color="grey lighten-4" class="elevation-2 mb-1" width="100%" dense>
      <v-toolbar-title>Оплаты</v-toolbar-title>
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
              <TableColumns :headers="headers" name="paysColumnJira" />
            </el-dropdown-item>
            <el-dropdown-item>
              <download-excel
                :fields="json_fields"
                :fetch="getExel"
                name="pays_from_jira.xls"
              >
                Экспорт в excel
              </download-excel>
            </el-dropdown-item>

          </el-dropdown-menu>
        </el-dropdown>

        <!-- ФИЛЬТРЫ -->

        <el-dropdown trigger="click" :hide-on-click="false">
          <el-button>
            <svg-icon icon-class="filter" />
            Фильтры
          </el-button>

          <el-dropdown-menu slot="dropdown">

            <el-dropdown-item>
              <NamedFilters :filters="Filters" @load-filter="loadFilter" @reset-filter="resetFilter" @set-parent-filters="setParentFilters" />
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

      </v-row>

    </v-toolbar>

    <v-spacer />

    <div class="data_table_wrapper">
      <v-data-table
        ref="paysListTable"
        :headers="computedHeaders"
        :items="Data"
        item-key="id"
        sort-by="id"
        dense
        sort-desc
        :mobile-breakpoint="750"
        :fixed-header="checkBox"
        :height="checkBox ? WindowHeight : null"
        :footer-props="{
          itemsPerPageText: 'Строк на странице',
          itemsPerPageOptions: [50,250,500],
          showFirstLastPage: true
        }"
        class="elevation-2"
      >
        <template #[`body.prepend`]>

          <tr class="hidden-sm-and-down">
            <td v-if="computedHeaders.find(header => header.value === 'id')"><span>ИТОГО:</span></td>
            <td v-if="computedHeaders.find(header => header.value === 'ikey')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'created')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'date_plan')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'date_crit')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'firma')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'istatus')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'ci')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'ci_type')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'forma')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'pp')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'sum')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'currency')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'total')" colspan="1">
              <v-text-field
                v-if="$refs.paysListTable"
                v-model="totalSum"
                type="text"
                readonly
                outlined
                disabled
                dense
                hide-details
                class="py-1"
              />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'bills')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'stroki')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'paid')" colspan="1">
              <v-text-field
                v-if="$refs.paysListTable"
                v-model="totalPaid"
                type="text"
                readonly
                outlined
                disabled
                dense
                hide-details
                class="py-1"
              />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'paid_status')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'action')" colspan="1" />
          </tr>

          <tr class="hidden-sm-and-down">
            <td v-if="computedHeaders.find(header => header.value === 'id')" colspan="1" />

            <td v-if="computedHeaders.find(header => header.value === 'ikey')">
              <v-text-field
                v-model="filters.ikey"
                clearable
                outlined
                dense
                hide-details
              />
            </td>

            <td v-if="computedHeaders.find(header => header.value === 'created')">
              <v-menu ref="menuPayDateCreated" v-model="menuPayDateCreated" :close-on-content-click="false" transition="scale-transition">
                <template #activator="{ on }">
                  <v-icon :color="filters.created !== null && filters.created.length > 0 ? `green darken-2` : ``" v-on="on">event</v-icon>
                </template>
                <v-date-picker v-model="filters.created" multiple no-title locale="ru">
                  <div class="flex-grow-1" />
                  <v-btn text color="primary" @click="menuPayDateCreated = false">Отмена</v-btn>
                  <v-btn text color="primary" @click="$refs.menuPayDateCreated.save(filters.created)">OK</v-btn>
                </v-date-picker>
              </v-menu>
              <v-icon v-if="filters.created !== null && filters.created.length > 0" @click="filters.created = []">clear</v-icon>
            </td>

            <td v-if="computedHeaders.find(header => header.value === 'firma')">
              <v-autocomplete
                v-model="filters.firma"
                :items="firms"
                clearable
                outlined
                dense
                hide-details
                multiple
                class="py-1"
              />
            </td>

            <td v-if="computedHeaders.find(header => header.value === 'istatus')">
              <v-autocomplete
                v-model="filters.istatus"
                :items="istatus"
                clearable
                outlined
                dense
                hide-details
                multiple
                class="py-1"
              />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'ci')" colspan="1">
              <v-autocomplete
                v-model="filters.ci"
                :items="ci"
                clearable
                outlined
                dense
                hide-details
                multiple
                class="py-1"
              />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'ci_type')" colspan="1">
              <v-autocomplete
                v-model="filters.ci_type"
                :items="ci_type"
                clearable
                outlined
                dense
                hide-details
                multiple
                class="py-1"
              />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'forma')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'pp')" colspan="1">
              <v-autocomplete
                v-model="filters.pp"
                :items="pp"
                clearable
                outlined
                dense
                hide-details
                multiple
                class="py-1"
              />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'sum')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'currency')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'total')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'date_plan')">
              <v-menu ref="menuPayDatePlan" v-model="menuPayDatePlan" :close-on-content-click="false" transition="scale-transition">
                <template #activator="{ on }">
                  <v-icon :color="filters.date_plan !== null && filters.date_plan.length > 0 ? `green darken-2` : ``" v-on="on">event</v-icon>
                </template>
                <v-date-picker v-model="filters.date_plan" multiple no-title locale="ru">
                  <div class="flex-grow-1" />
                  <v-btn text color="primary" @click="menuPayDatePlan = false">Отмена</v-btn>
                  <v-btn text color="primary" @click="$refs.menuPayDatePlan.save(filters.date_plan)">OK</v-btn>
                </v-date-picker>
              </v-menu>
              <v-icon v-if="filters.date_plan !== null && filters.date_plan.length > 0" @click="filters.date_plan = []">clear</v-icon>
            </td>

            <td v-if="computedHeaders.find(header => header.value === 'date_crit')">
              <v-menu ref="menuPayDateCrit" v-model="menuPayDateCrit" :close-on-content-click="false" transition="scale-transition">
                <template #activator="{ on }">
                  <v-icon :color="filters.date_crit !== null && filters.date_crit.length > 0 ? `green darken-2` : ``" v-on="on">event</v-icon>
                </template>
                <v-date-picker v-model="filters.date_crit" multiple no-title locale="ru">
                  <div class="flex-grow-1" />
                  <v-btn text color="primary" @click="menuPayDateCrit = false">Отмена</v-btn>
                  <v-btn text color="primary" @click="$refs.menuPayDateCrit.save(filters.date_crit)">OK</v-btn>
                </v-date-picker>
              </v-menu>
              <v-icon v-if="filters.date_crit !== null && filters.date_crit.length > 0" @click="filters.date_crit = []">clear</v-icon>
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'bills')">
              <v-text-field
                v-model="filters.bills"
                clearable
                outlined
                dense
                hide-details
              />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'stroki')">
              <v-text-field
                v-model="filters.stroki"
                clearable
                outlined
                dense
                hide-details
              />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'paid')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'paid_status')" colspan="1" />

            <td v-if="computedHeaders.find(header => header.value === 'action')" colspan="1" />
          </tr>

        </template>

        <template #[`item.sum`]="{ item }">
          {{ item.sum ? item.sum.toLocaleString('ru') : null }}
        </template>

        <template #[`item.total`]="{ item }">
          {{ item.total
            ? item.total.toLocaleString('ru', { style: 'currency', currency: 'RUB' })
            : item.sum
              ? item.sum.toLocaleString('ru', { style: 'currency', currency: 'RUB' })
              : null
          }}
        </template>

        <template #[`item.pp`]="{ item }">
          <v-tooltip v-if="item.pplp" top>
            <template #activator="{ on }">
              <span style="cursor: pointer" v-on="on">{{ item.pp }}</span>
            </template>
            <span>{{ item.pplp }}</span>
          </v-tooltip>
          <span v-else>{{ item.pp }}</span>
        </template>

        <template #[`item.created`]="{ item }">
          {{ item.created ? new Date(item.created).toLocaleDateString('ru') : null }}
        </template>

        <template #[`item.date_plan`]="{ item }">
          {{ item.date_plan ? new Date(item.date_plan).toLocaleDateString('ru') : null }}
        </template>

        <template #[`item.date_crit`]="{ item }">
          {{ item.date_crit ? new Date(item.date_crit).toLocaleDateString('ru') : null }}
        </template>

        <template #[`item.paid`]="{ item }">
          {{ item.paid ? item.paid.toLocaleString('ru', { style: 'currency', currency: 'RUB' }) + totalOrSummary(item.stroki) : null }}
        </template>

        <template #[`item.paid_status`]="{ item }">
          {{ item.stroki ? getPaidStatus(item) : null }}
        </template>

        <template #[`item.stroki`]="{ item }">
          <template v-if="item.stroki">
            <div v-for="str of item.stroki.split(' ')" :key="str">
              {{ str }}
            </div>
          </template>

        </template>

        <template #[`item.action`]="{ item }">
          <v-icon small @click="edit(item)">edit</v-icon>
        </template>

      </v-data-table>
    </div>
  </v-container>

</template>

<script>
import EditDialog from './components/edit_pays_jira.vue'
import settings from '@/settings'

import moment from 'moment'
import { AclRule } from 'vue-acl'
import { getColumns } from '@/services/table-columns'
// import { formatDate } from '../../../services/helpers'
import ProgressDialog from '@/components/shared/ProgressDialog.vue'
import _ from 'lodash'
import TableColumns from '@/components/DataTable/columns.vue'
import NamedFilters from '@/components/shared/NamedFilters.vue'

export default {

  _SETTINGS: settings,

  components: {

    ProgressDialog,
    EditDialog,
    TableColumns,
    NamedFilters

  },

  props: {

    buhs: {

      type: Array,
      required: true

    }

  },

  // ====================================== СОСТОЯНИЕ ============================================ //

  data() {
    return {

      filters: {
        created: [],
        date_plan: [],
        date_crit: [],
        firma: [],
        istatus: [],
        ci: [],
        ci_type: [],
        pp: []
      },

      multiSelects: {
        firma: [],
        istatus: [],
        ci: [],
        ci_type: [],
        pp: []
      },

      Filters: [],
      editedItem: {},
      json_fields: {},

      show: false,
      loading: false,
      menu: false,
      dialog: false,
      menuPayDateCreated: false,
      menuPayDatePlan: false,
      menuPayDateCrit: false,
      menuFactPayDate: false,
      localloading: false,
      menu_filter: false,
      checkBox: true,
      showForFilter: false,
      infoText: '',

      headers: [
        {
          text: 'id',
          value: 'id',
          selected: localStorage.paysColumnJira ? localStorage.paysColumnJira['id'] : false,
          visible: true,
          divider: true
        },
        {
          text: 'Номер',
          value: 'ikey',
          selected: localStorage.paysColumnJira ? localStorage.paysColumnJira['ikey'] : false,
          visible: true,
          width: "100",
          divider: true,
          filter: value => {
            if (!this.filters.ikey) return true
            if (!value) return false
            return value.toLowerCase().includes(this.filters.ikey.toLowerCase())
          }
        },
        {
          text: 'Дата создания',
          value: 'created',
          selected: localStorage.paysColumnJira ? localStorage.paysColumnJira['created'] : false,
          visible: true,
          divider: true,
          filter: value => {
            if (!this.filters.created || this.filters.created.length === 0) return true
            if (!value || isNaN(Date.parse(value))) return false
            const Arr = this.filters.created.map(item => moment(item).unix())
            const first = Math.min(...Arr)
            const last = Math.max(...Arr)
            return (moment(value).unix() >= first && moment(value).unix() <= last)
          }
        },
        {
          text: 'Фирма',
          value: 'firma',
          selected: localStorage.paysColumnJira ? localStorage.paysColumnJira['firma'] : false,
          visible: true,
          divider: true,
          filter: value => {
            if (this.filters.firma.length === 0) return true
            if (!value) return false
            return value.includes(this.filters.firma.find(item => item === value))
          }
        },
        {
          text: 'Статус',
          value: 'istatus',
          selected: localStorage.paysColumnJira ? localStorage.paysColumnJira['istatus'] : false,
          visible: true,
          divider: true,
          filter: value => {
            if (this.filters.istatus.length === 0) return true
            if (!value) return false
            return value.includes(this.filters.istatus.find(item => item === value))
          }
        },
        {
          text: 'Статья расходов',
          value: 'ci',
          selected: localStorage.paysColumnJira ? localStorage.paysColumnJira['ci'] : false,
          visible: true,
          divider: true,
          filter: value => {
            if (this.filters.ci.length === 0) return true
            if (!value) return false
            return value.includes(this.filters.ci.find(item => item === value))
          }
        },
        {
          text: 'Тип статьи',
          value: 'ci_type',
          selected: localStorage.paysColumnJira ? localStorage.paysColumnJira['ci_type'] : false,
          visible: true,
          divider: true,
          filter: value => {
            if (this.filters.ci_type.length === 0) return true
            if (!value) return false
            return value.includes(this.filters.ci_type.find(item => item === value))
          }
        },
        {
          text: 'Форма',
          value: 'forma',
          selected: localStorage.paysColumnJira ? localStorage.paysColumnJira['forma'] : false,
          visible: true,
          divider: true
          /* filter: value => {

            if (this.filters.forma.length === 0) return true
            if (!value) return false
            return value.includes(this.filters.forma.find(item => item === value))

          } */
        },
        {
          text: 'Получатель платежа',
          value: 'pp',
          selected: localStorage.paysColumnJira ? localStorage.paysColumnJira['pp'] : false,
          visible: true,
          divider: true,
          filter: value => {
            if (this.filters.pp.length === 0) return true
            if (!value) return false
            return value.includes(this.filters.pp.find(item => item === value))
          }
        },
        {
          text: 'Сумма',
          value: 'sum',
          selected: localStorage.paysColumnJira ? localStorage.paysColumnJira['sum'] : false,
          visible: true,
          divider: true
        },
        {
          text: 'Валюта',
          value: 'currency',
          selected: localStorage.paysColumnJira ? localStorage.paysColumnJira['currency'] : false,
          visible: true,
          divider: true
        },
        {
          text: 'Сумма по курсу',
          value: 'total',
          selected: localStorage.paysColumnJira ? localStorage.paysColumnJira['total'] : false,
          visible: true,
          divider: true
        },
        {
          text: 'Дата планируемая',
          value: 'date_plan',
          selected: localStorage.paysColumnJira ? localStorage.paysColumnJira['date_plan'] : false,
          visible: true,
          divider: true,
          filter: value => {
            if (!this.filters.date_plan || this.filters.date_plan.length === 0) return true
            if (!value || isNaN(Date.parse(value))) return false
            const Arr = this.filters.date_plan.map(item => moment(item).unix())
            const first = Math.min(...Arr)
            const last = Math.max(...Arr)
            return (moment(value).unix() >= first && moment(value).unix() <= last)
          }
        },
        {
          text: 'Дата критическая',
          value: 'date_crit',
          selected: localStorage.paysColumnJira ? localStorage.paysColumnJira['date_crit'] : false,
          visible: true,
          divider: true,
          filter: value => {
            if (!this.filters.date_crit || this.filters.date_crit.length === 0) return true
            if (!value || isNaN(Date.parse(value))) return false
            const Arr = this.filters.date_crit.map(item => moment(item).unix())
            const first = Math.min(...Arr)
            const last = Math.max(...Arr)
            return (moment(value).unix() >= first && moment(value).unix() <= last)
          }
        },
        {
          text: 'Связанные счета',
          value: 'bills',
          selected: localStorage.paysColumnJira ? localStorage.paysColumnJira['bills'] : false,
          visible: true,
          divider: true,
          filter: value => {
            if (!this.filters.bills) return true
            if (!value) return false
            return value.toLowerCase().includes(this.filters.bills.toLowerCase())
          }
        },
        {
          text: 'Строки выписки',
          value: 'stroki',
          selected: localStorage.paysColumnJira ? localStorage.paysColumnJira['stroki'] : false,
          visible: true,
          divider: true,
          filter: value => {
            if (!this.filters.stroki) return true
            if (!value) return false
            return value.toLowerCase().includes(this.filters.stroki.toLowerCase())
          }
        },
        {
          text: 'Оплачено',
          value: 'paid',
          selected: localStorage.paysColumnJira ? localStorage.paysColumnJira['paid'] : false,
          visible: true,
          divider: true,
          width: 170
        },
        {
          text: 'Статус оплаты',
          value: 'paid_status',
          selected: localStorage.paysColumnJira ? localStorage.paysColumnJira['paid_status'] : false,
          visible: true,
          divider: true
        },
        {
          text: 'Действия',
          value: 'action',
          align: 'center',
          selected: localStorage.paysColumnJira ? localStorage.paysColumnJira['action'] : false,
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
      const data = this.$store.getters['budget/pays/jira'];
      return data.length
        ? data.filter(item => item.istatus !== 'Закрыт')
        : []
    },

    computedHeaders() {
      return this.headers.filter(header => header.selected)
    },

    firms() {
      return _.uniq(this.multiSelects.firma)
    },

    istatus() {
      return _.uniq(this.multiSelects.istatus)
    },

    ci() {
      return _.uniq(this.multiSelects.ci)
    },

    ci_type() {
      return _.uniq(this.multiSelects.ci_type)
    },

    pp() {
      return _.uniq(this.multiSelects.pp)
    },

    totalSum() {
      const filteredSum = this.$refs.paysListTable.$children[0].filteredItems.map(arr => +arr.total || +arr.sum)
      return Math.round(_.sum(filteredSum)).toLocaleString('ru')
    },

    totalPaid() {
      const filteredSum = this.$refs.paysListTable.$children[0].filteredItems.map(arr => +arr.paid)
      return _.sum(filteredSum).toLocaleString('ru')
    },

    Edit() {
      return new AclRule('user').and('engineer').or('admin').generate()
    },
    user() {
      return this.$store.getters.currentUser
    }

  },

  // ============================================= ХУКИ ==================================================== //

  beforeMount() {
    this.WindowHeight = window.innerHeight - 271
  },

  async created() {
    await this.getColumns();
    if (!this.Data.length) {
      await this.$store.dispatch('budget/pays/jira', { root: true })
    }
    this.fillMultiSelects(this.multiSelects)
  },

  mounted() {
    const obj = {}
    for (const key in this.filters) {
      this.$watch(['filters', key].join('.'), val => {
        obj[key] = val || ''
        localStorage.setItem('filtersPaysJira', JSON.stringify(obj))
      })
    }

    this.setFiltersFromLocalStorage()
    window.addEventListener('resize', this.getWindowHeight)

    this.getCalculations(this.Data)
  },

  // ============================================= МЕТОДЫ ================================================ //

  methods: {

    getWindowHeight(event) {
      this.WindowHeight = event.target.innerHeight - 210
    },

    async getExel() {
      const filtered = await this.headers.filter(header => header.selected === true)
      filtered.forEach(item => {
        this.json_fields[item.text] = item.value
      })
      return this.$refs.paysListTable.$children[0].filteredItems
    },

    setFiltersFromLocalStorage() {
      if (localStorage.filtersPaysJira) {
        Object.keys(this.filters).forEach(key => {
          Object.entries(JSON.parse(localStorage.filtersPaysJira)).forEach((item) => {
            if (JSON.parse(localStorage.getItem('filtersPaysJira'))[item[0]] && JSON.parse(localStorage.getItem('filtersPaysJira'))[item[0]] !== 'null' && item[0] === key) {
              this.filters[item[0]] = JSON.parse(localStorage.getItem('filtersPaysJira'))[item[0]]
            }
          })
        })
      }
    },

    async getColumns() {
      await getColumns('paysColumnJira', this.headers)
        .then(data => console.log(data))
        .catch(error => {
          this.show = true
          this.infoText = error.message
        })
    },

    fillMultiSelects(container) {
      this.Data.forEach(item => {
        if (item.firma) container.firma.push(item.firma)
        if (item.istatus) container.istatus.push(item.istatus)
        if (item.ci) container.ci.push(item.ci)
        if (item.ci_type) container.ci_type.push(item.ci_type)
        if (item.pp) container.pp.push(item.pp)
      })
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

    totalOrSummary(item) {
      const row = this.buhs.find(buh => buh.pay_1c === item)
      if (row && row.buh.split(',').length > 1) return ` *`
      else return ``
    },

    getCalculations(pays) {
      pays.forEach(item => {
        const row = this.buhs.find(buh => buh.pay_1c === item.stroki)

        if (row && row.buh.split(',').length > 1) {
          item.paid = (item.total || item.sum)
        } else {
          if (item.stroki) {
            const sum = this.buhs.filter(buh => item.stroki.includes(buh.pay_1c)).reduce((acc, item) => {
              return parseFloat(acc + item.pay_sum)
            }, 0)

            item.paid = sum
          }
        }
      })
    },

    getPaidStatus(item) {
      const sum = this.buhs.filter(buh => item.stroki.includes(buh.pay_1c)).reduce((acc, item) => {
        return parseFloat(acc + item.pay_sum)
      }, 0)

      const row = item.stroki
        ? this.buhs.find(buh => item.stroki.includes(buh.pay_1c))
        : undefined

      switch (true) {
        case !sum: return 'нет'
        case (row && row.buh && row.buh.split(',').length > 1): return 'Оплачен массово'
        case item.total < sum: return 'Превышено'
        case item.total === sum: return 'Полностью'
        case item.total > sum: return 'Частично'
        default: return ''
      }
    },

    addUpdatedStroki(data) {
      const Item = this.Data.find(pay => pay.ikey === this.editedItem.ikey)
      Item.stroki = data.join(' ')
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
