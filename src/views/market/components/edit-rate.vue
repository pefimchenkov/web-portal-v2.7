<template>
  <v-dialog v-model="modal" width="500px">

    <template #activator="{on}">
      <v-icon
        v-if="$acl.check('Edit')"
        color="primary"
        small
        class="ml-3"
        v-on="on"
        @click="getRate()"
      >mdi-pencil
      </v-icon>
    </template>

    <el-card class="box-card">
      <v-row justify="center" align="center">
        <v-col cols="12">
          <v-card-title>Задать курс:</v-card-title>
          <v-card-text>
            <v-text-field v-model="editedDollar" name="dollar" label="Доллар" type="text" dense filled />
            <v-text-field v-model="editedEuro" name="euro" label="Евро" type="text" dense filled />
          </v-card-text>
        </v-col>

        <v-col cols="12" class="text-center">
          <el-button type="warning" plain @click="onCancel">Отмена</el-button>
          <el-button type="success" plain @click="onSave">Сохранить</el-button>
        </v-col>
      </v-row>
    </el-card>

  </v-dialog>
</template>

<script>

import Api from '@/services/Api'
import { eventBus } from '@/main.js'
import { AclRule } from 'vue-acl'

export default {

  props: {

    openEditDialog: {

      type: Boolean,
      default: false

    }

  },

  data() {
    return {

      modal: false,
      editedDollar: '',
      editedEuro: ''

    }
  },

  computed: {

    Edit() {
      return new AclRule('admin').generate()
    }

  },

  watch: {

    openEditDialog(val) {
      if (val) {
        this.getRate()
        this.modal = true
      }
    }

  },

  methods: {

    getRate() {
      this.$store.getters.currency.forEach(c => {
        if (c.id === 2) {
          this.editedEuro = c.rate
        }
        if (c.id === 3) {
          this.editedDollar = c.rate
        }
      })
    },

    onCancel() {
      this.editedDollar = ''
      this.editedEuro = ''
      this.modal = false
      this.$emit('closeDialog')
    },

    onSave() {
      if (this.editedDollar !== '' && this.editedEuro !== '') {
        Api()
          .post('zip_prices/setrate', [
            parseFloat(this.editedEuro),
            parseFloat(this.editedDollar)
          ])
          .then(response => {
            eventBus.$emit('Rate', [
              { name: 'Dollar', value: this.editedDollar },
              { name: 'Euro', value: this.editedEuro }
            ])
            this.$store.commit('setData', response.data)
            this.modal = false
            setTimeout(() => {
              window.location.replace('/market/list')
            }, 2000)
          })
          .catch(error => {
            this.$store.commit('setError', error.message)
          })
      }
    }

  }
}
</script>
