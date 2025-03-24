
<template>
  <el-card class="model-card" style="width: 100%; min-height: 139px">
    <div slot="header">
      <span>Склад назначения:</span>
    </div>
    <el-select
      v-model="stock"
      value-key="name"
      @change="setSelectedStock"
      style="min-width: 300px;"
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

const emits = defineEmits(['setSelectedStock'])
defineProps({
  disabled: Boolean
})

onMounted(() => {
  emits('setSelectedStock', stock.value)
})

  const stocks = [
    { id: 1, name: 'СКЛАД СЕРВИСНОГО ЦЕНТРА '},
    { id: 2, name: 'СКЛАД ГОТОВОЙ ПРОДУКЦИИ' }
  ]

  const stock = ref(stocks[0])

  function setSelectedStock() {
    emits('setSelectedStock', stock.value)
  }

</script>

<style lang="scss" scoped>
</style>