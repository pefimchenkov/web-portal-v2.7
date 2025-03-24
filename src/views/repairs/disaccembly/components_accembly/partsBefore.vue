<template>
  <el-card style="width: 100%">
    <el-alert
      v-if="isValidForDisassebmble"
      title="ВНИМАНИЕ!"
      description="Не весь ЗИП есть в наличии. Такой ЗИП не доступен к выбору."
      type="warning"
      show-icon>
    </el-alert>

    <el-table
      ref="partsRef"
      :data="parts"
      stripe
      style="width: 100%; margin: 20px 0"
      size="mini"
      @selection-change="handleSelectionChangeParts"
    >
      <el-table-column
        type="selection"
        width="50"
        :selectable="availableSelect"
      >
      </el-table-column>

      <el-table-column prop="marketid" label="ID"> </el-table-column> <!-- MAIN_JIRA_ID -->
      <el-table-column prop="marketNAME" show-overflow-tooltip label="Название">
      </el-table-column>
      <el-table-column prop="marketART" label="Артикул"> </el-table-column>
      <el-table-column prop="marketPN" show-overflow-tooltip label="PN"></el-table-column>
      <el-table-column prop="autopercent" label="% в составе"> </el-table-column>
      <el-table-column prop="price" label="Цена">
        <template slot-scope="scope">
          {{
            scope.row.price?.toLocaleString("ru", {
              style: "currency",
              currency: "RUB",
            })
          }}
        </template>
      </el-table-column>
      <el-table-column prop="qty" label="Кол-во"></el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  parts: Array,
  devicesCount: String
});


const partsRef = ref("partsRef");
const isValidForDisassebmble = computed(() => {
  return props.parts.some(item => item.qty <= 0 || !item.qty )
})
console.log(props.parts);

const emits = defineEmits(["handleSelectionChangeParts"]);

function handleSelectionChangeParts(arr) {
  emits("handleSelectionChangeParts", arr);
}

function availableSelect(row) {
  return row.qty > 0 && row.qty >= Number(props.devicesCount);
}


</script>

<style lang="scss" scoped>
</style>