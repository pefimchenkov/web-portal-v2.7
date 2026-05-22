<template>
  <el-container>
    <el-header>
      <el-steps
        :active="state.active"
        finish-status="success"
        simple
        style="margin-top: 10px;"
      >
        <el-step title="Выбор устройств и доп. данных" description=""></el-step>
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
        <!-- Что собираем -->
        <el-col :span="12">
          <SelectTargetModel
            :deviceId="state.deviceId"
            :devices="state.devices"
            :disabled="state.active > 0"
            @handleTargetSelect="handleTargetSelect"
          />
        </el-col>

        <!-- Из чего собираем -->
        <el-col :span="12">
          <SelectSourceModel
            :deviceId="state.deviceId"
            :devices="state.devices"
            :disabled="state.active > 0"
            @handleSourceSelect="handleSourceSelect"
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
        <el-col :span="9">
          <SelectDeviceCount
            :selected1CDetails="state.selected1CDetails"
            @setSelectedDeviceCount="setSelectedDeviceCount"
            :disabled="state.active > 0"
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
        v-if="state.assemblyResult.name && state.active >= 1"
        :title="state.assemblyResult.type === 'success' ? 'Успешный результат' : 'Ошибка'"
        :type="state.assemblyResult.type === 'success' ? 'success' : 'error'"
        :description="state.assemblyResult.name"
        show-icon
        style="margin-bottom: 10px;"
        >
      </el-alert>


      <el-row type="flex" justify="center">
         <!-- карточка действий -->
        <Actions
          :active="state.active"
          :deviceCount="Number(state.devicesCount)"
          :disable="checkDisable"
          @toggleSelection="toggleSelection"
          @assembly="assembly"
          @next="next"
          @back="back"
        />
      </el-row>
    </el-main>

    <el-footer style="text-align: end"></el-footer>
  </el-container>
</template>
<script setup>
import { reactive, onMounted, ref } from "vue";

import SelectSourceModel from './components_accembly/selectSourceModel.vue'
import SelectTargetModel from './components_accembly/selectTargetModel.vue'
import Actions from './components_accembly/actions.vue'
import SelectDeviceCount from './components_accembly/selectDeviceCount'
import SelectSourceStock from './components_accembly/selectSourceStock.vue'
import SelectTargetStock from './components_accembly/selectTargetStock.vue'
import SelectBetweenStock from './components_accembly/selectBetweenStock.vue'


import store from "@/store";
import { Notification  } from "element-ui";

const partsRef = ref("");
const newpartsRef = ref("");

const state = reactive({
  loading: false,
  fullLoading: false,
  active: 0,
  sourceStock: null,
  targetStock: null,
  betweenStock: null,
  devices: [],
  dataFrom1C: [],
  warehousesFrom1C: [],
  deviceId: null,
  devicesCount: '0',
  selectedSourceDevice: [],
  selectedTargetDevice: null,
  selectedMarketDetails: {},
  selected1CDetails: {},

  assemblyResult: {
    type: 'info',
    name: ''
  },
  firstMovementResult: {
    type: 'info',
    name: ''
  },
  secondMovementResult: {
    type: 'info',
    name: ''
  }
})


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


  const marketIdsWithParts = dataFromMarket.map(i => i.marketid);

  const filteredDataFrom1c = state.dataFrom1C
    .map(item => { if (marketIdsWithParts.find(i => i.toString() === item.codeZip)) return item })
    .filter(i => i?.warehouse === 'd494caa5-c02d-11ea-80da-0cc47a1243f5') // только склад Сервисного центра
    .filter(i => i)


  state.devices = filteredDataFrom1c
    .map((el, i) => ({
      id: i,
      marketId: Number(el.codeZip),
      warehouse: el.warehouse,
      qty: el.qti,
      name: `${el.name} ${el.artTSD}` // ${state.warehousesFrom1C.find(item => item["Ссылка"] === el.warehouse)?.["Наименование"]}
    })
    );

    state.loading = false;

}

