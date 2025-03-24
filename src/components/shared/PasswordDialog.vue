<template>
  <div>
    <el-dialog :visible="dialogVisible" @ title="Для продолжения операции введите свой пароль">
      <el-input v-model="password" type="password" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="close">Отмена</el-button>
        <el-button type="primary" @click="confirm">Подтвердить</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    visible: Boolean
  },
  data() {
    return {
      password: '',
      dialogVisible: false
    }
  },
  watch: {
    visible(val) {
      return (this.dialogVisible = val)
    }
  },
  methods: {
    close() {
      this.dialogVisible = false
      this.password = null
      this.$emit('dialogClose', false)
    },
    confirm() {
      this.dialogVisible = false
      this.$emit('dialogClose', this.password)
      this.password = null
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
