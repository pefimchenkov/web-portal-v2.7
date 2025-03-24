<template>
  <v-container style="z-index: 9999">

    <Confirm ref="confirm" />

    <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
      <template #activator="{ on }">
        <span v-on="on">Список заказов</span>
      </template>

      <v-card>
        <v-toolbar dark style="background: #054a8f !important;">
          <v-btn text @click="delOrders">
            <v-icon>mdi-delete</v-icon>Удалить всё
          </v-btn>
          <v-spacer />
          <v-btn text @click="dialog = false">
            <v-icon>mdi-close</v-icon>Закрыть
          </v-btn>
        </v-toolbar>

        <h3 class="text-center" style="margin: 15px 0 0 0;">Список заказов</h3>

        <v-text-field
          v-model="Search"
          class="text-center"
          style="width: 600px; margin: 15px auto"
          prepend-icon="search"
          label="Поиск по заказам"
          single-line
          clearable
        />

        <v-container v-for="Obj in filteredAndSorted.slice().reverse()" :key="Orders.indexOf(Obj)" class="px-10">
          <v-row style="background: #2e7d32 !important; color: #fff" justify="center" align="center">

            <v-col style="margin: auto">
              <v-edit-dialog
                ref="Comment"
                large
                persistent
                cancel-text="Отменить"
                save-text="Сохранить"
                @save="updateComment(Orders.indexOf(Obj), Orders[Orders.indexOf(Obj)].comment)"
              >{{ `Заказ № ${Orders.indexOf(Obj) + 1}  :` }}
                {{ Orders[Orders.indexOf(Obj)].comment ? Orders[Orders.indexOf(Obj)].comment : '( ваш комментарий ) ' }}
                {{ '(' }}<v-icon x-small class="mx-1">mdi-pencil</v-icon>{{ ')' }}
                <template #input>
                  <v-text-field
                    v-model="Orders[Orders.indexOf(Obj)].comment"
                    single-line
                    counter
                    label="( Введите свой комментарий )"
                  />
                </template>
              </v-edit-dialog>
            </v-col>

            <v-col style="margin: auto">
              {{ Orders[Orders.indexOf(Obj)].date ? Orders[Orders.indexOf(Obj)].date : 'Дата отсутствует' }}
            </v-col>

            <v-col>
              <el-button size="small" plain @click="moveToBasket(Orders.indexOf(Obj))">
                <v-icon small>mdi-undo-variant</v-icon>
                В корзину для редактирования
              </el-button>
            </v-col>

            <v-col v-if="$acl.check('Agent')" cols="1" align="end">
              <el-button
                v-if="!Orders[Orders.indexOf(Obj)].isOnSite"
                plain
                size="small"
                :disabled="$acl.not.check('Admin')"
                @click="sendOrderToSite(Orders.indexOf(Obj))"
              >
                <v-icon small class="mr-1">mdi-send</v-icon>
                На сайт
              </el-button>
              <template v-else>
                <v-icon small class="mr-1">mdi-alert</v-icon>Уже на сайте
              </template>
            </v-col>

            <v-col align="end">
              <el-button size="small" plain @click="delOrderFromList(Orders.indexOf(Obj))">
                <v-icon small class="mr-1">mdi-delete</v-icon>
                Удалить
              </el-button>
            </v-col>

            <v-col cols="12">
              <v-data-table
                ref="order"
                :items="Market.filter(item => Obj.order.find(i => i.marketid === item.marketid))"
                :headers="Obj.headers"
                dense
                calculate-widths
                hide-default-footer
                style="padding: 10px !important"
              >
                <template #[`item.Count`]="{ item }">
                  <v-edit-dialog
                    ref="Count"
                    large
                    persistent
                    cancel-text="Отмена"
                    save-text="Сохранить"
                    @save="updateCount(Orders.indexOf(Obj), item.marketid, item.Count)"
                  >
                    <v-icon x-small class="mr-3">mdi-pencil</v-icon>{{ Obj.order.find(i => i.marketid === item.marketid).Count }}
                    <template #input>
                      <v-text-field
                        v-model="item.Count"
                        label="Редактировать"
                        single-line
                        counter
                        autofocus
                      />
                    </template>
                  </v-edit-dialog>
                </template>

                <template #[`item.marketPRICEPERONE`]="{ item }">
                  {{ pricePerOne(Obj.headers, item).toLocaleString('ru', { style: 'currency', currency: 'RUB' }) }}
                </template>
                <template #[`item.marketSALE`]="{ item }">
                  {{ (changeRate(item) * Obj.order.find(i => i.marketid === item.marketid).Count * 1).toLocaleString('ru', { style: 'currency', currency: 'RUB' }) }}
                </template>
                <template #[`item.marketPARTNER`]="{ item }">
                  {{ (changeRate(item) * Obj.order.find(i => i.marketid === item.marketid).Count * 0.9).toLocaleString('ru', { style: 'currency', currency: 'RUB' }) }}
                </template>
                <template #[`item.marketOPT`]="{ item }">
                  {{ (changeRate(item) * Obj.order.find(i => i.marketid === item.marketid).Count * 0.8).toLocaleString('ru', { style: 'currency', currency: 'RUB' }) }}
                </template>

                <template #top>
                  <v-row style="text-align: end">
                    <v-col>
                      <el-button size="small" type="info" plain>
                        <!-- <download-excel
                          :title="Orders[Orders.indexOf(Obj)].comment + ' / ' + Orders[Orders.indexOf(Obj)].date"
                          :fields="JsonFields(`${Orders.indexOf(Obj)}`)"
                          :data="JsonData(`${Orders.indexOf(Obj)}`).MarketItems"
                          class="btn btn-default"
                          name="orders_list.xls"
                          :footer="JsonData(`${Orders.indexOf(Obj)}`).Summ"
                        >
                          <v-icon small>save_alt</v-icon> EXCEL
                        </download-excel> -->
                      </el-button>
                    </v-col>
                  </v-row>
                </template>

                <template #[`body.append`]>
                  <td :colspan="8" style="text-align: end">
                    {{ ((JsonData(`${Orders.indexOf(Obj)}`).Summ).toLocaleString('ru', { style: 'currency', currency: 'RUB' })) }}
                  </td>
                </template>

              </v-data-table>
            </v-col>

          </v-row>

        </v-container>

      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>

