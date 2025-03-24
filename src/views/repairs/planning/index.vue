
<template>
  <div>{{ state.repairs }}
    <Edit
      :dialog-visible="dialogVisible"
      :data="cellData"
      @close-dialog="closeDialog"
      @set-repairs="setRepairs"
    />

  <el-calendar v-model="now">
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
</el-calendar>
  </div>
</template>

<script setup>

import { reactive, ref } from 'vue';

import Edit from './edit.vue'
const now = ref(new Date());
const dialogVisible = ref(false);
const cellData = ref(null);

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

</style>