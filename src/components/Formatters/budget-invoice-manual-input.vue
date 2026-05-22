<!-- eslint-disable vue/no-mutating-props -->
<template>

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
          v-model="row[column]"
          @change="change"
          style="margin-right: 5px;">
        </el-input>
        <el-button @click="update" size="mini" icon="el-icon-check">
        </el-button>
        <el-button @click="visible = !visible" size="mini" icon="el-icon-close">
        </el-button>
      </div>

      <span v-if="isAdmin" slot="reference" @click="visible = !visible">
        <el-icon class="el-icon-edit"></el-icon>
        <span v-if="is_manual" :style="{ 'color': is_manual ? 'red' : '' }">*&nbsp;</span>
        {{ payload }}
      </span>
      <span v-else slot="reference">
        <span v-if="is_manual" :style="{ 'color': is_manual ? 'red' : '' }">*&nbsp;</span>
        {{ payload }}
      </span>
    </el-popover>
  </div>

</template>

<script>

export default {
  props: ['row', 'column'],
  data() {
    return {
      visible: false
    }
  },

  computed: {
    payload() {
      return this.column === "sm_percent" || this.column === "om_percent" || this.column === "profit"
        ? this.row[this.column] ? this.row[this.column] + '%' : null
        : this.column === "sm_sum" || this.column === "om_sum"
          ? this.row[this.column] ? Number(this.row[this.column]).toLocaleString("ru") : null
          : this.row[this.column]
    },

    is_manual() {
      return this.row['is_manual']
    },

    isAdmin() {
      return this.$store.getters.isAdmin
      //return this.$store.getters.userRole.find(role => role === "admin");
    }

  },


  methods: {
    change(val) {
      console.log(val)
    },

    update() {
      this.$emit('update-manual', { column: this.column, row: this.row, value: this.row[this.column] })
      this.visible = false;
    }
  }


}
</script>

<style>

  .hightlight {
    background-color: aliceblue !important;
  }

</style>