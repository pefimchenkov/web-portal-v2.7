<template>
  <el-dialog
    v-loading="loading"
    :visible.sync="visible"
    :close-on-click-modal="false"
    destroy-on-close
    @close="close"
  >
    <el-card>
      <div class="text-center title mb-5">{{ options[action] }}</div>
      <slot />
      <Form
        :items="items"
        :form="form"
        :options="options"
        @onSubmit="onSubmit"
      />

    </el-card>
  </el-dialog>
</template>

<script>

export default {
  components: {
    Form: () => import('./form.vue')
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    show: {
      type: Boolean,
      required: true
    },
    items: {
      type: Array,
      default: () => {}
    },
    data: { // редактируемые данные из компонента для подстановки в Форму
      type: Object,
      default: () => {}
    },
    action: {
      type: String,
      required: true
    },
    options: {
      type: Object,
      default: () => {}
    },
  },
  data() {
    return {
      visible: false,
      form: {},
    }
  },

  watch: {
    show: {
      immediate: true,
      handler(val) {
        this.visible = val
      }
    },
    data: {
      immediate: true,
      handler(val) {
        // console.log('From Form: ', val)
        this.form = { ...val }
      }
    },
    form: {
      deep: true,
      /* immediate: true, */
      handler(newval) {
        this.$emit('watchForm', newval)
      }
    }
  },

  methods: {
    onSubmit(form) {
      this.$emit(`${this.action}`, form)
    },
    close() {
      this.$emit('closeDialog')
    },

  },
}
</script>

<style lang="scss" scoped>

</style>
