<template>
  <div>
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      :label-width="options.labelWidth"
      size="mini"
    >
      <el-row>
        <div
          v-for="item in items"
          :key="item.value"
        >
          <el-col v-if="checkDivider(item)" :span="24">
            <el-divider content-position="left">
              <span style="font-weight: 600">{{ checkDivider(item) }}</span>
            </el-divider>
          </el-col>
          <el-col
            :span="(item.span || 24)"
          >
            <el-form-item
              v-if="isShow(item)"
              :label="item.label"
              :prop="item.value"
            >
              <keep-alive>
                <component
                  :is="item.type"
                  :id="item.key"
                  :items="item.data"
                  :form="form"
                  :value="item.value"
                  :name="item.name"
                  :multiple="item.multiple"
                  :options="item.options"
                  :width="item.width"
                  :disabled="item.disabled"
                />
              </keep-alive>
            </el-form-item>
          </el-col>
        </div>
      </el-row>

    </el-form>
    <div class="text-center">
      <el-button
        type="info"
        plain
        @click="reset('form')"
      >
        Очистить
      </el-button>
      <el-button
        type="success"
        plain
        @click="submit('form')"
      >Сохранить
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  components: {
    customInput: () => import('./input.vue'),
    customInputNumber: () => import('./input-number.vue'),
    customSelect: () => import('./select.vue'),
    customRemoteSelect: () => import('./remote-select.vue'),
    customDateTime: () => import('./datetime.vue'),
    customDate: () => import('./date.vue'),
    customSwitcher: () => import('./switcher.vue'),
    customCheckbox: () => import('./checkbox.vue')
  },

  props: {
    items: {
      type: Array,
      required: true
    },
    form: {
      type: Object,
      default: () => {}
    },
    options: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      ref: 'form',
      rules: {},
    }
  },

  created() {
    this.setRules(this.items)
  },


  methods: {
    isShow(item) {
      return item.type && item.visible
    },
    submit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$emit('onSubmit', this.form)
        } else {
          console.log('Ошибка валидации данных!')
        }
      })
    },
    reset() {
      for (const field in this.form) {
        // eslint-disable-next-line vue/no-mutating-props
        if (Array.isArray(this.form[field])) this.form[field] = []
        // eslint-disable-next-line vue/no-mutating-props
        else this.form[field] = null
      }
      // this.$refs[formName].clearValidate()
    },
    setRules(items) {
      items.forEach(item => {
        this.rules[item.value] = []
        /* Обязательно к заполнению */
        if (item.rules['required']) this.rules[item.value].push({ required: true, message: 'Обязательно!', trigger: 'blur' })
        /* Мин. и макс длинна */
        if (item.rules['length']) {
          this.rules[item.value].push(
            { min: item.rules['length'][0], max: item.rules['length'][1], message: `Длинна - от ${item.rules['length'][0]} до ${item.rules['length'][1]} символов!`, trigger: 'blur' }
          )
        }
        /* Число */
        if (item.rules['number']) this.rules[item.value].push({ type: 'number', message: 'Должно быть число!' })
        /* Custom validator rule */
        if (item.rules['validator']) {
          this.rules[item.value].push({ validator: item.rules['validator'], trigger: 'blur' })
        }
      })
    },
    checkDivider(item) {
      if (!item.visible) return false
      const obj = this.options.dividerAfter?.find(i => i.value === item.value)
      return obj
        ? obj.text
        : false
    },
  },
}
</script>

<style lang="scss" scoped>

</style>
