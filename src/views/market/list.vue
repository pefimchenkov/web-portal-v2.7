<template>
  <v-container v-loading="(!state.tableData.length || state.loadingForRemove)" :fill-height="!state.tableData.length" fluid>


    <Dialog
      v-if="state.dialog"
      ref="dialogForm"
      :show="state.dialog"
      :loading="state.loading"
      :items="state.dialogItems"
      :options="state.dialogOptions"
      :action="state.action"
      :data="state.editedItem"
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
              <el-input v-model="state.stockPrice" size="mini" readonly style="width: 65%" />
            </div>
          </el-col>
          <el-col :span="12">
            <div style="display: flex">
              <span style="width: 35%; text-align: center">Клиентская</span>
              <el-input v-model="state.clientPrice" size="mini" readonly style="width: 65%" />
            </div>
          </el-col>
          <el-col :span="12">
            <div style="display: flex">
              <span style="width: 35%; text-align: center">Партнёрская</span>
              <el-input v-model="state.partnerPrice" size="mini" readonly style="width: 65%" />
            </div>
          </el-col>
          <el-col :span="12">
            <div style="display: flex">
              <span style="width: 35%; text-align: center">Оптовая</span>
              <el-input v-model="state.optPrice" size="mini" readonly style="width: 65%" />
            </div>
          </el-col>
        </el-row>
      </template>
    </Dialog>




    <!-- Добавление в корзину (кол-во)  -->

    <ConfirmWithCount
      ref="confirm_with_count"
      @Count="addItemToBasket"
    />

    <!-- Тех. характеристики -->
    <el-dialog
      :visible.sync="state.dialogTechProps"
      width="1000"
    >
      <TechProps :key="state.editedItem.marketid" :market-item="state.editedItem" />
    </el-dialog>

    <v-toolbar color="#eaeff5" class="text-lg-right elevation-2 mb-1" dense style="width: 100%">
      <v-toolbar-title>Маркет</v-toolbar-title>
      <v-divider class="mx-3" inset vertical />

      <!-- Настройки таблицы -->
      <el-checkbox
        v-model="state.showHeader"
      >Заголовок
      </el-checkbox>
      <el-checkbox
        v-model="state.showSortable"
      >Сортировка
      </el-checkbox>
      <el-checkbox
        v-model="state.textAlign"
      >Текст по центру
      </el-checkbox>
      <v-divider class="mx-3" inset vertical />

      <v-spacer />
      

      <!--------- Курсы валют ---------->
      <ExchangeRates />
      <v-spacer />

      <v-divider class="mx-3" inset vertical />

      <!-- Заказы (магазин) -->

      <Basket
        v-if="basket.length"
        :show="state.showBasket"
        @close="state.showBasket = false"
        @updateFromBasket="updateFromBasket"
        class="mr-3"
      />

      <Orders
        v-if="orders.length"
        :show="state.showOrders"
        :update-from-basket="state.isUpdateFromBasket"
        @close="state.showOrders = false"
        @resetBasketUpdate="state.isUpdateFromBasket = false"
        class="mr-3"
      />
      



      <!-- МЕНЮ ДЕЙСТВИЙ -->
      <el-dropdown trigger="click" :hide-on-click="false">
        <el-button size="mini" icon="el-icon-s-operation">
          Действия
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>
            <TableColumns
              v-if="state.tableHeaders.length"
              :headers="state.tableHeaders"
              name="marketColumn"
            />
          </el-dropdown-item>
          <el-dropdown-item>

            <!-- Экспорт -->
            <ExportExcel
              :list="state.filteredTableData"
              type="plain"
              :header="selectedHeaders.map(header => header.value)"
              :ru-header="selectedHeaders.map(header => header.text)"
              :table-name="exportFileName"
            />
          </el-dropdown-item>
          <el-dropdown-item>
            <v-menu
              v-model="state.menu_th"
              :close-on-content-click="false"
              :nudge-width="100"
              offset-x
            >
              <template #[`activator`]="{ on, attrs }">
                <span v-bind="attrs" v-on="on">
                  Технические характеристики
                </span>
              </template>

              <MarketFilter :types="state.AllTypes" @setTpFilter="setTpFilter" @resetTpFilter="resetTpFilter" @setType="setType" />

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
      v-if="state.tableData.length"
      :key="state.tableData.length"
      ref="marketTable"
      :data="state.paginatedTableData"
      :max-height="state.showHeader ? state.WindowHeight : ''"
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
      <!-- :sortable="(`sortable` in templateHeaders[idx] && state.showSortable) ? column.sortable : false" -->
      <el-table-column
        v-for="(column, idx) in selectedHeaders"
        :key="column.id"
        :prop="column.value"
        :label="column.text"
        :align="column.align || (state.textAlign ? 'center' : 'left')"
        :width="column.width"
        :fixed="column.fixed"
        resizable
        :sortable="
          Object.hasOwn(state.templateHeaders[idx], 'sortable') && state.showSortable
            ? column.sortable
            : false
        "
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
            :id="row.marketID"
            @update="editItem"
            @remove="removeMarket"
            @openTH="editTechProps"
            @addToBasket="openBasketDialog"
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
            v-if="state.tableData.length > 0"
            :reference="reference"
            :data="state.tableData"
            :options="state.filtersOptions"
            :filters="state.filters"
            :types="{
              Input: ['marketNAME', 'marketPN', 'marketART'],
              InputNumber: ['marketid', 'marketID'],
              Select: ['elementTYPE', 'marketTYPE', 'marketPARTS', 'marketTYPE', 'marketSUPPLIER', 'marketCOND', 'marketSUPPLIER'],
              MultiSelect: ['marketMODELS', 'marketEMAIL'],
              Date: ['marketDATE'],
              CheckBox: ['marketPHOTO', 'marketTH', 'marketSITE', 'marketIM', 'marketABS'],
              Switch: [],
              Clear: ['actions']
            }"
            :formatters="state.formatters"
            :property="scope.column.property"
            @updateData="updateData"
            @updateFilters="updateFilters"
            @resetFilters="resetFilters"
          />
        </template>

      </el-table-column>

    </el-table>

    <Pagination
      v-show="state.total > 0"
      :total="state.total"
      :page.sync="state.listQuery.page"
      :limit.sync="state.listQuery.limit"
      @pagination="getPaginationData"
    />

  </v-container>
