<template>

  <el-dialog
    :visible.sync="dialogFormVisible"
    max-width="900px"
    append-to-body
    top="30vh"
    :title="`Привязать заказ № ${id} к ZAKUPKA:`"
    @close="close"
  >

    <el-card v-loading="loading" shadow="never">
      <v-card-text>

        <el-form ref="form" :model="form" size="large">

          <el-row>
            <el-col :span="24">
              <el-form-item prop="purchase" :rules="[{ required: true, message: 'Обязательно!', trigger: 'blur' }]">
                <el-select
                  v-model="form.purchase"
                  filterable
                  clearable
                  value-key="ID"
                  placeholder="выберите ZAKUPKA из списка"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in purchases"
                    :key="item.ID"
                    :value="item"
                    :label="setPurchaseName(item)"
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
        <el-button
          type="success"
          :disabled="Object.keys(form.purchase).length === 0"
          @click.native="save">
          Сохранить
        </el-button>
      </div>
    </el-card>
  </el-dialog>

</template>

<script>

import { getPurchases, linkPurchase } from '@/api/market/orders'

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
      purchases: [],
      dialogFormVisible: false,
      loading: false,
      search: '',
      disabled: false,

      form: {
        purchase: {}
      },

      formLabelWidth: '130px'

    }
  },

  computed: {
    ...mapGetters({ market: 'market_new/market' }),

    user() {
      return this.$store.getters["auth/currentUser"]?.email || null
    }

  },

  watch: {

    show(val) {
      this.dialogFormVisible = val
      this.loading = true

      if (!this.purchases.length && val) {
        getPurchases()
          .then(res => {
            this.purchases = [...res]
            console.log(this.purchases)
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

    setPurchaseName(item) {
      return `${item.jkey} [${item.jstatus}] - ${item.SUMMARY || 'нет'} [${item.REPORTER}]`
    },

    close() {
      this.purchases = []
      this.$emit('closeDialog')
    },

    save() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          linkPurchase({ order: this.form.purchase, id: this.id })
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
