
<template>
    <div>
      <el-card style="margin-bottom: 10px">
      <el-row :gutter="10" type="flex" justify="space-between">
      <el-col :span="4">
        <div>
          <el-statistic>
            <template slot="title"><span style="color: grey; ">ID</span></template>
            <template slot="formatter"><span style="font-size: 1rem;">{{ device.marketid || 'нет информации' }}</span></template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="4">
        <div>
          <el-statistic>
            <template slot="title"><span style="color: grey; ">Название</span></template>
            <template slot="formatter"><span style="font-size: 1rem;">{{ device.marketNAME || 'нет информации' }}</span></template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="4">
        <div>
          <el-statistic>
            <template slot="title"><span style="color: grey; ">Цена</span></template>
            <template slot="formatter"><span style="font-size: 1rem;">{{
            from1c?.costPrice?.toLocaleString("ru", {
              style: "currency",
              currency: "RUB",
            }) || "нет информации"
          }}</span></template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="4">
        <div>
          <el-statistic>
            <template slot="title"><span style="color: grey; ">Состав</span></template>
            <template slot="formatter"><span style="font-size: 1rem;">{{ device.marketPARTS || 'нет информации' }}</span></template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="4">
        <div>
          <el-statistic>
            <template slot="title"><span style="color: grey; ">Склад источник</span></template>
            <template slot="formatter"><span style="font-size: 1rem;">
              {{
                warehouses.find(i => i["Ссылка"] === from1c?.warehouse)
                  ? warehouses.find(i => i["Ссылка"] === from1c?.warehouse)["Наименование"]
                  : 'нет информации'
              }}</span></template>
          </el-statistic>
        </div>
      </el-col>
    </el-row>
    </el-card>
    
    <el-card>
      <el-row :gutter="10" type="flex" justify="space-between">

        <el-col :span="6">
          <el-statistic>
              <template slot="title"><span style="color: grey; ">Разукомплектация</span></template>
              <template slot="formatter"><span style="font-size: 1rem;">{{ formattedMethod }}</span></template>
            </el-statistic>
        </el-col>

        <el-col :span="6">
          <el-statistic>
              <template slot="title"><span style="color: grey; ">Количество устройств</span></template>
              <template slot="formatter"><span style="font-size: 1rem;">{{ devicesCount }}</span></template>
            </el-statistic>
        </el-col>

        <el-col :span="6">
          <el-statistic>
              <template slot="title"><span style="color: grey; ">Склад перемещения</span></template>
              <template slot="formatter"><span style="font-size: 1rem;">{{  betweenStock?.name  }}</span></template>
            </el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic>
              <template slot="title"><span style="color: grey; ">Склад назначения</span></template>
              <template slot="formatter"><span style="font-size: 1rem;">{{  targetStock?.name  }}</span></template>
            </el-statistic>
        </el-col>
      </el-row>

      <el-divider></el-divider>

      <el-row>
        <el-table
          :data="newParts"
          stripe
          style="width: 100%; margin: 20px 0"
          size="mini"
          :row-style="tableRowClassName"
        >
          <el-table-column prop="MAIN_JIRA_ID" label="ID"> </el-table-column>
          <el-table-column prop="marketNAME" show-overflow-tooltip label="Название">
          </el-table-column>
          <el-table-column prop="marketART" label="Артикул"> </el-table-column>
          <el-table-column prop="marketPN" show-overflow-tooltip label="PN">
          </el-table-column>
          <el-table-column prop="autopercent" label="% в составе"> </el-table-column>
          <el-table-column prop="price" label="Цена">
        <template slot-scope="scope">
          {{ scope.row.price.toLocaleString('ru', { style: 'currency', currency: 'RUB' }) }}
        </template>
      </el-table-column>
        </el-table>
      </el-row>
    </el-card>

    </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from "vue";

const show = ref(false);

const props = defineProps({
  preview: Boolean,
  device: Object,
  from1c: Object,
  betweenStock: Object,
  targetStock: Object,
  devicesCount: String,
  method: String,
  newParts: Array,
  warehouses: Array
});

// const emits = defineEmits(["closeDialog"]);
const methods = [
  { ru: "Полная", eng: "full" },
  { ru: "Частичная", eng: "part" },
];

watch(
  () => props.preview,
  (val) => {
    show.value = val;
  }
);

onMounted(() => console.log(props.method))

const formattedMethod = computed(() => {
  return methods.find((i) => i.eng === props.method).ru;
});

function tableRowClassName({row}) {
    if (!row.MAIN_JIRA_ID) {
      return {
         background: 'rgb(227 251 214)'
      }
    }
    return '';
  }

/* function closeDialog() {
  emits("closeDialog");
} */
</script>

<style lang="scss" scoped>
</style>