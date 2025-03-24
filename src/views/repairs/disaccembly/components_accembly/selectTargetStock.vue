
<template>
  <el-card class="model-card" style="width: 100%; min-height: 139px">
    <div slot="header">
      <span>Склад назначения:</span>
    </div>
    <el-select
      v-model="stock"
      value-key="name"
      :disabled="disabled"
      @change="setSelectedStock"
      style="min-width: 100%;"
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

const emits = defineEmits(['setSelectedTargetStock'])
defineProps({
  disabled: Boolean
})

onMounted(() => {
  emits('setSelectedTargetStock', stock.value)
})

  const stocks = [
    { id: 'd494caa5-c02d-11ea-80da-0cc47a1243f5', name: 'СКЛАД СЕРВИСНОГО ЦЕНТРА' },
    { id: '349c82b8-81ac-11ea-8282-001dd8b72066', name: 'ОСНОВНОЙ СКЛАД'},
  ]

  const stock = ref(stocks[0])

  function setSelectedStock() {
    emits('setSelectedTargetStock', stock.value)
  }

</script>

<style lang="scss" scoped>
</style>