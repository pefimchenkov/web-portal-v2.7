<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div :class="{ manual: is_manual }">
    <el-popover
      placement="top"
      width="400"
      trigger="manual"
      v-model="visible"
      style="cursor: pointer"
    >
      <div style="display: flex">
        <el-select
          v-model="row[column]"
          size="mini"
          filterable
          clearable
          value-key="id"
          style="width: 300px; margin-right: 5px"
        >
          <el-option
            v-for="item in options[column]"
            :key="item?.id"
            :value="item"
            :label="item?.name || item?.value"
            :disabled="item.disabled"
          >
          </el-option>
        </el-select>

        <el-button @click="update" size="mini" icon="el-icon-check"></el-button>
        <el-button @click="visible = !visible" size="mini" icon="el-icon-close"></el-button>
      </div>

      <span slot="reference" @click="visible = !visible">
        <el-icon class="el-icon-edit"></el-icon>
        <span v-if="is_manual" :style="{ color: is_manual ? 'red' : '' }">*&nbsp;</span>
        {{ typeof row[column] === 'object' ? row[column].name : row[column] }}
      </span>
    </el-popover>
  </div>
</template>

<script>
export default {
  props: ["row", "column", "options"],
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
};
</script>

<style>
.hightlight {
  background-color: aliceblue !important;
}
</style>
