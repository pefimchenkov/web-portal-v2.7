<template>
  <el-dialog
    :visible.sync="dialog"
    :close-on-click-modal="false"
    top="20vh"
    width="70%"
    @close="onCancel"
  >

    <el-card class="pa-3" shadow="never">

      <el-row type="flex" justify="center" align="middle" :gutter="12" class="mb-4">
        <el-col :span="18">
          <el-input
            label="Привязка строки выписки"
            readonly
            :value="item.pay_1c"
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
            label="Оплаты"
            :items="buhs"
            :item-text="(item) => (item.ikey + ' (Cумма: ' + (item.total || item.sum) + ' руб | ' + item.isummary + ')')"
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
            :value="pay_sum"
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

    </el-card>
  </el-dialog>
</template>

<script>

import { updateBuh } from '@/api/budget/pays'

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

    buhs() {
      const data = this.$store.getters['budget/pays/jira']
      return data.sort((a, b) => (b.id - a.id))
    },

    cost_sum() {
      return this.item.pay_sum ? this.item.pay_sum.toLocaleString('ru') : 0
    },

    pay_sum() {
      return this.pays.reduce((acc, item) => {
        return (item.total || item.sum || 0) + acc
      }, 0)
    },

    diff() {
      return this.item.pay_sum - this.pays.reduce((acc, item) => {
        return (item.total || item.sum || 0) + acc
      }, 0)
    },

    isSaveBtnShow() {
      return this.pays.length === 1
        ? this.diff <= 0
        : this.diff === 0
    }

  },

  watch: {

    show(val) {
      this.dialog = val
      this.pays = this.buhs.filter(buh => {
        if (this.item.buh) {
          return this.item.buh.split(',').includes(buh.ikey)
        }
      })
    }

  },

  methods: {

    onCancel() {
      this.$emit('closeDialog')
    },

    async onSave(item) {
      const { pay_1c } = item
      const ids = this.pays.map(item => item.id)

      try {
        const res = await updateBuh({ ids, pay_1c })
        this.$store.commit('setData', res.message)
        this.$emit('addUpdatedBuhs', ids)
        this.$emit('closeDialog')
      } catch (error) {
        console.log(error)
      }
    }

  }
}

</script>
