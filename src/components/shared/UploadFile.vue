
<template>
  <div>
    <v-layout row wrap>
      <v-chip v-if="file" class="mr-5">
        Имя файла: {{ file.name }}
      </v-chip>
      <v-chip v-else-if="xls2json">
        Файл загружен на сервер!
      </v-chip>
      <v-flex class="mr-2">
        <v-btn
          ref="fileBtn"
          :color="color"
          class="white--text"
          :disabled="localLoading"
          :loading="localLoading"
          @click="triggerUpload()"
        >
          {{ text }}
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
      </v-flex>
    </v-layout>
  </div>
</template>
<script>

import { uploadData, excelToDB } from '@/api/zip'

export default {
  props: {
    id: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      formData: new FormData(),
      file: null,
      xls2json: null,
      text: 'Файл для импорта',
      color: 'blue-grey',
      localLoading: false
    }
  },
  methods: {
    triggerUpload() {
      let urlUpload = ''
      let urlXls2json = ''
      let location = ''
      if (this.id === 'ALIASES') {
        urlUpload = '/specprices/upload_file'
        urlXls2json = '/specprices/json_to_db'
        location = 'aliases'
      }
      if (this.id === 'SN') {
        urlUpload = '/serial_numbers/upload_file'
        urlXls2json = '/serial_numbers/json_to_db'
        location = '/sn'
      }
      if (this.file && this.id) {
        this.localLoading = true

        uploadData(urlUpload, this.formData)
          .then((response) => {
            if (response.data.filename) {
              setTimeout(() => {
                this.xls2json = response.data.filename
                this.file = null
                this.localLoading = false
                this.text = 'Импорт Excel в БД'
                this.color = 'warning'
              }, 2000)
            } else {
              setTimeout(() => {
                this.$store.commit('setData', response.data.mess)
                this.formData.delete('file')
                this.localLoading = false
                this.file = null
                this.text = 'Файл для импорта'
                this.color = 'blue-grey'
              }, 2000)
            }
          })
          .catch((error) => {
            this.$store.commit('setError', error.message)
          })
      } else if (this.xls2json) {
        this.localLoading = true
        const email = this.$store.getters.currentUser.email

        excelToDB(urlXls2json, [this.xls2json, email])
          .then((response) => {
            if (response.data.success === false) {
              this.$store.commit('setError', response.data.error.message)
              this.localLoading = false
            } else {
              this.$store.commit('setData', response.data)
              setTimeout(() => {
                this.$router.push(location)
              }, 2000)
            }
          })
          .catch((error) => {
            console.log(error.message)
            this.localLoading = false
            this.$store.commit('setError', error.message)
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
    }
  }
}
</script>
