<template>
  <v-container fluid>

    <ProgressDialog :show="show" :info-text="infoText" />
    <EditDialog :show="dialog" :item="editedItem" @closeDialog="dialog = false" @addUpdatedBuhs="addUpdatedBuhs" />

    <v-toolbar v-show="!loading" :prominent="$vuetify.breakpoint.name === 'xs'" color="grey lighten-4" class="elevation-2 mb-1" width="100%" dense>
      <v-toolbar-title>Строки выписки</v-toolbar-title>
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
              <TableColumns :headers="headers" name="paysColumn1c" />
            </el-dropdown-item>
            <el-dropdown-item>
              <download-excel
                :fields="json_fields"
                :fetch="getExel"
                name="pays_list.xls"
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
        :items="pays"
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
            <td v-if="computedHeaders.find(header => header.value === 'client_1c')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'pay_1c')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'pay_date')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'currency_code')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'pay_sum')" colspan="1">
              <v-text-field
                v-if="$refs.paysListTable"
                v-model="paySum"
                type="text"
                readonly
                outlined
                disabled
                dense
                hide-details
                class="py-1"
              />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'account_pay_sum')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'project_name')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'yellow')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'one_c_name')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'jira_name')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'fact_pay_date')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'rs')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'buh')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'action')" colspan="1" />
          </tr>

          <tr class="hidden-sm-and-down">
            <td v-if="computedHeaders.find(header => header.value === 'id')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'client_1c')">
              <v-text-field v-model="filters.client1C" clearable type="text" />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'pay_1c')">
              <v-text-field v-model="filters.pay1C" clearable type="text" />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'pay_date')">
              <v-menu ref="menuPayDate" v-model="menuPayDate" :close-on-content-click="false" transition="scale-transition">
                <template #activator="{ on }">
                  <v-icon :color="filters.payDate !== null && filters.payDate.length > 0 ? `green darken-2` : ``" v-on="on">event</v-icon>
                </template>
                <v-date-picker v-model="filters.payDate" multiple no-title>
                  <div class="flex-grow-1" />
                  <v-btn text color="primary" @click="menuPayDate = false">Отмена</v-btn>
                  <v-btn text color="primary" @click="$refs.menuPayDate.save(filters.payDate)">OK</v-btn>
                </v-date-picker>
              </v-menu>
              <v-icon v-if="filters.payDate !== null && filters.payDate.length > 0" @click="filters.payDate = []">clear</v-icon>
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'currency_code')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'pay_sum')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'account_pay_sum')" colspan="1" />
            <td v-if="computedHeaders.find(header => header.value === 'project_name')">
              <v-autocomplete
                v-model="filters.projectName"
                multiple
                :items="projectName"
                deletable-chips
                clearable
                chips
              />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'yellow')">
              <v-text-field v-model="filters.yellow" clearable type="text" />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'one_c_name')">
              <v-autocomplete
                v-model="filters.oneCName"
                multiple
                :items="oneCName"
                deletable-chips
                clearable
                chips
              />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'jira_name')">
              <v-autocomplete
                v-model="filters.jiraName"
                multiple
                :items="jiraName"
                clearable
              />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'fact_pay_date')">
              <v-menu ref="menuFactPayDate" v-model="menuFactPayDate" :close-on-content-click="false" transition="scale-transition">
                <template #activator="{ on }">
                  <v-icon :color="filters.factPayDate !== null && filters.factPayDate.length > 0 ? `green darken-2` : ``" v-on="on">event</v-icon>
                </template>
                <v-date-picker v-model="filters.factPayDate" multiple no-title>
                  <div class="flex-grow-1" />
                  <v-btn text color="primary" @click="menuFactPayDate = false">Отмена</v-btn>
                  <v-btn text color="primary" @click="$refs.menuFactPayDate.save(filters.factPayDate)">OK</v-btn>
                </v-date-picker>
              </v-menu>
              <v-icon v-if="filters.factPayDate !== null && filters.factPayDate.length > 0" @click="filters.factPayDate = []">clear</v-icon>
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'rs')">
              <v-autocomplete
                v-model="filters.rs"
                multiple
                :items="rs"
                deletable-chips
                clearable
                chips
              />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'buh')">
              <v-text-field v-model="filters.buh" clearable type="text" />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'action')" colspan="1" />
          </tr>

        </template>

        <template #[`item.buh`]="{ item }">
          <div v-if="item.buh">
            <a v-for="buh in item.buh.split(',')" :key="buh" :href="$options._SETTINGS.jira_url + buh" target="_blank">{{ buh }}<br></a>
          </div>
        </template>

        <template #[`item.pay_sum`]="{ item }">
          {{ item.pay_sum.toLocaleString('ru') }}
          <v-icon color="primary" x-small>mdi-currency-rub</v-icon>
        </template>
        <template #[`item.pay_date`]="{ item }">
          {{ item.pay_date ? new Date(item.pay_date).toLocaleDateString('ru') : null }}
        </template>
        <template #[`item.fact_pay_date`]="{ item }">
          {{ item.fact_pay_date ? new Date(item.fact_pay_date).toLocaleDateString('ru') : null }}
        </template>
        <template #[`item.action`]="{ item }">
          <v-icon small @click="edit(item)">edit</v-icon>
        </template>
      </v-data-table>
    </div>
  </v-container>

