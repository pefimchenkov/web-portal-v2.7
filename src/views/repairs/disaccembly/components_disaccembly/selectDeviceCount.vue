
<template>
  <el-card class="model-card" style="width: 100%; min-height: 139px">
    <div slot="header">
      <span>Количество устройств <span style="color: red;">*</span></span>
    </div>
    <el-input v-model="count" :disabled="disabled" @change="setSelectedDeviceCount">
    </el-input>
  </el-card>
</template>

<script setup>
  import { ref, watch } from 'vue';
  import { Message } from 'element-ui'

    const count = ref(0)

  const emits = defineEmits(['setSelectedDeviceCount'])
  const props = defineProps({
    disabled: Boolean,
    selected1CDetails: Object
  })

  watch(count, (val) => {
    if (val > props.selected1CDetails?.qti) {
      count.value = null
      Message({ type: 'error', message: "Превышено допустимое количество!" })
    }
  })


  function setSelectedDeviceCount(val) {
    emits('setSelectedDeviceCount', val)
  }

</script>

<style lang="scss" scoped>
</style>