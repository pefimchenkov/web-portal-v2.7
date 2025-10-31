<template>
  <div>

    <Edit
      v-if="Object.keys(editedItem).length > 0"
      :id="editedItem.id"
      :show="dialogEdit"
      :comment="editedItem.comment"
      :price-type="editedItem.price_type"
      :total="editedItem.total"
      :sale="editedItem.sale_id"
      :orders-parts="OrdersParts.filter(i => editedItem.id == i.order_id)"
      :discount="editedItem.sale_xl"
      @closeDialog="dialogEdit = false"
      @update="update"
    />

    <EditParts
      v-if="Object.keys(editedItem).length > 0"
      :id="editedItem.id"
      :show="dialogEditParts"
      :parts="partsByOrderId(editedItem.id)"
      :price-type="editedItem.price_type"
      :sale="editedItem.sale_id"
      :total="editedItem.total"
      :discount="editedItem.sale_xl"
      @closeDialog="dialogEditParts = false"
      @resetId="editedItem.id = null"
      @update="update"
    />

    <LinkSale
      :id="editedItem.id"
      :show="dialogLinkSale"
      @closeDialog="dialogLinkSale = false"
      @update="update"
    />

    <CreateSale
      :id="editedItem.id"
      :show="dialogCreateSale"
      :comment="editedItem.comment"
      :total="editedItem.total"
      @closeDialog="dialogCreateSale = false"
      @resetId="editedItem.id = null"
      @update="update"
    />

    <LinkPurchase
      :id="editedItem.id"
      :show="dialogLinkPurchase"
      @closeDialog="dialogLinkPurchase = false"
      @update="update"
    />

    <CreatePurchase
      :id="editedItem.id"
      :show="dialogCreatePurchase"
      :comment="editedItem.comment"
      :parts="partsByOrderId(editedItem.id)"
      @closeDialog="dialogCreatePurchase = false"
      @resetId="editedItem.id = null"
      @update="update"
    />


    <el-button
      icon="el-icon-s-cooperation"
      size="mini"
      class=""
      @click="dialog = true"
    >
      Список заказов
    </el-button>


    <el-dialog :visible.sync="dialog" append-to-body fullscreen>


        <h3 class="text-center" style="margin: 15px 0 0 0;">Список заказов</h3>

        <v-text-field
          v-model="search"
          class="text-center"
          style="width: 600px; margin: 15px auto"
          prepend-icon="search"
          label="Поиск по типу цены, комментарию или создателю"
          single-line
          clearable
        />

          <el-card v-loading="loading">
            <el-table
              :data="filteredOrders"
              :default-sort="{prop: 'created_date', order: 'descending'}"
              row-class-name="tableRowClassName"
              @expand-change="getJsonFields(true)"
            >
              <el-table-column type="expand">
                <template slot-scope="props">

                  <el-table
                    ref="orderDetails"
                    :data="sortedByOrders(props.row)"
                    :default-sort="{prop: 'market_id'}"
                    show-summary
                    :summary-method="getSummaries"
                    empty-text="нет данных"
                  >
                    <el-table-column
                      label="Маркет ID"
                      prop="market_id"
                    />
                    <el-table-column
                      label="Название"
                      prop="type"
                    />
                    <el-table-column
                      label="Описание"
                      prop="NAME"
                    />
                    <el-table-column
                      label="PN"
                      prop="PN"
                    />
                    <el-table-column
                      label="Состояние"
                      prop="cond"
                    />
                    <el-table-column
                      label="Артикул 1С"
                      prop="ART_1C"
                    />
                    <el-table-column
                      label="Количество"
                      prop="qty"
                    />
                    <el-table-column
                      label="Себестоимость"
                      prop="cost"
                    />
                    <el-table-column
                      label="Цена (₽)"
                      prop="price"
                      width="200"
                    />
                    <el-table-column
                      label="Итого (₽)"
                      prop="summ"
                    />
                    <el-table-column
                      label="Скидка (₽)"
                      prop="sale_xs"
                    >
                      <template slot-scope="scope">
                        {{ scope.row.sale_xs * scope.row.qty }}
                      </template>
                    </el-table-column>
                    <el-table-column
                      label="Склад ТСД"
                      prop="qtyT"
                    />
                    <el-table-column
                      label="Склад Атлас"
                      prop="qtyA"
                    />
                    <template slot="append">
                      <div style="text-align: end;">
                        <download-excel
                          :title="`test`"
                          :fields="JsonFields"
                          :data="sortedByOrders(props.row)"
                          name="orders_list.xls"
                          style="color: green; line-height: 2em; cursor: pointer"
                        >
                          Экспорт в Excel
                        </download-excel>
                      </div>
                    </template>
                  </el-table>

                </template>
              </el-table-column>

              <el-table-column
                label="№"
                prop="id"
                width="50"
              />
              <el-table-column
                label="Тип заказа"
                prop="type"
              >
                <template slot-scope="{ row }">
                  <div v-if="row.type === 'sale'" style="background: #67cbe1; padding: 0 10px; color: #fff; width: 80px">Продажа</div>
                  <div v-if="row.type === 'purchase'" style="background: #e99f42; padding: 0 10px; color: #fff; width: 80px">Закупка</div>
                </template>
              </el-table-column>

              <el-table-column
                label="Тип цены"
                prop="price_type"
              >
                <template
                  v-if="row.type === 'sale'"
                  slot-scope="{ row }"
                >
                  <i class="el-icon-money" />
                  <span style="margin-left: 10px">{{ xformPriceType(row.price_type) }}</span>
                </template>
              </el-table-column>

              <el-table-column
                label="Автор"
                prop="reporter"
              >
                <template slot-scope="props">
                  {{ props.row.reporter | getUserName }}
                </template>
              </el-table-column>

              <el-table-column
                label="Создан"
                prop="created_date"
                sortable
              >
                <template slot-scope="scope">
                  <span>{{ new Date(scope.row.created_date).toLocaleDateString('ru', {hour: '2-digit', minute:'2-digit'}) }}</span>
                </template>
              </el-table-column>

              <el-table-column
                label="Изменён"
                prop="updated_date"
                sortable
              >
                <template slot-scope="scope">
                  <span>{{ scope.row.updated_date ? new Date(scope.row.updated_date).toLocaleDateString('ru', {hour: '2-digit', minute:'2-digit'}) : new Date(scope.row.created_date).toLocaleDateString('ru') }}</span>
                </template>
              </el-table-column>

              <el-table-column
                label="Комментарий"
                prop="comment"
              />
              <el-table-column
                label="Сумма"
                prop="total"
                width="150"
              >
                <template slot-scope="scope">
                  <span>{{ scope.row.total ? (scope.row.total - scope.row.sale_xl).toLocaleString('ru', { style: 'currency', currency: 'RUB' }) : 'нет данных' }}</span>
                </template>
              </el-table-column>

              <el-table-column
                label="Скидка на заказ"
                prop="sale_xl"
                width="150"
              >
                <template slot-scope="scope">
                  <span>{{ scope.row.sale_xl ? scope.row.sale_xl.toLocaleString('ru', { style: 'currency', currency: 'RUB' }) : '' }}</span>
                </template>
              </el-table-column>

              <el-table-column
                label="JIRA"
                prop="sale_id"
              >
                <template slot-scope="scope">
                  <el-link type="primary" :href="$options._SETTINGS.jira_url + scope.row.sale_id" target="_blank">{{ scope.row.sale_id }}</el-link>
                </template>
              </el-table-column>
              
              <el-table-column
                label="Действия"
                prop="action"
                width="85px"
                align="center"
                style="cursor: pointer !important;"
              >
                <template slot-scope="{ row }">
                  <el-dropdown trigger="click" style="cursor: pointer; width: 100%" @command="handleCommand">
                    <div>
                      <i
                        class="el-icon-more"
                      />
                    </div>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item :command="{ action: 'edit', row }">Редактировать заказ</el-dropdown-item>
                      <el-dropdown-item :command="{ action: 'edit_parts', row }">Редактировать состав</el-dropdown-item>

                      <el-dropdown-item v-if="!row.sale_id && row.type === 'sale'" :command="{ action: 'link_sale', row }">Привязать SALE</el-dropdown-item>
                      <el-dropdown-item v-if="row.sale_id && row.type === 'sale'" :command="{ action: 'unlink_sale', row }">Отвязать SALE</el-dropdown-item>
                      <el-dropdown-item v-if="!row.sale_id && row.type === 'sale'" :command="{ action: 'create_sale', row }">Создать SALE</el-dropdown-item>

                      <el-dropdown-item v-if="!row.sale_id && row.type === 'purchase'" :command="{ action: 'link_purchase', row }">Привязать ZAKUPKA</el-dropdown-item>
                      <el-dropdown-item v-if="row.sale_id && row.type === 'purchase'" :command="{ action: 'unlink_purchase', row }">Отвязать ZAKUPKA</el-dropdown-item>
                      <el-dropdown-item v-if="!row.sale_id && row.type === 'purchase'" :command="{ action: 'create_purchase', row }">Создать ZAKUPKA</el-dropdown-item>

                      <el-dropdown-item :command="{ action: 'remove', row }">Удалить заказ</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </template>
              </el-table-column>
            </el-table>
          </el-card>

    </el-dialog>

  </div>
