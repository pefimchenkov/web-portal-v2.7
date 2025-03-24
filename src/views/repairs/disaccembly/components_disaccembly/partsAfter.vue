<template>
  <el-card style="width: 100%">
    <el-table
      ref="newpartsRef"
      :data="newParts"
      style="width: 100%; margin: 20px 0"
      size="mini"
      :row-style="tableRowClassName"
      @selection-change="handleSelectionChangeNewParts"
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
      <el-table-column prop="marketPN" show-overflow-tooltip label="PN">
      </el-table-column>
      <el-table-column prop="autopercent" label="% в составе"> </el-table-column>
      <el-table-column prop="price" label="Цена">
        <template slot-scope="scope">
          {{ scope.row?.price?.toLocaleString('ru', { style: 'currency', currency: 'RUB' }) }}
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>

  defineProps({
    newParts: Array
  })


  const emits = defineEmits(['handleSelectionChangeNewParts'])

  function handleSelectionChangeNewParts(val) {
    emits('handleSelectionChangeNewParts', val)
  }

  function availableSelect(row) {
    return row.MAIN_JIRA_ID
  }

  function tableRowClassName({row}) {
    if (!row.MAIN_JIRA_ID) {
      return {
         background: 'rgb(227 251 214)'
      }
    }
    return '';
  }


</script>

<style lang="scss" scoped>
</style>