
<template>
  <el-transfer
    v-model="value"
    :data="state.formatted">
  </el-transfer>
</template>

<script setup>

import { onMounted, ref, reactive } from 'vue';

const value = ref([])
const state = reactive({
  formatted: []
})

onMounted(() => {
  state.formatted = props.data.map(item => {
    return { key: item.marketid, label: item.marketNAME }
  })
  console.log(state.formatted);
})

const props = defineProps({
  data: Array
})

</script>

<style lang="scss" scoped>

</style>