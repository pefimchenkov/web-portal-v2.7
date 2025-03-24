<template>
  <el-dialog
    :visible.sync="dialog"
    :close-on-click-modal="false"
    top="20vh"
    width="70%"
    @close="onCancel"
  >
    <el-card class="pa-3">

      <el-row type="flex" justify="center" align="center" :gutter="10">
        <el-col :span="18">
          <el-input
            label="Привязка строки выписки"
            readonly
            :value="item.bill_1c"
          />
        </el-col>
        <el-col :span="6">
          <el-input
            label="Сумма"
            readonly
            :value="cost_sum.toLocaleString('ru', { style: 'currency', currency: 'RUB' }) "
          />
        </el-col>
      </el-row>

      <el-row align="center" type="flex" class="mb-2">
        <el-col :span="8">
          <DatePicker
            :filter="filters.dates"
            @resetFilter="filters.dates = []"
            @updateFilter="updateDateFilter"
          />
        </el-col>
      </el-row>

      <el-row type="flex" justify="center" align="center" :gutter="10" class="mb-4">
        <el-col :span="18"> <!-- v-if="item.Buhs.split(',').length === pays.length" -->
          <v-autocomplete
            v-model="pays"
            multiple
            label="Выберите оплаты"
            :items="buhs"
            :item-text="(val) => transformPaysString(val)"
            :hint="`Присутствуют только задачи в статусе 'Оплата поставщику', фирма ТСД Сервис, форма оплаты - безналичный расчёт.`"
            persistent-hint
            return-object
            clearable
            outlined
            hide-details
            dense
          />
        </el-col>
        <el-col :span="6">
          <el-input
            label="Сумма"
            readonly
            style="height: 40px;"
            :value="pay_sum.toLocaleString('ru', { style: 'currency', currency: 'RUB' })"
          />
        </el-col>
      </el-row>

      <el-row type="flex" justify="center" align="middle" :gutter="10">
        <el-col :span="18">
          <el-button type="success" plain small @click="onSave(item)">Сохранить</el-button>
          <el-button type="danger" plain small @click="onCancel">Отмена</el-button>
        </el-col>

        <el-col :span="6">
          <el-input
            label="Разница"
            readonly
            :value="diff.toLocaleString('ru', { style: 'currency', currency: 'RUB' })"
          />
        </el-col>
      </el-row>

    </el-card>
  </el-dialog>
</template>

<script>

import { updateBuh } from '@/api/budget/income'
import DatePicker from '@/components/DatePicker'

import { rangeDateFilter } from '@/helpers/shared/index.js'

export default {

  components: {

    DatePicker

  },

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
      pays: [],
      filters: {
        dates: []
      }

    }
  },

  computed: {

    buhs() {
      const data = this.$store.getters['budget/pays/jira']
      console.log(data)
      const filtredData = data.filter(item => item.istatus === 'Оплата поставщику' && item.firma === 'ТСД-сервис' && item.forma?.includes('Безналичный'))
        .sort((a, b) => (new Date(b.date_plan) - new Date(a.date_plan)))
      const datesToTime = this.filters.dates.map(item => Math.round(new Date(item).getTime() / 1000.0))

      if (this.filters.dates.length === 0) return filtredData

      return filtredData.filter(item => {
        return rangeDateFilter(item.date_plan, datesToTime)
      })
    },

    cost_sum() {
      return this.item.bill_sum ? this.item.bill_sum : 0
    },

    pay_sum() {
      return this.pays.reduce((acc, item) => {
        return (item.total || item.sum || 0) + acc
      }, 0)
    },

    diff() {
      return this.item.bill_sum - this.pays.reduce((acc, item) => {
        return (item.total || item.sum || 0) + acc
      }, 0)
    }

  },

  watch: {

    show(val) {
      this.dialog = val

      this.pays = this.buhs.filter(buh => {
        if (this.item.Buhs) {
          return this.item.Buhs.split(',').includes(buh.ikey)
        }
      })
    }

  },

  async created() {
    if (this.buhs.length === 0) await this.$store.dispatch('budget/pays/jira')
  },

  methods: {

    onCancel() {
      this.$emit('closeDialog')
    },

    async onSave(item) {
      const { bill_1c } = item
      const ids = this.pays.map(item => item.id)

      try {
        const res = await updateBuh({ ids, bill_1c })
        this.$store.commit('setData', res.message)
        this.$emit('addUpdatedBuhs', ids)
        this.$emit('closeDialog')
      } catch (error) {
        console.log(error)
      }
    },

    updateDateFilter(val) {
      this.filters.dates = [...val]
    },

    truncString(val, n) {
      if (val) return val.length > n ? val.substring(0, n) + '... ' : val
    },

    transformPaysString(item) {
      return `${item.ikey}
      ( ${Math.round((item.total || item.sum)).toLocaleString()} р. | ${this.truncString(item.isummary, 45)})
      | ${item.pp}
      | ${new Date(item.date_plan).toLocaleDateString()}`
    }

  }
}

</script>
