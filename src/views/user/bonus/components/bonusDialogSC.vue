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
        color="primary"
        @click="$emit('dialogToggle', { toggle: true })"
      >
        Разовые ремонты
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
      calculate-widths
      fixed-header
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
      <template #item.sm="{ item }">
        {{ UserName(item.sm) }}
      </template>
      <template #item.vi="{ item }">
        {{ UserName(item.vi) }}
      </template>
      <template #item.buh="{ item }">
        {{ UserName(item.buh) }}
      </template>
      <template #item.head="{ item }">
        {{ role.split('&').includes('serviceManager') ? UserName(item.smboss) : UserName(item.viboss) }}
      </template>
      <template #item.hp="{ item }">
        {{ role.split('&').includes('serviceManager') ? item.bsmp : item.bvip }}
      </template>
      <template #item.IDs="{ item }">
        <a :href="`http://support.atlas-pro24.local/issues/?jql=id in (${item.IDs})`" target="_blank">Ссылка на JIRA</a>
      </template>
      <template #item.Bills="{ item }">
        {{ item.Bills ? item.Bills.split(',').join(', ') : null }}
      </template>
      <template #item.Zatraty="{ item }">
        {{ (item.Zatraty * 100).toFixed(2) }}%
      </template>
      <template #item.Marzha="{ item }">
        {{ (item.Marzha * 100).toFixed(2) }}%
      </template>
      <template #item.Percent="{ item }">
        {{ (item.Percent * 100).toFixed(2) }}%
      </template>
      <template #item.pX="{ item }">
        {{ item.pX.toFixed(2) }}
      </template>
      <template #no-data>
        <v-progress-linear
          v-if="BonusProfitSC.length === 0"
          color="orange"
          indeterminate
        />
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
        text: 'ID клиента',
        value: 'Client',
        selected: true,
        divider: true
      },
      {
        text: 'Имя',
        value: 'ClientName',
        selected: true,
        divider: true
      },
      {
        text: 'Тип',
        value: 'pname',
        selected: true,
        divider: true
      },
      {
        text: 'Стоимость контракта',
        value: 'Summa',
        selected: true,
        divider: true
      },
      {
        text: 'Оплачено',
        value: 'Price',
        selected: true,
        divider: true
      },
      {
        text: 'Стоимость',
        value: 'Cost',
        selected: true,
        divider: true
      },
      {
        text: 'Скидка',
        value: 'Sale',
        selected: true,
        divider: true
      },
      {
        text: 'Затраты',
        value: 'Zatraty',
        selected: true,
        divider: true
      },
      {
        text: 'Маржа',
        value: 'Marzha',
        selected: true,
        divider: true
      },
      {
        text: '% дохода',
        value: 'Percent',
        selected: true,
        divider: true
      },
      {
        text: 'Сервис менеджер',
        value: 'sm',
        selected: true,
        divider: true
      },
      {
        text: 'Ведущий инженер',
        value: 'vi',
        selected: true,
        divider: true
      },
      {
        text: 'Бухгалтер',
        value: 'buh',
        selected: true,
        divider: true
      },
      {
        text: 'Руководитель',
        value: 'head',
        selected: true,
        divider: true
      },
      {
        text: '% СМ',
        value: 'smp',
        selected: true,
        divider: true
      },
      {
        text: '% ВИ',
        value: 'vip',
        selected: true,
        divider: true
      },
      {
        text: '% Бух.',
        value: 'bp',
        selected: true,
        divider: true
      },
      {
        text: '% Руководителя',
        value: 'hp',
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
        text: 'JIRA',
        value: 'IDs',
        selected: true,
        divider: true,
        width: 130
      },
      {
        text: '1C',
        value: 'Bills',
        selected: true,
        divider: false
      }
      ]
    }
  },

  computed: {
    ...mapState({
      BonusProfitSC: state => state.user.BonusProfitSC
    }),
    ...mapGetters(['currentUser', 'jira_users']),
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
      return this.BonusProfitSC.filter(item => item.sm === this.email || item.vi === this.email || item.buh === this.email || item.head === this.email || item.smboss === this.email || item.viboss === this.email)
    },
    // eslint-disable-next-line vue/return-in-computed-property
    getMonthPerQuarter() {
      if (this.quarter === 1) return [1, 2, 3]
      if (this.quarter === 2) return [4, 5, 6]
      if (this.quarter === 3) return [7, 8, 9]
      if (this.quarter === 4) return [10, 11, 12]
    },
    // eslint-disable-next-line vue/return-in-computed-property
    MonthsInQuarter() {
      const year = new Date().getFullYear()
      if (this.typeDate === 'quarter') {
        if (this.quarter === 1) return { months: [1, 2, 3], year }
        else if (this.quarter === 2) return { months: [4, 5, 6], year }
        else if (this.quarter === 3) return { months: [7, 8, 9], year }
        else if (this.quarter === 4) return { months: [10, 11, 12], year }
        else if (this.quarter === 0) return { months: [10, 11, 12], year: year - 1 }
      }
      if (this.typeDate === 'month') {
        if (this.month === 0) {
          return { months: [12, 12, 12], year: year - 1 }
        } else return { months: [this.month, this.month, this.month], year: year }
      }
    }
  },

  async mounted() {
    if (!this.BonusProfitSC) {
      await this.$store.dispatch('getBonusProfitSC', { email: this.email, MonthsInQuarter: this.MonthsInQuarter })
    }
    await this.$store.dispatch('fetchJiraUsers')
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
