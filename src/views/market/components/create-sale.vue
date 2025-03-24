<template>

  <el-dialog
    :visible.sync="dialogFormVisible"
    max-width="900px"
    append-to-body
    top="10vh"
    lock-scroll
    :close-on-click-modal="false"
    :title="theme"
    @close="close"
  >

    <el-card shadow="never">

      <v-card-text>
        <el-form ref="form" :model="form" :rules="rules">

          <el-row :gutter="10" type="flex" justify="center" align="middle">
            <el-col v-loading="clients.length === 0" :span="12">
              <el-form-item label="Организация" prop="org">
                <el-select
                  v-model="form.org"
                  placeholder="Выберите организацию"
                  autocomplete
                  filterable
                  clearable
                  value-key="ID"
                >
                  <el-option
                    v-for="item in clients"
                    :key="item.ID"
                    :label="item.NAME"
                    :value="item"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Проект 1с" prop="project">
                <el-select
                  v-model="form.project"
                  placeholder="Выберите проект 1с"
                  autocomplete
                  filterable
                  clearable
                  value-key="id"
                >
                  <el-option
                    v-for="item in Projects"
                    :key="item.id"
                    :label="item.name"
                    :value="item"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="10" type="flex" justify="center" align="middle">
            <el-col :span="12">
              <el-form-item label="Посредник" prop="agent">
                <el-select v-model="form.agent" placeholder="Выберите посредника" clearable value-key="ID" :disabled="clients.length === 0">
                  <el-option
                    v-for="item in agents"
                    :key="item.ID"
                    :label="item.NAME"
                    :value="item"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Фирма исполнитель" prop="firm">
                <el-select v-model="form.firm" placeholder="Выберите фирму" clearable value-key="ID" :disabled="clients.length === 0">
                  <el-option
                    v-for="item in firms"
                    :key="item.ID"
                    :label="item.NAME"
                    :value="item"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

            <el-row :gutter="10">
              <el-col :span="24">
              <el-form-item label="Описание" prop="comment">
                <el-input
                  v-model="form.comment"
                  type="textarea"
                  maxlength="200"
                  show-word-limit
                  clearable
                />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="Инициатор" prop="author">
                <el-select
                  v-model="form.author"
                  placeholder="Выберите инициатора"
                  filterable
                  clearable
                  value-key="user_name"
                >
                  <el-option
                    v-for="item in jiraUsers"
                    :key="item.user_name"
                    :label="item.display_name"
                    :value="item"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Ответственный менеджер" prop="manager">
                <el-select
                  v-model="form.manager"
                  placeholder="Выберите менеджера"
                  filterable
                  clearable
                  value-key="user_name"
                >
                  <el-option
                    v-for="item in jiraUsers"
                    :key="item.email"
                    :label="item.display_name"
                    :value="item"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="Консультанты" prop="consultants">
                <el-select v-model="form.consultants" multiple placeholder="Выберите консультантов" filterable clearable value-key="user_name">
                  <el-option
                    v-for="item in jiraUsers"
                    :key="item.user_name"
                    :label="item.display_name"
                    :value="item"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <div style="font-weight: 600; margin-bottom: 7px"><span style="color: red">*</span> Время выполнения</div>
              <el-form-item prop="due">
                <el-date-picker
                  v-model="form.due"
                  type="datetime"
                  format="dd.MM.yy HH:mm"
                  placeholder="Выберите дату"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <div style="font-weight: 600; margin-bottom: 7px"><span style="color: red">*</span> Время критическое</div>
              <el-form-item prop="critical">
                <el-date-picker
                  v-model="form.critical"
                  type="datetime"
                  format="dd.MM.yy HH:mm"
                  placeholder="Выберите дату"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="Наблюдатели" prop="supervisors">
                <el-select v-model="form.supervisors" multiple placeholder="Выберите наблюдателей" filterable clearable value-key="user_name">
                  <el-option
                    v-for="item in jiraUsers"
                    :key="item.user_name"
                    :label="item.display_name"
                    :value="item"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Сумма заказа">
                <el-input
                  v-model="form.total"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Исполнитель">
                <el-input
                  v-model="displayName"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>

        </el-form>

      </v-card-text>
      <div class="text-center" style="padding: 10px 0">
        <el-button @click="resetForm('form')">Сбросить</el-button>
        <!-- <el-button @click="close">Отмена</el-button> -->
        <el-button type="primary" @click.native="save('form')">Создать</el-button>
      </div>
    </el-card>
  </el-dialog>

</template>

<script>

import { createSale } from '@/api/market/orders'

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
    total: {
      type: Number,
      default: () => null
    }
  },

  data() {
    return {

      dialogFormVisible: false,
      loading: false,

      form: {
        theme: '',
        org: '',
        agent: '',
        firm: '',
        comment: '',
        author: '',
        manager: '',
        consultants: [],
        due: '',
        critical: '',
        supervisors: [],
        total: this.total
      },

      /* projects: [
        { id: 0, project: 'Ремонт', value: 50 },
        { id: 1, project: 'Аренда', value: 50 },
        { id: 2, project: 'Продажа (склад)', value: 50 },
        { id: 3, project: 'Продажа (новое)', value: 16 },
        { id: 4, project: 'Продажа (ЗИП)', value: 50 },
        { id: 5, project: 'Продажа (IT)', value: 10 },
        { id: 6, project: 'Производство', value: 50 },
        { id: 7, project: 'СКС (Wi-Fi)', value: 30 },
        { id: 8, project: 'Серв. Контракт', value: 50 },
        { id: 9, project: 'Прочее', value: 10 }
      ], */

      formLabelWidth: '230px',

      rules: {
        org: [{ required: true, message: 'Обязательно!', trigger: 'change' }],
        project: [{ required: true, message: 'Обязательно!', trigger: 'change' }],
        firm: [{ required: true, message: 'Обязательно!', trigger: 'change' }],
        comment: [{ required: true, message: 'Обязательно!', trigger: 'change' }],
        author: [{ required: true, message: 'Обязательно!', trigger: 'change' }],
        manager: [{ required: true, message: 'Обязательно!', trigger: 'change' }],
        consultants: [{ required: true, message: 'Обязательно!', trigger: 'change' }],
        due: [{ required: true, message: 'Обязательно!', trigger: 'blur' }],
        critical: [{ required: true, message: 'Обязательно!', trigger: 'blur' }]
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
      return `Автоматическая сделка по заказу № ${this.id}`
    },

    agents() {
      return this.clients.filter(c => c.INTERMEDIATE === 1)
    },

    firms() {
      return this.clients.filter(c => (c.ID === 429 || c.ID === 990))
    },

    Projects() {
      return this.$store.state.atlas_1c.getAtlasProjects
    }

  },

  watch: {

    show(val) {
      this.dialogFormVisible = val
      this.form.theme = this.theme
      this.form.total = this.total
      this.form.comment = this.comment
      this.$store.dispatch('clients/getClients')
    }

  },

  async created() {
    if (!this.Projects.length)
      await this.$store.dispatch('atlas_1c/getAtlasProjects');
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
          createSale({ form: this.form, id: this.id, user: this.currentUser })
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
    }

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
