<template>
    <el-card
      class="model-card"
      style="width: 100%;"
      :body-style="{
        display: 'flex',
        justifyContent: 'center'
      }"
    >
      <!-- <div slot="header">
        <span>Меню действий:</span>
      </div> -->
      <el-button
        v-if="
          multipleSelectionParts.length > 0 ||
          multipleSelectionNewParts.length > 0
        "
        type="warning"
        size="mini"
        @click="toggleSelection()"
      >
        Сбросить выбор
      </el-button>
      <el-button
        type="success"
        size="mini"
        v-if="multipleSelectionParts.length > 0"
        @click="pullFromDevice()"
      >
        Забрать из модели
      </el-button>
      <el-button
        type="primary"
        size="mini"
        v-if="multipleSelectionNewParts.length > 0"
        @click="pushToDevice()"
      >
        Вернуть обратно
      </el-button>


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
        :disabled="!parts.length || !disable()"
        type="primary"
        size="mini"
        @click="next()"
      >
        Дальше
      </el-button>

      <!-- ************ -->
      <el-button
        type="warning"
        size="mini"
        v-if="newParts.length && !multipleSelectionNewParts.length && active === 1"
        @click="next()"
      >
        Продолжить
      </el-button>


      <!-- ************ -->
      <el-button
        type="success"
        size="mini"
        v-if="newParts.length && !multipleSelectionNewParts.length && active >= 2"
        :disabled="active >= 2"
        @click="disassemble()"
      >
        Разукомлектовать
      </el-button>

    </el-card>
</template>

<script setup>

  const emits = defineEmits(['toggleSelection', 'pullFromDevice', 'pushToDevice', 'disassemble', 'preview', 'next', 'back'])
  defineProps({
    active: Number,
    multipleSelectionParts: Array,
    multipleSelectionNewParts: Array,
    newParts: Array,
    parts: Array,
    deviceCount: Number,
    disable: Function
  })

  function toggleSelection() {
    emits('toggleSelection')
  }
  function pullFromDevice() {
    emits('pullFromDevice')
  }
  function pushToDevice() {
    emits('pushToDevice')
  }
  /* function preview() {
    emits('preview')
  } */
  function disassemble() {
    emits('disassemble')
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