</template>

<script>
import EditDialog from './components/edit_pays_1c.vue'
import settings from '@/settings'

import moment from 'moment'
import { AclRule } from 'vue-acl'
import { getColumns } from '@/services/table-columns'
import { formatDate } from '../../../services/helpers'
import ProgressDialog from '@/components/shared/ProgressDialog.vue'
import _ from 'lodash'
import NamedFilters from '@/components/shared/NamedFilters.vue'
import TableColumns from '@/components/DataTable/columns.vue'

export default {

  _SETTINGS: settings,

  filters: {

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
    TableColumns,
    NamedFilters

  },

  props: {

    pays: {

      type: Array,
      required: true

    }

  },

  // ====================================== СОСТОЯНИЕ ============================================ //

  data() {
    return {

      filters: {
        client1C: '',
        pay1C: '',
        projectName: [],
        oneCName: [],
        payDate: [],
        json_fields: {},
        yellow: '',
        jiraName: [],
        buh: '',
        rs: [],
        factPayDate: []
      },

      multiSelects: {
        jiraName: [],
        projectName: [],
        oneCName: [],
        rs: []
      },

      Filters: [],
      editedItem: {},
      json_fields: {},

      show: false,
      loading: false,
      menu: false,
      dialog: false,
      menuPayDate: false,
      menuFactPayDate: false,
      localloading: false,
      menu_filter: false,
      checkBox: true,
      showForFilter: false,
      infoText: '',

      headers: [{
        text: 'id',
        value: 'id',
        selected: localStorage.paysColumn1c ? localStorage.paysColumn1c['id'] : false,
        visible: true
      },
      {
        text: 'Поставщик',
        value: 'client_1c',
        selected: localStorage.paysColumn1c ? localStorage.paysColumn1c['client_1c'] : false,
        visible: true,
        divider: true,
        filter: value => {
          if (!this.filters.client1C) return true
          if (!value) return false
          return value.toLowerCase().includes(this.filters.client1C.toLowerCase())
        }
      },
      {
        text: 'Документ',
        value: 'pay_1c',
        selected: localStorage.paysColumn1c ? localStorage.paysColumn1c['pay_1c'] : false,
        visible: true,
        divider: true,
        filter: value => {
          if (!this.filters.pay1C) return true
          if (!value) return false
          return value.toLowerCase().includes(this.filters.pay1C.toLowerCase())
        }
      },
      {
        text: 'Дата документа',
        value: 'pay_date',
        selected: localStorage.paysColumn1c ? localStorage.paysColumn1c['pay_date'] : false,
        visible: true,
        divider: true,
        width: 120,
        filter: value => {
          if (!this.filters.payDate || this.filters.payDate.length === 0) return true
          if (!value || isNaN(Date.parse(value))) return false
          const Arr = this.filters.payDate.map(item => moment(item).unix())
          const first = Math.min(...Arr)
          const last = Math.max(...Arr)
          return (moment(value).unix() >= first && moment(value).unix() <= last)
        }
      },
      {
        text: 'Валюта',
        value: 'currency_code',
        selected: localStorage.paysColumn1c ? localStorage.paysColumn1c['currency_code'] : false,
        visible: true,
        divider: true
      },
      {
        text: 'Сумма',
        value: 'pay_sum',
        selected: localStorage.paysColumn1c ? localStorage.paysColumn1c['pay_sum'] : false,
        visible: true,
        divider: true,
        width: 155
      },
      {
        text: 'Учётная валютная сумма',
        value: 'account_pay_sum',
        selected: localStorage.paysColumn1c ? localStorage.paysColumn1c['account_pay_sum'] : false,
        visible: true
      },
      {
        text: 'Проект 1С',
        value: 'project_name',
        selected: localStorage.paysColumn1c ? localStorage.paysColumn1c['project_name'] : false,
        visible: true,
        divider: true,
        filter: value => {
          if (this.filters.projectName.length === 0) return true
          if (!value) return false
          return value.includes(this.filters.projectName.find(item => item === value))
        }
      },
      {
        text: 'Жёлтый',
        value: 'yellow',
        selected: localStorage.paysColumn1c ? localStorage.paysColumn1c['yellow'] : false,
        visible: true,
        divider: true,
        filter: value => {
          if (!this.filters.yellow) return true
          if (!value) return false
          return value.toString().includes(this.filters.yellow.toString())
        }
      },
      {
        text: 'Статья 1C',
        value: 'one_c_name',
        divider: true,
        selected: localStorage.paysColumn1c ? localStorage.paysColumn1c['one_c_name'] : false,
        visible: true,
        filter: value => {
          if (this.filters.oneCName.length === 0) return true
          if (!value) return false
          return value.includes(this.filters.oneCName.find(item => item === value))
        }
      },
      {
        text: 'Статья расходов',
        value: 'jira_name',
        selected: localStorage.paysColumn1c ? localStorage.paysColumn1c['jira_name'] : false,
        visible: true,
        divider: true,
        filter: value => {
          if (this.filters.jiraName.length === 0) return true
          if (!value) return false
          return value.includes(this.filters.jiraName.find(item => item === value))
        }
      },
      {
        text: 'Фактическая дата',
        value: 'fact_pay_date',
        selected: localStorage.paysColumn1c ? localStorage.paysColumn1c['fact_pay_date'] : false,
        visible: true,
        divider: true,
        filter: value => {
          if (!this.filters.factPayDate || this.filters.factPayDate.length === 0) return true
          if (!value || isNaN(Date.parse(value))) return false
          const Arr = this.filters.factPayDate.map(item => moment(item).unix())
          const first = Math.min(...Arr)
          const last = Math.max(...Arr)
          return (moment(value).unix() >= first && moment(value).unix() <= last)
        }
      },
      {
        text: 'Расчётный счёт',
        value: 'rs',
        align: 'center',
        divider: true,
        selected: localStorage.paysColumn1c ? localStorage.paysColumn1c['rs'] : false,
        visible: true,
        filter: value => {
          if (this.filters.rs.length === 0) return true
          if (!value) return false
          return value.includes(this.filters.rs.find(item => item === value))
        }
      },
      {
        text: 'Связанные оплаты',
        value: 'buh',
        selected: localStorage.paysColumn1c ? localStorage.paysColumn1c['buh'] : false,
        visible: true,
        divider: true,
        filter: value => {
          if (!this.filters.buh) return true
          if (!value) return false
          return value.toLowerCase().toString().includes(this.filters.buh.toLowerCase().toString())
        }
      },
      {
        text: 'Действия',
        value: 'action',
        align: 'center',
        selected: localStorage.paysColumn1c ? localStorage.paysColumn1c['action'] : false,
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

    Buhs() {
      return this.$store.getters['budget/pays/jira'] || []
    },

    computedHeaders() {
      return this.headers.filter(header => header.selected)
    },
    jiraName() {
      return _.uniq(this.multiSelects.jiraName)
    },
    projectName() {
      return _.uniq(this.multiSelects.projectName)
    },
    oneCName() {
      return _.uniq(this.multiSelects.oneCName)
    },
    paySum() {
      const filteredSum = this.$refs.paysListTable.$children[0].filteredItems.map(arr => +arr.pay_sum)
      return Math.round(_.sum(filteredSum)).toLocaleString('ru')
    },

    rs() {
      return _.uniq(this.multiSelects.rs)
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
    this.loading = true
    await this.getColumns()
    this.loading = false
  },

  mounted() {
    const obj = {}
    for (const key in this.filters) {
      this.$watch(['filters', key].join('.'), val => {
        obj[key] = val || ''
        localStorage.setItem('filtersPays1c', JSON.stringify(obj))
      })
    }

    this.loadFiltersFromLocalStorage()
    window.addEventListener('resize', this.getWindowHeight)
  },

  updated() {
    this.transformData(this.pays, this.multiSelects)
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

    loadFiltersFromLocalStorage() {
      if (localStorage.filtersPays) {
        Object.keys(this.filters).forEach(key => {
          Object.entries(JSON.parse(localStorage.filtersPays)).forEach((item) => {
            if (JSON.parse(localStorage.getItem('filtersPays'))[item[0]] && JSON.parse(localStorage.getItem('filtersPays'))[item[0]] !== 'null' && item[0] === key) {
              this.filters[item[0]] = JSON.parse(localStorage.getItem('filtersPays'))[item[0]]
            }
          })
        })
      }
    },

    async getColumns() {
      await getColumns('paysColumn1c', this.headers)
        .then(data => console.log(data))
        .catch(error => {
          this.show = true
          this.infoText = error.message
        })
    },

    transformData(data, multiselects) {
      data.forEach(item => {
        if (item.pay_date) item.pay_date = formatDate(item.pay_date)
        if (item.fact_pay_date) item.fact_pay_date = formatDate(item.fact_pay_date)
        if (item.jira_name) multiselects.jiraName.push(item.jira_name)
        if (item.project_name) multiselects.projectName.push(item.project_name)
        if (item.one_c_name) multiselects.oneCName.push(item.one_c_name)
        if (item.rs) multiselects.rs.push(item.rs)
      })
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

    addUpdatedBuhs(data) {
      const Item = this.pays.find(pay => pay.pay_1c === this.editedItem.pay_1c)
      const ikeys = this.Buhs.filter(item => data.includes(item.id)).map(item => item.ikey).join(',')
      Item.buh = ikeys
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
