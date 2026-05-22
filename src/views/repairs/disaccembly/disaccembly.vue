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
        <el-col :span="10">
          <SelectModel
            :deviceId="state.deviceId"
            :devices="state.devices"
            :disabled="state.active > 0"
            @handleSelect="handleSelect"
        />
        </el-col>

        <!-- Карточка инфо -->
        <el-col :span="14">
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

        <!-- Карточка метода -->
        <el-col :span="8">
          <SelectMethod
            @setSelectedMethod="setSelectedMethod"
            :disabled="!checkDisable()"
          />
        </el-col>
         <!-- Карточка кол-ва -->
        <el-col :span="8">
          <SelectDeviceCount
            :selected1CDetails="state.selected1CDetails"
            @setSelectedDeviceCount="setSelectedDeviceCount"
            :disabled="!checkDisable()"
          />
        </el-col>

        <!-- склад источник -->
        <el-col :span="5">
          <SelectSourceStock
            @setSelectedSourceStock="setSelectedSourceStock"
            :disabled="true"
          />
        </el-col>

        <!-- склад промежуточный для перемещения-->
        <el-col :span="5">
          <SelectBetweenStock
            @setSelectedBetweenStock="setSelectedBetweenStock"
            :disabled="true"
          />
        </el-col>

        <!-- склад назначения для перемещения -->
        <el-col :span="5">
          <SelectTargetStock
            @setSelectedTargetStock="setSelectedTargetStock"
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
            v-if="state.dataFrom1C.length && state.parts.length"
            v-loading="state.loading"
            :disabled="(state.active < 1 || !checkDisable())"
            :parts="state.parts"
            :dataFrom1c="state.dataFrom1C"
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
        :betweenStock="state.betweenStock"
        :targetStock="state.targetStock"
        :newParts="state.new_parts"
        @closeDialog="state.preview = false"
      />

      <el-alert
        v-if="state.firstMovementResult.name && state.active >= 1"
        :title="state.firstMovementResult.type === 'success' ? 'Успешный результат' : 'Ошибка'"
        :type="state.firstMovementResult.type === 'success' ? 'success' : 'error'"
        :description="state.firstMovementResult.name"
        show-icon
        style="margin-bottom: 10px;"
      >
      </el-alert>

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
          @disassemble="disassemble"
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

import Preview from './components_disaccembly/preview.vue'
import SelectModel from './components_disaccembly/selectModel.vue'
import ModelCard from './components_disaccembly/modelCard.vue'
import Actions from './components_disaccembly/actions.vue'
import PartsBefore from './components_disaccembly/partsBefore.vue'
import PartsAfter from './components_disaccembly/partsAfter.vue'
import SelectDeviceCount from './components_disaccembly/selectDeviceCount'
import SelectSourceStock from './components_disaccembly/selectSourceStock.vue'
import SelectTargetStock from './components_disaccembly/selectTargetStock.vue'
import SelectBetweenStock from './components_disaccembly/selectBetweenStock.vue'
import SelectMethod from './components_disaccembly/selectMethod.vue'

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
  sourceStock: null,
  betweenStock: null,
  targetStock: null,
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
  },
  firstMovementResult: {
    type: 'info',
    name: ''
  },
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

watch(
  () => state.method,
  (val) => {
  if (val === 'part') {
    state.new_parts.push({
      ...state.selectedMarketDetails,
      price: state.selected1CDetails?.costPrice,
      autopercent: 100
    })
  }
  if (val === 'full') {
    state.new_parts = state.new_parts.filter(i => i.MAIN_JIRA_ID)
  }
})

