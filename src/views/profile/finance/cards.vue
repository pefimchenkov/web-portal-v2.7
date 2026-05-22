<template>
  <div>
    <v-dialog v-model="dialog" width="700">

      <Detail :key="data ? data.PERIOD : null" :payload="data" />

    </v-dialog>

    <v-row v-if="jiraUser" justify="center">
      <v-col
        v-for="item in salary"
        :key="item.PERIOD + '-' + item.YEAR"
        sm="12"
        md="12"
        lg="6"
        xl="6"
        class="pa-10"
      >

        <!-- Основная карточка -->

        <v-card max-width="600" outlined class="elevation-1" style="margin: 0 auto">
          <v-card-text>
            <div class="card-panel-icon-wrapper">
              <v-icon class="card-panel-icon-salary">mdi-cash-multiple</v-icon>
            </div>
            <div
              class="overline ml-3"
              style="font-size: 0.9em !important; font-weight: 800; color: #f79d36"
            >
              {{ item.PERIOD | getMonthNameByNumber }} {{ item.YEAR }} {{ item.manual ? '(не предоставлен доход)' : '' }}
            </div>

            <v-list-item three-line>
              <v-list-item-content>
                <v-list-item-subtitle
                  class="title my-5"
                  style="font-weight: bold"
                >
                  <v-tooltip top>
                    <template #activator="{ on, attrs }">
                      <v-icon class="mr-2 mb-1" v-bind="attrs" v-on="on">help</v-icon>
                    </template>
                    <span v-html="totalDetails(item)" />
                  </v-tooltip>
                  Общий доход: {{ item.Total | ruFormatCurrency }}</v-list-item-subtitle>
                <v-list-item-subtitle
                  class="my-2"
                  style="font-weight: bold"
                >Получено: {{ item.Paid | ruFormatCurrency }}<span style="color:#f79d36; margin-left:10px">({{ Math.round((item.Paid / item.Total) * 100) }}%)</span></v-list-item-subtitle>
                <v-list-item-subtitle
                  class="my-2"
                  style="font-weight: bold"
                >Долг: {{ item.Total - item.Paid | ruFormatCurrency }}</v-list-item-subtitle>
                <v-divider />
                <v-list-item-subtitle class="mt-3 text--disabled">
                  <span class="mr-5">Нажмите для детализации</span>
                  <v-btn class="text-end" small text outlined @click="getDetail(item)">Подробнее</v-btn>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col
        v-for="item in premium"
        :key="item.PERIOD"
        sm="12"
        md="12"
        lg="6"
        xl="6"
        class="pa-10"
      >

        <!-- Премиальная карточка -->

        <v-card max-width="600" outlined class="elevation-1" style="margin: 0 auto">
          <v-card-text>
            <div class="card-panel-icon-wrapper">
              <v-icon class="card-panel-icon-premium">mdi-medal</v-icon>
            </div>
            <div
              class="overline ml-3"
              style="font-size: 0.9em !important; font-weight: 800; color: #f79d36"
            >
              {{ Math.abs(item.PERIOD) + '-й квартал' }}
              {{ item.YEAR }}
            </div>
            <v-list-item three-line>
              <v-list-item-content>
                <v-list-item-subtitle
                  class="title my-5"
                  style="font-weight: bold"
                >Общая премия: {{ item.Total | ruFormatCurrency }}
                </v-list-item-subtitle>
                <v-list-item-subtitle
                  class="my-2"
                  style="font-weight: bold"
                >Получено: {{ item.Paid | ruFormatCurrency }}<span style="color:#f79d36; margin-left:10px">({{ Math.round((item.Paid / item.Total) * 100) }}%)</span>
                </v-list-item-subtitle>
                <v-list-item-subtitle
                  class="my-2"
                  style="font-weight: bold"
                >Долг: {{ item.Total - item.Paid | ruFormatCurrency }}
                </v-list-item-subtitle>
                <v-divider />
                <v-list-item-subtitle class="mt-3 text--disabled">
                  <span class="mr-5">Нажмите для детализации</span>
                  <v-btn class="text-end" small text outlined @click="getDetail(item)">Подробнее</v-btn>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col
        v-if="IncomeCashDetail.length > 0"
        sm="12"
        md="12"
        lg="6"
        xl="6"
        class="pa-10"
      >

        <!-- Долг кассы перед юзером -->

        <v-card max-width="600" outlined class="elevation-1" style="margin: 0 auto">
          <v-card-text>
            <div class="card-panel-icon-wrapper">
              <v-icon class="card-panel-icon-cashdebt">mdi-credit-card-refund</v-icon>
            </div>
            <div
              class="overline ml-3 mb-2"
              style="font-size: 0.9em !important; font-weight: 800; color: #f79d36"
            >
              {{ 'Долг за весь период' }}
            </div>
            <v-list-item
              class="title"
            >
              <v-list-item-content>
                <v-list-item-subtitle
                  v-for="item in IncomeCashDetail"
                  :key="item.CASH_ID"
                  class="my-2 font-weight-medium"
                  style="font-size: 20px;color: rgba(0,0,0,.8)"
                >
                  {{ item.CASH }} - {{ item.SUM | ruFormatCurrency }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-else justify="center" align="center" style="margin-top: 20px">
      <v-col cols="6" offset="" class="text-center">
        <v-alert
          outlined
          type="warning"
          prominent
          border="left"
        >
          Внимание, похоже, Вы используете не ваш основной электронный адрес. Обратитесь к вашему руководителю.
        </v-alert>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getMonthNameByNumber } from '@/filters/getMonthNameByNumber'
