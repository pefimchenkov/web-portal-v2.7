<template>
  <div>
    <Confirm ref="confirm" />

    <v-card v-loading="loading" class="mx-auto mt-3">
      <v-toolbar class="elevation-2 grey lighten-3" dense>
        <v-toolbar-title><span :style="`color: #1976d2`">Подписка:</span></v-toolbar-title>
        <v-spacer />

        <v-checkbox
          v-model="weekly"
          hide-details
          class="shrink ml-2 mt-0"
        />
        <span>Еженедельная:</span>
        <v-spacer />

        <v-checkbox
          v-model="enable"
          hide-details
          class="shrink ml-2 mt-0"
        />
        <span>Разовая:</span>
        <v-menu
          ref="menu"
          v-model="menu"
          :close-on-content-click="false"
          :return-value.sync="date"
          transition="scale-transition"
          offset-y
          min-width="auto"
          :disabled="!enable"
        >
          <template #activator="{ on, attrs }">
            <v-text-field
              v-model="date"
              prepend-icon="mdi-calendar"
              readonly
              v-bind="attrs"
              class="mt-5"
              style="max-width: 130px; margin: 23px 0 0 10px"
              :disabled="!enable"
              v-on="on"
            />
          </template>
          <v-date-picker v-model="date" no-title scrollable locale="Ru">
            <v-spacer />
            <v-btn text color="primary" @click="menu = false"> Отмена </v-btn>
            <v-btn text color="primary" @click="$refs.menu.save(date)">
              Да
            </v-btn>
          </v-date-picker>
        </v-menu>
        <v-spacer />
        <v-btn small color="primary" @click.stop="save()">Сохранить</v-btn>
      </v-toolbar>
    </v-card>
  </div>
</template>

<script>
import Confirm from '@/components/shared/Confirm'

export default {
  components: {
    Confirm
  },
  props: {
    crmData: {
      type: [Array, Object],
      required: true
    }
  },
  data() {
    return {
      dialog: false,
      loading: false,
      weekly: false,
      enable: false,
      date: null,
      menu: false
    }
  },
  watch: {
    enable(val) {
      if (val) {
        this.date = this.crmData.fields
          ? this.crmData.fields.duedate
          : new Date().toISOString().substr(0, 10)
        this.weekly = false
      } else {
        this.date = null
      }
    },
    weekly(val) {
      if (val) {
        this.date = null
        this.enable = false
      }
    },
    crmData(val) {
      this.fillData(val)
    }
  },
  async created() {
    this.pause(1000)
    this.fillData(this.crmData)
  },
  methods: {
    pause(t) {
      this.loading = true
      return setTimeout(() => {
        return (this.loading = false)
      }, t)
    },
    async save() {
      const activate = !this.weekly && this.date === null
        ? await this.$refs.confirm.open('Деактивация подписки', 'Делаем?', { color: 'red' })
        : await this.$refs.confirm.open('Активация подписки', 'Делаем?', { color: 'orange' })

      if (activate) {
        this.$store
          .dispatch('jira/setCrmSubscribe', { id: this.crmData.key, weekly: this.weekly, date: this.date }, { root: true })
          .then(() => {
            !this.weekly && this.date === null
              ? this.$store.commit('setData', 'Подписка успешно деактивирована.')
              : this.$store.commit('setData', 'Подписка успешно активирована.')
          })
      }
    },
    fillData(val) {
      if (Object.keys(val).length > 1) {
        if (val.fields.customfield_24004 !== null && val.fields.customfield_24004.id === '22307') {
          this.weekly = true
          this.date = null
        }
      }
      if (Object.keys(val).length > 1) {
        if (val.fields.customfield_24004 !== null && val.fields.customfield_24004.id === '22308') {
          this.enable = true
          this.weekly = false
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
