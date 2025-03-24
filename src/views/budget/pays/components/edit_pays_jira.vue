<template>
  <el-dialog
    :visible.sync="dialog"
    :close-on-click-modal="false"
    top="20vh"
    width="70%"
    @close="onCancel"
  >

    <el-card class="pa-3" shadow="never">

      <el-row type="flex" justify="center" align="middle" :gutter="12" class="mb-3">
        <el-col :span="18">
          <el-input
            label="Привязка оплаты"
            readonly
            :value="item.ikey"
          />
        </el-col>
        <el-col :span="6">
          <el-input
            label="Сумма"
            readonly
            :value="cost_sum"
          />
        </el-col>

      </el-row>

      <el-row type="flex" justify="center" align="middle" :gutter="12" class="mb-4">
        <el-col :span="18">
          <v-autocomplete
            v-model="pays"
            multiple
            auto-select-first
            label="Строки выписки"
            :items="stroki"
            :item-text="(item) => (item.pay_1c + ' от ' + new Date(item.pay_date).toLocaleDateString() + ' - ' + (item.total || item.pay_sum) + ' р. - ' + item.client_1c)"
            return-object
            clearable
            outlined
            dense
            hide-details
          />
        </el-col>
        <el-col :span="6">
          <el-input
            label="Сумма"
            readonly
            :value="pay_sum.toLocaleString('ru')"
          />
        </el-col>
      </el-row>

      <el-row type="flex" justify="center" align="middle" :gutter="12">
        <el-col :span="18">
          <el-button v-if="isSaveBtnShow" type="success" plain @click="onSave(item)">Сохранить</el-button>
          <el-button type="danger" plain @click="onCancel">Отмена</el-button>
        </el-col>
        <el-col :span="6">
          <el-input
            label="Разница"
            readonly
            :value="diff.toLocaleString('ru')"
          />
        </el-col>
      </el-row>

    </el-card></el-dialog></template>

<script>

import { updateStroki } from '@/api/budget/pays'

export default {

  props: {

    show: {

      type: Boolean,
      default: false

    },

    item: {

      type: Object,
      default: () => {}

    }

  },

  data() {
    return {

      dialog: false,
      pays: []

    }
  },

  computed: {

    stroki() {
      const data = this.$store.getters['budget/pays/oneC']
      return data.sort((a, b) => (b.id - a.id))
    },

    cost_sum() {
      return this.item.total ? this.item.total.toLocaleString('ru') : 0
    },

    pay_sum() {
      return this.pays.reduce((acc, item) => {
        return (item.pay_sum || 0) + acc
      }, 0)
    },

    diff() {
      return this.item.total - this.pays.reduce((acc, item) => {
        return (item.pay_sum || 0) + acc
      }, 0)
    },

    isSaveBtnShow() {
      return this.pays.length > 0
        ? this.diff >= 0
        : false
    }

  },

  watch: {

    show(val) {
      this.dialog = val
      this.pays = this.stroki.filter(str => {
        if (this.item.stroki) return this.item.stroki.split(' ').includes(str.pay_1c)
      })
    }

  },

  methods: {

    onCancel() {
      this.$emit('closeDialog')
    },

    async onSave(item) {
      const { ikey } = item
      const pays = this.pays.map(item => item.pay_1c)

      try {
        const res = await updateStroki({ pays, ikey })
        this.$store.commit('setData', res.message)
        this.$emit('addUpdatedStroki', pays)
        this.$emit('closeDialog')
      } catch (error) {
        console.log(error)
      }
    }

  }
}

</script>