onMounted(() => {
  loadData();
  console.log(store.state.jira_users)
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

  const filteredDataFrom1c = state.dataFrom1C
    .map(item => { if (marketIdsWithParts.find(i => i.toString() === item.codeZip)) return item })
    .filter(i => i?.warehouse === "349c82b8-81ac-11ea-8282-001dd8b72066"
      || i?.warehouse === "42ae2af6-abcc-11ea-80d6-0cc47a1243f5"
      || i?.warehouse === "d494caa5-c02d-11ea-80da-0cc47a1243f5")
    .filter(i => i)

  state.devices = filteredDataFrom1c
    .map((el, i) => ({
      id: i,
      marketId: Number(el.codeZip),
      warehouse: el.warehouse,
      name: `${el.name} ${el.artTSD} (${state.warehousesFrom1C.find(item => item["Ссылка"] === el.warehouse)?.["Наименование"]})`
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
      return { ...item, price: state.selected1CDetails?.costPrice * (item.percent || item.autopercent) / 100 }
    });
    state.deviceId = marketId;
    state.loading = false;
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

async function disassemble() {
  state.fullLoading = true;

  const targetGoods = state.new_parts.map(item => { return { "id": `${item.marketid}`, "qty": `${state.devicesCount}`, "val": item.autopercent}})
  const sourceGood = [{ "id": `${state.deviceId}`, "qty": `${state.devicesCount}`, "val": 1 }]
  const username = store.state.jira_users.JIRA_USERS.find(user => user.email === store.getters["auth/currentUser"]?.email)?.user_name
  const displayname = store.state.jira_users.JIRA_USERS.find(user => user.email === store.getters["auth/currentUser"]?.email)?.display_name

  const dataForFirstMovement = {
    "date": new Date().toISOString().slice(0, 19),
    'warehouseIdFrom': state.sourceStock?.id,
    'warehouseIdTo': state.betweenStock?.id,
    'Goods': sourceGood,
    'comment': `Автоматическое перемещение №1 для разукомплектации`
  }

  const dataForDisassembly = {
    "date": new Date().toISOString().slice(0, 19),
    "warehouseId": state.betweenStock?.id,
    "goodFrom": `${state.deviceId}`,
    "qti": state.devicesCount,
    "goodsTo": targetGoods,
    "comment": "Автоматическая разукомплектации с web-портала"
  }

  const dataForSecondMovement = {
    "date": new Date().toISOString().slice(0, 19),
    'warehouseIdFrom': state.betweenStock?.id,
    'warehouseIdTo': state.targetStock?.id,
    'Goods': targetGoods,
    'comment': `Автоматическое перемещение №2 для разукомплектации`
  }

   const dataForStatistic = {
    model_market_id: state.deviceId,
    qty: state.devicesCount,
    qty_zip: targetGoods.length,
    method: state.method,
    price: state.selected1CDetails.costPrice,
    email: store.getters["auth/currentUser"]?.email,
    displayname,
    goods: targetGoods
  }


  const response = await store.dispatch("atlas_1c/createDisassemble", { username, dataForFirstMovement, dataForDisassembly, dataForSecondMovement, dataForStatistic })

  /* const response = { data: { docId: null, name: null } };
  response.data.docId = ( Math.random(1, 9) * 100000).toFixed();
  response.data.name = `00TST-${response.data.docId}`; */

  console.log(response)

  /* console.log('dataForFirstMovement', dataForFirstMovement)
  console.log('dataForDisassembly', dataForDisassembly)
  console.log('dataForSecondMovement', dataForSecondMovement)
  console.log('dataForStatistic', dataForStatistic) */


  const { disassemblyFrom1c, createdSklad } = response;


  if (disassemblyFrom1c?.data.length) {
    state.disassembleResult.name = `Создана задача по комплектации: ${disassemblyFrom1c.data[0].name}`
    state.disassembleResult.type = 'success'
  } else {
    state.disassembleResult.name = disassemblyFrom1c?.data[0]
    state.disassembleResult.type = 'error'
  }

  if (createdSklad?.key) {
    state.firstMovementResult.name = `Создана задача Склад под комплектацию: ${createdSklad?.key}`
    state.firstMovementResult.type = 'success'
  } else {
    state.firstMovementResult.name = createdSklad
    state.firstMovementResult.type = 'error'
  }


  state.active = 5;
  Notification({ type: "success", message: "Разукомплектовали!" });
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

function setSelectedMethod(val) {
  state.method = val
}
function setSelectedDeviceCount(val) {
  state.devicesCount = val
}


function setSelectedSourceStock(val) {
  state.sourceStock = val
}

function setSelectedTargetStock(val) {
  state.targetStock = val
}

function setSelectedBetweenStock(val) {
  state.betweenStock = val
}

function next() {
  state.active += 1
}

function back() {
  state.active -= 1
}

function checkDisable() {
  if (!state.selected1CDetails) return false
  return state.selected1CDetails.qti > 0 && state.selected1CDetails.costPrice >= 0
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
