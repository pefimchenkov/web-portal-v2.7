<template>
  <el-popover
    placement="right"
    trigger="click">
    <el-table :data="Balances">
      <el-table-column width="200" property="bankAccount" label="Рассчётный счёт"></el-table-column>
      <el-table-column width="120" label="Сумма">
        <template slot-scope="{ row: { balance } }">
            {{ balance.toLocaleString("ru") }}
        </template>
      </el-table-column>
      <el-table-column  property="currency" label="Валюта"></el-table-column>
    </el-table>
    <el-button size="mini" slot="reference">Баланс: {{ total.toLocaleString("ru", { style: "currency", currency: 'RUB' }) }}</el-button>
</el-popover>
</template>

<script>

  import { getAccountBalances } from "@/api/1c/atlas_1c"

  export default {
    data() {
      return {
        Balances: [],
        date: {
          date: new Date().toISOString().slice(0,19)
        }
      };
    },

    created() {
      getAccountBalances(this.date)
        .then(res => {
          this.Balances = res.data;
        })
        .catch(err => {
          this.$notify({ type: "error", message: err.message })
        })
    },

    computed: {
      total() {
        return this.Balances.reduce((acc, { balance }) => (acc + balance), 0);
      }
    }
    
  };
</script>