<template>
  <v-container fluid>
    <form>
      <v-card outlined>
        <v-card-text>
          <v-layout row wrap>
            <v-flex xs4 class="px-2">
              <v-text-field v-model="Company" label="Компания">
                <v-input>{{ Company }}</v-input>
              </v-text-field>
              <v-text-field v-model="Position" label="Должность">
                <v-input type="text">{{ Position }}</v-input>
              </v-text-field>
              <v-text-field v-model="Phone" label="Телефон">
                <v-input type="number">{{ Phone }}</v-input>
              </v-text-field>
            </v-flex>
            <v-flex xs4 flexbox class="px-2">
              <v-text-field v-model="FirstName" label="Имя">
                <v-input type="text">{{ FirstName }}</v-input>
              </v-text-field>
              <v-text-field v-model="LastName" label="Фамилия">
                <v-input type="text">{{ LastName }}</v-input>
              </v-text-field>
              <v-text-field v-model="Email" label="Email">
                <v-input v-if="Email" type="email">{{ Email }}</v-input>
              </v-text-field>
            </v-flex>
            <v-flex xs4 flexbox class="px-2">
              <v-text-field v-model="Country" label="Страна">
                <v-input type="text">{{ Country }}</v-input>
              </v-text-field>
              <v-text-field v-model="City" label="Город">
                <v-input type="text">{{ City }}</v-input>
              </v-text-field>
              <v-text-field v-model="Address" label="Адрес">
                <v-input type="text">{{ Address }}</v-input>
              </v-text-field>
            </v-flex>
          </v-layout>

          <v-textarea v-model="Aboutme" clearable counter label="Немного о себе">{{ Aboutme }}</v-textarea>
          <v-col class="text-center ma-auto">
            <v-btn class="success text-center" :loading="localloading" :disabled="localloading" @click="updateInfo">Обновить</v-btn>
          </v-col>

        </v-card-text>
      </v-card>
    </form>

    <el-form ref="passwordForm" :model="passwordForm" :rules="passwordRules" class="my-5">
      <passwordDialog :visible="dialogVisible" @dialogClose="confirmDialog" />
      <el-row :gutter="20">
        <el-col :span="9">
          <el-form-item name="password" prop="password">
            <el-input :key="passwordType" ref="password" v-model.trim="passwordForm.password" :type="passwordType" placeholder="введите новый пароль" />
          </el-form-item>
        </el-col>
        <el-col :span="9">
          <el-form-item name="confirmPassword" prop="confirmPassword">
            <el-input :key="passwordType" v-model.trim="passwordForm.confirmPassword" :type="passwordType" placeholder="введите новый пароль ещё раз" />
          </el-form-item>
        </el-col>
        <el-col :span="2">
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" :disabled="disabledPassword" :loading="loadingPassword" @click="submitPassword">Изменить</el-button>
        </el-col>
      </el-row>
    </el-form>

  </v-container>
</template>
<script>
// import { eventBus } from '../../main.js'
import { mapState } from 'vuex'
import { validPassword } from '@/utils/validate'
import passwordDialog from '@/components/shared/PasswordDialog'
import { Message } from 'element-ui'

export default {
  name: 'EditProfileForm',
  components: {
    passwordDialog
  },
  props: {
    dataBackgroundColor: {
      type: String,
      default: ''
    }
  },

  data() {
    const validatePassword = (rule, value, callback) => {
      if (!validPassword(value)) {
        callback(new Error('Пароль не надёжный!'))
      } else {
        callback()
      }
    }
    const validateConfirmPassword = (rule, value, callback) => {
      if (value && value !== this.passwordForm.password) {
        callback(new Error('Повторный пароль не совпадает с оригинальным!'))
      } else {
        callback()
      }
    }
    return {
      localloading: false,
      passwordType: 'password',
      loadingPassword: false,
      dialogVisible: false,
      passwordForm: {
        password: null,
        confirmPassword: null
      },
      passwordRules: {
        password: [{ required: false, trigger: 'blur', validator: validatePassword }],
        confirmPassword: [{ required: true, trigger: 'blur', validator: validateConfirmPassword }]
      },
      data: {
        type: '',
        payload: ''
      }
    }
  },

  computed: {
    ...mapState({
      info: state => state.user.info
    }),
    Position: {
      get() {
        return this.info
          ? this.info.position
          : null
      },
      set(val) {
        this.$store.dispatch('changeInfo', {
          key: 'position',
          value: val
        })
      }
    },
    Company: {
      get() {
        return this.info
          ? this.info.company
          : null
      },
      set(val) {
        this.$store.dispatch('changeInfo', {
          key: 'company',
          value: val
        })
      }
    },
    FirstName: {
      get() {
        return this.info
          ? this.info.firstname
          : null
      },
      set(val) {
        this.$store.dispatch('changeInfo', {
          key: 'firstname',
          value: val
        })
      }
    },
    LastName: {
      get() {
        return this.info
          ? this.info.lastname
          : null
      },
      set(val) {
        this.$store.dispatch('changeInfo', {
          key: 'lastname',
          value: val
        })
      }
    },
    City: {
      get() {
        return this.info
          ? this.info.city
          : null
      },
      set(val) {
        this.$store.dispatch('changeInfo', {
          key: 'city',
          value: val
        })
      }
    },
    Address: {
      get() {
        return this.info
          ? this.info.address
          : null
      },
      set(val) {
        this.$store.dispatch('changeInfo', {
          key: 'Address',
          value: val
        })
      }
    },
    Email: {
      get() {
        return this.info
          ? this.info.email
          : null
      },
      set(val) {
        this.$store.dispatch('changeInfo', {
          key: 'emailaddress',
          value: val
        })
      }
    },
    Phone: {
      get() {
        return this.info
          ? this.$store.state.user.info.phone
          : null
      },
      set(val) {
        this.$store.dispatch('changeInfo', {
          key: 'phone',
          value: val
        })
      }
    },
    Country: {
      get() {
        return this.info
          ? this.$store.state.user.info.country
          : null
      },
      set(val) {
        this.$store.dispatch('changeInfo', {
          key: 'country',
          value: val
        })
      }
    },
    Aboutme: {
      get() {
        return this.info
          ? this.$store.state.user.info.aboutme
          : null
      },
      set(val) {
        this.$store.dispatch('changeInfo', {
          key: 'aboutme',
          value: val
        })
      }
    },
    disabledPassword() {
      if (this.passwordForm.password && this.passwordForm.confirmPassword && (this.passwordForm.password === this.passwordForm.confirmPassword)) return false
      else return true
    }
  },

  methods: {
    async updateInfo() {
      await this.$store.dispatch('updateInfo', this.info)
      await this.$store.dispatch('setData', 'Профиль успешно обновлён.')
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    submitPassword() {
      this.$refs.passwordForm.validate(valid => {
        if (valid) {
          this.loadingPassword = true
          this.dialogVisible = true
          this.data.payload = this.passwordForm.password
          this.data.type = 'password'
        } else {
          this.loadingPassword = false
          return false
        }
      })
    },
    confirmDialog(password) {
      this.dialogVisible = false
      if (password === false) {
        this.loadingPassword = false
        return
      }
      this.$store.dispatch('reauthUser', password).then((isAuth) => {
        if (isAuth && this.data.type === 'password') {
          this.$refs.passwordForm.resetFields()
          this.$store.dispatch('setUserPassword', this.data.payload)
        }
      })
        .catch(error => {
          Message({ message: error.message, type: 'error', duration: 4 * 1000 })
        })
        .finally(() => {
          this.loadingPassword = false
        })
    }
  }
}
</script>
<style></style>
