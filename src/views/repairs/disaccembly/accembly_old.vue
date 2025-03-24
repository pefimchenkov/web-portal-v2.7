<template>
  <el-container>
    <el-header>
      <el-steps
        :active="state.active"
        finish-status="success"
        simple
        style="margin-top: 10px;"
      >
        <el-step title="Выбор устройства и доп. данных" description=""></el-step>
        <el-step title="Выбор запчастей" description=""></el-step>
        <el-step title="Подтверждение" description=""></el-step>
      </el-steps>
    </el-header>

    <el-main v-loading="state.fullLoading">

      <el-row
        v-loading="state.loading"
        v-show="state.active >= 0 && state.active < 2"
        type="flex"
        :gutter="10"
        justify="center"
        align="middle"
      >
        <el-col :span="12">
          <SelectModel
            :deviceId="state.deviceId"
            :devices="state.devices"
            :disabled="state.active > 0"
            @handleSelect="handleSelect"
          />
        </el-col>

        <!-- Карточка инфо -->
        <el-col :span="12">
          <ModelCard
            :selectedMarketDetails="state.selectedMarketDetails"
            :selected1CDetails="state.selected1CDetails"
            :warehouses="state.warehousesFrom1C"
            :disabled="state.active > 0"
          />
        </el-col>
      </el-row>

      <el-row
        v-show="state.active >= 0 && state.active < 2"
        type="flex"
        justify="center"
        align="top"
        :gutter="10"
      >

         <!-- Карточка кол-ва -->
        <el-col :span="12">
          <SelectDeviceCount
            :selected1CDetails="state.selected1CDetails"
            @setSelectedDeviceCount="setSelectedDeviceCount"
            :disabled="!checkDisable()"
          />
        </el-col>

        <!-- Карточка склада -->
        <el-col :span="12">
          <SelectStock
            @setSelectedStock="setSelectedStock"
            :disabled="true"
          />
        </el-col>

      </el-row>

      <el-row
        v-show="state.active >= 1 && state.active < 2"
        type="flex"
        justify="center"
        align="top"
        :gutter="10"
      >
        <!-- Первая таблица -->
        <el-col :span="state.new_parts?.length ? 12 : 24">
          <PartsBefore
            v-loading="state.loading"
            :disabled="(state.active < 1 || !checkDisable())"
            :parts="state.parts"
            :devicesCount="state.devicesCount"
            @handleSelectionChangeParts="handleSelectionChangeParts"
          />
        </el-col>

        <!-- Вторая таблица -->
        <el-col
          v-show="state.new_parts?.length"
          :span="state.parts?.length ? 12 : 24"
        >
        <PartsAfter
          :newParts="state.new_parts"
          @handleSelectionChangeNewParts="handleSelectionChangeNewParts"
        />
        </el-col>
      </el-row>

      <!-- Карточка превью -->
      <Preview
        v-show="state.active >= 2"
        :preview="state.preview"
        :device="state.selectedMarketDetails"
        :from1c="state.selected1CDetails"
        :warehouses="state.warehousesFrom1C"
        :method="state.method"
        :devicesCount="state.devicesCount"
        :stock="state.stock"
        :newParts="state.new_parts"
        @closeDialog="state.preview = false"
      />

      <el-alert
        v-if="state.disassembleResult.name && state.active >= 2"
        :title="state.disassembleResult.type === 'success' ? 'Успешный результат' : 'Ошибка'"
        :type="state.disassembleResult.type === 'success' ? 'success' : 'error'"
        :description="state.disassembleResult.name"
        show-icon>
      </el-alert>

      <el-row type="flex" justify="center">
         <!-- карточка действий -->
        <Actions
          :multipleSelectionParts="state.multipleSelectionParts"
          :multipleSelectionNewParts="state.multipleSelectionNewParts"
          :new-parts="state.new_parts"
          :parts="state.parts"
          :active="state.active"
          :deviceCount="Number(state.devicesCount)"
          :disable="checkDisable"
          @toggleSelection="toggleSelection"
          @pullFromDevice="pullFromDevice"
          @pushToDevice="pushToDevice"
          @assembly="assembly"
          @preview="preview"
          @next="next"
          @back="back"
        />
      </el-row>
    </el-main>

    <el-footer style="text-align: end"></el-footer>
  </el-container>
