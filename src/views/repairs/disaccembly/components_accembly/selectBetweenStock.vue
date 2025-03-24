
<template>
  <el-card class="model-card" style="width: 100%; min-height: 139px">
    <div slot="header">
      <span>Склад перемещения:</span>
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
  emits('setSelectedBetweenStock', stock.value)
})

  const stocks = [
    { id: '444640d1-3adc-11ea-8264-001dd8b72066', name: 'РЕМОНТ'},
  ]

  const stock = ref(stocks[0])

  function setSelectedStock() {
    emits('setSelectedBetweenStock', stock.value)
  }

</script>

<style lang="scss" scoped>
</style>