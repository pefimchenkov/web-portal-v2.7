<template>
  <div>
    <el-dialog :visible.sync="dialog" :close-on-click-modal="false" title="Ручное добавление ЗИП" top="30vh">

      <el-card class="pa-3 mx-auto" shadow="naver">

        <v-autocomplete
          ref="market"
          v-model="zip"
          :items="Market"
          :item-text="formattedMarket"
          label="Маркет *"
          validation
          required
          clearable
          outlined
          return-object
        />
        <v-autocomplete
          ref="engineer"
          v-model="engineer"
          :items="engineers"
          item-text="display_name"
          label="Инженер *"
          required
          clearable
          outlined
          return-object
        />
        <v-textarea
          v-model="comment"
          label="Комментарий:"
          auto-grow
          outlined
          rows="3"
          row-height="25"
        />
        <v-spacer />

        <div class="text-center">
          <el-button
            type="danger"
            plain
            @click="close"
          >Отменить</el-button>

          <el-button
            type="success"
            plain
            :disabled="localloading"
            :loading="localloading"
            @click.native="save()"
          >Сохранить</el-button>
        </div>

      </el-card>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {

  props: {

    engineers: {

      type: Array,
      required: true

    }

  },

  data() {
    return {

      zip: {},
      engineer: {},
      comment: '',
      type: null,
      localloading: false,
      dialog: false,
      resolve: null,
      reject: null

    }
  },

  computed: {
    ...mapGetters({ Market: 'market_new/market' }),

    user() {
      return this.$store.getters["auth/currentUser"]?.email
    }
  },

  methods: {

    open(type) {
      this.dialog = true
      this.type = type
    },

    close() {
      this.dialog = false
      this.localloading = false
      this.engineer = {}
      this.zip = {}
      this.type = null
    },

    save() {
      if (Object.keys(this.zip).length > 0 && Object.keys(this.engineer).length > 0) {
        this.localloading = true
        this.$store
          .dispatch('manualAddZip', {
            zip: this.zip,
            type: this.type,
            engineer: this.engineer,
            user: this.user,
            comment: this.comment
          })
          .then(insertId => {
            console.log(insertId)
            this.$store.commit(
              'setData',
              'Новый ЗИП (id ' + insertId + ') успешно добавлен.'
            )
            this.close()
          })
      } else {
        this.$store.commit('setError', 'Не все поля заполнены!')
      }
    },

    formattedMarket(item) {
      return (item.marketNAME + ' - (' + item.marketPN + ') - ' + '[' + item.marketART + ']')
    }

  }
}
</script>

<style lang="scss" scoped></style>
