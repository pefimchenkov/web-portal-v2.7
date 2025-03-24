<template>
    <el-card
      class="model-card"
      style="width: 100%;"
      :body-style="{
        display: 'flex',
        justifyContent: 'center'
      }"
    >
 
      <el-button
        v-if="active >= 1"
        type="primary"
        size="mini"
        @click="back()"
      >
        Назад
      </el-button>
      <el-button
        v-if="active < 1 && deviceCount > 0"
        :disabled="disable()"
        type="primary"
        size="mini"
        @click="next()"
      >
        Дальше
      </el-button>

      <!-- ************ -->

      <el-button
        v-if="active >= 1"
        type="success"
        size="mini"
        :disabled="active >= 2"
        @click="assembly()"
      >
        Комлектовать
      </el-button>

    </el-card>
</template>

<script setup>

  const emits = defineEmits(['assembly', 'next', 'back'])
  defineProps({
    active: Number,
    deviceCount: Number,
    disable: Function
  })


  function assembly() {
    emits('assembly')
  }

  function next() {
    emits('next')
  }
  function back() {
    emits('back')
  }

</script>

<style lang="scss" scoped>
</style>