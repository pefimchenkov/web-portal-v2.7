<template>
<!-- eslint-disable vue/no-mutating-props -->


  <div :class="{'manual': is_manual }">
    <el-popover
      placement="top"
      width="300"
      trigger="manual"
      v-model="visible"
      style="cursor: pointer"
      >
      <div style="display: flex;">
        <el-input
          size="mini"
          v-model="manualSum"
          style="margin-right: 5px;">
        </el-input>

        <el-button @click="update" size="mini" icon="el-icon-check"></el-button>
        <el-button @click="visible = !visible" size="mini" icon="el-icon-close"></el-button>
      </div>

      <span v-if="isAdmin" slot="reference" @click="visible = !visible">
        <el-icon class="el-icon-edit"></el-icon>
        <span v-if="is_manual" :style="{ 'color': is_manual ? 'red' : '' }">*&nbsp;</span>
        <span style="cursor: pointer">{{ +Sum.toLocaleString('ru') }}</span>
      </span>

      <span v-else slot="reference">
        <span v-if="is_manual" :style="{ 'color': is_manual ? 'red' : '' }">*&nbsp;</span>
        <span style="cursor: pointer">{{ +Sum.toLocaleString('ru') }}</span>
      </span>
    </el-popover>
  </div>
</template>

<script>


export default {
  name: 'BudgetInvoicePayments',
  props: ['row', 'column', 'incomingPays'],

  data() {
    return {
      visible: false,
      manualSum: null,
    }
  },

  watch: {
    visible(value) {

      if (value) {
        this.manualSum = this.Sum;
      }
    }
  },

  computed: {

    Sum() {
      return this.row[this.column]
        .map(i => i.paymentSum)
        .reduce((a, b) => { return a + b }, 0).toFixed(2)
    },

    TooltipText() {
      return this.row[this.column].map(item => {
        return `<div><span>${item?.paymentNum || item.contractorCreditName}</span> - <span>${new Date(item?.paymentDate || item?.subjectDate).toLocaleDateString('ru')}</span> - <span>${item.paymentSum }</span></div>`
      }).join("")
    },

    is_manual() {
      return this.row['is_manual']
    },

    isAdmin() {
      return this.$store.getters.isAdmin
      // return this.$store.getters.userRole.find(role => role === "admin");
    }

  },

  methods: {

    update() {
      const number = this.manualSum.replace(/ /g, "").replace(",", ".")

      if (isNaN(number)) return this.$notify({ type: "error", message: "Неверный формат вводимых данных!" })

      console.log(Number(number))


      this.$emit('update-manual', { column: this.column, row: this.row, value: Number(number) })
      this.visible = false;
    }
  }
}
</script>