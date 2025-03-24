<template>
  <v-container v-loading="show" grid-list-md text-center class="mt-4">

    <v-row align="center" justify="center">
      <input
        ref="fileInput"
        type="file"
        style="display:none"
        accept="image/*"
        @change="onFileChange"
      >

      <v-col cols="12">
        <img v-if="imageSRC" :src="imageSRC" height="350">
      </v-col>

      <v-col cols="12">
        <v-btn color="blue-grey" class="white--text" :disabled="$acl.not.check('Edit')" @click="triggerUpload">Выберите фото
          <v-icon right dark>cloud_upload</v-icon>
        </v-btn>
      </v-col>

      <v-col cols="12">
        <v-btn
          class="success"
          :disabled="!image || loading"
          :visible="false"
          :loading="loading"
          @click="uploadPhoto()"
        >Загрузить
        </v-btn>
      </v-col>

    </v-row>
  </v-container>
</template>

<script>

import Api from '@/services/Api'
import { AclRule } from 'vue-acl'

export default {
  // eslint-disable-next-line vue/require-prop-types
  props: ['id', 'name', 'photos', 'photosWidth'],

  data() {
    return {
      formData: new FormData(),
      image: null,
      imageSRC: '',
      show: false
    }
  },

  computed: {
    loading() {
      return this.$store.getters.loading
    },
    Edit() {
      return new AclRule('leadEngineer').or('admin').generate()
    }
  },

  methods: {
    uploadPhoto() {
      if (this.imageSRC) {
        this.show = true
        Api()
          .post('zip/uploadphoto', this.formData)
          .then(response => {
            delete response.data.success
            setTimeout(() => {
              this.photos.push(response.data.url)
              this.photosWidth.push(response.data)

              this.$store.dispatch('setData', response.data.success)
              this.$router.push('/zip/' + this.id)
              this.show = false
              this.reset()
            }, 1000)
          })
          .catch(() => {})
      }
    },
    triggerUpload() {
      this.$refs.fileInput.click()
    },
    onFileChange(event) {
      const file = event.target.files[0]
      if (file.size > 2048 * 2048) {
        event.preventDefault()
        this.$store.dispatch('setError', 'Размер файла превышает допустимый порог в 4 МБ!')
        return
      } else if (!file.type.match('image.*')) {
        event.preventDefault()
        this.$store.dispatch('setError', 'Выбранный файл не является изображением!')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        this.imageSRC = reader.result
      }
      reader.readAsDataURL(file)
      this.image = file
      this.formData.append('id', this.id)
      this.formData.append('image', this.image)
    },
    reset() {
      this.formData = new FormData()
      this.image = null
      this.imageSRC = ''
      this.imageWidth = ''
    }
  }
}
</script>
