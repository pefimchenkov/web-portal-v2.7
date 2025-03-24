<!-- eslint-disable vue/no-mutating-props -->
<template>

  <el-popover
      placement="top"
      width="175"
      trigger="manual"
      v-model="visible"
      style="cursor: pointer"
    >
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <!-- <input
          type="checkbox"
          v-model="value"
          class="el-checkbox"
          style="border: 1px solid #c3c3c3; border-radius: 5px; padding: 5px 10px"
        /> -->

        <el-switch
          v-model="value"
        >
        </el-switch>

      

        <div>
          <el-button @click="update" size="mini" icon="el-icon-check"></el-button>
          <el-button @click="visible = !visible" size="mini" icon="el-icon-close"></el-button>
        </div>
      </div>

      <span slot="reference" @click="visible = !visible">
        <el-icon class="el-icon-edit"></el-icon>&nbsp;&nbsp;
        
        <i :class="`el-icon-${status} icon custom-${status}`"></i>

      </span>
    </el-popover>

</template>

<script>


export default {
  name: 'BudgetInvoiceNumStatus',
  props: ['row', 'column'],
  data() {
    return {
      visible: false
    }
  },

  computed: {
    status() {
      return this.value
        ? 'success'
        : 'error'
    },

    value: {
      get() {
        return Boolean(this.row[this.column]);
      },
      set(val) {
        // eslint-disable-next-line vue/no-mutating-props
        this.row[this.column] = Boolean(val);
      }
    }
  },

  mounted() {
    // console.log(this.row[this.column])
  },

  methods: {
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



<style scoped>
  .icon {
    font-size: 16px;

  }
  .custom-success {
    color: rgb(63, 204, 122)
  }
  .custom-error {
    color: rgb(156, 166, 168)
  }

</style>