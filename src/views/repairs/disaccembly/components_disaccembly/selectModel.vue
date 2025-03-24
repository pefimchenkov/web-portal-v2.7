<template>
  <el-card style="width: 100%; min-height: 100px" class="model-card">
    <el-select
      v-model="state.selectedDevice"
      placeholder="Выберите модель для разукомплектации"
      class="model-input"
      clearable
      autocomplete
      filterable
      :disabled="disabled"
      value-key="id"
      @change="handleSelect"
    >
      <el-option
        v-for="item in devices"
        :key="item.id"
        :label="item.name"
        :value="item"
      >
        {{ item.name }}
      </el-option>
    </el-select>
  </el-card>
</template>

<script setup>
import { reactive, watch } from "vue";

const props = defineProps({
  devices: Array,
  deviceId: Number,
  disabled: Boolean
});

watch(() => props.deviceId, (val) => {
  if (val) {
    state.selectedDevice = props.devices.find(i => i.marketId === val)
    handleSelect()
  }
});

const emits = defineEmits(["handleSelect"]);

const state = reactive({
  selectedDevice: null,
});

function handleSelect() {
  console.log('From selectModel: ', state.selectedDevice);
  emits("handleSelect", state.selectedDevice);
}
</script>

<style lang="scss" scoped>
.model-input {
  width: 100%;
  margin: 5px 0;
}
</style>