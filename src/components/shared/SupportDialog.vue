<!-- eslint-disable vue/no-mutating-props -->
<template>
  <v-dialog
    v-model="dialog"
    persistent
    max-width="720px"
  >
    <v-card v-loading="loading">
      <v-card-title>
        <span class="headline">Создание задачи</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-select
                ref="type"
                v-model="type"
                :items="types"
                item-text="name"
                item-value="id"
                label="Тип задачи *"
                outlined
                dense
                required
                validate
                :rules="reqRule"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                ref="theme"
                v-model="theme"
                label="Тема *"
                outlined
                dense
                required
                validate
                :rules="reqRule"
              />
            </v-col>
            <v-col
              cols="12"
            >
              <v-textarea
                ref="desc"
                v-model="desc"
                label="Описание *"
                required
                outlined
                validate
                :rules="reqRule"
              />
            </v-col>
            <v-col
              cols="12"
            >
              <CustomUpload :clear="clear" @attachments="getAttachments" />
            </v-col>

          </v-row>
        </v-container>
        <small>* поля обязательные к заполнению</small>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="blue darken-1"
          text
          @click="closeDialog()"
        >
          Закрыть
        </v-btn>
        <v-btn
          color="blue darken-1"
          text
          @click="sendForm"
        >
          Отправить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

import CustomUpload from '@/components/shared/CustomUpload'
import { createRequest } from '@/api/jira'

export default {
  components: {
    CustomUpload
  },
  props: {
    dialog: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  data: () => ({
    loading: false,
    attachments: [],
    clear: null,
    type: null,
    theme: null,
    desc: null,
    types: [
      { id: 1, name: 'Ошибка' },
      { id: 4, name: 'Улучшение' },
      { id: 2, name: 'Новый функционал' }
    ],
    reqRule: [
      v => !!v || 'Обязательное поле!'
    ]
  }),
  computed: {
    users() {
      return this.$store.state.jira_users.JIRA_USERS
    },
    email() {
      return this.$store.state.user.currentUser.email
    },
    currentUser() {
      return this.users.find(item => item.email === this.email)
    }
  },

  methods: {
    closeDialog() {
      this.clear = +(Math.random(1, 9) * 100000).toFixed()
      this.attachments = []
      this.type = this.desc = this.theme = null
      this.$emit('closeDialog', true)
    },
    getAttachments(data) {
      this.attachments = data
    },
    sendForm() {
      if (this.$refs.type.validate() && this.$refs.theme.validate() && this.$refs.desc.validate()) {
        this.loading = true
        const formData = new FormData()
        this.attachments.forEach(file => {
          formData.append('file', file.raw)
        })
        formData.append('type', this.type)
        formData.append('theme', this.theme)
        formData.append('desc', this.desc)
        formData.append('user_name', this.currentUser ? this.currentUser.user_name : 'robot')
        createRequest(formData)
          .then(res => {
            if (res.status === 'ok') this.$store.commit('setData', res.message)
            this.loading = false
            this.closeDialog()
          })
          .catch(err => {
            this.$store.commit('setError', err.message || err)
            this.loading = false
          })
      } else {
        this.$store.commit('setError', 'Не заполнены необходимые поля!')
      }
    }
  }
}
</script>

<style scoped>

</style>
