<!-- eslint-disable vue/no-mutating-props -->
<template>

  <el-popover
      placement="top"
      width="325"
      trigger="manual"
      v-model="visible"
      style="cursor: pointer"
    >
      <div style="display: flex; justify-content: space-between">
        <el-date-picker
          v-model="row[column]"
          format="dd.MM.yy"
          placeholder="Выбор даты"
          size="small"
          style="max-width: 190px"
        />

        <el-button @click="update" size="mini" icon="el-icon-check"></el-button>
        <el-button @click="visible = !visible" size="mini" icon="el-icon-close"></el-button>
      </div>

      <span slot="reference" @click="visible = !visible">
        <el-icon class="el-icon-edit"></el-icon>
        
        <span v-if="row['sale_date']" :style="{ 'color': checkDays(row[column])}">
          <span v-if="is_manual" style="color: red">* </span>
          {{ formatDate(row[column]) }}
        </span>
        <span v-else>
          <span :style="{ 'color': row['manual_pay_date'] ? 'green' : null }">
            <span v-if="is_manual" style="color: red">* </span>
            {{ formatDate(row[column]) }}
          </span>
        </span>

      </span>
    </el-popover>

</template>



<script>

export default {
  name: 'BudgetInvoicePayDate',
  props: ['row', 'column'],

  data() {
    return {
      visible: false,
    }
  },

  computed: {
    is_manual() {
      return this.row['is_manual']
    },
  },

  mounted() {
    this.checkDays(this.row[this.column])
  },

  methods: {

    formatDate(val) {
      if (!val) return 
      return val.toLocaleDateString("ru")
    },

    checkDays(date) {
      
      const nowTime = new Date().getTime();
      const dateTime = new Date(date).getTime();
      // const plusWeek = new Date(date).getTime() + (7 * 24 * 3600 * 1000)

      if (this.row['manual_pay_date']) return 'green'

      return Math.sign(dateTime - nowTime) === -1
        ? 'red'
        : dateTime - nowTime < (7 * 24 * 3600 * 1000)
          ? 'orange'
          : ''
    },

    change(val) {
      console.log(val);
    },

    update() {
      this.$emit("update-manual", {
        column: this.column,
        row: this.row,
        value: this.row[this.column],
      });
      this.visible = false;
    },

  }
}
</script>