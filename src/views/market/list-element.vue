<template>
  <v-container v-loading="!tableData.length || loadingForRemove" :fill-height="!tableData.length" fluid>

    <Dialog
      v-if="dialog"
      :show="dialog"
      :loading="loading"
      :items="dialogItems"
      :options="dialogOptions"
      :action="action"
      :data="editedItem"
      @add="addMarket"
      @update="updateMarket"
      @watchForm="watchForm"
      @closeDialog="closeDialog"
    >
      <template #default>
        <el-row style="margin: 5px auto; background: #f0f0f0; border-radius: 5px; padding: 10px">
          <el-col :span="12">
            <div style="display: flex">
              <span style="width: 35%; text-align: center">Себестоимость</span>
              <el-input v-model="stockPrice" size="mini" readonly style="width: 65%" />
            </div>
          </el-col>
          <el-col :span="12">
            <div style="display: flex">
              <span style="width: 35%; text-align: center">Клиентская</span>
              <el-input v-model="clientPrice" size="mini" readonly style="width: 65%" />
            </div>
          </el-col>
          <el-col :span="12">
            <div style="display: flex">
              <span style="width: 35%; text-align: center">Партнёрская</span>
              <el-input v-model="partnerPrice" size="mini" readonly style="width: 65%" />
            </div>
          </el-col>
          <el-col :span="12">
            <div style="display: flex">
              <span style="width: 35%; text-align: center">Оптовая</span>
              <el-input v-model="optPrice" size="mini" readonly style="width: 65%" />
            </div>
          </el-col>
        </el-row>
      </template>
    </Dialog>

    <!-- Добавление в корзину (кол-во)  -->
    <ConfirmWithCount ref="confirm_with_count" @Count="addItemToBasket" />

    <!-- Тех. характеристики -->
    <el-dialog
      :visible.sync="dialogTechProps"
      width="1000"
    >
      <TechProps :key="editedItem.marketid" :market-item="editedItem" />
    </el-dialog>

    <v-toolbar color="#eaeff5" class="text-lg-right elevation-2 mb-1" dense style="width: 100%">
      <v-toolbar-title>Маркет</v-toolbar-title>
      <v-divider class="mx-3" inset vertical />

      <!-- Настройки таблицы -->
      <el-checkbox
        v-model="showHeader"
      >Заголовок
      </el-checkbox>
      <el-checkbox
        v-model="showSortable"
      >Сортировка
      </el-checkbox>
      <el-checkbox
        v-model="textAlign"
      >Текст по центру
      </el-checkbox>
      <v-divider class="mx-3" inset vertical />

      <v-spacer />

      <!--------- Курсы валют ---------->
      <ExchangeRates />
      <v-spacer />

      <!-- Заказы (магазин) -->
      <el-dropdown
        v-if="(Basket.length > 0 || Orders.length > 0)"
        trigger="click"
        :hide-on-click="false"
        @command="handleCommandOrders"
      >
        <el-button icon="el-icon-s-cooperation" size="mini">
          Заказы
        </el-button>

        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-if="Basket.length > 0" :hide-on-click="false" command="showBasket">
            <Basket
              :show="showBasket"
              @close="showBasket = false"
              @updateFromBasket="updateFromBasket"
            />
          </el-dropdown-item>

          <el-dropdown-item v-if="Orders.length > 0" :hide-on-click="true" command="showOrders">
            <Orders
              :show="showOrders"
              :update-from-basket="isUpdateFromBasket"
              @close="showOrders = false"
              @resetBasketUpdate="isUpdateFromBasket = false"
            />
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <!-- МЕНЮ ДЕЙСТВИЙ -->
      <el-dropdown trigger="click" :hide-on-click="false">
        <el-button size="mini" icon="el-icon-s-operation">
          Действия
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>
            <TableColumns
              :headers="tableHeaders"
              name="marketColumn"
            />
          </el-dropdown-item>
          <el-dropdown-item>
            <!-- Экспорт -->
            <download-excel
              v-if="$refs[`${reference}`]"
              :fields="headersToObject(selectedHeaders)"
              :data="$refs[`${reference}`].$children[0].filteredItems"
              :name="exportFileName"
            >
              Экспорт в Excel
            </download-excel>
          </el-dropdown-item>
          <el-dropdown-item>
            <v-menu
              v-model="menu_th"
              :close-on-content-click="false"
              :nudge-width="100"
              offset-x
            >
              <template #[`activator`]="{ on, attrs }">
                <span v-bind="attrs" v-on="on">
                  Технические характеристики
                </span>
              </template>

              <MarketFilter :types="AllTypes" @setTpFilter="setTpFilter" @resetTpFilter="resetTpFilter" @setType="setType" />

            </v-menu>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <v-divider class="mx-3" inset vertical />

      <el-button
        type="primary"
        size="mini"
        class="mr-5"
        @click="addItem"
      >
        Добавить
      </el-button>

    </v-toolbar>
    <v-spacer />

    <el-table
      v-if="tableData.length"
      :key="key"
      :data="paginatedTableData"
      :max-height="showHeader ? WindowHeight : ''"
      border
      stripe
      fit
      lazy
      row-key="marketid"
      size="mini"
      :header-cell-style="{ background: '#f3f3f3', color: '#6e6e6e' }"
      style="width: 100%; height: 100%"
      @sort-change="customSort"
    >
      <el-table-column
        v-for="(column, idx) in selectedHeaders"
        :key="column.id"
        :prop="column.value"
        :label="column.text"
        :align="column.align || (textAlign ? 'center' : 'left')"
        :width="column.width"
        :fixed="column.fixed"
        resizable
        :sortable="(`sortable` in templateHeaders[idx] && showSortable) ? column.sortable : false"
        show-overflow-tooltip
        :formatter="column.formatter ? null : formatterData"
      >
        <!-- слот для кастомного форматирования данных строки -->
        <template v-if="column.formatter" #default="{ row }">
          <component
            :is="column.formatter"
            v-if="column.formatter"
            :actions="column.actions"
            :row="row"
            :column="column.value"
            @update="editItem"
            @remove="removeMarket"
            @openTH="editTechProps"
            @addToBasket="itemToBasket"
            @detail="detail"
          />
          <div v-else>
            {{ row[column.value] }}
          </div>
        </template>

        <!-- Заголовок таблицы c фильтрами -->
        <template slot="header" slot-scope="scope">
          <div style="word-break: keep-all;">{{ column.text }}</div>
          <TableFilters
            v-if="tableData.length"
            :reference="reference"
            :data="tableData"
            :options="filtersOptions"
            :filters="filters"
            :types="{
              Input: ['marketNAME', 'marketPN', 'marketART'],
              InputNumber: ['marketid', 'marketID'],
              Select: ['elementTYPE', 'marketTYPE', 'marketPARTS', 'marketTYPE', 'marketSUPPLIER', 'marketCOND', 'marketSUPPLIER'],
              MultiSelect: ['marketMODELS', 'marketEMAIL'],
              Date: ['marketDATE'],
              CheckBox: ['marketPHOTO', 'marketTH', 'marketSITE'],
              Switch: [],
              Clear: ['actions']
            }"
            :formatters="formatters"
            :property="scope.column.property"
            @updateData="updateData"
            @updateFilters="updateFilters"
            @resetFilters="resetFilters"
          />
        </template>

      </el-table-column>

      <!-- ---------------------- Преобразованные данные ------------------------ -->

      <!-- <template #[`item.marketid`]="{ item }">
        <td :style="`background-color:${ratingColor(item.marketRating)}; border-radius: 5px; color: ${item.marketRating === 1 || item.marketRating === 5 ? '#fff' : '#000'}`" class="px-2 py-1">{{ item.marketid }}</td>
      </template>

      <template #[`item.marketTH`]="{ }">
        {{ filters.searchMarketTH.length > 0 ? filters.searchMarketTH.map(i => i.name).join(', ') : '' }}
      </template>

      <template #[`item.sebT`]="{ item }">
        <span :style="`${(((+item.priceSTOCK / +item.sebT) > 1.1) || ((1 - (+item.priceSTOCK / +item.sebT )) > 0.1)) && (item.priceSTOCK && item.sebT) ? 'color: red' : ''}`">
          {{ item.sebT }}
        </span>
      </template>

      <template #[`item.sebA`]="{ item }">
        <span :style="`${(((+item.priceSTOCK / +item.sebA) > 1.1) || ((1 - (+item.priceSTOCK / +item.sebA )) > 0.1)) && (item.priceSTOCK && item.sebA) ? 'color: red' : ''}`">
          {{ item.sebA }}
        </span>
      </template> -->

      <!-- <v-list>
        <v-list-item v-if="$acl.check('Edit')" small class="mr-2" @click="editItem(item)">Редактировать</v-list-item>
        <v-list-item v-if="$acl.check('Delete')" small @click="deleteItem(item)">Удалить</v-list-item>
        <v-list-item v-if="$acl.check('BasketAccess') || $acl.check('Agent')" small @click="itemToBasket(item)">Добавить в заказ</v-list-item>
        <v-list-item v-if="$acl.check('Edit')" small @click="editTechProps(item)">Технические характеристики</v-list-item>
        <v-list-item v-if="$acl.check('Edit') || $acl.check('LeadEngineer') || $acl.check('Financier') || $acl.check('Agent')" text fab small left :to="'/market/' + item.marketid">Подробнее</v-list-item>
      </v-list> -->
      <!-- .................... -->

    </el-table>

    <Pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getPaginationData"
    />

  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { createTechProps } from '@/helpers/market/tech-props-filter'