function handleTargetSelect(val) {
  state.selectedTargetDevice = val;
  console.log(state.selectedTargetDevice)
}

function handleSourceSelect(val) {
  state.selectedSourceDevice = val;
  console.log(state.selectedSourceDevice)
}


async function assembly() {
  if (!state.selectedSourceDevice.length || !state.selectedTargetDevice)
    return Notification({ type: 'error', message: 'Не выбраны устройства для комплектации!' })

  state.fullLoading = true;

  const sourceGoods = state.selectedSourceDevice.map(item => {
    return { "id": `${item.marketId}`, "qty": `${state.devicesCount}`, "val": 1}
  })
  const targetGood = [{ "id": `${state.selectedTargetDevice.marketId}`, "qty": `${state.devicesCount}`, "val": 1 }]
  const username = store.state.jira_users.JIRA_USERS.find(user => user.email === store.getters["auth/currentUser"]?.email)?.user_name
  const displayname = store.state.jira_users.JIRA_USERS.find(user => user.email === store.getters["auth/currentUser"]?.email)?.display_name

  const dataForFirstMovement = {
    "date": new Date().toISOString().slice(0, 19),
    'warehouseIdFrom': state.sourceStock?.id,
    'warehouseIdTo': state.betweenStock?.id,
    'Goods': sourceGoods,
    'comment': `Автоматическое перемещение №1 для комплектации`
  }

  const dataForAssembly = {
    "date": new Date().toISOString().slice(0, 19),
    "warehouseId": state.betweenStock?.id,
    "goodsFrom": sourceGoods,
    "qti": state.devicesCount,
    "goodTo": `${state.selectedTargetDevice.marketId}`,
    "comment":"Автоматическая комплектация с web-портала"
  }

  const dataForSecondMovement = {
    "date": new Date().toISOString().slice(0, 19),
    'warehouseIdFrom': state.betweenStock?.id,
    'warehouseIdTo': state.targetStock?.id,
    'Goods': targetGood,
    'comment': `Автоматическое перемещение №2 для комплектации`
  }

  const dataForStatistic = {
    model_market_id: state.deviceId,
    qty: state.devicesCount,
    qty_zip: sourceGoods.length,
    price: state.selected1CDetails.costPrice,
    email: store.getters["auth/currentUser"]?.email,
    displayname,
    goods: sourceGoods
  }


  const response = await store.dispatch("atlas_1c/createAssemble", { username, dataForFirstMovement, dataForAssembly, dataForSecondMovement, dataForStatistic })
  // console.log('createAssemble: ', response)


  /* const response = { data: { docId: null, name: null } };
  response.data.docId = ( Math.random(1, 9) * 100000).toFixed();
  response.data.name = `TEST-${response.data.docId}`; */

  const { assemblyFrom1c, createdSklad } = response;


  if (assemblyFrom1c?.data.length) {
    state.assemblyResult.name = `Создана задача по комплектации: ${assemblyFrom1c.data[0].name}`
    state.assemblyResult.type = 'success'
  } else {
    state.assemblyResult.name = assemblyFrom1c?.data[0]
    state.assemblyResult.type = 'error'
  }

  if (createdSklad?.key) {
    state.firstMovementResult.name = `Создана задача Склад под комплектацию: ${createdSklad?.key}`
    state.firstMovementResult.type = 'success'
  } else {
    state.firstMovementResult.name = createdSklad
    state.firstMovementResult.type = 'error'
  }


  state.active = 2;
  Notification ({ type: "success", message: "Укомплектовали!" });
  state.fullLoading = false;

}

function toggleSelection() {
  partsRef.value.clearSelection();
  newpartsRef.value.clearSelection();
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
  console.log(state.active);
  return state.active >= 2
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

.el-alert .el-alert__description {
  font-size: 15px !important;
}

.el-alert__title {
  font-size: 16px !important; 
}

</style>
