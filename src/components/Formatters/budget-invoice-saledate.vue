<!-- eslint-disable vue/no-mutating-props -->
<template>
  <!-- <el-tooltip content="Отредактировано вручную" placement="top">
    <div :style="{ 'color': row['manual_sale_date'] ? 'green' : '' }">
      {{ row[column] ? new Date(row[column]).toLocaleDateString("ru") : null }}
    </div>
  </el-tooltip> -->

  <div :class="{ manual: is_manual }">
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
        <span v-if="is_manual" :style="{ color: is_manual ? 'red' : '' }">*&nbsp;</span>
        <span :style="{ 'color': row['manual_sale_date'] ? 'green' : '' }">
          {{ row[column] ? new Date(row[column]).toLocaleDateString("ru") : null }}
        </span>
      </span>
    </el-popover>
  </div>
</template>

<script>

export default {
  name: 'BudgetInvoiceSaleDate',
  props: ['row', 'column'],
  data() {
    return {
      visible: false,
    };
  },

  computed: {
    is_manual() {
      return this.row["is_manual"];
    },
  },


  methods: {
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
  },

}
</script>