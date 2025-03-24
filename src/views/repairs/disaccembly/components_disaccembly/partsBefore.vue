<template>
  <el-card style="width: 100%">
    <el-alert
      v-if="isAutopercent"
      title="ВНИМАНИЕ!"
      description="Не у всех ЗИП указан % в составе, их получить нельзя."
      type="warning"
      show-icon>
    </el-alert>

    <el-alert
      v-if="isIn1c"
      title="ВНИМАНИЕ!"
      description="Есть отсутствующие в 1с позиции."
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

      <el-table-column prop="marketid" label="ID"> </el-table-column> <!-- был ранее MAIN_JIRA_ID -->
      <el-table-column prop="marketNAME" show-overflow-tooltip label="Название"></el-table-column>
      <el-table-column prop="marketART" label="Артикул"> </el-table-column>
      <el-table-column prop="marketPN" show-overflow-tooltip label="PN"></el-table-column>
      <el-table-column prop="isIn1c" label="Наличие в 1с">
        <template slot-scope="scope">
          {{ scope.row.isIn1c ? 'есть' : "нет" }}
        </template>
      </el-table-column>
      <el-table-column label="% в составе">
        <template slot-scope="{ row }">
          {{ row.autopercent }}
        </template>
      </el-table-column>
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
    </el-table>
  </el-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";

const partsRef = ref("partsRef");

const isAutopercent = computed(() => {
  return props.parts.some(item => (!item.autopercent) )
})

const isIn1c = computed(() => {
  return props.parts.some(item => (!item.isIn1c) )
})


const props = defineProps({
  parts: Array,
  dataFrom1c: Array
});

watch(() => props.parts, () => {
  setProperty();
})

onMounted(() => {
  setProperty()
})

const emits = defineEmits(["handleSelectionChangeParts"]);

function handleSelectionChangeParts(arr) {
  emits("handleSelectionChangeParts", arr);
}

function availableSelect(row) {
  return row.autopercent && row.isIn1c;
}

function setProperty() {
  console.log('props.parts', props.parts)

  props.parts.forEach(item => {
    const obj = props.dataFrom1c.find(data => data.codeZip === item.marketid.toString());
    if (obj) {
      item.isIn1c = true
    } else {
      item.isIn1c = false
    }
  })
}


</script>

<style lang="scss" scoped>
</style>