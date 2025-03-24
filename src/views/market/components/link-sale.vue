<template>

  <el-dialog
    :visible.sync="dialogFormVisible"
    max-width="900px"
    append-to-body
    top="30vh"
    :title="`Привязать заказ № ${id} к SALE:`"
    @close="close"
  >

    <el-card v-loading="loading" shadow="never">
      <v-card-text>

        <el-form ref="form" :model="form" size="large">

          <el-row>
            <el-col :span="24">
              <el-form-item prop="sale" :rules="[{ required: true, message: 'Обязательно!', trigger: 'blur' }]">
                <el-select
                  v-model="form.sale"
                  filterable
                  clearable
                  value-key="ID"
                  placeholder="выберите SALE из списка"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in sales"
                    :key="item.ID"
                    :value="item"
                    :label="setSaleName(item)"
                    :options="item"
                  >
                  </el-option>
                </el-select>

              </el-form-item>
            </el-col>

          </el-row>
        </el-form>

      </v-card-text>
      <div class="text-center" style="padding: 10px 0">
        <!-- <el-button plain type="danger" @click="close">Отмена</el-button> -->
        <el-button type="success" :disabled="Object.keys(form.sale).length === 0" @click.native="save">Сохранить</el-button>
      </div>
    </el-card>
  </el-dialog>

</template>

<script>

import { getSales, linkSale } from '@/api/market/orders'

import { mapGetters } from 'vuex'

export default {

  props: {
    show: {
      type: Boolean,
      required: true
    },

    id: {
      type: Number,
      default: () => null
    }

  },

  data() {
    return {
      sales: [],
      dialogFormVisible: false,
      loading: false,
      search: '',
      disabled: false,

      form: {
        sale: {}
      },

      formLabelWidth: '130px'

    }
  },

  computed: {
    ...mapGetters({ market: 'market_new/market' }),

    user() {
      return this.$store.getters.currentUser ? this.$store.getters.currentUser.email : null
    }

  },

  watch: {

    show(val) {
      this.dialogFormVisible = val
      this.loading = true

      if (!this.sales.length && val) {
        getSales()
          .then(res => {
            this.sales = [...res]
            console.log(this.sales)
          })
      }

      setTimeout(() => {
        this.loading = false
      }, 1000)
    }

  },

  beforeDestroy() {
    this.$emit('closeDialog')
  },

  methods: {

    setSaleName(item) {
      return `${item.jkey} [${item.jstatus}] - ${item.SUMMARY || 'нет'} [${item.REPORTER}]`
    },

    close() {
      this.sales = []
      this.$emit('closeDialog')
    },

    save() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          linkSale({ sale: this.form.sale, id: this.id })
            .then(res => {
              this.close()
              this.$message({ type: 'success', message: res })
              this.$emit('update')
            })
        }
      })
    }

  }

}
</script>

<style lang="scss" scoped>

  .col {
    padding: 5px !important;
  }
  .row {
    align-items: center !important;
  }
  .el-form-item {
    margin-bottom: 5px;
  }
.v-input {
  font-size: 14px !important;
}

</style>