</template>
<script setup>
import { reactive, onMounted, watch, ref } from "vue";

import Preview from './components_accembly/preview.vue'
import SelectModel from './components_accembly/selectModel.vue'
import ModelCard from './components_accembly/modelCard.vue'
import Actions from './components_accembly/actions.vue'
import PartsBefore from './components_accembly/partsBefore.vue'
import PartsAfter from './components_accembly/partsAfter.vue'
import SelectDeviceCount from './components_accembly/selectDeviceCount'
import SelectStock from './components_accembly/selectSourceStock.vue'

import { get as getPartsFromJira } from '@/api/parts'
import store from "@/store";
import { Notification  } from "element-ui";

const partsRef = ref("");
const newpartsRef = ref("");

const state = reactive({
  loading: false,
  fullLoading: false,
  active: 0,
  preview: false,
  method: "full",
  stock: null,
  devices: [],
  dataFrom1C: [],
  warehousesFrom1C: [],
  deviceId: null,
  parts: [],
  new_parts: [],
  devicesCount: '0',
  selectedDevice: null,
  selectedMarketDetails: {},
  selected1CDetails: {},
  multipleSelectionParts: [],
  multipleSelectionNewParts: [],
  disassembleResult: {
    type: 'info',
    name: ''
  }
})

watch(
  () => state.selectedDevice,
  (val) => {
    if (!val) {
      state.parts = [];
      state.new_parts = [];
      state.selectedMarketDetails = {}
      state.selected1CDetails = {}
    }
  }
)

watch(
  () => state.new_parts,
  (val) => {
    if (val.length) {
      const model = val.filter(i => !i.MAIN_JIRA_ID);
      const zip = val.filter(i => i.MAIN_JIRA_ID);

      const summ_percents = zip.reduce((acc, curr) => {
        return (acc + curr.autopercent)
      }, 0)
      const summ_price = zip.reduce((acc, curr) => {
        return Number((acc + curr.price).toFixed(2))
      }, 0)

      if (model.length) {
        model[0].autopercent = Number((100 - summ_percents).toFixed(2))
        model[0].price = state.selected1CDetails?.costPrice - summ_price
      }
    }
  }
)

onMounted(() => {
   loadData();
})

async function loadData() {
  state.loading = true;

   state.warehousesFrom1C = 
    !store.state.atlas_1c.warehouses.length
      ? await store.dispatch("atlas_1c/getAtlasWarehouses")
      : store.state.atlas_1c.warehouses;
    console.log(state.warehousesFrom1C)

  const dataFromMarket =
    store.state.market_new.Market?.length === 0
      ? await store.dispatch("market_new/get")
      : store.state.market_new.Market;

  state.dataFrom1C = 
    !store.state.atlas_1c.getAtlasGoods.length
      ? await store.dispatch("atlas_1c/getAtlasGoods")
      : store.state.atlas_1c.getAtlasGoods;


  const marketIdsWithParts = dataFromMarket.filter(item => item.marketPARTS > 0).map(i => i.marketid)

  const filteredDataFrom1c = state.dataFrom1C.map(item => {
    if (marketIdsWithParts.find(i => i.toString() === item.codeZip)) return item
  }).filter(i => i)

  state.devices = filteredDataFrom1c
    .map((el, i) => ({
      id: i,
      marketId: Number(el.codeZip),
      warehouse: el.warehouse,
      qty: el.qti,
      name: `${el.name}`
    })
    );

    console.log(state.devices)

    state.loading = false;

}

