<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-flex xs12 sm8 md6>
        <v-card class="elevation-12">
          <v-toolbar dark color="primary">
            <v-toolbar-title>Регистрация</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-text-field
                v-model="email"
                prepend-icon="person"
                name="email"
                label="Email"
                type="email"
                required
                :rules="emailRules"
              />
              <v-text-field
                id="password"
                v-model="password"
                prepend-icon="lock"
                name="password"
                label="Пароль"
                type="password"
                :counter="20"
                :rules="passRules"
              />
              <v-text-field
                id="confirm-password"
                v-model="confirmPassword"
                prepend-icon="lock"
                name="confirm-password"
                label="Повторите пароль"
                type="password"
                :counter="20"
                :rules="confirmPassRules"
              />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="primary"
              :disabled="!valid || loading"
              :loading="loading"
              @click="onSubmit()"
            >Зарегистрироваться</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>



<script>

export default {
  name: 'Register',

  data() {
    return {
      email: '',
      password: '',
      confirmPassword: '',
      valid: false,
      emailRules: [
        v => !!v || 'E-mail - обязательный параметр',
        v => /.+@.+/.test(v) || 'E-mail должен быть правильного формата'
      ],
      passRules: [
        v => !!v || 'Пароль - обязательный параметр',
        v =>
          (v && v.length >= 12) ||
					'Пароль должен быть больше или равен 12 символам!'
      ],
      confirmPassRules: [
        v => !!v || 'Пароль - обязательный параметр',
        v => v === this.password || 'Пароль не совпадает!'
      ]
    }
  },


  computed: {
    loading() {
      return this.$store.getters.loading
    }
  },


  methods: {
    async onSubmit() {
      if (this.$refs.form.validate()) {

        const user = {
          email: this.email,
          password: this.password
        }


        try {
          await this.$store.dispatch('auth/register', user)
          this.$router.push({ name: "Dashboard" })
        } catch (err) {
          this.$notify({ type: "error", message: err.response?.data?.message })
        }
        
          
      }
    }
  }
}
</script>
