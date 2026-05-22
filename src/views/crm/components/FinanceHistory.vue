<template>
  <v-container fluid>
    <ProgressDialog v-if="loading" :show="loading" info-text="Подождите, идёт удаление..." />
    <v-data-table
      ref="finance"
      :headers="headers"
      :items="items"
      :mobile-breakpoint="900"
      calculate-widths
      multi-sort
      dense
      :sort-by="['DATE']"
      :sort-desc="[true]"
      :items-per-page="15"
      :footer-props="{
        itemsPerPageAllText: 'Все',
        itemsPerPageOptions: [50,250,500,-1],
        showFirstLastPage: true,
        itemsPerPageText: 'Строк на странице'
      }"
      class="elevation-2"
    >
      <template #[`body.prepend`]>
        <tr>
          <td v-for="(header) of headers" :key="header.text">
            <template v-if="header.value === 'Detail'">
              <v-btn v-if="$acl.check('SuperFinancier')" color="success">
                <download-excel
                  :fields="json_fields"
                  :fetch="getExel"
                  class="btn btn-default xlsx_btn"
                  name="finance_history_list.xls"
                >
                  <v-icon>save_alt</v-icon> excel
                </download-excel>
              </v-btn>
            </template>
            <template v-if="header.value === 'ACTOR'">
              <v-text-field
                v-if="header.value === 'ACTOR'"
                v-model="filters.ACTOR"
                outlined
                clearable
                dense
                hide-details
                class="py-5"
              />
            </template>
            <template v-if="header.value === 'SUM'">
              <v-text-field
                v-if="header.value === 'SUM' && $refs.finance"
                v-model="sumTotal"
                label="Итого: (р.)"
                outlined
                dense
                hide-details
                readonly
              />
            </template>
            <template v-if="header.value === 'USER'">
              <v-text-field
                v-if="header.value === 'USER'"
                v-model="filters.USER"
                outlined
                clearable
                dense
                hide-details
              />
            </template>
            <template v-if="header.value === 'TYPE'">
              <v-select
                v-if="header.value === 'TYPE'"
                v-model="filters.type"
                :items="types"
                multiple
                outlined
                clearable
                dense
                hide-details
              />
            </template>
            <template v-if="header.value === 'PERIOD'">
              <v-select
                v-if="header.value === 'PERIOD'"
                v-model="filters.PERIOD"
                :items="periods"
                outlined
                clearable
                dense
                hide-details
              />
            </template>
            <template v-if="header.value === 'YEAR'">
              <v-select
                v-if="header.value === 'YEAR'"
                v-model="filters.YEAR"
                :items="years"
                outlined
                clearable
                dense
                hide-details
              />
            </template>
            <template v-if="header.value === 'COST_ITEM'">
              <v-select
                v-if="header.value === 'COST_ITEM'"
                v-model="filters.name"
                :items="names"
                outlined
                clearable
                dense
                hide-details
              />
            </template>
            <template v-if="header.value === 'CASH'">
              <v-select
                v-if="header.value === 'CASH'"
                v-model="filters.CASH"
                :items="cashes"
                outlined
                clearable
                dense
                hide-details
              />
            </template>
            <template v-if="header.value === 'COMMENT'">
              <v-text-field
                v-if="header.value === 'COMMENT'"
                v-model="filters.COMMENT"
                outlined
                clearable
                dense
                hide-details
              />
            </template>

            <DatePicker
              v-if="header.value === 'DATE'"
              :filter="filters.dates"
              @resetFilter="filters.dates = []"
              @updateFilter="updateDateFilter"
            />

            <!-- <v-menu
              v-if="header.value === 'DATE'"
              ref="menu"
              v-model="menu"
              :close-on-content-click="false"
              :return-value.sync="filters.dates"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template #activator="{ on, attrs }">
                <v-text-field
                  v-model="dateRangeText"
                  label="Выберите диапазон"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  clearable
                  style="font-size: 13px;"
                  v-on="on"
                />
              </template>
              <v-date-picker
                v-model="filters.dates"
                range
                no-title
                scrollable
                locale="ru-RU"
              >
                <v-spacer />
                <v-btn
                  text
                  color="primary"
                  @click="filters.dates = []"
                >
                  Сброс
                </v-btn>
                <v-btn
                  text
                  color="primary"
                  @click="$refs.menu[0].save(filters.dates)"
                >
                  OK
                </v-btn>
              </v-date-picker>
            </v-menu> -->
          </td>
        </tr>
      </template>
      <template #[`item.USER`]="{ item }">
        {{ getDisplayName(item.USER) }}
      </template>
      <template #[`item.ACTOR`]="{ item }">
        {{ getDisplayName(item.ACTOR) }}
      </template>
      <template #[`item.TYPE`]="{ item }">
        {{ getType(item.TYPE) }}
      </template>
      <template #[`item.SUM`]="{ item }">
        {{ item.SUM | ruFormatCurrency }}
      </template>
      <template #[`item.DATE`]="{ item }">
        {{ item.DATE ? new Date(item.DATE).toLocaleDateString('ru-RU', { hour: 'numeric', minute: 'numeric' }) : null }}
      </template>
      <template
        v-if="$acl.check('SuperFinancier')"
        #[`item.Detail`]="{ item }"
      >
        <v-icon
          v-if="item.PARENT_ID === null"
          small
          @click="deleteItem(item)"
        >
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import { getMonthNameByNumber } from '@/filters/getMonthNameByNumber'
import { ruFormatCurrency } from '@/filters/ruFormatCurrency'
import { uppercaseFirst, translateFinanceMethod } from '@/filters/index.js'

