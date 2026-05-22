<template>
  <div>
    <v-app-bar dense fixed>
      <span class="font-weight-bold mr-4">Сотрудник: </span><v-chip color="orange" dark label>
        {{
          ' ' + email ? jira_users.find(user => user.email === email).display_name : ''
        }}
      </v-chip>
      <v-spacer /> <v-chip color="orange" dark label>{{ name }}</v-chip>
      <v-spacer /> <v-chip color="orange" dark label>
        {{ typedate === 'quarter' ? `Квартал № ` + quarter : `Месяц № ` + month }}
      </v-chip>
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
        {{ role.split('&').includes('serviceManager') ? UserName(item.SMBoss) : UserName(item.VIBoss) }}
      </template>
      <template #item.bp="{ item }">
        {{ role.split('&').includes('serviceManager') ? item.bsmp : item.bvip }}
      </template>
      <template #item.SM="{ item }">
        {{ UserName(item.SM) }} {{ +item.LSM_Mark ? ' *' : null }}
      </template>
      <template #item.VI="{ item }">
        {{ UserName(item.VI) }} {{ +item.LV_Mark ? ' *' : null }}
      </template>
      <template #item.Buh="{ item }">
        {{ UserName(item.Buh) }} {{ +item.LM_Mark ? ' *' : null }} {{ +item.LB_Mark ? ' *' : null }}
      </template>
      <template #item.pX="{ item }">
        {{ item.pX.toFixed(2) }}
      </template>
      <template #item.doc_sum="{ item }">
        <span
          :class="item.doc_sum === item.Price
            ? 'grn text-center'
            : item.doc_sum < item.Price ? 'rd_lt text-center' : 'rd_gt text-center'"
          style="margin: auto 0"
        >{{ item.doc_sum }}
        </span>
      </template>
      <template #item.Price="{ item }">
        <span
          :class="item.doc_sum === item.Price
            ? 'grn text-center'
            : item.doc_sum > item.Price ? 'rd_lt text-center' : 'rd_gt text-center'"
          style="margin: auto 0;"
        >{{ item.Price }}</span>
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
    },
    month: {
      type: Number,
      required: true
    },
    typedate: {
      type: String,
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
          if (this.typedate === 'quarter') return this.getMonthPerQuarter.includes(new Date(val).getMonth() + 1)
          if (this.typedate === 'month') return (new Date(val).getMonth() + 1) === this.month
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
        text: 'Сумма ремонта',
        value: 'Price',
        selected: true,
        divider: true
      },
      {
        text: 'Сервис менеджер',
        value: 'SM',
        selected: true,
        divider: true
      },
      {
        text: 'Ведущий инженер',
        value: 'VI',
        selected: true,
        divider: true
      },
      {
        text: 'Отв. бухгалтер',
        value: 'Buh',
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
        text: '% Сервис менеджера',
        value: 'smp',
        selected: true,
        divider: true
      },
      {
        text: '% Вед. инженера',
        value: 'vip',
        selected: true,
        divider: true
      },
      {
        text: '% Отв. бух.',
        value: 'buhp',
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
        text: '% теория',
        value: 'pX',
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
      return this.typedate === 'quarter'
        ? this.BonusPerManager.filter(item => this.getMonthPerQuarter.includes(new Date(item.doc_date).getMonth() + 1))
        : this.BonusPerManager.filter(item => (new Date(item.doc_date).getMonth() + 1) === this.month)
    },
    // eslint-disable-next-line vue/return-in-computed-property
    BonusPerManager() {
      if (this.email === 'nouser@tsd-group.ru') return this.BonusProfit.filter(item => !item.SM && !item.VI && !item.Buh)
      return this.BonusProfit.filter(item => item.SM === this.email || item.VI === this.email || item.Buh === this.email || item.SMBoss === this.email || item.VIBoss === this.email)
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

<style lang="scss" scoped>
  .grn {
    background-color: rgba(145, 250, 119, 0.158);
    float: left;
    width: 100%;
     line-height: 3em;
  }
  .rd_lt {
    background-color: rgba(252, 176, 176, 0.3);
    float: left;
    width: 100%;
     line-height: 3em;
  }
  .rd_gt {
    background-color: rgba(252, 77, 77, 0.3);
    float: left;
    width: 100%;
     line-height: 3em;
  }
</style>