</template>

<script setup>

  import Vue, { computed, ref, reactive, watch, onBeforeMount, onBeforeUnmount, onMounted, nextTick } from 'vue'
  import store from '@/store'
  import router from '@/router' 
  import variables from '@/styles/variables.scss'
  import { Notification, MessageBox } from 'element-ui'
  import ExportExcel from '@/components/ExportExcel'

  import { createTechProps } from '@/helpers/market/tech-props-filter'
  import { getUserName } from '@/filters/jira-users'
  import { add, update, remove, checkInRemonts, getMarketParts } from '@/api/market'
  // import { AclRule } from 'vue-acl'

  import { createHeaders, headersToObject, setRemoteCustomSort, createSelectOptionsFromTableData, createSelectOptionsFromSpecificData } from '@/components/DataTable/utils.js'
  import { reference, exportFileName, templateHeaders, elementTypes, dialogItems, dialogOptions } from './data.js'
  import { getElementType, isPartsInElement, setTHInElement, showElementTypeDialogItems,
    showSomeDialogItems, hideSomeDialogItems, calcStockPrice, calcClientPrice, calcPartnerPrice, calcOptPrice } from './utils.js'

  import { filterHandler } from '@/workers/filters.js'
 

  import Dialog from '@/components/Dialog'
  import Pagination from '@/components/Pagination'
  import TableFilters from '@/components/TableFilters/index.vue'
  import TableColumns from '@/components/DataTable/columns.vue'
  import ConfirmWithCount from '@/components/shared/ConfirmWithCount.vue'
  import MarketFilter from './components/market-filter'
  import ExchangeRates from './components/exchange-rates'
  import TechProps from './components/tech-props.vue'
  import Orders from './components/orders.vue'
  import Basket from './components/basket.vue'

  const state = reactive({
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
    listQuery: { page: 1, limit: 25 },
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
    CurrentOrder: [],
    TechProperties: [],
    elementTypes,
    WindowHeight: null,
    showOrders: false,
    showBasket: false,
    isUpdateFromBasket: false,
    dialog: false,
    dialogTechProps: false,
    templateHeaders,
    reference,
    headersToObject,
    exportFileName,
    dialogItems,
    dialogOptions,
    variables
  })


  const confirm_with_count = ref('');
  const dialogForm = ref('');
  const marketTable = ref(null);



  const selectedHeaders = computed(() => state.tableHeaders.filter(header => header.selected));
  const market = computed(() => store.getters['market_new/market']);
  const user = computed(() => store.getters['auth/currentUser']);
  const Zip = computed(() => store.state.zip.Zip);
  const Models = computed(() => store.state.models.models);
  const ModelsType = computed(() => store.state.models.types);
  const ProductsType = computed(() => store.state.products_type.ProductsType);
  const Conditions = computed(() => store.state.conditions.Conditions);
  const Suppliers = computed(() => store.state.suppliers.Suppliers);
  const Currency = computed(() => store.state.currency.Currency);
  const MarketImg = computed(() => store.state.marketImg.MarketImg);

  console.log('Currency', Currency.value)

  const isDialogVisible = computed(() => {
    return (!!Zip.value.length && !!Models.value.length &&  !!ModelsType.value.length && !!ProductsType.value.length && !!Conditions.value.length && !!Suppliers.value.length)
  });

  const orders = computed(() => store.state.market.Orders)
  const basket = computed(() => store.state.market.Basket)



  watch(() => state.filteredTableData, () => {
    getPaginationData()
  }, { deep: true, immediate: true })



  watch(() => state.total, async (val) => {
    if (val > 0) {
      await getDataForDialog();
      setFormattersForOptions();

      if (!basket.value?.length) store.dispatch('getBasket');
      if (!orders.value?.length) store.dispatch('getOrders');
    }
  })



  onBeforeMount(async() => {
    state.WindowHeight = window.innerHeight - 190
    state.tableHeaders = await createHeaders(state.templateHeaders)

    state.filters = JSON.parse(localStorage.getItem(state.reference)) || {};

  })



  onMounted(async() => {
    console.time('Компонент создавался: ');
    if (!MarketImg?.value.length) store.dispatch('getMarketImg');
    if (!market?.value.length) await store.dispatch('market_new/get');

    if (!state.tableData?.length) getData();
    init();


    updateData();
    console.timeEnd('Компонент создавался: ');
  })



  onBeforeUnmount(() => {
    window.removeEventListener('resize', state.setScreenHeight);
  })


  

  // ********************************************* МЕТОДЫ *************************************************** //

    async function init() {
      window.addEventListener('resize', state.setScreenHeight)
      if (window.location.hash) {
        const id = window.location.hash.replace(/[^0-9]/gim, '')
        state.filters['marketID'] = id
      }
      state.maxWidth = localStorage.getItem('sizeColName');

    }


    /**
     * Проваливаемся в `Подробнее` по id позиции
     */
    function detail(item) {
      console.log(item)
      router.push(`/market/${item.marketid}`)
    }

    /**
     * Получение основных данных
     */
    function getData() {
      console.time('Загрузка Маркета: ');
      const photoColumn = state.tableHeaders.find(header => header.value === 'marketPHOTO');
      
      state.tableData = market?.value?.map(el => ({
        ... el,
        elementTYPE: getElementType(el.elementTYPE),
        marketEMAIL: getUserName(el.marketEMAIL),
        marketPARTS: isPartsInElement(el.marketPARTS),
        marketTH: setTHInElement(el, state.TechProperties),
        marketPHOTO: photoColumn?.selected ? setPhotoToElement(el) : null
      }));

      state.TechProperties = createTechProps();
      console.timeEnd('Загрузка Маркета: ');

      //console.log('tate.tableData', state.tableData)
    }



    /* Получение дополнительных данных */
    async function getDataForDialog() {
      
      if (isDialogVisible.value) return;

      await store.dispatch('fetchZip')
      await store.dispatch('models/models')
      await store.dispatch('models/types')
      await store.dispatch('fetchParts')
      await store.dispatch('fetchProductsType')
      await store.dispatch('fetchSuppliers')
      await store.dispatch('fetchConditions')
      await store.dispatch('getCurrency')


      state.dialogItems.forEach(obj => {
        if (Object.prototype.hasOwnProperty.call(obj, 'options')) {
          if (obj.value === 'elementTYPE') obj.options = [...elementTypes];
          if (obj.value === 'marketMODELS') obj.options = [...Models.value];
          if (obj.value === 'marketSUPPLIER') obj.options = [...Suppliers.value];
          if (obj.value === 'marketCOND') obj.options = [...Conditions.value];
          if (obj.value === 'CUR') obj.options = [...Currency.value];
          if (obj.value === 'ZIP') obj.options = Zip.value.map(item => { return { ...item, name: namePlusArt(item) } });
          if (obj.value === 'MODEL') obj.options = Models.value.map(item => { return { ...item, name: namePlusModel(item) } });
          if (obj.value === 'Parts') obj.options = state.tableData.map(obj => { return { ...obj, name: idNameTypeArtPNModels(obj) } });
        }
      })

    }

    function setFormattersForOptions() {

      state.formatters = [
        { name: 'marketPHOTO' },
        { name: 'marketTYPE' },
        { name: 'marketCOND' },
        { name: 'elementTYPE' },
        { name: 'marketSUPPLIER' },
        { name: 'marketEMAIL', },
        { name: 'marketPARTS' },
        { name: 'marketMODELS', prop: 'MODEL' }
      ]

      state.filtersOptions = {
        ...createSelectOptionsFromTableData({ data: state.tableData, columns: state.formatters.filter(i => !i.prop) }),
        ...createSelectOptionsFromSpecificData({ data: Models?.value, columns: state.formatters.filter(i => i.prop) })
      }

      state.AllTypes = [...ModelsType.value.map(i => ({ ...i, element: 2 })), ...ProductsType.value.map(i => ({ ...i, element: 1 }))]


    }

    /**
     * Форматируем данные в таблице
     */

    function formatterData(row, column, cellValue) {
      if (column.property === 'marketDATE') {
        return cellValue
          ? new Date(cellValue).toLocaleDateString('ru')
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

      if (column.property === 'marketIMAddress') {
        return cellValue === '0 0 0'
          ? ''
          : cellValue?.split(" ").join(" * ")
      }

      return cellValue
    }

    /**
     * устанавливаем кастомную сортировку для таблицы
     */
    function customSort({ prop, order }) {
      if (!order) return
      state.filteredTableData = state.tableData.sort((a, b) => setRemoteCustomSort(a, b, prop, order))
    }

    /**
     * устанавливаем себестоимость, клиентскую, партнёрскую и оптовую цены для маркета
     */
    function applyCalculatedPrices(data) {
      state.stockPrice = calcStockPrice(data).toLocaleString('ru', { style: 'currency', currency: 'RUB' })
      state.clientPrice = calcClientPrice(data).toLocaleString('ru', { style: 'currency', currency: 'RUB' })
      state.partnerPrice = calcPartnerPrice(data).toLocaleString('ru', { style: 'currency', currency: 'RUB' })
      state.optPrice = calcOptPrice(data).toLocaleString('ru', { style: 'currency', currency: 'RUB' })
    }

    /**
     * Диалог добавление новой позиции + бизнес логика
     */
    async function addItem() {
      state.loading = false
      state.dialog = true
      state.action = 'add'
      state.editedItem = {
        marketPRICE: 0,
        K1: 1,
        K2: 2.44,
        elementTYPE: {id: 1, name: 'ЗИП' },
        CUR: { id: 1, sign: '₽', name: 'руб.', rate: 1 }
      }
      hideSomeDialogItems(state.dialogItems, ['ZIP', 'MODEL'])
      showSomeDialogItems(state.dialogItems, ['Parts'])
    }

    /**
     * Диалог редактирования новой позиции + бизнес логика
     */
    async function editItem(item) {

      state.dialog = true;
      state.action = 'update';
      hideSomeDialogItems(state.dialogItems, ['Parts']);
      const addNamePropForZip = namePlusArt(Zip.value.find(i => i.zipID === item.marketID));
      const addNamePropForModel = namePlusModel(Models.value.find(i => i.ID === item.marketID));

      state.prevItem = {
        ...item,
        elementTYPE: elementTypes.find(i => i.id === item.elementTYPE),
        marketPACK: item.marketPack,
        ZIP: { ...Zip.value.find(i => i.zipID === item.marketID), name: addNamePropForZip },
        MODEL: { ...Models.value.find(i => i.ID === item.marketID), name: addNamePropForModel },
        user: user.value.email,
        displayName: getUserName(user.value.email),
        }

        state.editedItem = {
          ...item,
          elementTYPE: elementTypes.find(i => i.id === item.elementTYPE),
          marketSUPPLIER: Suppliers.value.find(i => i.name === item.marketSUPPLIER),
          marketCOND: Conditions.value.find(i => i.name_ru === item.marketCOND),
          marketPACK: item.marketPack,
          CUR: Currency.value.find(i => i.sign === item.CUR) || ({ id: 1, sign: '₽', name: 'руб.', rate: 1 }),
          ZIP: { ...Zip.value.find(i => i.zipID === item.marketID), name: addNamePropForZip },
          MODEL: { ...Models.value.find(i => i.ID === item.marketID), name: addNamePropForModel },
          marketSITE: !!item.marketSITE,
          user: user.value.email,
          displayName: getUserName(item.EMAIL),
        }


      applyCalculatedPrices(state.editedItem)
    }

    /**
     * Отслеживание и update цен с учётом редактирования формы
     */
    function updatePrices(form) {
      state.editedItem.marketPRICE = +form.marketPRICE
      state.editedItem.K1 = +form.K1
      state.editedItem.K2 = +form.K2
      state.editedItem.CUR = form.CUR
    }

    /**
     * Наблюдатель за формой
     */
    function watchForm(form) {
      showElementTypeDialogItems(state.dialogItems, form['elementTYPE'])
      updatePrices(form)

      
      if (form.marketPRICE && form.CUR && (form.K1 || form.K2)) applyCalculatedPrices(state.editedItem)
      if (form.MODEL?.ID) getPartsForModel(form.MODEL.ID)
    }

    function getPaginationData() {
      state.paginatedTableData = state.filteredTableData.filter((item, index) => index < state.listQuery.limit * state.listQuery.page && index >= state.listQuery.limit * (state.listQuery.page - 1))
      state.total = state.filteredTableData.length
    }



    function updateData() {

      Vue.prototype.$worker
        .run(filterHandler , [JSON.stringify(state.filters), JSON.stringify(state.tableData), JSON.stringify(state.formatters)])
        .then(res => {
          state.filteredTableData = (res || state.tableData)
          localStorage.setItem(state.reference, JSON.stringify(state.filters))
        })
        .catch(console.error)

    }



    function updateFilters(val) {
      if (val) state.filters = { ...val }
    }



    function resetFilters() {
      state.filters = {}
      state.filteredTableData = state.tableData
    }



    function editTechProps(item) {
      state.dialogTechProps = true
      state.editedItem = { ...item }
    }



    function setPhotoToElement(tableRow) {
        const image = MarketImg.value.find(item => +item.id === tableRow.marketid);
        return image?.url || null
    }



    async function getPartsForModel(modelID) {
      const res = await getMarketParts({ id: modelID })
      const Parts = state.dialogItems.find(i => i.value === 'Parts')
      // eslint-disable-next-line no-undef
      nextTick(() => {
        Parts.options = res.length
          ? res.map(i => ({ ...i, name: idNameTypeArtPNModels(i) }))
          : state.tableData.map(i => ({ ...i, name: idNameTypeArtPNModels(i) }))
      })
    }



    function setType(val) {
      if (val) state.filters.searchMarketType = val.name
    }



    function setTpFilter(val) {
      state.filters.searchMarketTH = val
    }



    function resetTpFilter() {
      state.filters.searchMarketTH = []
      state.filters.searchMarketType = ''
    }

    // ================================================================ //

    function namePlusArt(item) {
      return item?.ids
        ? '(' + item.zipID + ') ' + item.zipNAME + ' — ' + item.zipART
        : item?.zipID
          ? '(' + item.zipID + ') ' + item.zipNAME + ' — (X) Нет в маркете'
          : null
    }
    function namePlusModel(item) {
      return item?.ID && item?.TYPE && item?.MODEL && item?.VENDOR
        ? '(' + item?.ID + ') ' + item?.TYPE + ' — ' + item?.MODEL + ' (' + item?.VENDOR + ')'
        : null
    }
    function idNameTypeArtPNModels(item) {
      return '(' + item?.marketid + ') ' + '[' + item?.marketART + ', ' + item?.marketCOND + ', ' + item?.marketSUPPLIER + '] ' + item?.marketNAME + ' (' + item?.marketPN + ') - ' + item?.marketMODELS
    }

    function closeDialog() {
      state.dialog = false
    }


    /*  =====================================  ЗАКАЗЫ  ======================================   */

    /* function handleCommandOrders(command) {
      if (command === 'showBasket') state.showBasket = true
      if (command === 'showOrders') state.showOrders = true
    } */


    function updateFromBasket(val) {
      state.isUpdateFromBasket = val
    }


    async function openBasketDialog(item) {
      if (item.marketPRICE && item.marketPRICE !== 0) {
        if (await confirm_with_count.value.open('Кол-во товара:', 'Добавить?', item.marketid, { color: 'orange' })) {
          store.commit('setData', 'Позиция добавлена в корзину.')
        } else {
          store.commit('setInfo', 'Добавление отменено.')
        }
      } else {
        store.commit('setInfo', 'Товар не имеет цены! Добавление не может быть продолжено.')
      }
    }




    function addItemToBasket(data) {
      const marketBasket = JSON.parse(localStorage.getItem('marketBasket'))

      if (marketBasket) {
        const isInBasket = marketBasket.CurrentOrder.find(i => i.marketid === data.marketid)
        if (isInBasket) isInBasket.Count = Number(isInBasket.Count) + Number(data.Count)
        else marketBasket.CurrentOrder.push(data)
        localStorage.setItem('marketBasket', JSON.stringify({ CurrentOrder: marketBasket.CurrentOrder }))
        store.dispatch('setBasket', { CurrentOrder: marketBasket.CurrentOrder })
      } else {
        state.CurrentOrder.push(data)
        localStorage.setItem('marketBasket', JSON.stringify({ CurrentOrder: state.CurrentOrder }))
        store.dispatch('setBasket', { CurrentOrder: state.CurrentOrder })
      }
    }



    /* ========================================== Добавление позиции Маркета ================================================= */

    function addMarket(form) {
      state.loading = true;
      const new_data = { ...form, email: user.value.email, displayName: getUserName(user.value.email) }

      add(new_data)
        .then(async res => {
          if (!res.insertId) return Notification({ type: 'error', message: 'Произошла ошибка в процессе добавления Маркета.' });

          const new_data = await store.dispatch('market_new/get');
          state.tableData = [ ...new_data ];

          Notification({ type: 'success', message: 'Информация успешно добавлена.', duration: 10000 });
          closeDialog();
        })
        .catch(err => {
          console.log(err)
          Notification({ type: 'error', message: err })
        })
        .finally(() => (state.loading = false))
    }

    /* =========================== Редактирование позиции Маркета =========================== */
    function updateMarket(form) {
      const new_data = { ...form, email: user.value.email, displayName: getUserName(user.value.email) }
      state.loading = true

      update({ new_data, prev_data: state.prevItem })
        .then(async() => {
          const new_data = await store.dispatch('market_new/get');
          state.tableData = [ ...new_data ];
          state.tableData.length += 1;

          closeDialog();
          Notification({ type: 'success', message: 'Информация успешно обновлена.', duration: 10000 })
        })
        .catch(err => {
          console.log(err)
          Notification({ type: 'error', message: err })
        })
        .finally(() => (state.loading = false))
    }

    // ============================  Удаление позиции Маркета ============================== //

    async function removeMarket(item) {
      // 
      const { marketid } = item;
      let isConfirm;
      const res = await checkInRemonts({ id: marketid });
      const { zID, Qty } = res[0];

      isConfirm = (zID !== null)
        ? await MessageBox.confirm('Данная позиция выбрана в незакрытых ремонтах. Открыть отдельное окно Jira для их редактирования? Количество запросов - ' + Qty + ' шт.').catch(err => (isConfirm = err))
        : await MessageBox.confirm('Вы уверены, что хотите удалить эту позицию в Маркете?','Внимание!', { type: 'warning'}).catch(err => (isConfirm = err))
        
      if (isConfirm === "cancel") return;

      if (zID && isConfirm === 'confirm')
        return window.open('http://support.atlas-pro24.local/issues/?jql=id in (' + zID + ')');

      state.loadingForRemove = true;

      remove({
        id: marketid,
        DISPLAY_NAME: getUserName(user.value.email)
      })
        .then(async () => {
          const new_data = await store.dispatch('market_new/get');
          state.tableData = [ ...new_data ];
          Notification({ type: 'success', message: 'Позиция успешно удалена.', duration: 10000 });
        })
        .catch(err => {
          console.log(err)
          Notification({ type: 'error', message: err })
        })
        .finally(() => (state.loadingForRemove = false))
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
