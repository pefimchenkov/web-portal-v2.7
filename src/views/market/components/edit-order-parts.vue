<template>

  <el-dialog
    :visible.sync="dialogFormVisible"
    width="77%"
    top="30vh"
    append-to-body
    :close-on-click-modal="false"
    :title="`Редактирование состава заказа № ${id}`"
    @close="close"
  >

    <el-card v-loading="loading" shadow="never">

      <div style="display: flex; justify-content: space-between;">
        <el-row type="flex"><span style="font-weight: 600; margin-right: 10px">Тип цены:</span>{{ xformPriceType(priceType) }}</el-row>
        <el-row type="flex" justify="end" style="margin-bottom: 15px">
          <el-button
            type="primary"
            icon="el-icon-plus"
            @click.stop="add"
          />
        </el-row>
      </div>

      <el-form ref="form" :model="form" size="large" style="padding: inherit">

        <el-row
          v-for="(part, i) in form.parts"
          :key="part.marketid"
          :gutter="6"
        >

          <el-col :xs="24" :sm="24" :md="10" :lg="15" :xl="15">
            <el-form-item prop="parts">
              <v-autocomplete
                v-model="form.parts[i]"
                :items="marketFiltered"
                :item-text="IdTypeArtPnPrice"
                hide-details
                hide-selected
                height="20"
                return-object
                dense
                outlined
                placeholder="выберите состав из маркета"
                @change="checkForApprove(part, form.parts[i], i)"
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="24" :md="4" :lg="3" :xl="3">
            <el-form-item :prop="`prices[${i}]`">
              <el-tooltip class="item" effect="dark" placement="right" content="Цена за штуку с учётом наценки">
                <el-input
                  v-model="form.prices[i]"
                  autocomplete="off"
                >
                  <span v-if="form.deviations[i]" slot="prefix" style="color: #409EFF;">*</span>
                  <span slot="suffix">₽</span>
                </el-input>
              </el-tooltip>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="24" :md="4" :lg="2" :xl="2">
            <el-form-item
              :prop="`counts[${i}]`"
              :rules="[{ type: 'number', message: 'Не число' }, { required: true, message: 'Обязательно', trigger: 'blur' }]"
            >
              <el-input
                v-model.number="form.counts[i]"
                autocomplete="off"
              >
                <span slot="suffix">шт.</span>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="4" :lg="3" :xl="3">
            <el-form-item
              :prop="`discounts[${i}]`"
            >
              <el-tooltip class="item" effect="dark" content="Скидка" placement="right">
                <el-input
                  v-model="form.discounts[i]"
                  autocomplete="off"
                >
                  <span slot="suffix">₽</span>
                </el-input>
              </el-tooltip>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="24" :md="1" :lg="1" :xl="1">
            <el-form-item>
              <el-button type="info" plain icon="el-icon-delete" size="large" @click.stop="remove(i)" />
            </el-form-item>
          </el-col>

        </el-row>
      </el-form>

      <div class="text-center" style="padding: 10px 0">
        <el-button type="success" :disabled="disabled" @click.native="save">Сохранить</el-button>
      </div>
    </el-card>
  </el-dialog>

</template>

<script>