import { getUserName } from '@/filters/jira-users'
import { add, update, remove, checkInRemonts, getMarketParts } from '@/api/market'
import { AclRule } from 'vue-acl'

import { createHeaders, headersToObject, setRemoteCustomSort, createSelectOptionsFromTableData, createSelectOptionsFromSpecificData } from '@/components/DataTable/utils.js'
import { reference, exportFileName, templateHeaders, elementTypes, dialogItems, dialogOptions } from './data.js'
import { getElementType, isPartsInElement, setTHInElement, showElementTypeDialogItems,
  showSomeDialogItems, hideSomeDialogItems, calcStockPrice, calcClientPrice, calcPartnerPrice, calcOptPrice } from './utils.js'
import variables from '@/styles/variables.scss'

export default {

  components: {
    Basket: () => import('./components/basket.vue'),
    Orders: () => import('./components/orders.vue'),
    TechProps: () => import('./components/tech-props.vue'),
    ExchangeRates: () => import('./components/exchange-rates'),
    MarketFilter: () => import('./components/market-filter'),
    ConfirmWithCount: () => import('@/components/shared/ConfirmWithCount.vue'),
    TableColumns: () => import('@/components/DataTable/columns.vue'),
    TableFilters: () => import('@/components/TableFilters/index.vue'),
    Pagination: () => import('@/components/Pagination'),
    Dialog: () => import('@/components/Dialog')
  },

  filters: {

    getUserName

  },

  data() {
    return {
      /* Ext. data / utils */
      templateHeaders,
      headersToObject,
      reference,
      variables,
      exportFileName,
      dialogItems,
      dialogOptions,

      /* Local data */
      tableData: [],
      tableHeaders: [],
      filteredTableData: [],
      paginatedTableData: [],
      filtersOptions: {},
      filters: {},
      json_fields: {},
      editedItem: {},
      prevItem: {},
      formatters: [],
      menuMarketDate: false,
      loading: false,
      loadingForRemove: false,
      key: Math.random(1, 9) * 1000000,
      listQuery: {
        page: 1,
        limit: 27
      },
      stockPrice: null,
      clientPrice: null,
      partnerPrice: null,
      optPrice: null,
      total: 0,
      showHeader: true,
      showSortable: false,
      textAlign: true,
      maxWidth: '100px',
      menu: false,
      menu_th: false,
      localLoading: false,

      ModelMarketList: [],
      AllTypes: [],
      Parts: [],
      Filters: [],
      CurrentOrder: [],
      TechProperties: [],
      WindowHeight: null,

      selectedImage: null,
      imageWidth: '',
      filtered: '',
      showOrders: false,
      showBasket: false,
      isUpdateFromBasket: false,
      showForFilter: false,
      activeFilterName: '',
      active: 'tab-1',

      dialog: false,
      dialogTechProps: false,

      ART_1C: '',

      editedIndex: -1,
      marketTitle: '',

      priceRules: [
        v => !!v || 'Стоковая цена - обязательный параметр!',
        v => /^[0-9.]+$/.test(v) || 'Допускаются только цифры!'
      ],
      ratioRules: [
        v => !!v || 'Коэффициент - обязательный параметр!',
        v =>
          /^[0-9.]+$/.test(v) ||
					'Допускаются только цифры и точка для дробной части!)'
      ],
      allArtRules: [
        v => !!v || 'Артикул - обязательный параметр!',
        v =>
          /^[а-яА-ЯёЁa-zA-Z0-9]+$/.test(v) ||
					'Допускаются только цифры и буквы (латиница и кириллица)!'
      ],
      ReqRules: [
        v => !!v || 'Обязательный параметр!'
      ],
      ObjRules: [
        v => !!v || 'Обязательный параметр!',
        function(v) {
          if (typeof v === 'object') return true
          else return 'Не верный формат ввода!'
        }
      ],
      packRules: [
        function(v) {
          if (v === undefined || v === '' || v === null) {
            return true
          } else {
            return /^[0-9]+$/.test(v) || 'Допускаются только числа!'
          }
        }
      ],
      json_fields_all: {},
      json_meta: [
        [
          {
            key: 'charset',
            value: 'utf-8'
          }
        ]
      ]
    }
  },

  computed: {
    ...mapGetters({ market: 'market_new/market', JiraUsers: 'jira_users', dollar: 'dollar', euro: 'euro' }),
    selectedHeaders() { return this.tableHeaders.filter(header => header.selected) },
    user() { return this.$store.getters.currentUser },

    ...mapState({
      Zip: state => state.zip.Zip,
      Models: state => state.models.models,
      ModelsType: state => state.models.types,
      ProductsType: state => state.products_type.ProductsType,
      Conditions: state => state.conditions.Conditions,
      Suppliers: state => state.suppliers.Suppliers,
      Currency: state => state.currency.Currency,
      Orders: state => state.market.Orders,
      Basket: state => state.market.Basket,
      MarketImg: state => state.marketImg.MarketImg
    }),

    BasketAccess() {
      return new AclRule('admin').or('nom').or('basket').generate()
    },

    Edit() {
      return new AclRule('admin').or('nom').generate()
    },

    Delete() {
      return new AclRule('admin').or('nom').generate()
    },

    Excel() {
      return new AclRule('admin').or('crm').generate()
    },

    userRole() {
      return this.$store.getters.userRole || 'user'
    },
  },

  watch: {
    filteredTableData: {
      immediate: true,
      deep: true,
      handler() {
        this.getPaginationData()
      }
    },

  },

  async beforeMount() {
    this.WindowHeight = window.innerHeight - 150
    this.tableHeaders = await createHeaders(this.templateHeaders)
  },

  async created() {
    console.time('Компонент создавался: ')
    this.$store.dispatch('getCurrency')
    this.$store.dispatch('getRatefromCB')
    if (!this.market.length) await this.$store.dispatch('market_new/get')
    if (!this.MarketImg.length) await this.$store.dispatch('getMarketImg')

    await this.getDataForDialog()
    if (!this.tableData.length) this.getData()

    
    if (!this.Basket.length) this.$store.dispatch('getBasket')
    if (!this.Orders.length) this.$store.dispatch('getOrders')
    if (!this.MarketImg.length) this.$store.dispatch('getMarketImg')

    this.TechProperties = createTechProps()

    this.formatters = [
      { name: 'marketTYPE' },
      { name: 'marketCOND' },
      { name: 'marketSUPPLIER' },
      { name: 'marketEMAIL', formatter: getUserName },
      { name: 'elementTYPE', formatter: getElementType },
      { name: 'marketPARTS', formatter: isPartsInElement },
      { name: 'marketMODELS', prop: 'MODEL' }
    ]

    this.filtersOptions = {
      ...createSelectOptionsFromTableData({ data: this.tableData, columns: this.formatters.filter(i => !i.prop) }),
      ...createSelectOptionsFromSpecificData({ data: this.Models, columns: this.formatters.filter(i => i.prop) })
    }

    // if (key === 'searchMarketTH') obj[key] = [...new Set(newVal)]
    // else obj[key] = newVal
    this.AllTypes = [...this.ModelsType.map(i => ({ ...i, element: 2 })), ...this.ProductsType.map(i => ({ ...i, element: 1 }))]
    this.init()
    console.timeEnd('Компонент создавался: ')
  },

  // ********************************************* МЕТОДЫ *************************************************** //

  methods: {
    async init() {
      window.addEventListener('resize', this.setScreenHeight)
      if (window.location.hash) {
        const id = window.location.hash.replace(/[^0-9]/gim, '')
        this.filters.searchMarketZipID = id
      }
      this.maxWidth = localStorage.getItem('sizeColName')
    },

    detail(item) {
      this.$router.push(`/market/${item.marketid}`)
    },

    /**
     * Получение основных данных
     */
    getData() {
      console.time('Загрузка данных: ')
      const photoColumn = this.tableHeaders.find(header => header.value === 'marketPHOTO')
      this.tableData = this.market.map(el => ({
        ... el,
        marketTH: setTHInElement(el, this.TechProperties),
        marketPHOTO: photoColumn?.selected ? this.setPhotoToElement(el) : null
      }))

      this.dialogItems.forEach(obj => {
        if (Object.prototype.hasOwnProperty.call(obj, 'options')) {
          if (obj.value === 'elementTYPE') obj.options = [...elementTypes]
          if (obj.value === 'marketMODELS') obj.options = [...this.Models]
          if (obj.value === 'marketSUPPLIER') obj.options = [...this.Suppliers]
          if (obj.value === 'marketCOND') obj.options = [...this.Conditions]
          if (obj.value === 'CUR') obj.options = [...this.Currency]

          if (obj.value === 'ZIP') {
            obj.options = this.Zip.map(item => {
              return { ...item, name: this.namePlusArt(item) }
            })
          }
          if (obj.value === 'MODEL') {
            obj.options = this.Models.map(item => {
              return { ...item, name: this.namePlusModel(item) }
            })
          }
          if (obj.value === 'Parts') {
            obj.options = this.tableData.map(obj => {
              return { ...obj, name: this.idNameTypeArtPNModels(obj) }
            })
          }
        }
      })
      console.timeEnd('Загрузка данных: ')
    },

    async getDataForDialog() {
      if (!this.Zip.length) await this.$store.dispatch('fetchZip')
      if (!this.Models.length) await this.$store.dispatch('models/models')
      if (!this.ModelsType.length) await this.$store.dispatch('models/types')
      if (!this.Parts.length) await this.$store.dispatch('fetchParts')
      if (!this.ProductsType.length) await this.$store.dispatch('fetchProductsType')
      if (!this.Suppliers.length) await this.$store.dispatch('fetchSuppliers')
      if (!this.Conditions.length) await this.$store.dispatch('fetchConditions')
    },

    /**
     * Форматируем данные в таблице
     */

    formatterData(row, column, cellValue) {
      if (column.property === 'marketDATE') {
        return cellValue
          ? new Date(cellValue).toLocaleDateString('ru')
          : null
      }
      if (column.property === 'marketEMAIL') {
        return cellValue
          ? getUserName(cellValue)
          : null
      }
      if (column.property === 'marketPRICE') {
        return cellValue
          ? cellValue + ' ' + row.CUR
          : null
      }
      if (column.property === 'marketSITE') {
        return (cellValue > 0
          ? '*'
          : null)
      }
      if (column.property === 'elementTYPE') {
        return cellValue
          ? getElementType(cellValue)
          : null
      }
      return cellValue
    },

    /**
     * устанавливаем кастомную сортировку для таблицы
     */
    customSort({ prop, order }) {
      if (!order) return
      this.filteredTableData = this.tableData.sort((a, b) => setRemoteCustomSort(a, b, prop, order))
    },

    /**
     * устанавливаем себестоимость, клиентскую, партнёрскую и оптовую цены для маркета
     */
    applyCalculatedPrices(data) {
      this.stockPrice = calcStockPrice(data).toLocaleString('ru', { style: 'currency', currency: 'RUB' })
      this.clientPrice = calcClientPrice(data).toLocaleString('ru', { style: 'currency', currency: 'RUB' })
      this.partnerPrice = calcPartnerPrice(data).toLocaleString('ru', { style: 'currency', currency: 'RUB' })
      this.optPrice = calcOptPrice(data).toLocaleString('ru', { style: 'currency', currency: 'RUB' })
    },

    /**
     * Диалог добавление новой позиции + бизнес логика
     */
    async addItem() {
      this.loading = true
      await this.getDataForDialog()
      this.loading = false
      this.dialog = true
      this.action = 'add'
      this.editedItem = {
        marketPRICE: 0,
        K1: 1,
        K2: 2.44,
        CUR: { id: 1, sign: '₽', name: 'руб.', rate: 1 }
      }
      hideSomeDialogItems(this.dialogItems, ['ZIP', 'MODEL'])
      showSomeDialogItems(this.dialogItems, ['Parts'])
    },

    /**
     * Диалог редактирования новой позиции + бизнес логика
     */
    editItem(item) {
      this.dialog = true
      this.action = 'update'
      hideSomeDialogItems(this.dialogItems, ['Parts'])
      const addNamePropForZip = this.namePlusArt(this.Zip.find(i => i.zipID === item.marketID))
      const addNamePropForModel = this.namePlusModel(this.Models.find(i => i.ID === item.marketID))

      this.prevItem = {
        ...item,
        elementTYPE: elementTypes.find(i => i.id === item.elementTYPE),
        marketPACK: item.marketPack,
        ZIP: { ...this.Zip.find(i => i.zipID === item.marketID), name: addNamePropForZip },
        MODEL: { ...this.Models.find(i => i.ID === item.marketID), name: addNamePropForModel },
        user: this.user.email,
        displayName: getUserName(this.user.email),
      }

      this.editedItem = {
        ...item,
        elementTYPE: elementTypes.find(i => i.id === item.elementTYPE),
        marketSUPPLIER: this.Suppliers.find(i => i.name === item.marketSUPPLIER),
        marketCOND: this.Conditions.find(i => i.name_ru === item.marketCOND),
        marketPACK: item.marketPack,
        CUR: this.Currency.find(i => i.sign === item.CUR) || ({ id: 1, sign: '₽', name: 'руб.', rate: 1 }),
        ZIP: { ...this.Zip.find(i => i.zipID === item.marketID), name: addNamePropForZip },
        MODEL: { ...this.Models.find(i => i.ID === item.marketID), name: addNamePropForModel },
        marketSITE: !!item.marketSITE,
        user: this.user.email,
        displayName: getUserName(item.EMAIL),
      }

      this.applyCalculatedPrices(this.editedItem)
    },

    /**
     * Отслеживание и update цен с учётом редактирования формы
     */
    updatePrices(form) {
      this.editedItem.marketPRICE = +form.marketPRICE
      this.editedItem.K1 = +form.K1
      this.editedItem.K2 = +form.K2
      this.editedItem.CUR = form.CUR
    },

    /**
     * Наблюдатель за формой
     */
    watchForm(form) {
      showElementTypeDialogItems(this.dialogItems, form['elementTYPE'])
      this.updatePrices(form)
      if (form.marketPRICE && form.CUR && (form.K1 || form.K2)) this.applyCalculatedPrices(this.editedItem)
      if (form.MODEL?.ID) {
        this.getPartsForModel(form.MODEL.ID)
      }
    },

    getPaginationData() {
      this.paginatedTableData = this.filteredTableData.filter((item, index) => index < this.listQuery.limit * this.listQuery.page && index >= this.listQuery.limit * (this.listQuery.page - 1))
      this.total = this.filteredTableData.length
    },

    updateData(data) {
      this.filteredTableData = data || this.tableData
    },

    updateFilters(val) {
      if (val) this.filters = { ...val }
    },

    resetFilters() {
      this.filters = {}
      this.updateData()
    },

    editTechProps(item) {
      this.dialogTechProps = true
      this.editedItem = { ...item }
    },

    setPhotoToElement(tableRow) {
        const image = this.MarketImg.find(item => +item.id === tableRow.marketid)
        return image?.url || null
    },

    async getPartsForModel(modelID) {
      const res = await getMarketParts({ id: modelID })
      const Parts = this.dialogItems.find(i => i.value === 'Parts')
      this.$nextTick(() => {
        Parts.options = res.length
          ? res.map(i => ({ ...i, name: this.idNameTypeArtPNModels(i) }))
          : this.tableData.map(i => ({ ...i, name: this.idNameTypeArtPNModels(i) }))
      })
    },

    // async getExel() {
    //   const filtered = this.headers.filter(header => header.selected === true)
    //   filtered.forEach(item => {
    //     this.json_fields[item.text] = item.value
    //     if (item.text === 'Стоковая') {
    //       this.json_fields['Валюта'] = 'CUR'
    //     }
    //   })
    //   return this.$refs.marketTable.$children[0].filteredItems
    // },

    setScreenHeight(event) {
      this.ScreenHeight = event.target.innerHeight - 150
    },

    getParts() {
      this.Parts = this.$store.getters.Parts
    },

    getModels() {
      return [...new Set(this.Models.map(i => i.MODEL))]
    },

    setType(val) {
      if (val) this.filters.searchMarketType = val.name
    },

    setTpFilter(val) {
      this.filters.searchMarketTH = val
    },

    resetTpFilter() {
      this.filters.searchMarketTH = []
      this.filters.searchMarketType = ''
    },

    // ================================================================ //

    // gotoMainZip(id) {
    //   this.$router.replace('/zip/#' + id)
    // },

    // gotoMainModels(id) {
    //   this.$router.replace('/models/#' + id)
    // },

    namePlusArt(item) {
      return item?.ids
        ? '(' + item.zipID + ') ' + item.zipNAME + ' — ' + item.zipART
        : item?.zipID
          ? '(' + item.zipID + ') ' + item.zipNAME + ' — (X) Нет в маркете'
          : null
    },
    namePlusModel(item) {
      return item?.ID && item?.TYPE && item?.MODEL && item?.VENDOR
        ? '(' + item?.ID + ') ' + item?.TYPE + ' — ' + item?.MODEL + ' (' + item?.VENDOR + ')'
        : null
    },
    idNameTypeArtPNModels(item) {
      return '(' + item?.marketid + ') ' + '[' + item?.marketART + ', ' + item?.marketCOND + ', ' + item?.marketSUPPLIER + '] ' + item?.marketNAME + ' (' + item?.marketPN + ') - ' + item?.marketMODELS
    },
    ratingColor(rating) {
      switch (rating) {
        case 1: return 'red'
        case 2: return 'orange'
        case 3: return 'yellow'
        case 4: return 'lime'
        case 5: return 'green'
        default: return 'grey lighten-1'
      }
    },
    replaceComma(item) {
      if (item && item.includes(',')) {
        return item.replace(/,/g, '<br />')
      } else return item
    },

    closeDialog() {
      this.dialog = false
    },

    /*  =====================================  ЗАКАЗЫ  ======================================   */

    handleCommandOrders(command) {
      if (command === 'showBasket') this.showBasket = true
      if (command === 'showOrders') this.showOrders = true
    },

    updateFromBasket(val) {
      this.isUpdateFromBasket = val
    },

    async itemToBasket(item) {
      if (item.marketPRICE && item.marketPRICE !== 0) {
        if (await this.$refs.confirm_with_count.open('Кол-во товара:', 'Добавить?', item.marketid, { color: 'orange' })) {
          this.$store.commit('setData', 'Позиция добавлена в корзину.')
        } else {
          this.$store.commit('setInfo', 'Добавление отменено.')
        }
      } else {
        this.$store.commit('setInfo', 'Товар не имеет цены! Добавление не может быть продолжено.')
      }
    },
    addItemToBasket(data) {
      const marketBasket = JSON.parse(localStorage.getItem('marketBasket'))
      if (marketBasket) {
        const isInBasket = marketBasket.CurrentOrder.find(i => i.marketid === data.marketid)
        if (isInBasket) isInBasket.Count = Number(isInBasket.Count) + Number(data.Count)
        else marketBasket.CurrentOrder.push(data)
        localStorage.setItem('marketBasket', JSON.stringify({ CurrentOrder: marketBasket.CurrentOrder }))
        this.$store.dispatch('setBasket', { CurrentOrder: marketBasket.CurrentOrder })
      } else {
        this.CurrentOrder.push(data)
        localStorage.setItem('marketBasket', JSON.stringify({ CurrentOrder: this.CurrentOrder }))
        this.$store.dispatch('setBasket', { CurrentOrder: this.CurrentOrder })
      }
    },

    /* ========================================== Добавление позиции Маркета ================================================= */

    addMarket(form) {
      this.loading = true
      const new_data = { ...form, email: this.user.email, displayName: getUserName(this.user.email) }

      add(new_data)
        .then(async res => {
          if (!res.insertId) {
            return this.$notify({ type: 'error', message: 'Произошла ошибка в процессе добавления Маркета.' })
          }
          await this.$store.dispatch('market_new/get')
          this.getData()
          this.key = Math.random(1, 9) * 1000000
          this.$notify({ type: 'success', message: 'Информация успешно добавлена.' })
          this.closeDialog()
        })
        .catch(err => {
          console.log(err)
          this.$notify({ type: 'error', message: err })
        })
        .finally(() => (this.loading = false))
    },

    /* =========================== Редактирование позиции Маркета =========================== */
    updateMarket(form) {
      const new_data = { ...form, email: this.user.email, displayName: getUserName(this.user.email) }
      this.loading = true

      update({ new_data, prev_data: this.prevItem })
        .then(async() => {
          await this.$store.dispatch('market_new/get')
          this.getData()
          this.key = Math.random(1, 9) * 1000000
          this.closeDialog()
          this.$notify({ type: 'success', message: 'Информация успешно обновлена.', duration: 8000 })
        })
        .catch(err => {
          console.log(err)
          this.$notify({ type: 'error', message: err })
        })
        .finally(() => (this.loading = false))
    },

    // ============================  Удаление позиции Маркета ============================== //

    async removeMarket(item) {
      this.loadingForRemove = true
      const { marketid } = item
      let confirm
      const index = this.tableData.indexOf(item)
      const res = await checkInRemonts({ id: marketid })
      const { zID, Qty } = res[0]

      zID !== null
        ? confirm = await this.$confirm('Данная позиция выбрана в незакрытых ремонтах. Открыть отдельное окно Jira для их редактирования? Количество запросов - ' + Qty + ' шт.')
        : confirm = await this.$confirm('Вы уверены, что хотите удалить эту позицию в Маркете?')

      if (zID && confirm) return window.open('http://support.atlas-pro24.local/issues/?jql=id in (' + zID + ')')

      remove({
        id: marketid,
        DISPLAY_NAME: getUserName(this.user.email)
      })
        .then(() => {
          this.tableData.splice(index, 1)
          this.key = Math.random(1, 9) * 1000000
          this.$notify({ type: 'success', message: 'Позиция успешно удалена.' })
        })
        .catch(err => {
          console.log(err)
          this.$notify({ type: 'error', message: err })
        })
        .finally(() => (this.loadingForRemove = false))
    },
  }

}
</script>

<style scoped>
.v-input--selection-controls {
  margin-top: 5px !important;
  padding-top: 5px !important;
}
.v-list-item {
  min-height: 25px !important;
}
.th {
  margin-right: 8px;
  font-size: 14px;
}
.models {
	word-break: break-all;
}
.xlsx_btn {
	cursor: pointer;
	touch-action: none;
}
.maxWidth {
	max-width: 100px !important;
}
.minWidth {
	min-width: 200px !important;
}
.noWrap {
    white-space: nowrap;
}

.el-dropdown {
  margin-right: 10px !important;
}
</style>
