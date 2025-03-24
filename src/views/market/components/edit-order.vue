<template>

  <el-dialog
    :visible.sync="dialogFormVisible"
    max-width="800px"
    top="30vh"
    append-to-body
    center
    :close-on-click-modal="false"
    :title="`Редактирование заказа № ${id}`"
    @close="close"
  >

    <el-card shadow="never">
      <v-card-text>
        <el-form ref="ruleForm" :model="form" :rules="rules">

          <el-form-item label="Комментарий" :label-width="formLabelWidth" prop="comment">
            <el-input
              v-model="form.comment"
              type="textarea"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="Тип цены" :label-width="formLabelWidth" prop="price_type">
            <el-select v-model="form.price_type" placeholder="Выберите тип">
              <el-option label="Стандартная" :value="1" />
              <el-option label="Партнёрская" :value="2" />
              <el-option label="Оптовая" :value="3" />
            </el-select>
          </el-form-item>

          <el-form-item class="total" label="Всего:" :label-width="formLabelWidth">
            <h4>{{ form.total ? form.total.toLocaleString('ru', { style: 'currency', currency: 'RUB' }) : 'нет данных' }}</h4>
          </el-form-item>

          <el-form-item class="discount" label="Скидка на заказ:" :label-width="formLabelWidth">
            <el-input v-model="form.discount">
              <template slot="append">{{ (100 / (form.total / form.discount)).toFixed(1) + ' %' }}</template>
            </el-input>
          </el-form-item>

          <el-form-item class="" label="Всего с учётом скидки:" :label-width="formLabelWidth">
            <h4>{{ ((form.total || 0) - (form.discount || 0)).toLocaleString('ru', { style: 'currency', currency: 'RUB' }) }}</h4>
          </el-form-item>

        </el-form>

      </v-card-text>
      <div class="text-center" style="padding: 10px 0">
        <el-button type="primary" @click.native="save('ruleForm')">Сохранить</el-button>
      </div>
    </el-card>
  </el-dialog>

</template>

<script>

import { update } from '@/api/market/orders'

export default {

  props: {

    show: {
      type: Boolean,
      required: true
    },

    id: {
      type: Number,
      default: () => null
    },

    comment: {
      type: String,
      default: () => null
    },

    sale: {
      type: String,
      default: () => null
    },

    priceType: {
      type: Number,
      default: () => null
    },

    total: {
      type: Number,
      default: () => null
    },

    ordersParts: {
      type: Array,
      default: () => []
    },

    discount: {
      type: Number,
      default: () => null
    }

  },

  data() {
    return {

      dialogFormVisible: false,
      loading: false,
      search: '',

      form: {
        comment: '',
        price_type: null,
        total: null,
        discount: null
      },

      formLabelWidth: '170px',

      rules: {

        price_type: [
          { required: true, message: 'Тип цены является обязательным!', trigger: 'blur' }
        ],

        comment: [
          { min: 0, max: 200, message: 'Длина комментария превышает допустимый лимит!', trigger: 'blur' }
        ]

      }

    }
  },

  computed: {

    user() {
      return this.$store.getters.currentUser ? this.$store.getters.currentUser.email : null
    },

    totalXs() {
      return this.ordersParts.reduce((acc, item) => {
        return (acc + (item.sale_xs * item.qty))
      }, 0)
    }

  },

  watch: {

    show(val) {
      if (val) {
        this.form.total = this.total
        this.form.discount = this.discount
      }
      this.dialogFormVisible = val
    },

    comment(val) {
      this.form.comment = val
    },

    priceType: {
      immediate: true,
      handler(val) {
        this.form.price_type = val
      }
    },

    'form.price_type': {
      deep: true,
      handler(n, o) {
        if (o !== n && o) {
          this.form.total = ((this.calcRatio(n) / this.calcRatio(o)) * (this.form.total + this.totalXs)) - this.totalXs
          console.log(this.form.total)
        }
      }

    }

  },

  methods: {

    calcRatio(k) {
      switch (k) {
        case 1: return 1
        case 2: return 0.9
        case 3: return 0.8
      }
    },

    close() {
      this.$emit('closeDialog')
      setTimeout(() => (this.form.price_type = this.priceType), 500)
    },

    save(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          update({ ...this.form, id: this.id, sale: this.sale, user: this.user })
            .then(res => {
              this.close()
              this.$message({ type: 'success', message: res })
              this.$emit('update')
            })
        } else {
          console.log('Ошибка отправки формы!')
          return false
        }
      })
    }

  }

}
</script>

<style lang="scss" scoped>

.total {
  font-weight: 900 !important;
}
.discount {
  width: 375px !important;
}

</style>
