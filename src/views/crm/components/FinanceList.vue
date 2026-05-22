<template>
  <v-container v-loading="loading" :style="`max-width: 1300px; ${loading ? 'height: 80vh' : ''}`">

    <!-- Строка Меню -->

    <v-row justify="center" align="center" style="margin-bottom: 2px">
      <v-col cols="3">
        <el-card
          v-if="Cash.length > 0"
          :body-style="{ 'padding': '1px' }"
          class="text-center title font-weight-bold"
        >
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <svg-icon
                icon-class="checkout"
                class-name="card-panel-icon"
                v-bind="attrs"
                v-on="on"
                style="height: 30px"
              />
            </template>
            <span v-html="itemsDetails('cash', 5)"></span>
          </v-tooltip>
          <span class="ml-5" style="line-height: 1.5em">ТСД: {{ tsdCash | ruFormatCurrency }}</span>
        </el-card>
      </v-col>

      <v-col cols="3">
        <el-card
          v-if="Cash.length > 0"
          :body-style="{ 'padding': '1px' }"
          class="text-center title font-weight-bold"
        >

          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <svg-icon
                icon-class="checkout"
                class-name="card-panel-icon"
                v-bind="attrs"
                v-on="on"
                style="height: 30px"
              />
            </template>
            <span v-html="itemsDetails('cash', 6)"></span>
          </v-tooltip>

          <span class="ml-5" style="line-height: 1.5em">Атлас: {{ atlasCash | ruFormatCurrency }}</span>
        </el-card>
      </v-col>

      <v-col cols="2">
        <el-card :body-style="{ 'padding': '3px' }" style="display: flex; justify-content: center; align-items: center;">

          <el-popover trigger="click" width="760">
            <div style="height: 800px !important; overflow: auto; ">
              <table
                style="border-collapse:separate; border-spacing: 20px;"
              >
                <tr>
                  <th align="left" width="170">Касса</th>
                  <th align="left" width="130">План</th>
                  <th align="left" width="130">Факт</th>
                  <th align="left" width="50">Месяц</th>
                  <th align="left" width="80">Год</th>
                  <th align="left" width="130">Сальдо</th>
                </tr>
                <tr v-for="(item, i) in saldo" :key="i">
                  <td>{{ item.CASH }}</td>
                  <td>{{ item.PTotal?.toLocaleString("ru", { style: 'currency', currency: "RUB" }) }}</td>
                  <td>{{ item.FTotal?.toLocaleString("ru", { style: 'currency', currency: "RUB" }) }}</td>
                  <td>{{ item.PERIOD }}</td>
                  <td>{{ item.YEAR }}</td>
                  <td>{{ item.Saldo?.toLocaleString("ru", { style: 'currency', currency: "RUB" }) }}</td>
                </tr>
              </table>
            </div>

              <div slot="reference" style="cursor: pointer">
                <v-icon class="mb-1 mr-3">help</v-icon>
                <span style="font-size: 1.1rem;">Баланс</span>
              </div>
          </el-popover>

        </el-card>
      </v-col>

      <v-col :cols="!roles.find(item => item === 'limitedFinancier') ? 2 : 3">
        <el-select
          v-model="cash"
          placeholder="Фильтр по кассе"
          multiple
          clearable
          @change="getData"
          style="    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);"
        >
          <el-option
            v-for="cash in cashes"
            :key="cash.id"
            :label="cash.name"
            :value="cash.id"
          >
          </el-option>
        </el-select>
      </v-col>

      <v-spacer />

      <v-col v-if="$acl.check('SuperFinancier') || roles.find(item => item === 'limitedFinancier')" cols="1" class="text-right">
        <el-button type="success">
          <download-excel
            :fields="json_fields"
            :fetch="getExel"
            class="btn btn-default xlsx_btn"
            name="finance_list.xls"
          >
            <i class="el-icon-download" style="font-size: 14px" />
          </download-excel>
        </el-button>
      </v-col>

      <v-col v-if="!roles.find(item => item === 'limitedFinancier')" cols="1" class="text-right">
        <FinanceDialog
          v-if="$acl.check('SuperFinancier')"
          :users="users"
          :types="costItems"
          :detailed-cash="DetailedCash"
          class="text-right"
        />
      </v-col>
    </v-row>

    <!-- Таблица -->

    <v-data-table
      ref="finance"
      :headers="headers"
      calculate-widths
      :items="Salary"
      multi-sort
      :sort-by="['PERIOD', 'Debt']"
      :sort-desc="[true, true]"
      :items-per-page="15"
      :footer-props="{
        itemsPerPageAllText: 'Все',
        itemsPerPageOptions: [15, 100, 300, -1],
        showFirstLastPage: true,
        itemsPerPageText: 'Строк на странице'
      }"
      class="elevation-3"
      :style="`margin: 0 auto;`"
    >
      <template #[`body.prepend`]>
        <tr>
          <td v-for="header in headers" :key="header.text">
            <template v-if="header.value === 'USER'">
              <v-autocomplete
                v-if="header.value === 'USER'"
                v-model="filters.USER"
                :items="users"
                outlined
                dense
                hide-details
                clearable
                class="py-5"
              />
            </template>
            <template v-if="header.value === 'PERIOD'">
              <v-select
                v-if="header.value === 'PERIOD'"
                v-model="filters.PERIOD"
                :items="periods"
                outlined
                dense
                hide-details
                clearable
              />
            </template>
            <template v-if="header.value === 'YEAR'">
              <v-select
                v-if="header.value === 'YEAR'"
                v-model="filters.YEAR"
                :items="years"
                outlined
                dense
                hide-details
                clearable
              />
            </template>
            <template v-if="header.value === 'COST_ITEM'">
              <v-select
                v-if="header.value === 'COST_ITEM'"
                v-model="filters.COST_ITEM"
                :items="types"
                outlined
                dense
                hide-details
                clearable
              />
            </template>
            <template v-if="header.value === 'Total'">
              <v-text-field
                v-if="header.value === 'Total' && $refs.finance"
                v-model="sumTotal"
                label="Итого:"
                outlined
                dense
                hide-details
                readonly
              />
            </template>
            <template v-if="header.value === 'Final'">
              <v-select
                v-if="header.value === 'Final' && $refs.finance"
                v-model="final"
                :items="['Полный','Неполный']"
                hide-details
                clearable
                dense
                outlined
                class="mt-0"
              />
            </template>
            <template v-if="header.value === 'Paid'">
              <v-text-field
                v-if="header.value === 'Paid' && $refs.finance"
                v-model="sumPaid"
                label="Итого:"
                outlined
                dense
                hide-details
                readonly
              />
            </template>
            <template v-if="header.value === 'Debt' && $refs.finance">
              <v-text-field
                v-if="header.value === 'Debt'"
                v-model="sumDebt"
                label="Итого:"
                outlined
                dense
                hide-details
                readonly
              />
            </template>
          </td>
        </tr>
      </template>
      <template #[`item.USER`]="{ item }">
        <span :style="{ color: userName(item.USER).includes('проверьте пользователя') ? 'darkred' : null }">{{ userName(item.USER) }}</span>
      </template>
      <template #[`item.PERIOD`]="{ item }">
        {{ item.PERIOD | getMonthNameByNumber | uppercaseFirst }}
      </template>
      <template #[`item.Total`]="{ item }">
        <v-tooltip top>
          <template #activator="{ on, attrs }">
            <v-icon small class="mr-5" v-bind="attrs" v-on="on">help</v-icon>
          </template>
          <span v-html="itemsDetails('total', item)" />
        </v-tooltip>
        {{ item.Total | ruFormatCurrency }}
      </template>
      <template #[`item.Paid`]="{ item }">
        {{ item.Paid | ruFormatCurrency }}
      </template>
      <template #[`item.Debt`]="{ item }">
        {{ item.Debt | ruFormatCurrency }}
      </template>
      <template #[`item.Final`]="{ item }">
        <v-icon v-if="item.Final" small color="success">done</v-icon>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import { getMonthNameByNumber } from '@/filters/getMonthNameByNumber'
