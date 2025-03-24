<template>

  <v-simple-table>
    <template #default>
      <thead>
        <tr>
          <th class="text-left">Сумма</th>
          <th class="text-left">Способ получения</th>
          <th class="text-left">Плательщик</th>
          <th class="text-left">Дата</th>
          <th class="text-left">Комментарий</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in detail" :key="item.DATE">
          <td width="150">+ {{ item.SUM | ruFormatCurrency }}</td>
          <td>{{ item.COST_ITEM | translateFinanceMethod }}</td>
          <td>{{ item.CASH }}</td>
          <td>{{ new Date(item.DATE).toLocaleDateString('ru') }}</td>
          <td>{{ item.COMMENT }}</td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>

</template>

<script>
import { getMonthNameByNumber } from '@/filters/getMonthNameByNumber'
import { ruFormatCurrency } from '@/filters/ruFormatCurrency'
import { translateFinanceMethod } from '@/filters'

export default {
  filters: {
    getMonthNameByNumber,
    ruFormatCurrency,
    translateFinanceMethod
  },
  props: {
    payload: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      loader: false
    }
  },

  computed: {
    detail() {
      return this.$store.state.finance.employeeSalaryDetail.filter(item => item.PERIOD === this.payload.PERIOD && item.YEAR === this.payload.YEAR)
    }
  },
  created() {
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
.card-panel-icon-wrapper {
  position: relative;
  left: -30px;
  top: -30px;
  transition: all 0.38s ease-out;
  border-radius: 6px;
}

.card-panel-icon {
  float: left;
  border-radius: 6px;
  font-size: 42px;
  color: rgb(255, 255, 255);
  background: #32c976;
  padding: 10px;
}
</style>
