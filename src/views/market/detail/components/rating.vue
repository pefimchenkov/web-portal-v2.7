<template>

  <v-container v-loading="loading">

    <v-row justify="center">

      <v-col xs="12">

        <v-card
          class="elevation-2 mx-auto mt-5 grey--text text--darken-3"
        >
          <v-data-table
            :items="items"
            :headers="headers"
            dense
            calculate-widths
            no-data-text="Данных нет."
            sort-by="id"
            sort-desc
            :mobile-breakpoint="750"
            class="elevation-2"
            :footer-props="{
              itemsPerPageText: 'Строк на странице',
              itemsPerPageOptions: [10,50,250],
              showFirstLastPage: true
            }"
          >

            <template #[`item.rating`]="{ item }">
              <div v-html="showStars(item.rating)" />
            </template>

            <template #[`item.rating_author`]="{ item }">
              {{ getUserName(item.rating_author) }}
            </template>

            <template #[`item.rating_date`]="{ item }">
              {{ new Date(item.rating_date).toLocaleDateString('ru') }}
            </template>

            <template #[`item.actions`]="{ item }">
              <v-icon v-if="$acl.check('Admin')" small @click="delRating(item.id)">delete</v-icon>
            </template>

          </v-data-table>

        </v-card>

        <v-card
          class="elevation-2 mx-auto mt-5 grey--text text--darken-3"
        >
          <v-row justify="center" align="center">
            <v-col cols="6">
              <p
                class="text-center title"
              >
                Оцените качество данного элемента:
              </p>
              <v-card-text>

                <v-row justify="center" align="center">
                  <v-col cols="6">
                    <p class="pt-3 mt-0 mb-0"><span class="green--text">★ ★ ★ ★ ★</span> - отличное</p>
                    <p class="mt-0 mb-0"><span class="lime--text">★ ★ ★ ★</span> - хорошее</p>
                    <p class="mt-0 mb-0"><span class="yellow--text">★ ★ ★</span> - удовлетворительное</p>
                    <p class="mt-0 mb-0"><span class="orange--text">★ ★</span> - плохое</p>
                    <p class="mt-0 mb-0"><span class="red--text">★</span> - неприемлемое</p>
                  </v-col>
                  <v-col cols="6" class="text-subtitle-1 font-weight-bold text-right">
                    Средний рейтинг: {{ averageRating }}
                  </v-col>
                </v-row>

                <div class="text-center mt-2">
                  <v-rating
                    v-model="rating"
                    color="yellow darken-3"
                    background-color="grey darken-1"
                    large
                    clearable
                  />
                </div>
              </v-card-text>
            </v-col>
            <v-col cols="6">
              <p class="text-center title">Оставьте комментарий по качеству элемента (выставленной оценке).</p>

              <v-card-text>
                <div class="text-center mt-4">
                  <v-textarea
                    v-model="comment"
                    outlined
                    name="input-7-4"
                    clearable
                    :value="comment"
                  />
                </div>
              </v-card-text>
            </v-col>
          </v-row>

          <v-divider />

          <v-card-actions class="justify-center">
            <v-btn
              color="primary"
              :disabled="!(rating && comment)"
              :loading="loading"
              @click="addRating"
            >
              Добавить
            </v-btn>
          </v-card-actions>

        </v-card>

      </v-col>

    </v-row>

  </v-container>

</template>

<script>

import { get, add, remove } from '@/api/market-rating'

export default {

  props: {
    id: {
      type: String,
      required: true
    }
  },

  data() {
    return {

      rating: null,
      comment: null,
      loading: false,
      items: [],
      headers: [
        {
          text: 'Оценка',
          value: 'rating',
          divider: true
        },
        {
          text: 'Комментарий',
          value: 'comment',
          divider: true
        },
        {
          text: 'Автор',
          value: 'rating_author',
          divider: true
        },
        {
          text: 'Дата',
          value: 'rating_date',
          divider: true
        },
        {
          text: 'Действия',
          value: 'actions',
          align: 'center',
          divider: true
        }
      ]

    }
  },

  computed: {

    users() {
      return this.$store.getters.jira_users
    },

    currentUser() {
      return this.users.find(user => user.email === this.$store.getters["auth/currentUser"]?.email)
    },

    averageRating() {
      return this.items.length > 0
        ? (this.items.reduce((acc, item) => acc + item.rating, 0) / this.items.length).toFixed(2)
        : 0
    }

  },

  created() {
    this.getRating()
  },

  methods: {

    getRating() {
      get({ id: this.id })
        .then(data => {
          this.items = data
        })
    },

    addRating() {
      if (!this.comment && !this.rating) {
        return this.$store.commit('setError', 'Рейтинг и Комментарий обязательны к заполнению!')
      }

      this.loading = true

      const payload = {

        market_id: this.id,
        rating: this.rating,
        comment: this.comment,
        rating_author: this.currentUser?.email

      }

      add(payload)
        .then(res => {
          if (res.affectedRows > 0) {
            payload['id'] = res.insertId
            payload['rating_date'] = new Date().toISOString()
            this.items.unshift(payload)
            this.rating = null
            this.comment = null
          }
          this.loading = false
        })
        .catch(e => {
          this.$store.commit('setError', e.message)
        })
    },

    async delRating(id) {
      await this.$confirm('Вы уверены? Продолжаем?', 'ВНИМАНИЕ!', {
        confirmButtonText: 'Да',
        cancelButtonText: 'Нет',
        type: 'warning'
      })
        .then(() => {
          this.loading = true

          remove({ id })
            .then(res => {
              if (res.affectedRows > 0) {
                this.items = this.items.filter(item => item.id !== id)
              }
              this.loading = false
            })
        })
        .catch(e => {
          console.log(e)
        })
    },

    showStars(number) {
      switch (+number) {
        case 5: return '<span class="green--text">★ ★ ★ ★ ★</span>'
        case 4: return '<span class="lime--text">★ ★ ★ ★</span>'
        case 3: return '<span class="yellow--text">★ ★ ★</span>'
        case 2: return '<span class="orange--text">★ ★</span>'
        case 1: return '<span class="red--text">★</span>'
      }
    },

    getUserName(email) {
      return this.users.find(user => user.email === email)?.display_name
    }

  }
}

</script>

<style lang="scss" scoped>
</style>
