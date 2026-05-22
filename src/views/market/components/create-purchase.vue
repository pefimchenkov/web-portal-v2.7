<template>

  <el-dialog
    :visible.sync="dialogFormVisible"
    width="70%"
    append-to-body
    top="10vh"
    lock-scroll
    :close-on-click-modal="false"
    :title="theme"
    @close="close"
  >

    <el-card shadow="never">

        <el-form ref="form" :model="form" :rules="rules">
          <el-row :gutter="10">

              <el-col :span="24">
                <el-form-item label="Тема" prop="theme">
                  <el-input
                    v-model="form.theme"
                    maxlength="200"
                    show-word-limit
                    disabled
                  />
                </el-form-item>
              </el-col>
              
          </el-row>

          <el-row :gutter="10" type="flex" justify="center" align="middle">
            <el-col :span="12">
              <el-form-item label="Инициирующий отдел" prop="initiating">
                <el-input
                  :value="form.initiating.name"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Основание для закупки" prop="intention">
                <el-input
                      v-model="form.intention"
                      disabled
                    />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
              <el-col :span="24">
                <el-form-item label="Инициатор" prop="author">
                    <el-input
                      v-model="displayName"
                      disabled
                    />
                  </el-form-item>
              </el-col>
          </el-row>

          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item
                label="Подраздление"
                prop="subdivision">
                  <el-select v-model="form.subdivision" value-key="value">
                  <el-option
                    v-for="item in subdivisions"
                    :key="item.value"
                    :label="item.name"
                    :value="item">
                  </el-option>
                </el-select>
                </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="Клиент"
                prop="organization">
                <el-select
                  v-model="form.organization"
                  value-key="ID"
                  filterable
                  clearable
                >
                  <el-option
                    v-for="item in organizations"
                    :key="item.ID"
                    :label="item.NAME"
                    :value="item">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>

          </el-row>

          <el-row>
            <el-form-item
              label="Задачи JIRA"
              prop="task">
                <el-select
                  v-model="form.task"
                  value-key="jkey"
                  filterable
                  multiple
                  clearable
                  :disabled="!tasks.length"
                >
                  <el-option
                    v-for="item in tasks"
                    :key="item.jkey"
                    :label="formatTask(item)"
                    :value="item">
                  </el-option>
                </el-select>
              </el-form-item>
          </el-row>


          <el-row>
            <el-col :span="24">
                <el-form-item label="Описание" prop="comment">
                  <el-input
                    v-model="form.comment"
                    type="textarea"
                    maxlength="300"
                    show-word-limit
                    clearable
                  />
              </el-form-item>
            </el-col>
          </el-row>


        </el-form>

        <el-table
          ref="orderDetails"
          :data="parts"
          :default-sort="{prop: 'market_id'}"
          show-summary
          :summary-method="getSummaries"
          empty-text="нет данных"
        >
            <el-table-column
              label="Маркет ID"
              prop="market_id"
            />
            <el-table-column
              label="Название"
              prop="type"
            />
            <el-table-column
              label="Состояние"
              prop="cond"
            />
            <el-table-column
              label="Артикул 1С"
              prop="ART_1C"
            />
            <el-table-column
              label="Количество"
              prop="qty"
            />
            <el-table-column
              label="Цена (₽)"
              prop="price"
              width="200"
            />
            <el-table-column
              label="Итого (₽)"
              prop="summ"
            />
            

          </el-table>



      <div class="text-center" style="padding: 10px 0">
        <el-button type="primary" @click.native="save('form')">Создать</el-button>
      </div>
    </el-card>
  </el-dialog>

</template>

<script>

import { createPurchase, getClientTasks } from '@/api/market/orders'

export default {

  props: {

    show: {
      type: Boolean,
      required: true
    },
    id: {
      type: Number,
      default: () => null
    },
    comment: {
      type: String,
      default: () => null
    },
    parts: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {

      dialogFormVisible: false,

      form: {
        theme: '',
        initiating: {
          name: 'Атлас-Про',
          value: 20702,
        },
        subdivision: {},
        organization: {},
        task: {},
        comment: '',
        intention: 'Автопополнение склада'
      },

      organizations: [],
      tasks: [],
      subdivisions: [
        { name: "Сервисный центр", value: 23802 },
        { name: "Отдел продаж", value: 23803 }
      ],

      marketDetails: [],
      formLabelWidth: '230px',
      rules: {
        comment: [{ required: true, message: 'Обязательно!', trigger: 'change' }],
      }
    }
  },

  computed: {
    currentUser() {
      return this.$store.getters["auth/currentUser"]
    },

    currentJiraUser() {
      return this.jiraUsers.find(user => user.email === this.currentUser?.email);
    },

    displayName() {
      return this.jiraUsers.find(user => user.email === this.currentUser?.email)?.display_name;
    },

    jiraUsers() {
      return this.$store.getters["jira/users"] || [];
    },

    clients() {
      return this.$store.getters.clients || [];
    },

    theme() {
      return `Автоматическая закупка по заказу № ${this.id}`;
    },

    market() {
      return this.$store.getters['market_new/market'];
    }


  },

  watch: {

    async show(val) {

      if (val)
        this.$emit('loading', true);

      await this.$store.dispatch('clients/getClients');

      if (!this.jiraUsers.length)
        await this.$store.dispatch('jira/users');

      this.dialogFormVisible = val
      this.form.comment = this.comment
      this.form.theme = this.theme

      const ids = this.parts.map(i => i.market_id);
      this.marketDetails = this.market.filter(i => ids.includes(i.marketid))
      this.organizations = [ { ID: 0, NAME: 'Отсутствует клиент' }, ...this.clients ]

      this.$emit('loading', false)
    },


    
    "form.organization": {
      deep: true,
      handler(org) {
        
        this.form.task = null;

        if (org) {
          getClientTasks({ id: org.ID })
            .then(res => {
              console.log(res)
              this.tasks = [ ...res ]
            })
        } else {
          this.tasks = []
        }
      }
    }

  },



  beforeDestroy() {
    this.close()
  },

  methods: {

    close() {
      this.$emit('resetId')
      this.$emit('closeDialog')
    },

    save(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {

          createPurchase({
            form: this.form,
            id: this.id,
            user: this.currentJiraUser,
            parts: this.parts,
            marketDetails: this.marketDetails
          })
          .then(res => {
            this.close()
            this.$notify({ type: 'success', message: res })
            this.$emit('update')
          })
        } else {
          console.log('Ошибка отправки формы!')
          return false
        }
      })
    },


    resetForm(formName) {
      this.$refs[formName].resetFields()
    },

    formatTask(value) {
      return `${value.jkey} (${value.party_name})`
    },


    getSummaries(param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 8) { // было 5
          data.map(i => i.sale_xs * i.qty).reduce((a, c) => (a + c)) > 0
            ? sums[index] = 'Всего (со скидкой на ЗИП):'
            : sums[index] = 'Всего'
          return
        }
        const values = data.map(item => {
          if (column.property === 'summ') return (item[column.property] - (item['sale_xs'] * item['qty']))
        })

        if (!values.every(value => isNaN(value))) {
          sums[index] = values.reduce((prev, curr) => {
            return !isNaN(Number(curr))
              ? (prev + curr)
              : prev
          }, 0).toLocaleString()
        } else sums[index] = ''
      })

      return sums
    },

  }

}
</script>

<style lang="scss" scoped>

.el-select {
  width: -webkit-fill-available;
}
.el-date-editor.el-input {
  width: -webkit-fill-available;
}

</style>
