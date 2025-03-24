<template>
  <el-dialog
    :visible.sync="visible"
    :close-on-click-modal="false"
    @close="close"
  >
    <el-card>
      <div class="text-center title mb-5">{{ title }}</div>
      <el-form ref="form" :model="form" :rules="rules" :label-width="labelWidth">
        <el-row>
          <el-col :span="24">
            <el-form-item label="Бренд" prop="NAME">
              <el-input v-model="form.NAME" />
            </el-form-item>
          </el-col>
          <el-col v-if="action === 'add'" :span="24">
            <el-form-item label="Тип юрлица" prop="LP_TYPE">
              <el-select
                v-model="form.LP_TYPE"
                clearable
              >
                <el-option
                  v-for="el in legPersType"
                  :key="el"
                  :value="el"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="action === 'add'" :span="24">
            <el-form-item label="Название Юрлица" prop="LP_NAME">
              <el-input v-model="form.LP_NAME" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Название Юрлица Атлас" prop="LEGPERS_ATLAS">
              <el-input v-model="form.LEGPERS_ATLAS" />
            </el-form-item>
          </el-col>
          <el-col v-if="action === 'add'" :span="24">
            <el-form-item label="Код Юрлица по 1С" prop="ART_1C">
              <el-input v-model="form.ART_1C" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Тип контрагента" prop="PROJECT">
              <el-select
                v-model="form.PROJECT"
                clearable
              >
                <el-option
                  v-for="el in project"
                  :key="el"
                  :value="el"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div class="text-center">
        <el-button
          type="info"
          plain
          @click="reset('form')"
        >
          Сброс
        </el-button>
        <el-button
          type="success"
          plain
          @click="submit('form')"
        >Сохранить
        </el-button>
      </div>
    </el-card>
  </el-dialog>
</template>

<script>
import { legPersType, projects } from './data.js'
import { updateOne, addOne } from '@/api/clients'

export default {
  props: {
    show: {
      type: Boolean,
      required: true
    },
    data: {
      type: Object,
      default: () => {}
    },
    title: {
      type: String,
      default: () => 'Редактирование клиента '
    },
    action: {
      type: String,
      required: true
    },
    labelWidth: {
      type: String,
      default: () => '200px'
    }
  },
  data() {
    const validateArt = (rule, value, callback) => {
      if (!value) {
        callback(new Error('Обязательно!'))
      } else {
        if (/^[Т0-9.]{8,8}$/.test(value)) callback()
        else callback('Правильно: Буква ` Т ` кириллицей и 7 цифр!')
      }
    }

    return {
      visible: false,
      form: {},
      legPersType,
      rules: {
        NAME: [
          { required: true, message: 'Обязательно!', trigger: 'blur' },
          { min: 3, max: 25, message: 'Длинна имени - от 3 до 25 символов!', trigger: 'blur' }
        ],
        ART_1C: [
          { validator: validateArt, trigger: 'blur' }
        ],
        LP_NAME: [
          { required: true, message: 'Обязательно!', trigger: 'blur' },
        ],
        LP_TYPE: [
          { required: true, message: 'Обязательно!', trigger: 'change' },
        ],
        PROJECT: [
          { required: true, message: 'Обязательно!', trigger: 'change' },
        ]
      }
    }
  },
  computed: {
    project() {
      return projects.map(i => i.PROJECT)
    },
    legpers() {
      return this.form.LP_TYPE === 'ИП'
        ? this.form.LP_TYPE + ' ' + this.form.LP_NAME
        : this.form.LP_TYPE + ' «' + this.form.LP_NAME + '»'
    }
  },
  watch: {
    show: {
      immediate: true,
      handler(val) {
        this.visible = val
      }
    },
    data: {
      immediate: true,
      handler(val) {
        this.form = { ...val }
      }
    }
  },
  methods: {
    submit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const project = projects.find(i => i.PROJECT === this.form.PROJECT)
          const dataForLegpers = { client_name: this.form.NAME, name: this.legpers, '1c_id': this.form.ART_1C }
          delete this.form['LP_TYPE']
          delete this.form['LP_NAME']
          delete this.form['ART_1C']
          const data = { ...this.form, ...project, 'ACTIVE': 1 }

          if (this.action !== 'add') {
            updateOne(data)
              .then(() => {
                this.$emit('updateClient', data)
                this.close()
              })
              .catch(err => {
                console.log(err)
              })
          } else {
            addOne({ data, dataForLegpers })
              .then(res => {
                const new_data = { ID: res.insertId, LEGPERS: this.legpers, ...data }
                this.$emit('addClient', new_data)
                this.close()
              })
              .catch(err => {
                console.log(err)
              })
          }
        }
      })
    },
    reset(formName) {
      this.$refs[formName].resetFields()
    },
    close() {
      this.$emit('closeDialog')
    }
  },
}
</script>

<style lang="scss" scoped>

</style>
