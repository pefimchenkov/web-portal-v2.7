<template>
  <v-container fluid class="mt-5">
    <v-data-table
      ref="finance"
      :headers="headers"
      :items="items"
      :mobile-breakpoint="900"
      multi-sort
      dense
      :sort-by="['PERIOD', 'DATE']"
      :sort-desc="[true, true]"
      :items-per-page="15"
      :footer-props="{
        itemsPerPageAllText: 'Все',
        itemsPerPageOptions: [50,250,500,-1],
        showFirstLastPage: true,
        itemsPerPageText: 'Строк на странице'
      }"
      class="elevation-1"
    >
      <template #[`body.prepend`]>
        <tr height="50px">
          <td v-for="header in headers" :key="header.text">
            <template v-if="header.value === 'PERIOD'">
              <v-select
                v-if="header.value === 'PERIOD'"
                v-model="filters.PERIOD"
                :items="periods"
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
                dense
                hide-details
                clearable
              />
            </template>
            <template v-if="header.value === 'SUM'">
              <v-text-field
                v-if="header.value === 'SUM' && $refs.finance"
                v-model="sumTotal"
                filled
                dense
                hide-details
                readonly
              />
            </template>
            <template v-if="header.value === 'COMMENT'">
              <v-text-field
                v-if="header.value === 'COMMENT'"
                v-model="filters.COMMENT"
                dense
                hide-details
              />
            </template>
          </td>
        </tr>
      </template>
      <template #[`item.PERIOD`]="{ item }">
        {{ item.PERIOD | getMonthNameByNumber | uppercaseFirst }}
      </template>
      <template #[`item.SUM`]="{ item }">
        + {{ item.SUM | ruFormatCurrency }}
      </template>
      <template #[`item.DATE`]="{ item }">
        {{ new Date(item.DATE).toLocaleDateString() }}
      </template>
      <template #[`item.Detail`]="{}">
        <v-icon small>mdi-dots-horizontal</v-icon>
      </template>
      <template #[`item.COST_ITEM`]="{ item }">
        {{ item.COST_ITEM | translateFinanceMethod }}
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import { getMonthNameByNumber } from '@/filters/getMonthNameByNumber'
import { ruFormatCurrency } from '@/filters/ruFormatCurrency'
import { uppercaseFirst, translateFinanceMethod } from '@/filters/index.js'

export default {
  filters: {
    getMonthNameByNumber,
    ruFormatCurrency,
    uppercaseFirst,
    translateFinanceMethod
  },
  data() {
    return {
      dataHeader: [
        {
          text: 'Период',
          value: 'PERIOD',
          align: 'left',
          sortable: true,
          filter: (value) => {
            if (!this.filters.PERIOD) return true
            return (getMonthNameByNumber(value) === this.filters.PERIOD)
          }
        },
        {
          text: 'Год',
          value: 'YEAR',
          sortable: false,
          align: 'left',
          filter: (value) => {
            if (!this.filters.YEAR) return true
            return (value === this.filters.YEAR)
          }
        },
        {
          text: 'Дата',
          value: 'DATE',
          align: 'left',
          sortable: true
        },
        {
          text: 'Сумма',
          value: 'SUM',
          sortable: false,
          align: 'left'
        },
        {
          text: 'Тип',
          value: 'COST_ITEM',
          sortable: false,
          align: 'left',
          filter: (value) => {
            if (!this.filters.COST_ITEM) return true
            return (translateFinanceMethod(value) === this.filters.COST_ITEM)
          }
        },
        {
          text: 'Коммент',
          value: 'COMMENT',
          sortable: false,
          align: 'left',
          width: 400,
          filter: (value) => {
            if (!this.filters.COMMENT) return true
            if (!value) return false
            return value.toLowerCase().includes(this.filters.COMMENT.toLowerCase())
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
    items() {
      return this.employeeSalaryDetail
    },
    periods() {
      return this.employeeSalaryDetail.map(item => item.PERIOD === null ? 'Нет информации' : getMonthNameByNumber(item.PERIOD))
    },
    years() {
      return this.employeeSalaryDetail.map(item => item.YEAR === null ? 'Нет информации' : item.YEAR)
    },
    types() {
      return this.employeeSalaryDetail.map(item => item.COST_ITEM === null ? 'Нет информации' : translateFinanceMethod(item.COST_ITEM))
    },
    ...mapState({
      Jira_Users: (state) => state.jira_users.JIRA_USERS,
      fbUser: (state) => state.fb.user,
      employeeSalary: (state) => state.finance.employeeSalary,
      employeeSalaryDetail: (state) => state.finance.employeeSalaryDetail
    }),
    sumTotal() {
      return this.$refs.finance.$children[0].filteredItems.reduce((acc, value) => {
        return acc + value.SUM
      }, 0).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })
    }
  },
  mounted() {
  }
}
</script>

<style scoped>
</style>
