<template>
  <div v-loading="loading" class="app-container text-center">

    <el-dialog title="Редактирование" :visible.sync="dialog">
      <el-form :model="form" label-position="left" size="small">
        <el-form-item
          v-for="item in tableHeader"
          :ref="item"
          :key="item"
          :label="item"
          :rules="numberRule"
          label-width="200px"
          style="text-align: initial"
        >
          <el-select
            v-if="item === 'Пользователь'"
            v-model="editedItem[item]"
          >
            <el-option
              v-for="user in Jira_Users"
              :key="user.user_name"
              :label="user.display_name"
              :value="user.user_name"
            />
          </el-select>
          <el-select
            v-else-if="item === 'Статья'"
            v-model="editedItem[item]"
          >
            <el-option
              v-for="type in financeTypes.filter(item => item.type !== 3)"
              :key="type.id"
              :label="type.name"
              :value="type.id"
            />
          </el-select>
          <el-select
            v-else-if="item === 'Касса'"
            v-model="editedItem[item]"
          >
            <el-option
              v-for="cash in cashes"
              :key="cash.id"
              :label="cash.name"
              :value="cash.id"
            />
          </el-select>
          <el-input
            v-else
            v-model="editedItem[item]"
            autocomplete="off"
          />
        </el-form-item>
        <v-row v-if="messageRule" class="text-center red" style="color: #fff">
          <v-col>{{ messageRule }}</v-col>
        </v-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button small @click="close()">Отмена</el-button>
        <el-button small type="primary" @click="confirm()">Подтвердить</el-button>
      </span>
    </el-dialog>
    <v-row v-if="$acl.check('SuperFinancier')">
      <v-col class="text-center">
        <a href="/static/FinanceOperations_v4_1.xlsx">Пример файла Excel для импорта</a>
      </v-col>
    </v-row>

    <!-- Модуль загрузки файла -->
    <upload-excel-component
      v-if="tableData.length === 0 && $acl.check('SuperFinancier')"
      :on-success="handleSuccess"
      :before-upload="beforeUpload"
    />
    <!-- -->

    <template v-if="tableData.length > 0 && $acl.check('SuperFinancier')">
      <v-btn
        class="my-10"
        :disabled="UsersNotInJira.length > 0 || !!MonthNotNumber || !!TypeNotNumber || ifCashIsMinusOne()"
        @click="toDB"
      >
        <v-icon class="mr-5">mdi-file-upload-outline</v-icon>Загрузить
      </v-btn>
      <v-btn
        v-if="tableData.length > 0"
        class="ma-10"
        @click="tableData = []"
      >
        <v-icon class="mr-5">mdi-cancel</v-icon>Сбросить
      </v-btn>
    </template>
    <p
      v-if="UsersNotInJira.length > 0"
      v-html="`<span class='red--text'>1*</span> - В таблице присутствует(ют) <span class='red--text'>${UsersNotInJira.join(', ')}</span>, не обнаруженных в системе. Удалите или отредактируйте их до вставки в БД!`"
    />
    <p
      v-if="MonthNotNumber"
      v-html="`<span class='red--text'>2*</span> Месяц должен быть представлен в числовом формате и находиться в диапазоне от 1 до 12.`"
    />
    <p
      v-if="TypeNotNumber"
      v-html="`<span class='red--text'>3*</span> Статья должена быть представлена в числовом формате из подтверждённого списка.`"
    />
    <p
      v-if="ifCashIsMinusOne()"
      v-html="`<span class='red--text'>4* </span>Значение поля 'Касса' не корректно. Исправте значение`"
    />
    <el-table
      v-if="$acl.check('SuperFinancier')"
      :key="key"
      :data="tableData"
      lazy
      border
      stripe
      highlight-current-row
      style="width: 95%; margin: 10px auto;"
    >
      <el-table-column
        v-for="item of tableHeader"
        :key="item"
        :prop="item"
        :label="item"
      >
        <template slot-scope="scope">
          <span v-if="item === 'Пользователь'" v-html="getUser(scope.row[item])" />
          <span v-else-if="item === 'Сумма'" v-html="toInt(scope.row[item])" />
          <span v-else-if="item === 'Месяц'" v-html="getMonth(scope.row[item])" />
          <span v-else-if="item === 'Статья'" v-html="getCostItem(scope.row[item])" />
          <span v-else-if="item === 'Касса'" v-html="IncomeNoCheck(scope.row) ? `<span style='color:red'>4* - Ошибка</span>` : getCash(scope.row[item])" />
          <span v-else>{{ scope.row[item] }}</span>
        </template>
      </el-table-column>

      <el-table-column
        v-if="tableData.length > 0"
        label="Действия"
      >
        <template slot-scope="scope">
          <v-row class="text-center">
            <v-col>
              <el-button
                type="primary"
                icon="el-icon-edit"
                round
                @click="handleEdit(scope.$index, scope.row)"
              />
            </v-col>
            <v-col>
              <el-button
                type="danger"
                icon="el-icon-delete"
                round
                @click="handleDelete(scope.$index, scope.row)"
              />
            </v-col>
          </v-row>
        </template>
      </el-table-column>
    </el-table>
    <v-row v-else justify="center" align="center" style="margin-top: 20px">
      <v-col cols="6" offset="" class="text-center">
        <v-alert
          outlined
          type="warning"
          prominent
          border="left"
        >
          Внимание, отсутствуют права на EXCEL импорт. Обратитесь к вашему руководителю.
        </v-alert>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import UploadExcelComponent from '@/components/shared/UploadExcel'