</template>

<script>

import settings from '@/settings'
import { mapState, mapGetters } from 'vuex'
// import _ from 'lodash'
// import Confirm from '@/components/shared/Confirm'
import { get, remove, getParts, unlinkSale, unlinkPurchase } from '@/api/market/orders'
import { getUserName } from '@/filters/jira-users.js'

export default {

  _SETTINGS: settings,
  components: {
    Edit: () => import('./edit-order.vue'),
    EditParts: () => import('./edit-order-parts.vue'),
    LinkSale: () => import('./link-sale.vue'),
    CreateSale: () => import('./create-sale.vue'),
    LinkPurchase: () => import('./link-purchase.vue'),
    CreatePurchase: () => import('./create-purchase.vue')
  },

  filters: { getUserName },

  props: {
    show: {
      type: Boolean,
      default: false
    },

    updateFromBasket: {
      type: Boolean,
      default: false
    }

  },

  data() {
    return {
      Orders: [],
      OrdersParts: [],
      editedItem: {},
      JsonFields: {},
      dialog: false,
      dialogEdit: false,
      dialogEditParts: false,
      dialogLinkSale: false,
      dialogCreateSale: false,
      dialogLinkPurchase: false,
      dialogCreatePurchase: false,
      Comment: '',
      search: '',
      loading: false
    }
  },

  computed: {

    ...mapState({
      /* Orders: state => state.market.Orders,
      Basket: state => state.market.Basket, */
      Currency: state => state.currency.Currency
    }),

    ...mapGetters({ Market: 'market_new/market', JiraUsers: 'jira_users', CurrentUser: 'currentUser' }),

    filteredOrders() {
      return this.Orders.filter(data => {
        return (!this.search ||
        (data.comment.toLowerCase().includes(this.search.toLowerCase()) ||
        data.reporter.toLowerCase().includes(this.search.toLowerCase()) ||
        this.xformPriceType(data.price_type).toLowerCase().includes(this.search.toLowerCase())
        ))
      })
    }

    /* filteredAndSorted() {
      return this.Orders.filter(order => {
        if (this.search) {
          if (order.comment) {
            return order.comment.toLowerCase().includes(this.search.toLowerCase())
          } else return false
        } else return true
      })

    } */

  },

  watch: {

    show(val) {
      if (val) this.dialog = val
    },

    updateFromBasket(val) {
      if (val) {
        this.update()
        this.$emit('resetBasketUpdate')
      }
    },

    dialog(val) {
      if (val) {
        if (this.Orders.length === 0 || this.OrdersParts.length === 0) {
          this.update()
        }
      }
      if (!val) this.$emit('close')
    }

  },

  methods: {

    async getOrders() {
      this.loading = true;
      await get()
        .then(res => {

          const arr = res.map(item => {
            item.total = this.getTotal(item)
            return item
          }).filter(i => i.reporter === this.CurrentUser.email)

          this.Orders = [...arr]
          this.loading = false;
        })
    },

    async getOrdersParts() {
      await getParts()
        .then(res => {
          const arr = res.map(item => {
            item.price = Number((item.price || 0).toFixed(2))
            item.summ = item.price * item.qty
            return item
          })
          this.OrdersParts = [...arr]
        })
    },

    sortedByOrders(row) {
      return this.OrdersParts.filter(item => item.order_id === row.id) || []
    },

    partsByOrderId(id) {
      return this.OrdersParts.filter(item => item.order_id === id) || []
    },

    getTotal(data) {
      return this.OrdersParts.filter(i => i.order_id === data.id).reduce((acc, item) => {
        return acc + (+item.summ - (+item.sale_xs * item.qty))
      }, 0)
    },

    getSummaries(param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 8) { // было 5
          data.map(i => i.sale_xs * i.qty).reduce((a, c) => (a + c)) > 0
            ? sums[index] = 'Всего (со скидкой на ЗИП):'
            : sums[index] = 'Всего'
          return
        }
        const values = data.map(item => {
          if (column.property === 'summ') return (item[column.property] - (item['sale_xs'] * item['qty']))
          // if (column.property === 'sale_xs') return item[column.property]
        })

        if (!values.every(value => isNaN(value))) {
          sums[index] = values.reduce((prev, curr) => {
            return !isNaN(Number(curr))
              ? (prev + curr)
              : prev
          }, 0).toLocaleString()
        } else sums[index] = ''
      })

      return sums
    },

    async getJsonFields() {
      if (Object.keys(this.JsonFields).length > 0) return
      await this.$nextTick()
      this.$refs.orderDetails.columns.forEach(item => {
        if (item.label === undefined) return
        this.JsonFields[item.label] = item.property
      })
    },

    xformPriceType(val) {
      switch (val) {
        case 1: return 'Стандартная'
        case 2: return 'Партнёрская'
        case 3: return 'Оптовая'
      }
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
    },

    handleCommand(data) {
      if (data.action === 'edit') this.edit(data.row)
      if (data.action === 'edit_parts') this.editParts(data.row)
      if (data.action === 'link_sale') this.linkSale(data.row)
      if (data.action === 'unlink_sale') this.unlinkSale(data.row)
      if (data.action === 'create_sale') this.createSale(data.row)
      if (data.action === 'link_purchase') this.linkPurchase(data.row)
      if (data.action === 'unlink_purchase') this.unlinkPurchase(data.row)
      if (data.action === 'create_purchase') this.createPurchase(data.row)
      if (data.action === 'remove') this.remove(data.row)
    },

    edit(val) {
      this.editedItem = { ...val }
      setTimeout(() => (this.dialogEdit = true), 200)
    },

    editParts(val) {
      this.editedItem = { ...val }
      setTimeout(() => (this.dialogEditParts = true), 200)
    },





    linkSale(val) {
      this.editedItem = { ...val }
      setTimeout(() => (this.dialogLinkSale = true), 200)
    },

    unlinkSale(val) {
      this.$confirm('Вы точно хотите продолжить?', 'Внимание', {
        confirmButtonText: 'Да',
        cancelButtonText: 'Нет',
        type: 'warning'
      }).then(() => {
        unlinkSale({ id: val.id })
          .then(async res => {
            this.$message({ type: 'success', message: res })
            await this.getOrders()
          })
      })
    },

    createSale(val) {
      this.editedItem = { ...val }
      setTimeout(() => (this.dialogCreateSale = true), 200)
    },

    linkPurchase(val) {
      this.editedItem = { ...val }
      setTimeout(() => (this.dialogLinkPurchase = true), 200)
    },

    unlinkPurchase(val) {
      this.$confirm('Вы точно хотите продолжить?', 'Внимание', {
        confirmButtonText: 'Да',
        cancelButtonText: 'Нет',
        type: 'warning'
      }).then(() => {
        unlinkPurchase({ id: val.id })
          .then(async res => {
            this.$message({ type: 'success', message: res })
            await this.getOrders()
          })
      })
    },

    createPurchase(val) {
      this.editedItem = { ...val }
      setTimeout(() => (this.dialogCreatePurchase = true), 200)
    },



    async update() {
      await this.getOrdersParts()
      await this.getOrders()
    },

    remove(val) {
      this.$confirm('Вы точно хотите удалить этот заказ. Продолжаем?', 'ВНИМАНИЕ', {
        confirmButtonText: 'Да',
        cancelButtonText: 'Нет',
        type: 'warning'
      }).then(() => {
        this.loading = true
        remove({ id: val.id })
          .then(res => {
            setTimeout(() => {
              this.Orders = this.Orders.filter(order => order.id !== val.id)
              this.loading = false
              this.$message({ type: 'success', message: res })
            }, 1000)
          })
      })
    }

  }
}
</script>

<style>
  .tableRowClassName { background: #f3f4f7 !important; } /* #f3f4f7 */
  /* .tableRowClassName:hover { color: rgb(51, 49, 49); } */
  .has-gutter {
    font-weight: 600 !important;
  }
</style>
