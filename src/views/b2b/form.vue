<template>
  <el-form style="width: 600px; margin: 20px auto; text-align: center">
    <el-form-item>
    <el-input
      type="textarea"
      rows="6"
      placeholder="Введите артикул(ы) для поиска у поставщиков.

Формат ввода  - строка, в качестве разделителя нужно использовать либо запятую, либо пробел, или расположить каждый артикул на новой строке."
      v-model="state.form.arts"
    />
    </el-form-item>
    <el-form-item>
      <el-button type="success" size="mini" @click="onSubmit">Отправить</el-button>
      <el-button size="mini" @click="clear" >Очистить</el-button>
  </el-form-item>
  </el-form>
</template>

<script setup>

  import { reactive } from 'vue'
  import { getArrayOfArticuls, xformPayloadForMarvel /* xformPayloadForTreolan */ } from './utils.js'

  const emits = defineEmits(['data'])

  const state = reactive({
    loading: false,
    form: {
      arts: null
    }
  })

  function onSubmit() {
    const marvelTemplate = xformPayloadForMarvel(getArrayOfArticuls(state.form.arts))
    const treolanTemplate = getArrayOfArticuls(state.form.arts)
    const merlionTemplate = getArrayOfArticuls(state.form.arts)

    emits('data', { marvelTemplate, treolanTemplate, merlionTemplate })
  }
  function clear() {
    state.form.arts = null
  }

</script>

<style lang="scss" scoped>
</style>