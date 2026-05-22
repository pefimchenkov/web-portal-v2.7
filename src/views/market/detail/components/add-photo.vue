<template>
  <v-container v-loading="loading" grid-list-md text-center fluid>

    <v-row justify="center" align="center">
      <input
        ref="fileInput"
        type="file"
        style="display: none"
        accept="image/*"
        @change="onFileChange"
      >
      <v-col cols="12" class="mt-3">

        <v-badge
          v-if="imageSRC"
          color="error"
          icon="mdi-close"
          overlap
        >
          <template #badge>
            <v-icon
              style="cursor: pointer"
              @click="reset()"
            >mdi-close
            </v-icon>
          </template>
          <img :src="imageSRC" height="350">
        </v-badge>

      </v-col>

      <v-col cols="12">
        <v-btn
          color="blue-grey"
          class="white--text"
          :disabled="$acl.not.check('Edit')"
          @click="triggerUpload"
        >Выберите фото
          <v-icon right dark>cloud_upload</v-icon>
        </v-btn>
      </v-col>

      <v-col cols="12">
        <v-btn
          v-if="image || loading"
          :visible="false"
          :loading="loading"
          class="success"
          @click="uploadPhoto()"
        >Загрузить
        </v-btn>
      </v-col>

    </v-row>

  </v-container>
</template>

<script>
import Api from '@/services/___Api'
import { AclRule } from 'vue-acl'

export default {
  props: {
    id: {
      type: String,
      required: true
    },

    photos: {
      type: Array,
      required: true
    },

    photosWidth: {
      type: Array,
      required: true
    }
  },

  data() {
    return {
      formData: new FormData(),
      image: null,
      imageSRC: '',
      loading: false
    }
  },

  computed: {
    Edit() {
      return new AclRule('leadEngineer').or('admin').generate()
    }
  },

  methods: {
    uploadPhoto() {
      this.loading = true

      if (this.imageSRC) {
        Api()
          .post('market/uploadphoto', this.formData)
          .then((response) => {
            delete response.data.success
            setTimeout(() => {
              this.$emit('loadPhotos', {
                url: response.data.url,
                data: response.data,
                success: response.data.success
              })

              // this.photos.push(response.data.url)
              // this.photosWidth.push(response.data)
              // this.$store.dispatch('setData', response.data.success)

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
      console.log(file)
      if (file.size > 2048 * 2048) {
        event.preventDefault()
        this.$store.dispatch(
          'setError',
          'Размер файла превышает допустимый порог в 4 МБ!'
        )
        return
      } else if (!file.type.match('image.*')) {
        event.preventDefault()
        this.$store.dispatch(
          'setError',
          'Выбранный файл не является изображением!'
        )
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        this.imageSRC = reader.result
      }
      reader.readAsDataURL(file)
      this.image = file
      console.log(this.id)
      this.formData.append('id', this.id)
      this.formData.append('image', this.image)
    },

    reset() {
      this.formData = new FormData()
      this.image = this.imageSRC = this.imageWidth = null
      this.loading = false
    }
  }
}
</script>
