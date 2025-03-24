
<template>
  <el-card class="model-card" style="width: 100%; min-height: 139px">
    <div slot="header">
      <span>Склад источник:</span>
    </div>
    <el-select
      v-model="stock"
      value-key="name"
      @change="setSelectedStock"
      style="min-width: 100%;"
      :disabled="disabled"
    >
      <el-option
        v-for="item in stocks"
        :key="item.id"
        :label="item.name"
        :value="item"
      >
      </el-option>
    </el-select>
  </el-card>
</template>

<script setup>

import { onMounted, ref } from 'vue';

const emits = defineEmits(['setSelectedSourceStock'])
defineProps({
  disabled: Boolean
})

onMounted(() => {
  emits('setSelectedSourceStock', stock.value)
})

  const stocks = [
    { id: 'd494caa5-c02d-11ea-80da-0cc47a1243f5', name: 'СКЛАД СЕРВИСНОГО ЦЕНТРА '},
  ]

  const stock = ref(stocks[0])

  function setSelectedStock() {
    emits('setSelectedSourceStock', stock.value)
  }

</script>

<style lang="scss" scoped>
</style>