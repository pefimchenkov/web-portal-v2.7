
<template>
  <div>
  <el-table
    v-loading="!state.paginatedTableData.length"
    :data="state.paginatedTableData"
    stripe
    style="width: 100%"
    >
    <el-table-column
      type="expand"
      style=""
      >
      <template slot-scope="props">
        <el-table
          :data="data_parts.filter(i => i.parent_id === props.row.id)"
        >
          <el-table-column
            v-for="field in state.fields_parts"
            :key="field.value"
            :prop="field.value"
            :label="field.name"
            :min-width="field.width"
            >
            <template slot-scope="scope">
              {{ scope.row[field.value] }}
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-table-column>
    <el-table-column
      v-for="field in state.fields"
        :key="field.value"
        :prop="field.value"
        :label="field.name"
        :min-width="field.width"
    >
      <template slot-scope="scope">
        <span v-if="field.value === 'email'">
          {{ getUserName(scope.row[field.value]) }}
        </span>
        <span v-else-if="field.value === 'date'">
          {{ formatDate(scope.row[field.value]) }}
        </span>
        <span v-else-if="field.value === 'issues'">
          <el-link type="primary" :href="formatJiraLink(scope.row[field.value])" target="_blank">{{ scope.row[field.value] }}</el-link>
        </span>
        <span v-else>
          {{ scope.row[field.value] }}
        </span>
      </template>
    </el-table-column>
  </el-table>

  <pagination
      v-show="state.total > 0"
      :total="state.total"
      :page.sync="state.listQuery.page"
      :limit.sync="state.listQuery.limit"
      @pagination="getPaginationData"
    />
  </div>
</template>

<script setup>
  
  import { onMounted, reactive, computed } from 'vue';
  import store from '@/store'
  import settings from '@/settings'

  import Pagination from '@/components/Pagination'

const state = reactive({
    paginatedTableData: [],
    fields: [
      { value: 'id', name: 'ID' },
      { value: 'name', name: 'Документ', width: 350 },
      { value: 'issues', name: 'Задачи' },
      { value: 'model_market_id', name: 'Маркет ID' },
      { value: 'model_name', name: 'Модель' },
      { value: 'qty', name: 'Кол-во' },
      { value: 'method', name: 'Метод' },
      { value: 'price', name: 'Цена' },
      { value: 'email', name: 'Автор' },
      { value: 'date', name: 'Дата' },
      { value: 'qty_zip', name: 'Кол-во ЗИП' },
    ],
    fields_parts: [
      { value: 'zip_market_id', name: 'Маркет ID' },
      { value: 'Name', name: 'Название', width: 300 },
      { value: 'Percent', name: '%' },
      { value: 'Price', name: 'Цена' },
    ],

    listQuery: {
      page: 1,
      limit: 15
    },
    total: 0
    
  })
  

  const data = computed(() => {
    return store.state['repairs/disassembly'].stats
  })

  const data_parts = computed(() => {
    return store.state['repairs/disassembly'].stats_parts
  })

  const users = computed(() => {
    return store.state.jira_users.JIRA_USERS
  })

  onMounted(async() => {
    await getData();
    await getDataParts();
    await getPaginationData();
  })

  async function getData() {
    await store.dispatch('repairs/disassembly/getStats')
}

  async function getDataParts() {
    await store.dispatch('repairs/disassembly/getStatsParts')
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('ru');
}

function getUserName(value) {
  return users.value.find(i => i.email === value)?.display_name
}

function formatJiraLink(data) {
  return settings.jira_url + data
}

function getPaginationData() {
    state.paginatedTableData = data.value.filter((item, index) => index < state.listQuery.limit * state.listQuery.page && index >= state.listQuery.limit * (state.listQuery.page - 1))
    state.total = data.value.length
  }


</script>