import { validNumber } from '@/utils/validate'
import ProgressDialog from '@/components/shared/ProgressDialog'
import DatePicker from '@/components/DatePicker/index.vue'

export default {

  components: {
    ProgressDialog,
    DatePicker
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
      menu: false,
      json_fields: {},
      filters: {
        dates: [],
        type: []
      },
      dataHeader: [
        {
          text: 'ID',
          value: 'ID',
          sortable: false,
          align: 'left'
        },
        {
          text: 'Связь',
          value: 'PARENT_ID',
          sortable: true,
          align: 'left'
        },
        {
          text: 'Исполнитель',
          value: 'ACTOR',
          sortable: false,
          align: 'left',
          filter: (value) => {
            if (!this.filters.ACTOR) return true
            if (!value) return false
            return this.getDisplayName(value).toLowerCase().includes(this.filters.ACTOR.toLowerCase())
          }
        },
        {
          text: 'Сумма',
          value: 'SUM',
          sortable: false,
          align: 'left',
          width: 200
        },
        {
          text: 'Дата',
          value: 'DATE',
          align: 'left',
          width: 250,
          sortable: true,
          filter: value => {
            if (this.filters.dates.length === 0) return true
            if (!value || isNaN(Date.parse(value))) return false
            const Arr = this.filters.dates.map(item => Math.round(new Date(item).getTime() / 1000.0))
            const first = Math.min(...Arr)
            const last = Math.max(...Arr)
            const date = new Date(value)

            const formatted = `${date.getFullYear()}-${(date.getMonth() + 1) < 10
              ? '0' + (date.getMonth() + 1)
              : (date.getMonth() + 1)}-${date.getDate() < 10
              ? '0' + date.getDate()
              : date.getDate()}`
            const newVal = Math.round(new Date(formatted).getTime() / 1000.0)

            return first === last || Arr.length < 2
              ? newVal === first || newVal === last
              : (newVal >= first && newVal <= last)
          }
        },
        {
          text: 'Период',
          value: 'PERIOD',
          align: 'left',
          sortable: true,
          filter: (value) => {
            if (!this.filters.PERIOD) return true
            if (this.filters.PERIOD === 'Нет информации') return (!value)
            return value === this.filters.PERIOD
          }
        },
        {
          text: 'Год',
          value: 'YEAR',
          align: 'left',
          sortable: true,
          filter: (value) => {
            if (!this.filters.YEAR) return true
            if (this.filters.YEAR === 'Нет информации') return (!value)
            return value === this.filters.YEAR
          }
        },
        {
          text: 'Сотрудник',
          value: 'USER',
          align: 'left',
          sortable: true,
          filter: (value) => {
            if (!this.filters.USER) return true
            if (!value) return false
            return this.getDisplayName(value).toLowerCase().includes(this.filters.USER.toLowerCase())
          }
        },
        {
          text: 'Тип',
          value: 'TYPE',
          sortable: false,
          align: 'left',
          filter: (value) => {
            if (this.filters.type.length === 0) return true
            return (this.filters.type.includes(this.getType(value)))
          }
        },
        {
          text: 'Статья',
          value: 'COST_ITEM',
          sortable: false,
          align: 'left',
          filter: (value) => {
            if (!this.filters.name) return true
            return (value === this.filters.name)
          }
        },
        {
          text: 'Касса дохода',
          value: 'CASH',
          sortable: false,
          align: 'left',
          filter: (value) => {
            if (!this.filters.CASH) return true
            if (this.filters.CASH === 'Нет информации') return (!value)
            return (value === this.filters.CASH)
          }
        },
        {
          text: 'Коммент',
          value: 'COMMENT',
          sortable: false,
          align: 'left',
          width: 300,
          filter: (value) => {
            if (!this.filters.COMMENT) return true
            if (!value) return false
            return value.toLowerCase().includes(this.filters.COMMENT.toLowerCase())
          }
        },
        {
          text: 'Действия',
          value: 'Detail',
          sortable: false,
          align: 'left'
        }
      ],
      summaRules: [
        v => !!v || 'обязательный параметр',
        v => validNumber(v) || 'допускаются только цифры'
      ]
    }
  },

  computed: {
    headers() {
      return this.dataHeader
    },

    items() {
      return this.History || []
    },

    sumTotal() {
      return this.$refs.finance.$children[0].filteredItems.reduce((acc, value) => {
        return acc + value.SUM
      }, 0).toLocaleString()
    },

    names() {
      return this.History.map(item => item.COST_ITEM === null ? 'Нет информации' : item.COST_ITEM)
    },

    periods() {
      return this.History.map(item => item.PERIOD === null ? 'Нет информации' : item.PERIOD)
    },

    years() {
      return this.History.map(item => item.YEAR === null ? 'Нет информации' : item.YEAR)
    },

    types() {
      return this.History.map(item => item.TYPE === null ? 'Нет информации' : this.getType(item.TYPE))
    },

    cashes() {
      return this.History.map(item => item.CASH === null ? 'Нет информации' : item.CASH)
    },

    currentUser() {
      return this.Jira_Users.find(item => item.email === this.$store.getters["auth/currentUser"]?.email)
    },

    ...mapState({
      Jira_Users: (state) => state.jira_users.JIRA_USERS,
      History: (state) => state.finance.History || []
    }),

    dateRangeText: {
      get() {
        if (this.filters.dates.length > 0) {
          const date0 = new Date(this.filters.dates[0]).toLocaleDateString('ru-RU')
          const date1 = this.filters.dates[1] ? new Date(this.filters.dates[1]).toLocaleDateString('ru-RU') : 'не выбрано'
          return date0 + ' ~ ' + date1
        } else return null
      },
      set() {
        this.filters.dates = []
      }
    }
  },

  methods: {
    getDisplayName(value) {
      if (!value) return
      const user = this.Jira_Users.find(user => user.user_name === value)
      return user
        ? user.display_name
        : 'нет пользователя'
    },
    getType(value) {
      switch (value) {
        case 1: return 'Доход'
        case 2: return 'Расход'
        case -3: return 'Кассовый расход'
        case 3: return 'Кассовый приход'
        case 4: return 'Квартальная премия'
        default: 'нет типа'
      }
    },
    // Пока не реализованно (из-за невозможности проверки задолженности)
    save(item) {
      this.loading = true
      this.$store.dispatch('finance/updateFinanceInfo', { item }, { root: true })
        .then(() => {
          this.$store.commit('setData', 'Значение установлено')
          this.loading = false
        })
    },
    async deleteItem(item) {
      if (item.CASH && (item.CASH.includes('Касса') && item.TYPE === 2)) await this.$alert(`УДАЛЕНИЕ ЭТОЙ ЗАПИСИ УВЕЛИЧИТ КАССУ НА ${item.SUM} ₽.`, 'ВНИМАНИЕ!', { confirmButtonText: 'Понятно', type: 'warning' })

      await this.$confirm('Вы уверены? Продолжаем?', 'ВНИМАНИЕ!', {
        confirmButtonText: 'Да',
        cancelButtonText: 'Нет',
        type: 'warning'
      })
        .then(() => {
          this.loading = true
          const owner = this.Jira_Users.find(user => user.user_name === item.USER)
          this.$store.dispatch('finance/deleteFinanceInfo', { id: item.ID, current_user: this.currentUser.display_name, owner: owner.email }, { root: true })
            .then(() => {
              this.$message({
                type: 'success',
                message: 'Запись успешно удалена'
              })
              this.loading = false
            })
        })
        .catch((err) => {
          this.loading = false
          console.log(err)
        })
    },
    async getExel() {
      await this.headers.forEach(item => {
        if (item.value === 'Detail') return
        this.json_fields[item.text] = item.value
      })
      return this.$refs.finance.$children[0].filteredItems
    },

    updateDateFilter(val) {
      this.filters.dates = [...val]
    }

  }
}
</script>

<style scoped>
</style>
