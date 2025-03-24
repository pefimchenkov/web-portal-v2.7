<template>
  <div>

    <el-button
      type="primary"
      icon="el-icon-plus"
      @click="dialog = true"
    />

    <el-dialog
      :visible.sync="dialog"
      :close-on-click-modal="false"
      title="Добавление операции"
      center
      @close="close"
    >
      <el-card v-loading="loading" class="pa-3" shadow="never">
        <v-select
          ref="operation_type"
          v-model="editedItem.operation_type"
          :items="['Расход', 'Доход', 'Поступление']"
          required
          prepend-icon="help"
          placeholder="Операция"
          outlined
          dense
          :rules="reqRules"
        />
        <v-select
          ref="type"
          v-model="editedItem.type"
          :items="selectedTypes"
          item-text="name"
          item-value="id"
          required
          prepend-icon="help"
          :placeholder="editedItem.operation_type === 'Поступление' ? `Касса` : `Тип`"
          outlined
          dense
          :rules="reqRules"
        />
        <v-select
          v-if="editedItem.operation_type !== 'Поступление'"
          ref="cash_type"
          v-model="editedItem.cash_type"
          :items="selectedCashes"
          item-text="name"
          item-value="id"
          required
          prepend-icon="help"
          placeholder="Касса"
          outlined
          dense
          :rules="reqRules"
        />
        <v-autocomplete
          v-if="['Доход', 'Поступление'].includes(editedItem.operation_type) || [9, 10, 24, 27, 28].includes(editedItem.type)"
          ref="user"
          v-model="editedItem.username"
          required
          :items="editedItem.type === 24 ? usersPremium : Jira_Users"
          item-text="display_name"
          item-value="display_name"
          prepend-icon="face"
          label="Пользователь"
          outlined
          dense
          :rules="reqRules"
          :disabled="editedItem.operation_type === 'Поступление' && disable"
        />
        <v-autocomplete
          v-else
          ref="user"
          v-model="editedItem.username"
          required
          :items="users"
          prepend-icon="face"
          label="Пользователь"
          outlined
          dense
          :rules="reqRules"
        />
        <v-checkbox
          v-if="editedItem.operation_type === 'Поступление'"
          v-model="disable"
          hide-details
          class="shrink mx-2 mt-1"
        />
        <v-select
          v-if="editedItem.type === 24"
          ref="quarter"
          v-model="editedItem.quarter"
          :items="quartersFiltered"
          item-text="name"
          return-object
          required
          prepend-icon="event"
          outlined
          dense
          :rules="reqRules"
        />
        <v-menu
          v-else
          ref="menu"
          v-model="menu"
          :close-on-content-click="false"
          :return-value.sync="editedItem.date"
          transition="scale-transition"
          offset-y
          min-width="290px"
          :disabled="editedItem.operation_type === 'Поступление'"
        >
          <template #activator="{ on, attrs }">
            <v-text-field
              ref="date"
              v-model="dateFormatted"
              required
              prepend-icon="event"
              readonly
              v-bind="attrs"
              dense
              outlined
              :rules="reqRules"
              :disabled="editedItem.operation_type === 'Поступление'"
              v-on="on"
            />
          </template>
          <v-date-picker
            v-model="editedItem.date"
            type="month"
            class="mt-4"
            no-title
            scrollable
            :allowed-dates="allowedMonths"
            :min="previousYear01"
            :max="currentYear12"
            locale="ru"
            elevation="10"
          >
            <v-spacer />
            <v-btn text color="primary" @click="menu = false">Нет</v-btn>
            <v-btn text color="primary" @click="$refs.menu.save(editedItem.date)">Да</v-btn>
          </v-date-picker>
        </v-menu>
        <v-text-field
          ref="summa"
          v-model="editedItem.summa"
          required
          prepend-icon="mdi-currency-rub"
          suffix="рублей"
          placeholder="Сумма"
          outlined
          dense
          :rules="summaRules"
        />
        <v-row v-if="editedItem.operation_type === 'Доход'" justify="start" align="center" class="pb-4">
          <v-checkbox
            v-model="editedItem.finalIncome"
            hide-details
            small
            style="margin-top: -10px !important"
            class="shrink ml-11 mt-0"
          />
          <span style="margin-top: -10px !important">Финальный доход</span>
        </v-row>
        <v-textarea
          v-model="editedItem.comment"
          prepend-icon="mdi-comment-text"
          outlined
          label="Комментарий (не более 255 символов)"
        />
        <el-row type="flex" justify="center">
          <el-button type="success" plain @click.native="save">Добавить</el-button>
        </el-row>
      </el-card>
    </el-dialog></div>
