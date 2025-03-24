<template>
  <el-tabs v-model="active" type="border-card">
    <el-tab-pane label="Статистика" name="stats">
      <Stats v-if="active === 'stats'" />
    </el-tab-pane>
    <el-tab-pane label="Разукомплектация" name="disaccembly">
      <Disaccembly v-if="active === 'disaccembly'" />
    </el-tab-pane>
    <el-tab-pane label="Комплектация / Перекомплектация" name="accembly">
      <Accembly v-if="active === 'accembly'" />
    </el-tab-pane>
</el-tabs>
</template>

<script setup>

import { ref } from 'vue'

import Disaccembly from './disaccembly.vue'
import Accembly from './accembly.vue'
import Stats from './stats.vue'

const active = ref('stats')

</script>

<style lang="scss" scoped>

</style>