import { ruFormatCurrency } from '@/filters/ruFormatCurrency'
import Detail from './detail.vue'

export default {
  components: {
    Detail
  },
  filters: {
    getMonthNameByNumber,
    ruFormatCurrency
  },

  data() {
    return {
      loader: false,
      dialog: false,
      data: null
    }
  },

  computed: {
    userRole() {
      return this.$store.getters["auth/currentUser"]?.roles
    },

    salary() {
      return this.employeeSalary.filter(item => item.Total - item.Paid !== 0 && Math.sign(item.PERIOD) !== -1 || (!item.Final && (item.YEAR >= 2021 || item.PERIOD === 12 && item.YEAR === 2020)))
    },
    premium() {
      return this.employeeSalary.filter(item => item.Total - item.Paid !== 0 && Math.sign(item.PERIOD) === -1)
    },

    ...mapState({
      Jira_Users: (state) => state.jira_users.JIRA_USERS,
      fbUser: (state) => state.fb.user,
      employeeSalary: (state) => state.finance.employeeSalary,
      incomeDetail: (state) => state.finance.IncomeDetail,
      IncomeCashDetail: (state) => state.finance.IncomeCashDetail
    }),

    email() {
      return  this.$store.getters["auth/currentUser"]?.email || 'имя пользователя отсутствует'
    },

    jiraUser() {
      return this.Jira_Users.find((user) => user.email === this.email)
    }
  },

  async created() {
    await this.$store.dispatch('fetchJiraUsers')
    if (this.jiraUser) {
      await this.getEmployeeSalary()
      await this.getEmployeeSalaryDetail()
      await this.getIncomeDetail()
      await this.getIncomeCashDetail()
    }
  },
  methods: {
    getEmployeeSalary() {
      this.loader = true
      this.$store
        .dispatch(
          'finance/getEmployeeSalary',
          { username: this.jiraUser.user_name },
          { root: true }
        )
        .then(() => {
          this.addPrevMonthToSalary()
          this.loader = false
        })
    },
    getEmployeeSalaryDetail() {
      this.$store
        .dispatch(
          'finance/getEmployeeSalaryDetail',
          { username: this.jiraUser.user_name },
          { root: true }
        )
    },
    getIncomeDetail() {
      this.$store
        .dispatch(
          'finance/getIncomeDetail',
          { username: this.jiraUser.user_name },
          { root: true }
        )
    },
    getIncomeCashDetail() {
      this.$store
        .dispatch(
          'finance/getIncomeCashDetail',
          { username: this.jiraUser.user_name },
          { root: true }
        )
    },
    getDetail(item) {
      this.dialog = true
      this.data = item
    },
    totalDetails(item) {
      const details = this.incomeDetail.filter(obj => obj.PERIOD === item.PERIOD && obj.YEAR === item.YEAR)
      const html = []

      details.forEach(el => {
        html.push(el.Income + ' - ' + ruFormatCurrency(el.IncomeTotal) + ' (выплачено: ' + (el.CostTotal === null ? 0 : ruFormatCurrency(el.CostTotal)) + ')')
      })

      return html.length > 0
        ? html.join(' ,<br>')
        : 'нет данных'
    },
    addPrevMonthToSalary() {
      const filtered = [this.employeeSalary[this.employeeSalary.length - 1], this.employeeSalary[this.employeeSalary.length - 2]]
      let year = new Date().getFullYear()

      let month = (filtered[0].PERIOD >= new Date().getMonth() + 1) && filtered[0].YEAR >= year
        ? filtered[0].PERIOD
        : new Date().getMonth() + 1

      console.log('текущий месяц:', month)

      for (let i = 0; i <= 1; i++) {
        if (month === 1) {
          month = 13
          year--
        }

        if (!(filtered[0].PERIOD === (month - 1) && filtered[0].YEAR === year) && !(filtered[1].PERIOD === (month - 1) && filtered[1].YEAR === year)) {
          this.salary.push({ PERIOD: month - 1, YEAR: year, Total: 0.001, Paid: 0, manual: true })
        }
        month--
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.card-panel-icon-wrapper {
  position: relative;
  left: -30px;
  top: -30px;
  transition: all 0.38s ease-out;
  border-radius: 6px;
}

.card-panel-icon-salary {
  float: left;
  border-radius: 6px;
  font-size: 42px;
  color: rgb(255, 255, 255);
  background: #f79d36;
  padding: 10px;
}
.card-panel-icon-premium {
  float: left;
  border-radius: 6px;
  font-size: 42px;
  color: rgb(255, 255, 255);
  background: #54d89a;
  padding: 10px;
}
.card-panel-icon-cashdebt {
  float: left;
  border-radius: 6px;
  font-size: 42px;
  color: rgb(255, 255, 255);
  background: #54b3d8;
  padding: 10px;
}
</style>