</template>

<script>
import { validNumberWithPoint } from '@/utils/validate'

export default {
  props: {
    types: {
      type: Array,
      default: null
    },
    users: {
      type: Array,
      default: null,
      requared: true
    },
    detailedCash: {
      type: Array,
      default: null,
      requared: true
    }
  },
  data() {
    return {
      dialog: false,
      menu: false,
      loading: false,
      disable: true,
      selectedUser: null,
      selectedTypes: [],
      selectedCashes: [],
      userMonth: [],
      quartersFiltered: [],
      usersPremium: [],
      jiraCashes: [],
      dateFormatted: null,
      editedItem: {
        user: {},
        username: null,
        date: null,
        quarter: null,
        summa: null,
        finalIncome: false,
        operation_type: null,
        type: null,
        comment: ''
      },
      summaRules: [
        v => !!v || 'обязательный параметр',
        v => validNumberWithPoint(v) || 'допускаются только цифры или цифры с точкой',
        v => this.checkOverLimitCash(v) || 'введённая сумма превышает лимит кассы!',
        v => this.checkOverLimitDebt(v) || 'введённая сумма превышает лимит задолженности!'
      ],
      reqRules: [
        v => !!v || 'обязательный параметр'
      ],
      quartersAll: [
        { id: -1, year: new Date().getFullYear(), name: `I кв ${new Date().getFullYear()}` },
        { id: -2, year: new Date().getFullYear(), name: `II кв ${new Date().getFullYear()}` },
        { id: -3, year: new Date().getFullYear(), name: `III кв ${new Date().getFullYear()}` },
        { id: -4, year: new Date().getFullYear(), name: `IV кв ${new Date().getFullYear()}` },
        { id: -1, year: new Date().getFullYear() - 1, name: `I кв ${new Date().getFullYear() - 1}` },
        { id: -2, year: new Date().getFullYear() - 1, name: `II кв ${new Date().getFullYear() - 1}` },
        { id: -3, year: new Date().getFullYear() - 1, name: `III кв ${new Date().getFullYear() - 1}` },
        { id: -4, year: new Date().getFullYear() - 1, name: `IV кв ${new Date().getFullYear() - 1}` }
      ]
    }
  },
  computed: {
    Jira_Users() {
      switch (true) {
        case this.editedItem.operation_type === 'Поступление': return [...this.$store.getters.jira_users, ...this.jiraCashes.filter(item => !(item.user_name === this.editedItem.type))]
        case this.editedItem.operation_type === 'Расход' && this.editedItem.cash_type === 5 && this.editedItem.type === 27
          : return [...this.$store.getters.jira_users, ...this.jiraCashes].filter(user => this.detailedCash.filter(item => item.CASH_ID === 5).map(item => item.NAME).includes(user.display_name))
        case this.editedItem.operation_type === 'Расход' && this.editedItem.cash_type === 6 && this.editedItem.type === 27
          : return [...this.$store.getters.jira_users, ...this.jiraCashes].filter(user => this.detailedCash.filter(item => item.CASH_ID === 6).map(item => item.NAME).includes(user.display_name))
        default: return this.$store.getters.jira_users
      }
    },
    Salary() {
      return this.$store.state.finance.Salary
    },
    DetailedSalary() {
      return this.$store.state.finance.DetailedSalary
    },
    Cash() {
      return this.$store.state.finance.Cash
    },
    currentUser() {
      return this.$store.getters.jira_users.find(item => item.email === this.$store.getters.currentUser.email)
    },
    previousYear01() {
      return (new Date().getFullYear() - 1) + '-01'
    },
    currentYear12() {
      return new Date().getFullYear() + '-12'
    }
  },
  watch: {
    'editedItem.operation_type': {
      deep: true,
      handler(val) {
        if (val === 'Доход') {
          this.selectedTypes = this.types.filter(item => [1, 4].includes(item.type))
          this.selectedCashes = this.types.filter(item => item.type === 3 && ![5, 11, 13].includes(item.id))
          this.editedItem.username = ''
          this.disable = false
        }
        if (val === 'Расход') {
          this.selectedCashes = this.types.filter(item => item.type === 3 && ![5, 11, 13].includes(item.id))
          this.selectedTypes = this.types.filter(item => item.type === 2)
          this.editedItem.username = ''
          this.disable = false
        }
        if (val === 'Поступление') {
          this.selectedTypes = this.types.filter(item => item.type === 3 && [6, 12].includes(item.id))
          this.editedItem.username = this.Jira_Users.find(user => user.user_name === 'nouser').display_name
          this.editedItem.date = new Date().toISOString().substr(0, 7)
          this.disable = true
        }
      }
    },
    'editedItem.type': {
      deep: true,
      handler(val) {
        val !== 1 && this.editedItem.operation_type === 'Доход' || val !== 2 && this.editedItem.operation_type === 'Расход'
          ? this.selectedCashes = this.types.filter(item => item.type === 3 && [6, 12].includes(item.id))
          : this.selectedCashes = this.types.filter(item => item.type === 3 && ![5, 6, 11, 13].includes(item.id))
        this.editedItem.quarter = ''
        if (this.editedItem.operation_type !== 'Поступление') this.editedItem.date = this.editedItem.username = ''
        if (val === 24) {
          const withQuarterDebt = [...new Set(this.Salary.map(item => {
            if (Math.sign(item.PERIOD) === -1) return item.USER
          }))]
          this.usersPremium = this.Jira_Users.filter(user => withQuarterDebt.includes(user.user_name))
        }
      }
    },
    'editedItem.username': {
      deep: true,
      handler(val) {
        this.editedItem.finalIncome = false
        if (this.editedItem.operation_type !== 'Поступление') this.editedItem.date = ''
        if (val && val !== null) {
          this.editedItem.user = this.Jira_Users.find(user => user.display_name === val)
          if (this.editedItem.type === 24) {
            const data = this.Salary.filter(item => item.USER === this.editedItem.user.user_name && Math.sign(item.PERIOD) === -1)
            this.quartersFiltered = this.quartersAll.filter(quarters => data.map(item => item.PERIOD).includes(quarters.id) && data.map(item => item.YEAR).includes(quarters.year))
          } else if (this.editedItem.type === 27) {
            this.editedItem.date = new Date().toISOString().substr(0, 7)
          } else {
            this.userMonth = this.setUserMonth()
          }
        }
      }
    },
    'editedItem.date': {
      deep: true,
      handler(val) {
        this.dateFormatted = this.formatDate(this.editedItem.date)
        if (val) {
          if (this.editedItem.user) {
            const month = +val.split('-')[1]
            const year = +val.split('-')[0]
            const obj = this.Salary.find(item => item.PERIOD === month && item.YEAR === year && item.USER === this.editedItem.user.user_name)

            obj && !!obj.Final
              ? this.editedItem.finalIncome = true
              : this.editedItem.finalIncome = false
          }
        }
      }
    },
    dialog(val) {
      if (val) {
        const cashes = this.types.filter(item => item.type === 3);
        console.log('cashes', cashes)

        this.jiraCashes = cashes.map(item => {
          return { user_name: item.id, display_name: item.name }
        })
      }
    }
  },
  methods: {
    save() {
      const condition = this.$refs.user.validate() &&
        this.editedItem.type === 24 ? this.$refs.quarter.validate() : this.$refs.date.validate() &&
        this.$refs.summa.validate() &&
        this.$refs.type.validate() &&
        this.$refs.operation_type.validate()

      if (condition) {
        this.loading = true
        this.editedItem['current_user'] = this.currentUser

        this.$store.dispatch('finance/addFinanceInfo', this.editedItem, { root: true })
          .then(res => {
            Array.isArray(res)
              ? Object.prototype.hasOwnProperty.call(res[0], 'insertId') && Object.prototype.hasOwnProperty.call(res[1], 'insertId')
                ? this.$store.commit('setData', 'Запись успешно добавлена (Записи с id ' + res[0].insertId + ', ' + res[1].insertId + ')')
                : this.$store.commit('setError', res.message || 'Произошла ошибка при добавлении данных. Обратитесь к администратору портала.')
              : res.insertId
                ? this.$store.commit('setData', 'Запись успешно добавлена (ID записи - ' + res.insertId + ')')
                : this.$store.commit('setError', res.message || 'Произошла ошибка при добавлении данных. Обратитесь к администратору портала.')
            setTimeout(() => {
              this.loading = false
              this.close()
            }, 1000)
          })
          .catch(() => {
            setTimeout(() => {
              this.loading = false
              this.close()
            }, 1000)
          })
      } else {
        this.$store.commit('setError', 'Не заполнены (или заполнены не правильно) обязательные поля')
      }
    },
    close() {
      this.$emit('closeDialog', false)
      this.dialog = false
      this.editedItem = {
        user: {},
        username: null,
        date: null,
        quarter: null,
        summa: null,
        finalIncome: false,
        type: null,
        operation_type: null,
        cash_type: null,
        comment: ''
      }
      this.userMonth = []
      this.usersPremium = []
    },
    formatDate(date) {
      if (!date) return undefined
      const [year, month] = date.split('-')
      return `${month}/${year}`
    },
    allowedMonths(val) {
      return ['Поступление', 'Доход'].includes(this.editedItem.operation_type) || [9, 10, 27, 28].includes(this.editedItem.type)
        ? this.userMonth.find(item => item === parseInt(val.split('-')[1], 10))
        : this.userMonth.find(item => item.period === parseInt(val.split('-')[1], 10) && item.year === parseInt(val.split('-')[0], 10))
    },
    setUserMonth() {
      let arr = []
      if (['Поступление', 'Доход'].includes(this.editedItem.operation_type) || [9, 10, 27, 28].includes(this.editedItem.type)) {
        arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
      } else {
        this.Salary.forEach(item => {
          if (item.USER === this.editedItem.user.user_name) arr.push({ period: item.PERIOD, year: item.YEAR })
        })
      }
      return arr
    },
    checkOverLimitDebt(val) {
      if (!val) return true
      if ([9, 10, 24, 28].includes(this.editedItem.type)) return true
      if (this.editedItem.operation_type === 'Расход') {
        if (this.editedItem.type === 27) {
          const cashDept = this.detailedCash.find(item => item.NAME === this.editedItem.user.display_name)
          return (val <= cashDept.SUM)
        } else {
          const employeeSalary = this.Salary.find(item => {
            const isUser = item.USER === this.editedItem.user.user_name
            const isDate = item.YEAR === +this.editedItem.date.split('-')[0] && item.PERIOD === +this.editedItem.date.split('-')[1]
            return isUser && isDate
          })
          return (val <= employeeSalary.Debt)
        }
      } else return true
    },
    checkOverLimitCash(val) {
      if (!val) return true
      if (this.editedItem.cash_type === 5 && this.editedItem.operation_type === 'Расход') {
        return this.Cash[0].CASH >= val
      } else if (this.editedItem.cash_type === 6 && this.editedItem.operation_type === 'Расход') {
        return this.Cash[1].CASH >= val
      } else return true
    }

  }
}
</script>

<style lang="scss" scoped>

</style>
