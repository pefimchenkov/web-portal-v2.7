<!-- eslint-disable vue/valid-v-slot -->
<template>
  <div>
    <v-app-bar dense fixed>
      <span class="font-weight-bold mr-4">Сотрудник: </span><v-chip color="orange" dark label>
        {{
          ' ' + email ? jira_users.find(user => user.email === email).display_name : ''
        }}
      </v-chip>
      <v-spacer /> <v-chip color="orange" dark label>{{ name }}</v-chip>
      <v-spacer /> <v-chip color="orange" dark label>Квартал № {{ quarter }}</v-chip>
      <v-spacer />

      <v-btn
        v-if="name === 'Доходность'"
        color="primary"
        @click="$emit('dialogToggle', { toggle: false })"
      >
        Сервисные контракты
      </v-btn>
      <v-spacer />
      <v-btn color="primary">
        <download-excel
          :fields="getJsonFields"
          :data="getJsonData"
          class="btn btn-default xlsx_btn"
          name="bonus.xls"
        >Excell
        </download-excel>
      </v-btn>
    </v-app-bar>
    <v-data-table
      :headers="computedHeaders"
      :items="BonusPerManager"
      fixed-header
      calculate-widths
      :items-per-page="15"
      item-key="id"
      sort-by="id"
      sort-desc
      dense
      class="pa-4"
      :footer-props="{
        itemsPerPageAllText: 'Все',
        itemsPerPageText: 'Строк на странице:',
        itemsPerPageOptions: [15, 50, 150, -1],
        showFirstLastPage: true,
        firstIcon: 'mdi-arrow-collapse-left',
        lastIcon: 'mdi-arrow-collapse-right',
        prevIcon: 'mdi-minus',
        nextIcon: 'mdi-plus'
      }"
    >
      <template #item.doc_num="{item}">
        <div :style="`${item.doc_num === 'Нет реализации' ? 'background-color: red; color: #fff; padding: 5px; font-weight: bold' : null}`">
          {{ item.doc_num }}
        </div>
      </template>
      <template #item.doc_date="{item}">
        {{ new Date(item.doc_date).toLocaleDateString('ru') }}
      </template>
      <template #item.Boss="{ item }">
        {{ role.split('&').includes('serviceManager') ? UserName(item.BossSM) : UserName(item.Boss) }}
      </template>
      <template #item.HeadManager="{ item }">
        {{ UserName(item.HeadManager) }} {{ +item.LSM_Mark ? ' *' : null }}
      </template>
      <template #item.Manager="{ item }">
        {{ UserName(item.Manager) }} {{ +item.LV_Mark ? ' *' : null }}
      </template>
      <template #item.LocalManager="{ item }">
        {{ UserName(item.LocalManager) }} {{ +item.LM_Mark ? ' *' : null }} {{ +item.LB_Mark ? ' *' : null }}
      </template>
      <template #item.lmpX="{ item }">
        {{ item.lmpX.toFixed(2) }}
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  props: {
    name: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    quarter: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      headers: [{
        text: 'Счёт 1С',
        value: 'bill_1c',
        selected: true,
        divider: true
      },
      {
        text: 'Проект 1С',
        value: 'project_1c',
        selected: true,
        divider: true
      },
      {
        text: 'Номер отгрузки',
        value: 'doc_num',
        selected: true,
        divider: true
      },
      {
        text: 'Дата отгрузки',
        value: 'doc_date',
        selected: true,
        divider: true,
        filter: (val) => {
          if (!val) return false
          return this.getMonthPerQuarter.includes(new Date(val).getMonth() + 1)
        }
      },
      {
        text: 'Арт клиента счёт',
        value: 'client_1c',
        selected: true,
        divider: true
      },
      {
        text: 'Клиент счёт',
        value: 'client_name',
        selected: true,
        divider: true
      },
      {
        text: 'Сумма отгрузки',
        value: 'doc_sum',
        selected: true,
        divider: true
      },
      {
        text: this.name === 'Доходность' ? 'Сервис менеджер' : 'Куратор',
        value: 'HeadManager',
        selected: true,
        divider: true
      },
      {
        text: this.name === 'Доходность' ? 'Ведущий инженер' : 'Менеджер',
        value: 'Manager',
        selected: true,
        divider: true
      },
      {
        text: this.name === 'Доходность' ? 'Отв. бухгалтер' : 'Отв. менеджер',
        value: 'LocalManager',
        selected: true,
        divider: true
      },
      {
        text: 'Руководитель отдела',
        value: 'Boss',
        selected: true,
        divider: true
      },
      {
        text: 'Задача',
        value: 'Key',
        selected: true,
        divider: true
      },
      {
        text: 'Статус',
        value: 'Status',
        selected: true,
        divider: true
      },
      {
        text: 'Клиент задача',
        value: 'Client',
        selected: true,
        divider: true
      },
      {
        text: this.name === 'Доходность' ? '% Сервис менеджера' : '% Куратора',
        value: 'hmp',
        selected: true,
        divider: true
      },
      {
        text: this.name === 'Доходность' ? '% Вед. инженера' : '% Менеджера',
        value: 'mp',
        selected: true,
        divider: true
      },
      {
        text: this.name === 'Доходность' ? '% Отв. бух.' : '% ОМ',
        value: 'lmp',
        selected: true,
        divider: true
      },
      {
        text: '% Отдела',
        value: 'bp',
        selected: true,
        divider: true
      },
      {
        text: this.name === 'Доходность' ? '% теория' : '% ОМ факт',
        value: 'lmpX',
        selected: true,
        divider: true
      },
      {
        text: 'Тип',
        value: 'Type',
        selected: true,
        divider: true
      }]
    }
  },

  computed: {
    ...mapState({
      BonusSale: state => state.user.BonusSale,
      BonusProfit: state => state.user.BonusProfit
    }),
    ...mapGetters(['auth/currentUser', 'jira_users']),
    computedHeaders() {
      return this.headers.filter(header => header.selected)
    },
    getJsonFields() {
      const obj = {}
      this.headers.forEach(item => {
        obj[item.text] = item.value
      })
      return obj
    },
    getJsonData() {
      return this.BonusPerManager.filter(item => this.getMonthPerQuarter.includes(new Date(item.doc_date).getMonth() + 1))
    },
    // eslint-disable-next-line vue/return-in-computed-property
    BonusPerManager() {
      if (this.name === 'Продажи') {
        if (this.email === 'nouser@tsd-group.ru') return this.BonusSale.filter(item => !item.HeadManager && !item.Manager && !item.LocalManager)
        return this.BonusSale.filter(item => item.HeadManager === this.email || item.Manager === this.email || item.LocalManager === this.email || item.Boss === this.email)
      }
      if (this.name === 'Доходность') {
        if (this.email === 'nouser@tsd-group.ru') return this.BonusProfit.filter(item => !item.HeadManager && !item.Manager && !item.LocalManager)
        return this.BonusProfit.filter(item => item.HeadManager === this.email || item.Manager === this.email || item.LocalManager === this.email || item.Boss === this.email)
      }
    },
    // eslint-disable-next-line vue/return-in-computed-property
    getMonthPerQuarter() {
      if (this.quarter === 1) return [1, 2, 3]
      if (this.quarter === 2) return [4, 5, 6]
      if (this.quarter === 3) return [7, 8, 9]
      if (this.quarter === 4) return [10, 11, 12]
    }
  },
  created() {
    this.$store.dispatch('fetchJiraUsers')
  },

  methods: {
    UserName(email) {
      const Item = this.jira_users.find(item => item.email === email)
      if (Item) return Item.display_name
      else return null
    }
  }
}
</script>

<style lang="scss" scoped></style>
