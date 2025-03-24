<template>
  <el-dialog
    v-if="data"
    :visible.sync="visible"
    @close="cancel"
    >

    <el-card>
      {{ data }}
    </el-card>
    
    <el-select v-model="repairs" placeholder="Выберите ремонт" multiple>
        <el-option label="Ремонт No.1" value="remont1"></el-option>
        <el-option label="Ремонт No.2" value="remont2"></el-option>
        <el-option label="Ремонт No.3" value="remont3"></el-option>
    </el-select>

    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="save">Ок</el-button>
    </span>

</el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps(['dialogVisible', 'data']);
const emits = defineEmits('closeDialog')
const visible = ref(false);
const repairs = ref([]);

watch(() => props.dialogVisible, (val) => visible.value = val)

function save() {
  emits('set-repairs', { day: props.data.day, repairs: repairs.value})
}

function cancel() {
  emits('close-dialog', false)
}

</script>

<style lang="scss" scoped>

</style>