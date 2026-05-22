<template>
  <v-container v-loading="loading" fluid :fill-height="photos.length === 0">
    <v-row v-if="photos.length === 0" justify="center" align="center">
      <v-col class="mt-5 mb-3" align="center">
        У данной позиции отсутствуют фотографии
      </v-col>

      <AddPhoto :id="id" :photos="photos" :photos-width="photosWidth" @loadPhotos="loadPhotos" />
    </v-row>

    <div v-else class="mt-5">

      <v-dialog v-model="dialog" :max-width="imageWidth">
        <v-img v-if="selectedImage" width="100%" :src="selectedImage" @click.stop="close()" />
      </v-dialog>

      <v-container>
        <v-row justify="center" align="center">
          <v-col
            v-for="photo in photos"
            :key="photo"
            class="d-flex child-flex"
            cols="3"
          >
            <v-card class="d-flex" style="cursor: pointer">
              <v-img
                :src="photo"
                :lazy-src="photo"
                aspect-ratio="1"
                @click="zoom(photo)"
              >
                <template #placeholder>
                  <v-layout fill-height align-center justify-center ma-0>
                    <v-progress-circular
                      indeterminate
                      color="grey lighten-5"
                    />
                  </v-layout>
                </template>
                <span style="color: transparent">{{ photo }}</span>
              </v-img>

              <v-badge class="zIndex" overlap color="transoarent">
                <template #badge>
                  <v-icon
                    :slot="$acl.check('Edit') ? 'badge' : ''"
                    class="cursor_btn error"
                    dark
                    :data-photoname="getPhotoName(photo)"
                    size="25"
                    @click="deleteImg($event)"
                  >delete_forever</v-icon>
                </template>
              </v-badge>

            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <AddPhoto :id="id" :photos="photos" :photos-width="photosWidth" @loadPhotos="loadPhotos" />
    </div>
  </v-container>
</template>

<script>

import AddPhoto from './add-photo'
import Api from '@/services/___Api'

export default {

  components: {
    AddPhoto
  },

  props: {
    id: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      loading: false,
      dialog: false,
      photos: [],
      photosWidth: [],
      selectedImage: null,
      imageWidth: null
    }
  },

  async created() {
    if (this.id) {
      await Api()
        .post('market/getimages', [this.id])
        .then(response => {
          if (!response.data.error && response.data.length !== 0) {
            response.data.forEach(data => {
              this.photos.push(data.url)
            })
            this.photosWidth = response.data
            this.$store.commit('setLoading', false)
          } else if (response.data.length === 0) {
            this.$store.commit('setLoading', false)
          } else {
            this.$store.commit('setLoading', false)
          }
        })
    }
  },

  methods: {

    zoom(url) {
      this.open()
      this.selectedImage = url
      this.photosWidth.forEach(photo => {
        if (photo.url === url) {
          this.imageWidth = parseInt(photo.width)
        }
      })
    },

    open() {
      this.dialog = true
    },

    close() {
      this.dialog = false
      this.selectedImage = null
    },

    async deleteImg(e) {
      await this.$confirm('Вы уверены? Продолжаем?', 'ВНИМАНИЕ!', {
        confirmButtonText: 'Да',
        cancelButtonText: 'Нет',
        type: 'warning'
      })
        .then(() => {
          this.loading = true
          this.show = true
          const photoName = e.target.attributes['data-photoname'].value
          Api()
            .post('market/delImg', [this.id, photoName])
            .then(response => {
              this.photos.forEach((photo, index) => {
                if (photo === response.data.url) {
                  setTimeout(() => {
                    this.photos.splice(index, 1)
                    this.show = false
                    this.$store.commit('setData', 'Изображение ' + photoName + ' успешно удалёно!')
                    this.loading = false
                  }, 1000)
                }
              })
            })
        })
        .catch(e => console.log(e))
    },

    getPhotoName(data) {
      return data.split('/').pop()
    },

    loadPhotos(payload) {
      console.log(payload)

      const { url, data, success } = payload

      this.photos.push(url)
      this.photosWidth.push(data)
      this.$store.dispatch('setData', success)

      this.$router.push('/market/' + this.id)
    }

  }

}
</script>

<style scoped>

  .zIndex {
    z-index:1;
  }

</style>
