<template>
  <div>
    <Confirm ref="confirm" />

    <el-button
      icon="el-icon-s-goods"
      size="mini"
      @click="selectBasket"
    >
      Корзина
    </el-button>

    <el-dialog
      :title="`Корзина ${BasketType.name}`"
      :visible.sync="dialog"
      width="95%"
      :close-on-click-modal="false"
      append-to-body>


        <el-container style="margin: 10px; padding: 10px">
          <el-row align="middle" justify="center" :gutter="20"
            :style="{ 'background': BasketType.value === 'sale' ? 'lightblue' : '#e6d8ad' }"
            style="
              border-radius: 10px;
              margin-top: 20px auto !important;
              padding: 10px;
            "
          >
            <el-col :span="18">
              <v-row>

                <v-col :cols="BasketType.value === 'purchase' ? 12 : 6">
                  <el-card>
                    <v-text-field
                      v-model="Comment"
                      counter
                      hide-details
                      clearable
                      label="Комментарий"
                      style="padding: 10px"
                    />
                  </el-card>
                </v-col>

                <v-col
                  v-if="BasketType.value === 'sale'"
                  cols="6">
                  <el-card>
                    <v-select
                      v-model="price_type"
                      :items="prices"
                      item-text="name"
                      hide-details
                      return-object
                      label="Выберите тип цены"
                      style="padding: 10px"
                    />
                  </el-card>
                </v-col>

                <v-col cols="12">

                  <!-- ТАБЛИЦА ТОВАРОВ В КОРЗИНЕ -->

                  <v-data-table
                    ref="Basket"
                    :key="key"
                    :items="BasketItems"
                    :headers="computedHeaders"
                    hide-default-footer
                    :items-per-page="-1"
                    disable-sort
                    class="elevation-1 mt-3"
                  >
                    <template #[`item.marketNAME`]="{ item }">
                      <el-tooltip :content="item.marketNAME" placement="bottom">
                        <div>{{ item.marketNAME.substr(0, 20) }}...</div>
                      </el-tooltip>
                    </template>


                    <template v-if="BasketType.value === 'purchase'" #[`item.priceSTOCK`]="{ item }">
                      {{
                        item.priceSTOCK
                          ? item.priceSTOCK.toLocaleString("ru", {
                            style: "currency",
                            currency: "RUB",
                          })
                          : ""
                      }}
                    </template>


                    <template v-else #[`item.marketPricePerOne`]="{ item }">
                      <div style="display: flex">
                        <i
                          v-if="isPriceChanged(item)"
                          class="el-icon-close"
                          style="margin: auto; cursor: pointer"
                          @click="resetPrice(item)"
                        />
                        <v-edit-dialog
                          ref="Price"
                          large
                          persistent
                          cancel-text="Отмена"
                          save-text="Сохранить"
                          @click.native.stop
                          @save="updatePrice(item.marketid, ((item.marketPricePerOne / price_type.value) - item.priceCLIENT))"
                        >
                          {{ item.marketPricePerOne.toLocaleString("ru", {style: "currency", currency: "RUB" }) }}

                          <span
                            :style="
                              isPriceChanged(item) ? `color: #65c1e5` : ''
                            "
                          >{{ isPriceChanged(item) ? "*" : "" }}</span>
                          <template #input>
                            <v-text-field
                              v-model.number="item.marketPricePerOne"
                              label="Редактировать"
                              single-line
                            />
                          </template>
                          <v-icon
                            x-small
                            style="margin: 0 0 2px 10px"
                          >mdi-pencil</v-icon>
                        </v-edit-dialog>
                      </div>
                    </template>

                    <template #[`item.marketTotal`]="{ item }">
                      {{
                        (item.marketPricePerOne * item.Count).toLocaleString(
                          "ru",
                          {
                            style: "currency",
                            currency: "RUB",
                          }
                        )
                      }}
                    </template>

                    <template #[`item.Count`]="{ item }">
                      <v-edit-dialog
                        ref="Count"
                        large
                        persistent
                        cancel-text="Отмена"
                        save-text="Сохранить"
                        @save="updateCount(item.marketid, item.Count)"
                      >
                        {{ (item.Count = getItemCountFromLS(item.marketid)) }}
                        <v-icon
                          x-small
                          style="margin: 0 0 2px 10px"
                        >mdi-pencil</v-icon>
                        <template #input>
                          <v-text-field
                            v-model="item.Count"
                            label="Редактировать"
                            single-line
                          />
                        </template>
                      </v-edit-dialog>
                    </template>

                    <template #[`item.Discount`]="{ item }">
                      <v-edit-dialog
                        ref="Discount"
                        large
                        persistent
                        cancel-text="Отмена"
                        save-text="Применить"
                        @save="updateDiscount(item.marketid, item.Discount)"
                        @cancel="item.Discount = null"
                      >
                        {{ item.Discount || 0 }} ₽
                        <v-icon
                          x-small
                          style="margin: 0 0 2px 10px"
                        >mdi-pencil</v-icon>
                        <template #input>
                          <v-text-field
                            v-model="item.Discount"
                            label="Редактировать"
                            type="number"
                            single-line
                          />
                        </template>
                      </v-edit-dialog>
                    </template>

                    <template #[`item.action`]="{ item }">
                      <i
                        class="el-icon-delete"
                        style="cursor: pointer"
                        @click="del(item.marketid)"
                      />
                    </template>
                  </v-data-table>
                </v-col>
              </v-row>
            </el-col>

            <!-- КАРТОЧКА ИТОГО -->

            <el-col :span="6">
              <el-card
                style="border-radius: 10px; height: 100%; display: flex; align-items: center;}"
              >
                <v-row style="height: 100% !important">
                  <v-col cols="7" class="text-left"><b>Всего:</b></v-col><v-col cols="5" style="text-align: right">
                    <div>{{
                      (getAllPrices() - allZipDiscount).toLocaleString("ru", {
                        style: "currency",
                        currency: "RUB",
                      })
                    }}</div>
                    <div>(Сток: {{ summOfStockPrices }})</div>
                  </v-col>
                  <v-col
                    cols="6"
                    class="text-left"
                  ><b>С учётом скидок на ЗИП:</b></v-col><v-col cols="6" style="text-align: right">
                    {{
                      allZipDiscount.toLocaleString("ru", {
                        style: "currency",
                        currency: "RUB",
                      })
                    }}</v-col>

                  <el-divider />

                  <v-col
                    cols="6"
                    class="text-left"><b>Скидка на заказ:</b></v-col><v-col cols="6" style="text-align: right">
                    <v-edit-dialog
                      large
                      persistent
                      cancel-text="Отмена"
                      save-text="Применить"
                      @cancel="fullOrderDiscount = null"
                    >
                      <v-icon x-small style="margin-right: 5px">mdi-pencil</v-icon>
                      {{ fullOrderDiscount || 0 }} ₽
                      <template #input>
                        <v-text-field
                          v-model="fullOrderDiscount"
                          label="Редактировать"
                          type="number"
                          single-line
                        />
                        {{
                          ((fullOrderDiscount / (getAllPrices() - allZipDiscount)) * 100).toFixed(1)
                        }}
                        %
                      </template>
                      <div>
                        ({{
                          ((fullOrderDiscount / (getAllPrices() - allZipDiscount)) * 100).toFixed(1)
                        }}
                        %)
                      </div>
                    </v-edit-dialog>
                  </v-col>
                  <el-divider />
                  <v-col
                    cols="6"
                    class="text-left"><b>Всего c учётом скидок:</b></v-col><v-col cols="6" style="text-align: right">
                    {{
                      (getAllPrices() - allZipDiscount - fullOrderDiscount)
                        .toLocaleString("ru", {
                          style: "currency",
                          currency: "RUB",
                        })
                    }}</v-col>
                  <el-divider />
                  <v-col cols="12" class="text-center">
                    <el-button
                      type="success"
                      size="mini"
                      icon="el-icon-s-goods"
                      @click="addToOrder"
                    >
                      Создать {{ BasketType.name }}
                    </el-button></v-col>
                </v-row>
              </el-card>
            </el-col>
          </el-row>
        </el-container>
      
    </el-dialog>
  </div>