import { mapState, mapGetters } from 'vuex'
// import _ from 'lodash'
import Confirm from '@/components/shared/Confirm'

export default {
  components: {
    Confirm
  },
  data() {
    return {
      dialog: false,
      Comment: '',
      Search: ''
    }
  },

  computed: {

    ...mapState({
      Orders: state => state.market.Orders,
      Basket: state => state.market.Basket,
      Currency: state => state.currency.Currency
    }),

    ...mapGetters({ Market: 'market_new/market' }),

    loadings() {
      return this.$store.getters.loadings
    },

    filteredAndSorted() {
      return this.Orders.filter(order => {
        if (this.Search) {
          if (order.comment) {
            return order.comment.toLowerCase().includes(this.Search.toLowerCase())
          } else return false
        } else return true
      })
    }

  },

  created() {
    this.$store.dispatch('market_new/get')
  },

  methods: {

    changeRate(item) {
      return item.marketPRICE * item.K2 * this.Currency.find(cur => cur.sign === item.CUR).rate
    },

    pricePerOne(header, item) {
      if (header.find(item => item.value === 'marketPARTNER')) return item.marketPRICE * item.K2 * 0.9 * this.Currency.find(cur => cur.sign === item.CUR).rate
      if (header.find(item => item.value === 'marketOPT')) return item.marketPRICE * item.K2 * 0.8 * this.Currency.find(cur => cur.sign === item.CUR).rate
      if (header.find(item => item.value === 'marketSALE')) return item.marketPRICE * item.K2 * this.Currency.find(cur => cur.sign === item.CUR).rate
    },

    updateCount(objId, id, count) {
      if (count) {
        this.$store.dispatch('updateCount', { objId, id, count })
          .then(() => {
            this.$store.commit('setData', 'Количество успешно изменено.')
          })
      }
    },

    updateComment(objId, comment) {
      if (comment) {
        this.$store.dispatch('updateComment', { objId, comment })
          .then(() => {
            this.$store.commit('setData', 'Комментарий успешно добавлен / изменён.')
          })
      }
    },

    /* JsonFields(key) {

      const JsonFields = {}
      this.Orders[parseInt(key)].headers.forEach(item => {

        if (item.value === 'marketPRICE') item.value = 'marketSALE'
        if (item.text === 'Действие') item.text = 'ИТОГО:'
        JsonFields[item.text] = item.value

      })
      return JsonFields

    },

    JsonData(key) {

      const Summ = []
      const Order = this.Orders[parseInt(key)].order
      const Headers = this.Orders[parseInt(key)].headers
      const MarketItems = this.Market.filter(item => Order.find(i => i.marketid === item.marketid))

      if (_.find(Headers, header => header.value === 'marketOPT')) {

        MarketItems.forEach(obj => {

          obj.Count = Order.find(item => item.marketid === obj.marketid).Count
          obj.marketOPT = obj.marketPRICE * obj.K2 * obj.Count * 0.8 * this.Currency.find(cur => cur.sign === obj.CUR).rate
          obj.marketPRICEPERONE = obj.marketOPT / obj.Count
          Summ.push(obj.marketOPT)

        })
        return { MarketItems: MarketItems, Summ: _.sum(Summ) }

      }
      if (_.find(Headers, header => header.value === 'marketPARTNER')) {

        MarketItems.forEach(obj => {

          obj.Count = Order.find(item => item.marketid === obj.marketid).Count
          obj.marketPARTNER = obj.marketPRICE * obj.K2 * obj.Count * 0.9 * this.Currency.find(cur => cur.sign === obj.CUR).rate
          obj.marketPRICEPERONE = obj.marketPARTNER / obj.Count
          Summ.push(obj.marketPARTNER)

        })
        return { MarketItems: MarketItems, Summ: _.sum(Summ) }

      }
      if (_.find(Headers, header => header.value === 'marketSALE')) {

        MarketItems.forEach(obj => {

          obj.Count = Order.find(item => item.marketid === obj.marketid).Count
          obj.marketSALE = obj.marketPRICE * obj.K2 * obj.Count * this.Currency.find(cur => cur.sign === obj.CUR).rate
          obj.marketPRICEPERONE = obj.marketSALE / obj.Count
          Summ.push(obj.marketSALE)

        })
        return { MarketItems: MarketItems, Summ: _.sum(Summ) }

      }

    }, */

    async delOrders() {
      if (await this.$refs.confirm.open('Удаление заказов', 'Вы уверены?', { color: 'orange' })) {
        this.$store.dispatch('removeOrders')
          .then(() => {
            this.dialog = false
          })
      } else {
        this.$store.commit('setInfo', 'Удаление отменено')
      }
    },

    moveToBasket(orderId) {
      if (this.Basket && this.Basket.length === 0) {
        if (orderId !== undefined) {
          // const Item = this.Orders[orderId]
          const Order = this.Orders[orderId].order
          /* const index = this.Orders.indexOf(Item)
					this.Orders.splice(index, 1) */
          this.$store.dispatch('moveToBasket', Order)
            .then(() => {
              this.$store.commit('setData', 'Заказ успешно перемещён в корзину')
            })
        } else {
          this.$store.commit('setError', 'Не верный номер заказа или заказ не существует')
        }
      } else {
        this.$store.commit('setError', 'Корзина не пустая! Для начала очистите корзину')
      }
    },

    async delOrderFromList(index) {
      if (await this.$refs.confirm.open('Удаление заказа', 'Вы уверены?', { color: 'orange' })) {
        this.$store.dispatch('removeOrderFromList', index)
          .then(() => {
            this.$store.commit('setData', 'Удаление прошло успешно')
          })
      } else {
        this.$store.commit('setInfo', 'Удаление отменено')
      }
    },

    async sendOrderToSite(index) {
      if (await this.$refs.confirm.open('Отправка на сайт', 'Вы уверены?', { color: 'orange' })) {
        this.$store.dispatch('sendOrderToSite', index)
          .then(() => {
            this.$store.commit('setData', 'Заказа успешно отправлен!')
          })
      } else {
        this.$store.commit('setInfo', 'Отправка отменена')
      }
    }

  }
}
</script>

<style lang="scss" scoped>

</style>
