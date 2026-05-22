<template>

  <div>
    <el-dialog :visible.sync="dialog" center :close-on-click-modal="false" top="25vh" :title="`Детализация`">
      <Detail :key="data ? data.PERIOD : null" :payload="data" />
    </el-dialog>

    <el-tabs v-model="active" type="border-card">
      <el-tab-pane
        v-for="(line,i) of listOfYears"
        :key="i"
        :label="line"
        :name="line"
      >

        <el-timeline style="max-width: 60%; min-width: 300px !important; margin: 0 auto">
          <el-timeline-item
            v-for="(item,index) of salaryByYear[line].sort((a,b) => (b?.PERIOD - a?.PERIOD))"
            :key="index"
            :timestamp="`${xferMonth(item?.PERIOD)}`"
            placement="top"
          >
            <el-card>
              <el-row type="flex" justify="center" align="middle">
                <el-col :span="24">

                  <h4 style="padding-bottom: 10px">
                    <v-tooltip top>
                      <template #activator="{ on, attrs }">
                        <i class="el-icon-info mr-1" style="font-size: 16px" v-bind="attrs" v-on="on" />
                      </template>
                      <span v-html="totalDetails(item)" />
                    </v-tooltip>
                    Общий доход: {{ item.Total | ruFormatCurrency }}
                    {{ item.manual ? ' (доход не предоставлен)' : '' }}
                  </h4>

                  <div><b>Получено:</b> {{ item.Paid | ruFormatCurrency }} ({{ item.Total ? Math.round((item.Paid / item.Total) * 100) : 0 }}%)</div>
                  <div><b>Долг:</b> {{ (item.Total - item.Paid) | ruFormatCurrency }}</div>
                  <div><b>Финализация:</b> {{ item.Final ? 'да' : 'нет' }}</div>
                </el-col>
                <el-row>
                  <el-col :span="24" class="text-center">
                    <el-button size="small" type="info" plain @click="getDetail(item)">Подробнее</el-button>
                  </el-col>
                </el-row>
              </el-row>

            </el-card>

          </el-timeline-item>
        </el-timeline>
      </el-tab-pane>

      <el-tab-pane v-if="premium.length > 0" label="Квартальная премия" name="premium"><Premium /></el-tab-pane>

      <el-tab-pane label="История" name="history"><History /></el-tab-pane>

    </el-tabs>
  </div>
</template>

<script>

import History from '../finance/history'
import Detail from '../finance/detail'
import Premium from '../finance/premium.vue'

import { ruFormatCurrency } from '@/filters/ruFormatCurrency'

import { mapState } from 'vuex'

export default {

  filters: {
    ruFormatCurrency
  },

  components: {
    History,
    Detail,
    Premium
  },

  data() {
    return {

      active: '',
      dialog: false,
      data: null

    }
  },

  computed: {

    ...mapState({
      Jira_Users: (state) => state.jira_users.JIRA_USERS,
      employeeSalary: (state) => state.finance.employeeSalary,
      incomeDetail: (state) => state.finance.IncomeDetail,
      IncomeCashDetail: (state) => state.finance.IncomeCashDetail
    }),

    email() {
      return this.$store.getters["auth/currentUser"]?.email || 'имя пользователя отсутствует'
    },

    jiraUser() {
      return this.Jira_Users.find((user) => user.email === this.email)
    },

    listOfYears() {
      return Object.keys(this.salaryByYear).sort((a, b) => (+b - +a))
    },

    salary() {
      return this.employeeSalary.filter(item => ((item.Total - item.Paid) !== 0 && (Math.sign(item?.PERIOD) !== -1))
        || (!item.Final && (item.YEAR >= 2021
        || (item?.PERIOD === 12 && item.YEAR === 2020)) && (Math.sign(item?.PERIOD) !== -1)))
    },

    salaryByYear() {
      return this.salary.reduce((m, v) => (m[v.YEAR] = m[v.YEAR] || []).push(v) && m, {})
    },

    premium() {
      return this.employeeSalary.filter(item => item.Total - item.Paid !== 0 && Math.sign(item?.PERIOD) === -1)
    }

  },

  watch: {

    listOfYears: {

      immediate: true,
      handler(val) {
        this.active = Math.max(...val).toString()
      }

    }

  },

  async created() {
    await this.$store.dispatch('fetchJiraUsers')
    await this.$store.dispatch('finance/getEmployeeSalary', { username: this.jiraUser?.user_name }, { root: true })
    await this.$store.dispatch('finance/getEmployeeSalaryDetail', { username: this.jiraUser?.user_name }, { root: true })
    await this.$store.dispatch('finance/getIncomeDetail', { username: this.jiraUser?.user_name }, { root: true })
    await this.$store.dispatch('finance/getIncomeCashDetail', { username: this.jiraUser?.user_name }, { root: true })

    this.addPrevMonthToSalary()
  },

  methods: {

    getDetail(item) {
      this.dialog = true
      this.data = item
    },

    addPrevMonthToSalary() {
      const filtered = [this.employeeSalary[this.employeeSalary.length - 1], this.employeeSalary[this.employeeSalary.length - 2]]
      let year = new Date().getFullYear()

      let month = (filtered[0]?.PERIOD >= new Date().getMonth() + 1) && filtered[0].YEAR >= year
        ? filtered[0].PERIOD
        : new Date().getMonth() + 1

      for (let i = 0; i <= 1; i++) {
        if (month === 1) {
          month = 13
          year--
        }

        if (!(filtered[0]?.PERIOD === (month - 1) && filtered[0].YEAR === year) && !(filtered[1]?.PERIOD === (month - 1) && filtered[1].YEAR === year)) {
          this.salary.push({ PERIOD: month - 1, YEAR: year, Total: 0.001, Paid: 0, manual: true })
        }
        month--
      }
    },

    totalDetails(item) {
      const details = this.incomeDetail.filter(obj => obj?.PERIOD === item?.PERIOD && obj.YEAR === item.YEAR)
      const html = []

      details.forEach(el => {
        html.push(el.Income + ' - ' + ruFormatCurrency(el.IncomeTotal) + ' (выплачено: ' + (el.CostTotal === null ? 0 : ruFormatCurrency(el.CostTotal)) + ')')
      })

      return html.length > 0
        ? html.join(' ,<br>')
        : 'нет данных'
    },

    xferMonth(val) {
      switch (val) {
        case 1: return 'Январь'
        case 2: return 'Февраль'
        case 3: return 'Март'
        case 4: return 'Апрель'
        case 5: return 'Май'
        case 6: return 'Июнь'
        case 7: return 'Июль'
        case 8: return 'Август'
        case 9: return 'Сентябрь'
        case 10: return 'Октябрь'
        case 11: return 'Ноябрь'
        case 12: return 'Декабрь'
      }
    }

  }

}
</script>