import { ruFormatCurrency } from '@/filters/ruFormatCurrency'
import { uppercaseFirst, translateFinanceMethod } from '@/filters/index.js'
import { getCostItems, getCashDetails, getSaldo } from '@/api/finance'

import FinanceDialog from './FinanceDialog'

export default {
  components: {
    FinanceDialog
  },
  filters: {
    getMonthNameByNumber,
    ruFormatCurrency,
    uppercaseFirst,
    translateFinanceMethod
  },
  data() {
    return {
      loading: false,
      items: [],
      costItems: [],
      saldo: [],
      DetailedCash: [],
      cash: null,
      final: false,
      cashes: [
        /* { id: 5, name: 'Касса ТСД' }, */
        { id: 6, name: 'Касса Атлас' },
        { id: 12, name: 'Атлас Про' },
        { id: 21, name: 'АйДи-Сток' },
        { id: -1, name: 'Нет кассы' }
        /* { id: 11, name: 'ТСД-Сервис' }, */
      ],
      json_fields: {},
      dataHeader: [
        {
          text: 'Пользователь',
          value: 'USER',
          align: 'left',
          sortable: true,
          width: 300,
          filter: (value) => {
            if (!this.filters.USER) return true
            return (this.userName(value) === this.filters.USER)
          }
        },
        {
          text: 'Период',
          value: 'PERIOD',
          align: 'left',
          width: 150,
          sortable: true,
          filter: (value) => {
            if (!this.filters.PERIOD) return true
            return (getMonthNameByNumber(value) === this.filters.PERIOD)
          }
        },
        {
          text: 'Год',
          value: 'YEAR',
          sortable: true,
          align: 'left',
          width: 50,
          filter: (value) => {
            if (!this.filters.YEAR) return true
            return (value === this.filters.YEAR)
          }
        },
        {
          text: 'Общий доход',
          value: 'Total',
          sortable: true,
          align: 'left',
          width: 200,
          filter: (value) => {
            if (!this.filters.Total) return true
            return (this.filters.Total += value)
          }
        },
        {
          text: '🏁',
          value: 'Final',
          sortable: true,
          align: 'left',
          filter: (value) => {
            if (!this.final) return true
            if (this.final === 'Полный') return !!value
            if (this.final === 'Неполный') return !value
          }
        },
        {
          text: 'Получено',
          value: 'Paid',
          sortable: true,
          align: 'left',
          filter: (value) => {
            if (!this.filters.Paid) return true
            return (this.filters.Paid += value)
          }
        },
        {
          text: 'Долг',
          value: 'Debt',
          sortable: true,
          align: 'left',
          filter: (value) => {
            if (!this.filters.Debt) return true
            return (this.filters.Debt += value)
          }
        }
      ],
      filters: {
      }
    }
  },

  computed: {
    headers() {
      return this.dataHeader
    },

    periods() {
      return this.Salary.map(item => item.PERIOD === null ? 'Нет информации' : getMonthNameByNumber(item.PERIOD))
    },

    years() {
      return this.Salary.map(item => item.YEAR === null ? 'Нет информации' : item.YEAR)
    },

    users() {
      return this.Salary.map(item => item.USER === null ? 'Нет информации' : this.userName(item.USER))
    },

    jiraUser() {
      return this.Jira_Users.find((user) => user.email === this.email)
    },

    email() {
      return this.$store.getters["auth/currentUser"]?.email || 'имя пользователя отсутствует'

    },

    user_name() {
      return this.jiraUser?.user_name || null
    },

    roles() {
      return this.$store.getters["auth/currentUser"].roles
    },

    tsdCash() {
      return this.Cash[0] && typeof (this.Cash[0].CASH) === 'number'
        ? 0 /* this.Cash[0].CASH */
        : 0
    },

    atlasCash() {
      return this.Cash[1] && typeof (this.Cash[1].CASH) === 'number'
        ? this.Cash[1].CASH
        : 0
    },

    sumTotal() {
      return ruFormatCurrency(this.$refs.finance.$children[0].filteredItems.reduce((acc, value) => {
        return acc + value.Total
      }, 0))
    },

    sumPaid() {
      return ruFormatCurrency(this.$refs.finance.$children[0].filteredItems.reduce((acc, value) => {
        return acc + value.Paid
      }, 0))
    },

    sumDebt() {
      return ruFormatCurrency(this.$refs.finance.$children[0].filteredItems.reduce((acc, value) => {
        return acc + value.Debt
      }, 0))
    },

    ...mapState({
      Jira_Users: (state) => state.jira_users.JIRA_USERS || [],
      Salary: (state) => state.finance.Salary || [],
      DetailedSalary: (state) => state.finance.DetailedSalary || [],
      Cash: (state) => state.finance.Cash || [],
      employeeSalaryDetail: (state) => state.finance.employeeSalaryDetail || []
    })
  },

  async mounted() {
    if (!this.items.length) {
      if (!this.Jira_Users.length) await this.getJitaUsers()
      if (!this.Cash.length) await this.getCash()
      if (!this.DetailedCash.length) await this.getCashDetails()
      if (!this.costItems.length) await this.getCostItems()
      if (!this.saldo.length) await this.getSaldo()
      if (!this.Salary.length) await this.getData()
      await this.getDetailedData()
    }
  },

  methods: {
    async getData() {
      this.loading = true;
      const hasAccess = this.roles.find(item => item === 'limitedFinancier' && (this.user_name !== 'olegbelov' && this.user_name !== 'efimchenkov'));
      const res = await this.$store.dispatch('finance/getSalary', { cash_id: this.cash, user_name: this.user_name, isLimited: hasAccess }, { root: true });
      this.loading = false;

      return res;

          
    },


    getDetailedData() {
      return this.$store.dispatch('finance/getDetailedSalary', { root: true })
    },


    getCash() {
      return this.$store.dispatch('finance/getCash', { root: true })
    },


    getJitaUsers() {
      return this.$store.dispatch('fetchJiraUsers')
    },


    getCostItems() {
      getCostItems()
        .then(res => {
          this.costItems = res
        })
    },


    getCashDetails() {
      getCashDetails()
        .then(res => {
          this.DetailedCash = res
        })
    },


    getSaldo() {
      getSaldo()
        .then(res => {
          this.saldo = res
        })
    },


    /* showSaldo() {
      const html = []
      html.push(`
        <table style="border-collapse:separate; border-spacing: 10px;">
          <tr><th align="left">Касса</th><th align="left">План</th><th align="left">Факт</th><th align="left">Месяц</th><th align="left">Год</th><th align="left">Сальдо</th></tr>
      `)
      this.saldo.forEach(item => {
        html.push(`<tr><td>${item.CASH}</td><td>${ruFormatCurrency(item.PTotal)}</td><td>${ruFormatCurrency(item.FTotal)}</td><td>${item.PERIOD}</td>
          <td>${item.YEAR}</td><td>${ruFormatCurrency(item.Saldo)}</td></tr>`)
      })

      html.push(`</table>`)

      return html.length > 0
        ? html.join('<tr>')
        : 'нет данных'
    },
 */

    filterDataByCash() {
      console.log(this.cash)
    },


    userName(name) {
      if (typeof (name) === 'number' || name === 'nouser') return
      const user = this.Jira_Users.find(user => user.user_name === name)
      return user
        ? user.display_name
        : name + ' (проверьте пользователя)'
    },


    itemsDetails(type, item) {
      const html = []
      if (type === 'total') {
        const details = this.DetailedSalary?.filter(obj => obj.USER === item.USER && obj.PERIOD === item.PERIOD && obj.YEAR === item.YEAR)
        html.push('<table style="border-collapse:separate; border-spacing: 3px;">')
        details.forEach(el => {
          html.push(`<tr style="${el.CASH === '-' ? 'color: yellow' : ''}"><td>${el.CASH === '-' ? el.CCASH : el.CASH}&nbsp;: </td><td>&nbsp;&nbsp;${el.Income}</td><td>&nbsp;
          ${ruFormatCurrency(el.IncomeTotal)}</td><td>&nbsp;&nbsp;(выплачено: ${ruFormatCurrency(el.CostTotal)})</td></tr>`)
        })
        html.push('</table>')
      }
      if (type === 'cash') {
        const details = this.DetailedCash?.filter(obj => obj.CASH_ID === item)
        html.push('<table style="border-collapse:separate; border-spacing: 3px;">')
        details.forEach(el => {
          html.push(('<tr><td>Долг: </td><td>&nbsp;&nbsp;</td><td>' + ruFormatCurrency(el.SUM) + '</td><td>&nbsp;&nbsp;</td><td>' + el.NAME + '</td></tr>'))
        })
        html.push('</table>')
      }
      return html.length > 0
        ? html.join('<tr>')
        : 'нет данных'
    },


    async getExel() {
      await this.dataHeader.forEach(item => {
        if (item.value === 'Detail') return
        this.json_fields[item.text] = item.value
      })
      return this.$refs.finance.$children[0].filteredItems
    }
  }
}
</script>

<style scoped>
  .card-panel-icon {
    font-size: 32px;
    color: rgb(211, 97, 4)
  }
</style>