async function handleSelect({ marketId, warehouse }) {

  state.loading = true;
  state.new_parts = [];
  state.selectedMarketDetails = {};
  state.selected1CDetails = {}
  const partsFromJira = await getPartsFromJira({ id: marketId });

  
  state.selectedMarketDetails = store.state.market_new.Market.find((el) => el.marketid === marketId);
  console.log(state.selectedMarketDetails);
  if (!state.selectedMarketDetails) {
    Notification({ type: 'error', message: 'Выбранная модель не найдена в маркете. Дальнейшие действия не имеют смысла.' })
    state.loading = false;
    return
  }

  state.selected1CDetails = state.dataFrom1C.find(item => Number(item.codeZip) === state.selectedMarketDetails.marketid && item.warehouse === warehouse);
  if (!state.selected1CDetails) {
    Notification({ type: 'error', message: 'Выбранная модель не найдена в базе 1с. Дальнейшие действия не имеют смысла.' })
    state.loading = false;
    return
  }

  setTimeout(() => {
    state.parts = partsFromJira.map(item => {
      return {
        ...item,
        price: state.selected1CDetails?.costPrice * item.autopercent / 100,
        qty: state.dataFrom1C.find(i => Number(i.codeZip) === item.marketid)?.qti
      }
    });
    state.deviceId = marketId;
    state.loading = false;

    console.log(state.parts)
  }, 500);
}





function pullFromDevice() {
  state.new_parts = [...state.new_parts, ...state.multipleSelectionParts];
  const ids = state.multipleSelectionParts.map((i) => i.id);
  state.parts = state.parts.filter((item) => !ids.includes(item.id));
  state.multipleSelectionParts = [];
}

function pushToDevice() {
  state.parts = [...state.parts, ...state.multipleSelectionNewParts];
  const ids = state.multipleSelectionNewParts.map((i) => i.id);
  state.new_parts = state.new_parts.filter((item) => !ids.includes(item.id));
  state.multipleSelectionNewParts = [];
}

function preview() {
  state.preview = true
}

async function assembly() {

  state.fullLoading = true;

  // const warehouse = state.warehousesFrom1C.find(i => i['Наименование'] === state.selected1CDetails['warehouse'])
  const goods = state.new_parts.map(item => {
    return { "id": `${item.marketid}`, "qty": `${item.qty}`, "val": item.autopercent}
  })

  // "id": state.selected1CDetails['Номенклатура']['Ссылка'],
  // "warehouseId": warehouse['Ссылка'],
  const dataFor1C = {
   "date": new Date().toISOString().slice(0, 19),
    "warehouseId": "a4b55d3a-49e8-11ea-826d-001dd8b72066",
    "goodsFrom": goods,
    "qti": state.devicesCount,
    "goodTo": `${state.deviceId}`,
    "comment":"Тест по укомплектации"
  }

  const response = await store.dispatch("atlas_1c/createAssemble", dataFor1C)

  /* const response = { data: { disId: null, name: null } };
  response.data.disId = ( Math.random(1, 9) * 100000).toFixed();
  response.data.name = `TEST-${response.data.disId}`; */

  console.log(response)

  /* const dataForDB = {
    name: response.data.name,
    model_market_id: state.deviceId,
    qty: state.devicesCount,
    qty_zip: goods.length,
    price: state.selected1CDetails.costPrice,
    user: store.state.user.currentUser.email,
    goods
  }


  await store.dispatch("repairs/assembly/setStats", dataForDB)

  if (response.data.disId) {
    state.disassembleResult.name = response.data.name
    state.disassembleResult.type = 'success'

    state.active = 5;
    Notification ({ type: "success", message: "Укомплектовали!" });
  } else {
    state.disassembleResult.name = response.data
    state.disassembleResult.type = 'error'
  } */

  state.fullLoading = false;

}

function handleSelectionChangeParts(val) {
  state.multipleSelectionParts = val;
}

function handleSelectionChangeNewParts(val) {
  state.multipleSelectionNewParts = val;
}

function toggleSelection() {
  partsRef.value.clearSelection();
  newpartsRef.value.clearSelection();
}



function setSelectedDeviceCount(val) {
  state.devicesCount = val
}
function setSelectedStock(val) {
  state.stock = val
}

function next() {
  state.active += 1
}

function back() {
  state.active -= 1
}

function checkDisable() {
  return true
  /* if (!state.selected1CDetails) return false
  return state.selected1CDetails.qti > 0 && state.selected1CDetails.costPrice > 0 */
}

</script>

<style>

.model-card {
  width: 100%;
  margin: 5px 0;
}

.el-select-dropdown__list {
  max-width: fit-content !important;
}

</style>