</template>

<script>
import Confirm from '@/components/shared/Confirm'
import { mapState, mapGetters } from 'vuex'


import { add } from '@/api/market/orders'

export default {
  components: {
    Confirm,
  },

  props: {
    show: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      dialog: false,
      BasketItems: [],
      BasketType: {
        name: 'продажи',
        value: 'sale'
      },
      Comment: '',
      fullOrderDiscount: null,
      price_type: { id: 1, name: 'Стандартная', value: 1 },
      vendor: null,
      manual_price: 0,
      firm: {
        id: 990,
        name: "Атлас Про"
      },
      key: 0,
      json_fields: {},
      text: 'продаж',

      prices: [
        { id: 1, name: 'Стандартная', value: 1 },
        { id: 2, name: 'Партнёрская', value: 0.9 },
        { id: 3, name: 'Оптовая', value: 0.8 }
      ],


      headers: [
        { text: 'Макет ID', value: 'marketid', selected: true, divider: true },
        {
          text: 'Название',
          value: 'marketNAME',
          selected: true,
          divider: true
        },
        { text: 'Тип', value: 'marketTYPE', selected: true, divider: true },
        { text: 'Артикул', value: 'marketART', selected: true, divider: true },
        { text: 'Кол-во', value: 'Count', selected: true, width: 80, divider: true },
        { text: 'Себ.', value: 'priceSTOCK', selected: true, divider: true },
        {
          text: 'Цена за штуку',
          value: 'marketPricePerOne',
          selected: true,
          width: 170,
          divider: true
        },

        { text: 'Итого', value: 'marketTotal', selected: true, divider: true },

        {
          text: 'Скидка на ЗИП',
          value: 'Discount',
          selected: true,
          divider: true,
          width: 120
        },

        {
          text: 'Итого (продажа)',
          value: 'marketSALE',
          selected: false,
          divider: true
        },
        {
          text: 'Итого (партнёр)',
          value: 'marketPARTNER',
          selected: false,
          divider: true
        },
        {
          text: 'Итого (опт)',
          value: 'marketOPT',
          selected: false,
          divider: true
        },
        { text: 'Действие', value: 'action', selected: true, divider: true }
      ]
    }
  },





  computed: {
    ...mapState({
      Market: (state) => state.market.market,
      CurrentBasket: (state) => state.market.Basket, // получаем из LS, например: [{ Count: 1, marketid: 100, Deviation: 50 }]
      Currency: (state) => state.currency.Currency
    }),

    ...mapGetters({ Market: 'market_new/market', user: 'auth/currentUser' }),
    computedHeaders() {
      return this.headers.filter((item) => item.selected)
    },

    summOfStockPrices() {
      return (
        this.BasketItems.reduce((acc, item) => {
          return Number((acc + (+item.priceCLIENT * this.price_type.value * this.getItemCountFromLS(item.marketid) || 0)).toFixed(2))
        }, 0) || 0
      )
    },
    
    allZipDiscount() {
      return (
        this.BasketItems.reduce((acc, item) => {
          return acc + ((+item.Discount * this.getItemCountFromLS(item.marketid)) || 0)
        }, 0) || 0
      )
    }
  },





  watch: {
    show(val) {
      if (val) {
        this.dialog = val
      }
    },

    dialog(val) {
      if (!val) this.$emit('close')
    },

    price_type(n, o) {
      if (n !== o) {
        this.setup()
      }
    },

    CurrentBasket: {
      deep: true,
      handler(n, o) {
        if (n.length !== o.length) this.setup()
      }
    }
  },

  async created() {
    // await this.$store.dispatch('market_new/get')
    this.setup()
  },






  methods: {
    selectBasket() {
      this.$confirm('', 'Выберите тип корзины: ', {
        confirmButtonText: 'Продажа',
        cancelButtonText: 'Закупка',
        confirmButtonClass: 'confirm-button',
        center: true
      })
        .then(() => {
          this.BasketType.value = 'sale';
          this.BasketType.name = 'продажи';
          this.dialog = true;
        })
        .catch(() => {
          this.BasketType.value = 'purchase';
          this.BasketType.name = 'закупки';
          this.dialog = true;
        })
    },


    setup() {
      const marketInBasket = this.Market?.filter((item) => this.CurrentBasket.find((basket) => +basket.marketid === +item.marketid))
      console.log('Товары в корзине: ', marketInBasket)
      console.log(this.$store.getters["auth/currentUser"]?.email)
      marketInBasket.map((item) => { item.marketPricePerOne = this.calculatePricePerOne(item) })
      this.BasketItems = [...marketInBasket]
      this.key++

    },

    calculatePricePerOne(data) {
      this.key++
      const { marketid, marketPRICE, K2, CUR } = data
      const row = this.CurrentBasket.find((obj) => obj.marketid === marketid)
      return parseFloat(((marketPRICE * K2 * this.getCurrency(CUR)) + (row.Deviation || 0)) * this.price_type.value).toFixed(2)
    },

    updateCount(id, count) {
      this.$store.dispatch('updateCount', { id, count }).then(() => {
        this.key++
        this.$notify({
          title: 'Успешно',
          message: 'Количество изменено.',
          type: 'success'
        })
      })
    },

    updatePrice(id, deviation) {
      this.$store.dispatch('updatePrice', { id, deviation })
        .then(() => {
          this.key++
          this.$notify({
            title: 'Успешно',
            message: 'Цена изменена.',
            type: 'success'
          })
      })
    },

    updateDiscount(id, discount) {
      if (discount) {
        this.$store.dispatch('updateDiscount', { id, discount }).then(() => {
          this.$store.commit('setData', 'Скидка успешно применена.')
        })
      }
    },

    getAllPrices() {
      return (
        this.BasketItems.reduce((acc, item) => {
          return (
            acc +
            +item.marketPricePerOne * this.getItemCountFromLS(item.marketid)
          )
        }, 0) || null
      )
    },

    getCurrency(data) {
      return this.Currency.find((i) => i.sign === data)?.rate
    },

    isPriceChanged(item) {
      const row = this.CurrentBasket.find(obj => obj.marketid === item.marketid)
      return row
        ? row.Deviation
        : null
    },

    resetPrice(item) {
      const row = this.CurrentBasket.find((obj) => obj.marketid === item.marketid)
      const basketFormLS = JSON.parse(localStorage.getItem('marketBasket'))
      basketFormLS.CurrentOrder[0].Deviation = 0
      row.Deviation = 0
      localStorage.setItem('marketBasket', JSON.stringify(basketFormLS))
      item.marketPricePerOne = this.calculatePricePerOne(item) - row.Deviation
    },

    JsonFields() {
      const JsonFields = {}
      const headers = this.headers.filter((header) => header.selected === true)
      headers.forEach((item) => {
        JsonFields[item.text] = item.value
      })
      return JsonFields
    },

    getItemCountFromLS(id) {
      const item = this.CurrentBasket.find((obj) => obj.marketid === id)
      return item ? item.Count : 1
    },

    del(id) {
      this.$store.dispatch('delFromBasket', id)
    },




    addToOrder() {

        const dataToLS = {
          type: this.BasketType.value,
          headers: this.computedHeaders,
          order: this.CurrentBasket,
          comment: this.Comment,
          date: new Date().toLocaleDateString('ru', {
            hour: 'numeric',
            minute: 'numeric'
          }),
          isOnSite: false
        }

        const dataToDb = {
          type: this.BasketType.value,
          order: this.CurrentBasket,
          comment: this.Comment,
          price_type: this.price_type,
          firm: this.firm,
          fullOrderDiscount: this.fullOrderDiscount,
          email: this.user.email
        }

        add(dataToDb).then(() => {
          this.$emit('updateFromBasket', true)
          this.$store.commit('setData', 'Заказ успешно сохранён.')
          this.$store.dispatch('saveOrders', dataToLS) // сохраняем в LocalStorage
          this.dialog = false
        })

        // нужно причесать позже response (тут есть affectedRows = 1)
    },




    async removeBasket() {
      if (
        await this.$refs.confirm.open('Очистка корзины', 'Вы уверены?', {
          color: 'orange'
        })
      ) {
        this.$store.dispatch('removeBasket').then(() => {
          this.dialog = false
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>


.v-data-table {
  text-align: left !important;
}



</style>
