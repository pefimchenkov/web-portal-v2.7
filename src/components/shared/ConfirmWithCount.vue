<template>
  <el-dialog :visible.sync="dialog" :width="options.width" :style="{ zIndex: options.zIndex }" @keydown.esc="cancel">
    <el-card>
      <v-toolbar dark :color="options.color" dense flat>
        <v-toolbar-title class="white--text">{{ title }}</v-toolbar-title>
      </v-toolbar>
      <v-card-text v-show="!!message" class="pa-4">{{ message }}
        <v-text-field v-model="Count" placeholder="Выберите кол-во:" type="number" />
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer />
        <v-btn color="primary darken-1" text @click.native="agree">Да</v-btn>
        <v-btn color="grey" text @click.native="cancel">Отмена</v-btn>
      </v-card-actions>
    </el-card>
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
