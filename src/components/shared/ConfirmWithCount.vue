<template>
  <el-dialog :visible.sync="dialog" :width="options.width" :style="{ zIndex: options.zIndex }" @keydown.esc="cancel">
        <h4 class="mb-3">{{ title }}</h4>

        <el-input v-model="Count" type="number" />
        <!-- <div v-show="!!message" class="py-5">{{ message }}
          
        </div> -->

        <div class="pt-0">
          <el-divider />
          <el-button type="success" @click.native="agree">Да</el-button>
          <el-button type="warning" @click.native="cancel">Отмена</el-button>
        </div>
  </el-dialog>
</template>

<script>

export default {
  data: () => ({
    dialog: false,
    resolve: null,
    reject: null,
    message: null,
    title: null,
    Count: null,
    item: null,
    options: {
      color: 'primary',
      width: '20%',
      zIndex: 200
    }
  }),
  methods: {
    open(title, message, item, options) {
      this.dialog = true
      this.title = title
      this.message = message
      this.item = item
      this.options = Object.assign(this.options, options)
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },
    agree() {
      if (this.Count) {
        this.resolve(true)
        this.$emit('Count', {
          Count: this.Count,
          marketid: this.item
        })
        this.Count = null
        this.dialog = false
      } else {
        this.$store.commit('setError', 'Не выбрано кол-во!')
      }
    },
    cancel() {
      this.resolve(false)
      this.dialog = false
    }
  }
}
</script>