import { validNumber } from '@/utils/validate'

export default {
  name: 'UploadExcel',
  components: { UploadExcelComponent },
  data() {
    return {
      key: 1,
      tableData: [],
      tableHeader: [],
      messageRule: null,
      isCashCheck: [],
      editedItem: {
        index: null,
        'Пользователь': '',
        'Сумма': '',
        'Месяц': '',
        'Год': '',
        'Статья': '',
        'Комментарий': '',
        'Касса': ''
      },
      loading: false,
      dialog: false,
      form: {
      },
      numberRule: [
        v => !!v || 'обязательный параметр',
        v => validNumber(v) || 'допускаются только цифры'
      ]
    }
  },
  computed: {
    Jira_Users() {
      return this.$store.getters.jira_users
    },
    currentUser() {
      return this.Jira_Users.find(item => item.email === this.$store.getters.currentUser.email)
    },
    financeTypes() {
      return this.$store.state.finance.FinanceTypes
    },
    cashes() {
      return [
        { id: 5, name: 'Касса ТСД' },
        { id: 6, name: 'Касса Атлас' },
        { id: 11,	name:	'ТСД-Сервис' },
        { id: 12,	name:	'Атлас-Про' },
        { id: 13,	name:	'Инсенсор' },
        { id: 14,	name:	'ИП Ефимченков' },
        { id: 15,	name:	'ИП Сергеева' },
        { id: 16,	name:	'ИП Уфимцев' },
        { id: 17,	name:	'ИП Вольнов' },
        { id: 18,	name:	'ИП Рыбников' },
        { id: 19,	name:	'ЭнДиЛоракс' }
      ]
    },
    UsersNotInJira() {
      const arr = this.tableData.map(row => {
        const user = this.Jira_Users.find(user => user.user_name === row['Пользователь'])
        if (!user) return row['Пользователь']
      })
      return [...new Set(arr.filter(item => item))]
    },
    MonthNotNumber() {
      return this.tableData.find(item => typeof (item['Месяц']) !== 'number')
    },
    TypeNotNumber() {
      return this.tableData.find(item => typeof (item['Статья']) !== 'number' || ![1, 2, 3, 4, 8, 9, 10, 26, 28].includes(item['Статья']))
    }
  },
  created() {
    this.$store.dispatch('finance/getFinanceTypes', { root: true })
  },
  methods: {
    beforeUpload(file) {
      const isLt2M = file.size / 2048 / 2018 < 1

      if (isLt2M) {
        return true
      }

      this.$message({
        message: 'Пожалуйста, не загружайте файл более чем 2 Мб!',
        type: 'warning'
      })
      return false
    },
    handleSuccess({ results, header }) {
      this.loading = true
      setTimeout(() => {
        this.tableData = results
        this.tableHeader = header
        this.loading = false
      }, 1000)
    },
    handleEdit(index, row) {
      this.dialog = true
      Object.assign(this.editedItem, { ...row, index })
    },
    handleDelete(index) {
      this.tableData.splice(index, 1)
    },
    getCostItem(index) {
      switch (index) {
        case 1: return 'ЗП (официально)'
        case 2: return 'Официальная выплата'
        case 3: return 'Дополнительный доход'
        case 4: return 'Неофициальная выплата'
        case 8: return 'Дополнительный доход'
        case 9: return 'Закупка'
        case 10: return 'Хозоперация'
        case 25: return 'Премия по итогам месяца'
        case 26: return 'ЗП (неофициально)'
        case 28: return 'Транспортные (командировочные) расходы'
        default: return `<span class='red--text'>Статьи данного типа нет в проверке (можно добавить вручную) ***</span>`
      }
    },
    getCash(index) {
      switch (index) {
        case 5: return 'Касса ТСД'
        case 6: return 'Касса Атлас'
        case 11: return	'ТСД-Сервис'
        case 12: return	'Атлас-Про'
        case 13: return 'Инсенсор'
        case 14: return 'ИП Ефимченков'
        case 15: return 'ИП Сергеева'
        case 16: return 'ИП Уфимцев'
        case 17: return 'ИП Вольнов'
        case 18: return 'ИП Рыбников'
        case 19: return 'ЭнДиЛоракс'
        case 20: return 'ЭйБиЭс'
        case 21: return 'АйДиСток'
        case 22: return 'ИП Ерохина'
      }
    },
    getUser(username) {
      const user = this.Jira_Users.find(user => user.user_name === username)
      if (user) {
        return user.display_name
      } else {
        return `<span class="red--text">${username} *</span>`
      }
    },
    getUsersEmails() {
      const users = this.Jira_Users.filter(jiraUser => this.tableData.map(data => data['Пользователь']).includes(jiraUser.user_name))
      return users.map(user => user.email)
    },
    getMonth(month) {
      if (typeof (month) !== 'number' || (month > 12 || month < 1)) {
        return `<span class="red--text">${month} **</span>`
      } else {
        return month
      }
    },
    toInt(sum) {
      return typeof (sum) === 'string'
        ? `<span class='red--text'>${sum}</span>`
        : sum.toLocaleString()
    },
    ifCashIsMinusOne() {
      if (this.tableData.find(item => item['Касса'] === -1 || !item['Касса'])) return true
      else return false
    },
    IncomeNoCheck(row) {
      const cash = this.financeTypes.find(item => item.id === row['Касса'])
      if (cash && cash.type === 3) return false
      else return true
    },
    confirm() {
      this.key++
      const sum = this.editedItem['Сумма']
      const month = this.editedItem['Месяц']
      const year = this.editedItem['Год']

      if (validNumber(sum) && validNumber(month) && validNumber(year)) {
        const reg = /^([1-9]|1[0-2])$/
        if (!reg.test(month)) {
          this.messageRule = 'Месяц должен быть в диапазоне от 1 до 12!'
          return
        }
        this.editedItem['Месяц'] = Number(this.editedItem['Месяц'])
        this.editedItem['Сумма'] = parseInt(this.editedItem['Сумма'])
        Object.assign(this.tableData[this.editedItem.index], this.editedItem)
        this.ifCashIsMinusOne()
        this.close()
      } else {
        this.messageRule = 'Поля `Сумма`, `Месяц` и `Год` должны быть в числовом формате!'
      }
    },
    close() {
      this.dialog = false
      this.messageRule = null
      Object.keys(this.editedItem).forEach(key => {
        this.editedItem[key] = ''
      })
    },
    toDB() {
      this.loading = true
      this.$store.dispatch('finance/excelToDB', { data: this.tableData, user: this.currentUser, emails: this.getUsersEmails() })
        .then(res => {
          setTimeout(() => {
            this.tableData = []
            this.$store.commit('setData', res)
            this.loading = false
            document.location.reload()
          }, 1000)
        })
        .catch(err => {
          this.$store.commit('setError', err.message)
          this.loading = false
        })
    }
  }
}
</script>
