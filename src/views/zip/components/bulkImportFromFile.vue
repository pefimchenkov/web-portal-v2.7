
<template>
  <div>
    <v-row justify="center" align="center">
      <v-col cols="12" class="mr-2">

        <span v-if="file" class="mr-5 red--text">
          {{ file.name }}
        </span>

        <v-btn
          ref="fileBtn"
          :color="color"
          class="white--text"
          :disabled="localLoading"
          :loading="localLoading"
          small
          @click="triggerUpload()"
        >
          {{ ['xs', 'sm', 'md'].includes($vuetify.breakpoint.name) ? '' : text }}
          <v-icon right dark>cloud_upload</v-icon>
        </v-btn>
        <form id="form">
          <input
            id="file"
            ref="file"
            type="file"
            name="file"
            style="display:none"
            accept="msword/*"
            @change="handleFileUpload($event)"
          >
        </form>
      </v-col>
    </v-row>
  </div>
</template>
<script>

import { uploadData, excelToDB } from '@/api/zip'

export default {
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      formData: new FormData(),
      file: null,
      xls2json: null,
      text: 'Выбрать файл',
      color: 'blue-grey',
      localLoading: false
    }
  },
  methods: {
    triggerUpload() {
      let urlUpload = ''
      let urlXls2json = ''
      if (this.id === 'ALIASES') {
        urlUpload = '/specprices/upload_file'
        urlXls2json = '/specprices/json_to_db'
      }
      if (this.id === 'SN') {
        urlUpload = '/serial_numbers/upload_file'
        urlXls2json = '/serial_numbers/json_to_db'
      }
      if (this.file && this.id) {
        this.localLoading = true

        uploadData(urlUpload, this.formData)
          .then((response) => {
            if (response.filename) {
              setTimeout(() => {
                this.xls2json = response.filename
                this.file = null
                this.localLoading = false
                this.text = 'Импорт данных'
                this.color = 'warning'
              }, 1000)
            } else {
              setTimeout(() => {
                this.$store.commit('setData', response.mess)
                this.reset()
              }, 1000)
            }
          })
          .catch((error) => {
            this.$store.commit('setError', error.message)
          })
      } else if (this.xls2json) {
        this.$emit('setLoading', true)
        const email = this.$store.getters.currentUser.email

        excelToDB(urlXls2json, [this.xls2json, email])
          .then(async response => {
            await this.$store.dispatch('client/serial-numbers/getAll')
            await this.$store.commit('setData', response)
            this.$emit('setLoading', false)
            this.reset()
          })
          .catch((err) => {
            this.reset()
            this.$message({
              type: 'error',
              message: err.message
            })
          })
      } else {
        this.$refs.file.click()
      }
    },
    handleFileUpload() {
      this.file = this.$refs.file.files[0]
      console.log(this.file)
      if (this.file) {
        this.text = 'Загрузить'
        this.color = 'success'
        this.formData.append('file', this.file)
      }
    },
    reset() {
      this.localLoading = false
      this.formData.delete('file')
      this.xls2json = null
      this.file = null
      this.text = 'Файл для импорта'
      this.color = 'blue-grey'
    }
  }
}
</script>
