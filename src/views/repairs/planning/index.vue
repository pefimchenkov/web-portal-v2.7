
<template>
  <div class="pa-2 ma-3"> <!-- {{ state.repairs }} -->
  <!-- Редактирование -->
    <Edit
      :dialog-visible="dialogVisible"
      :data="cellData"
      @close-dialog="closeDialog"
      @set-repairs="setRepairs"
    />

    <!-- Календарь -->
    <!-- <el-calendar v-model="now">
      <template
        v-slot:dateCell="{ data }"
        >
        <div :class="data.isSelected ? 'is-selected' : ''"
          class="can-open"
          @click="openDialog(data)"
        >
          <div>{{ parseInt(data.day.split('-').slice(1)[1] )}}  {{ data.isSelected ? '✔️' : ''}} </div>
          <div>{{ formatRepair(data) }}</div>
        </div>
      </template>
    </el-calendar> -->
    <!-- ****** -->

    <el-row type="flex" justify="space-around" align="middle">
      <h1>Крипто трейдинг</h1>
      <Transition mode="out-in" name="fade">
        <div :key="rand" style="font-size: x-large; border: 1px solid grey; padding: 3px 6px; border-radius: 10px;">{{ rand }}</div>
      </Transition>
      <Transition mode="out-in" name="fade">
        <div :key="rand">{{ now.toLocaleDateString(undefined, options) }}</div>
      </Transition>

    </el-row>
    
    <div class="container">
      <el-card
        v-for="coin in coins"
        :key="coin.name">
        <h2>{{ coin.name }}</h2>
        <p>{{ coin.symbol }}</p>
        <p>{{ coin.price }} BTC</p>
        <img
          :src="coin.logo"
          :alt="coin.name"
        />
      </el-card>
    </div>

  </div>
</template>

<script setup>

import { reactive, ref, onMounted } from 'vue';
import Edit from './edit.vue'

import * as Comlink from "comlink"
//import Worker from "worker-loader!@/workers/crypto.js";
import Worker from "worker-loader!@/workers/market.js";

const options = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric"
}

//const { fetchCoins } = Comlink.wrap(new Worker());
const { fetchMarket } = Comlink.wrap(new Worker());

const now = ref(new Date());
const dialogVisible = ref(false);
const cellData = ref(null);

const coins = ref([]) ;
const rand = ref() ;


/* async function init() {
  const res = await fetchCoins();
  coins.value = res.formattedCoins
  now.value = res.date
  rand.value = res.rand
} */

onMounted(async () => {
  
  const data = await fetchMarket(process.env.VUE_APP_BASE_API, 'market');
  console.log(data)
  //init();

  /* setInterval(async() => {
    await init();
  }, 5000); */

})

// Terminate the web worker when the component is unmounted
/* onBeforeUnmount(() => {
  _worker.terminate();
}) */




const state = reactive({
  repairs: []
});

function openDialog(data) {
  dialogVisible.value = true;
  cellData.value = data;
}

function closeDialog(val) {
  dialogVisible.value = val;
}

function setRepairs(val) {
  console.log(val);
  state.repairs.push(val);
  dialogVisible.value = false;
}

function formatRepair(data) {
  const res = state.repairs.find(i => i.day === data.day)
  return res ? res.repairs : null
}

</script>

<style lang="scss" scoped>

.can-open {
      height: 100%;
      overflow: auto;
}

.container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.container div {
  width: 300px;
  margin: 10px;
  padding: 10px;

  text-align: center;
}

.container div img {
  width: 100px;
  height: 100px;
  margin: 0 auto;
  display: block;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

</style>