import { updateParts } from '@/api/market/orders'
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
    },
    sale: {
      type: String,
      default: () => null
    },
    total: {
      type: Number,
      default: () => null
    },
    discount: {
      type: Number,
      default: () => null
    },
    priceType: {
      type: Number,
      default: () => null
    },
    parts: {
      type: Array,
      required: true
    }
  },

  data() {
    return {

      marketFiltered: [],
      summaSdelki: null,
      dialogFormVisible: false,
      loading: false,
      search: '',

      form: {
        parts: [],
        counts: [],
        prices: [],
        deviations: [],
        discounts: []
      },

      formLabelWidth: '130px'

    }
  },

  computed: {

    ...mapGetters({ market: 'market_new/market' }),
    user() {
      return this.$store.getters["auth/currentUser"]?.email || null
    },
    disabled() {
      const noCount = this.form.counts.some(count => !count);
      const noPrice = this.form.prices.some(price => !price);
      const noParts = this.form.parts.some(i => !Object.keys(i).length)

      return (noCount || noPrice || noParts)
    }

  },

  watch: {

    show(val) {
      this.dialogFormVisible = val
      this.loading = true

      if (val) {
        this.setup()
        setTimeout(() => {
          this.marketFiltered = [...this.market]
          this.loading = false
        }, 300)
      }
    },

    'form': {
      deep: true,
      handler(val) {
        const diff = []
        const reducer = (data) => data.reduce((a, i) => a + Number(i), 0)
        val.parts.forEach((part, idx) => {
          diff[idx] = val.counts[idx] * (val.prices[idx] - val.discounts[idx])
        })
        this.summaSdelki = reducer(diff)

        console.log(val)
      }
    },

    'form.parts': {
      deep: true,
      handler(val) {
        const lastId = this.form.parts.length - 1;
        const price = val[lastId]
          ? this.getPriceByPriceType(val[lastId], this.priceType)
          : null
        if (!this.form.prices[lastId]) this.form.prices[lastId] = price
      }
    }

  },

  beforeDestroy() {
    this.$emit('resetId')
    this.$emit('closeDialog')
  },


  methods: {

    setup() {
      this.resetForm();
      console.log('PARTS', this.parts)
      const ids = this.parts.map(i => i.market_id);
      this.form.parts = this.market.filter(i => ids.includes(i.marketid));
      console.log('this.form.parts', this.form.parts)

      this.form.parts.forEach(parts => {
        const current = this.parts.find(i => i.market_id === parts.marketid)
        this.form.counts.push(current.qty)
        this.form.discounts.push(current.sale_xs)
        this.form.deviations.push(current.price_deviation)
        this.form.prices.push(current.price)
      })

      this.summaSdelki = this.total
    },

    getPriceByPriceType(item, type) {
      const types = ['priceCLIENT', 'pricePART', 'priceOPT']
      return item[types[type - 1]]
    },

    add() {
      this.form.parts.push({})
      this.form.counts.push(undefined)
    },

    remove(index) {

      Object.keys(this.form).forEach((key) => {
        this.form[key].splice(index, 1)
      })
    },

    checkForApprove(o, n, i) {
      if (this.form.parts.filter(i => i.marketid === n.marketid).length > 1) {
        this.form.parts[i] = { ...o }
        this.$message({ type: 'error', message: 'Такая позиция уже есть в заказе!' })
      }
      if (!n.priceSTOCK) {
        this.form.parts[i] = { ...o }
        this.$message({ type: 'error', message: 'Позиция не имеет стоковой цены!' })
      }
    },

    IdTypeArtPnPrice(item) {
      return `(${item.marketid}) [${item.marketART || 'нет'}] ${item.marketTYPE} (${item.marketPN}) - ${this.getPriceByPriceType(item, this.priceType)?.toLocaleString('ru', { style: 'currency', currency: 'RUB' })}` // обрезать NAME
    },

    close() {
      this.marketFiltered = []
      this.$emit('closeDialog')
      this.$emit('resetId')
    },

    resetForm() {
      this.form = {
        parts: [],
        counts: [],
        prices: [],
        deviations: [],
        discounts: []
      }
    },

    save() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const parts = this.form.parts.map((e, i) => {
            console.log('this.form.prices[i]', this.form.prices[i])
            console.log('this.calcRatio(this.priceType)', this.calcRatio(this.priceType))
            console.log('parseFloat(this.getPriceByPriceType(e, 1)', parseFloat(this.getPriceByPriceType(e, 1)))

            return {
              id: e.marketid,
              qty: +this.form.counts[i],
              price_deviation: (+this.form.prices[i] / this.calcRatio(this.priceType) - parseFloat(this.getPriceByPriceType(e, 1))),
              discount: +this.form.discounts[i]
            }
          })

          console.log('ADWWADWD', parts)

          updateParts({ parts, id: this.id, sale: this.sale, summaSdelki: (this.summaSdelki - this.discount) })
            .then(res => {
              this.close()
              this.$message({ type: 'success', message: res })
              this.$emit('update')
            })
        }
      })
    },

    calcRatio(k) {
      switch (k) {
        case 1: return 1
        case 2: return 0.9
        case 3: return 0.8
      }
    },
    xformPriceType(val) {
      switch (val) {
        case 1: return 'Стандартная'
        case 2: return 'Партнёрская'
        case 3: return 'Оптовая'
      }
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
