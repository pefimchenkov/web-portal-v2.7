<template>
    <el-card style="width: 100%;" class="model-card" :class="{disable: disabled}">
      <el-row :gutter="10" type="flex" justify="space-between">
      <el-col :span="4">
        <div>
          <el-statistic>
            <template slot="title"><span style="color: grey; ">ID</span></template>
            <template slot="formatter"><span style="font-size: 0.9rem;">{{ selectedMarketDetails?.marketid || 'нет информации' }}</span></template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="4">
        <div>
          <el-statistic>
            <template slot="title"><span style="color: grey; ">Цена</span></template>
            <template slot="formatter"><span style="font-size: 0.9rem;">{{
            selected1CDetails?.costPrice?.toLocaleString("ru", {
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
            <template slot="title"><span style="color: grey; ">Кол-во</span></template>
            <template slot="formatter"><span style="font-size: 0.9rem;">{{ selected1CDetails?.qti || 0 }}</span></template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="4">
        <div>
          <el-statistic>
            <template slot="title"><span style="color: grey; ">Состав</span></template>
            <template slot="formatter"><span style="font-size: 0.9rem;">{{ selectedMarketDetails?.marketPARTS || 'нет информации' }}</span></template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="4">
        <div>
          <el-statistic>
            <template slot="title"><span style="color: grey; ">Склад источник</span></template>
            <template slot="formatter"><span style="font-size: 0.9rem;">
              {{
                warehouses.find(i => i["Ссылка"] === selected1CDetails?.warehouse)
                  ? warehouses.find(i => i["Ссылка"] === selected1CDetails?.warehouse)["Наименование"]
                  : 'нет информации'
              }}
            </span></template>
          </el-statistic>
        </div>
      </el-col>
    </el-row>
    </el-card>
</template>

<script setup>

  defineProps({
    selectedMarketDetails: Object,
    selected1CDetails: Object,
    disabled: Boolean,
    warehouses: Array
  })

</script>

<style lang="scss" scoped>
  .disable {
    background: #F5F7FA;
  }
</style>