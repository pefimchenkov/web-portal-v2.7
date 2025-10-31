<template>
  <el-card class="model-card" style="width: 100%; min-height: 139px">
    <div slot="header">
      <span>Метод:</span>
    </div>

    <el-radio
      v-model="method"
      label="full"
      :disabled="disabled"
      @change="setSelectedMethod"
      >Полная
    </el-radio>

    <el-radio
      v-model="method"
      label="part"
      :disabled="disabled"
      @change="setSelectedMethod"
    >
      Частичная
    </el-radio>
    
  </el-card>
</template>

<script setup>
import { ref } from "vue";

const method = ref("full");

const emits = defineEmits(["setSelectedMethod"]);
defineProps({
  disabled: Boolean,
});

function setSelectedMethod() {
  emits("setSelectedMethod", method.value);
}
</script>

<style lang="scss" scoped>
</style>