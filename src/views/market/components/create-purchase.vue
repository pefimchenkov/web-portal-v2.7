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

import { createPurchase } from '@/api/market/orders'

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
      loading: false,

      form: {
        theme: '',
        initiating: {
          name: 'Атлас-Про',
          value: 20702,
        },
        comment: '',
        intention: 'Автопополнение склада'
      },

      formLabelWidth: '230px',

      rules: {
        comment: [{ required: true, message: 'Обязательно!', trigger: 'change' }],
      }
    }
  },

  computed: {

    currentUser() {
      return (this.$store.getters.currentUser && this.$store.getters.jira_users) ? this.jiraUsers.find(u => u.email === this.$store.getters.currentUser.email) : null
    },

    displayName() {
      return (this.$store.getters.currentUser && this.$store.getters.jira_users) ? this.jiraUsers.find(u => u.email === this.$store.getters.currentUser.email).display_name : null
    },

    jiraUsers() {
      return this.$store.getters.jira_users || []
    },

    clients() {
      return this.$store.getters.clients || []
    },

    theme() {
      return `Автоматическая закупка по заказу № ${this.id}`
    },


  },

  watch: {

    async show(val) {
      this.dialogFormVisible = val
      this.form.comment = this.comment
      this.form.theme = this.theme
      await this.$store.dispatch('clients/getClients')
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

          console.log(this.form)
          createPurchase({ form: this.form, id: this.id, user: this.currentUser, parts: this.parts })
            .then(res => {
              this.close()
              this.$message({ type: 'success', message: res })
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
