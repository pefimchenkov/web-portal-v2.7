<template>

  <el-timeline style="max-width: 60%; min-width: 300px !important; margin: 0 auto">
    <el-timeline-item
      v-for="(item,index) of premium"
      :key="index"
      :timestamp="`${getQuarter(item.PERIOD) + item.YEAR}`"
      placement="top"
    >
      <el-card>

        <h4 style="padding-bottom: 10px">
          Общая премия: {{ item.Total | ruFormatCurrency }}
          {{ item.manual ? ' (доход не предоставлен)' : '' }}
        </h4>

        <div><b>Получено:</b> {{ item.Paid | ruFormatCurrency }} ({{ item.Total ? Math.round((item.Paid / item.Total) * 100) : 0 }}%)</div>
        <div><b>Долг:</b> {{ (item.Debt) | ruFormatCurrency }}</div>
        <div><b>Финализация:</b> {{ item.Final ? 'да' : 'нет' }}</div>

      </el-card>

    </el-timeline-item>

  </el-timeline>

</template>

<script>

import { ruFormatCurrency } from '@/filters/ruFormatCurrency'

import { mapState } from 'vuex'

export default {

  filters: {

    ruFormatCurrency

  },

  data() {
    return {

    }
  },

  computed: {

    ...mapState({
      Jira_Users: (state) => state.jira_users.JIRA_USERS,
      employeeSalary: (state) => state.finance.employeeSalary
    }),

    email() {
      return this.$store.getters.currentUser
        ? this.$store.getters.currentUser.email
        : 'имя пользователя отсутствует'
    },

    jiraUser() {
      return this.Jira_Users.find((user) => user.email === this.email)
    },

    premium() {
      return this.employeeSalary.filter(item => item.Total - item.Paid !== 0 && Math.sign(item.PERIOD) === -1)
    }

  },

  async created() {
    await this.$store.dispatch('fetchJiraUsers')
    await this.$store.dispatch('finance/getEmployeeSalary', { username: this.jiraUser.user_name }, { root: true })
  },

  methods: {

    getQuarter(value) {
      switch (value) {
        case -4: return '4-ый квартал '
        case -3: return '3-ий квартал '
        case -2: return '2-ой квартал '
        case -1: return '1-ый квартал '
      }
    }

  }

}
</script>
