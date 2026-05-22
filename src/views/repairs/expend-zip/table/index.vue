<template>
  <div v-loading="state.loading">
    <v-toolbar color="#eaeff5" class="text-lg-right elevation-2 mb-1" dense>
      <v-toolbar-title light>
        <span>{{ tableName }}</span>
      </v-toolbar-title>
      <v-divider class="mx-3" inset vertical />

      <!-- Внешний фильтр (remote, from api) -->

      <!-- <OuterFilter
        :periods="periods"
        :clients="state.Clients"
        :models="state.Models"
        :engineers="state.Engineers"
        :users="state.JiraUsers"
        @getData="getData"
      /> -->

      <OuterFilter
        :periods="periods"
        @getData="getData"
      />

      <v-spacer />

      <!-- Настроки таблицы -->
      <TableOptions
        :visible="true"
        :showHeader="state.showHeader"
        :showSortable="state.showSortable"
        :textAlign="state.textAlign"
        @setShowHeader="(val) => (state.showHeader = val)"
        @setShowSortable="(val) => (state.showSortable = val)"
        @setTextAlign="(val) => (state.textAlign = val)"
      />

      <v-divider class="mx-3" inset vertical />

      <!-- МЕНЮ ДЕЙСТВИЙ -->
      <el-dropdown trigger="click" :hide-on-click="false">
        <el-button size="mini" icon="el-icon-s-operation"> Действия </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>
            <!-- управление колонками таблицы -->
            <TableColumns :headers="state.tableHeaders" name="expendZipColumn" />
          </el-dropdown-item>
          <el-dropdown-item>
            <!-- ЭКСПОРТ -->
            <ExportExcel
              :list="state.filteredTableData"
              type="plain"
              :header="selectedHeaders.map((header) => header.value)"
              :ru-header="selectedHeaders.map((header) => header.text)"
              :table-name="exportFileName"
            />

            <!-- <download-excel
              v-if="$refs[`${props.firm.reference}`]"
              :fields="headersToObject(selectedHeaders)"
              :data="$refs[`${props.firm.reference}`].$children[0].filteredItems"
              :name="exportFileName"
            >
              Экспорт в Excel
            </download-excel> -->
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </v-toolbar>

    <!-- ТАБЛИЦА ЗИПа -->

    <el-table
      :data="state.paginatedTableData"
      :max-height="state.showHeader ? state.WindowHeight : ''"
      highlight-current-row
      border
      stripe
      fit
      lazy
      :summary-method="getSummaries"
      show-summary
      row-key="Zip_ID"
      size="mini"
      :header-cell-style="{ background: '#f3f3f3', color: '#6e6e6e' }"
      style="width: 100%"
      @sort-change="customSort"
    >
      <el-table-column
        v-for="(column, idx) in selectedHeaders"
        :key="column.id"
        :prop="column.value"
        :label="column.text"
        :align="state.textAlign ? 'center' : 'left'"
        :width="column.width"
        :fixed="column.fixed"
        :sortable="
          Object.hasOwn(state.templateHeaders[idx], 'sortable') && state.showSortable
            ? column.sortable
            : false
        "
        :formatter="column.formatter ? null : formatterData"
        show-overflow-tooltip
        resizable
      >
        <template v-if="column.formatter" #default="{ row }">
          <component
            :is="column.formatter"
            v-if="column.formatter"
            :row="row"
            :column="column.value"
            :url="state.jira_url"
            :jql="state.jira_jql"
            :jql_query="getJqlQuery(row)"
            :jql_query_remonts="row.Remonts"
          />
          <div v-else>
            {{ row[column.value] }}
          </div>
        </template>

        <!-- Заголовок таблицы -->
        <template slot="header" slot-scope="scope">
          <div style="word-break: keep-all">{{ column.text }}</div>

          <TableFilters
            v-if="state.tableData.length"
            :key="props.firm.id"
            :reference="reference"
            :data="state.tableData"
            :options="state.options"
            :filters="state.filters"
            :types="{
              Input: ['Zip_ID', 'Zip_Name', 'Arts', 'PNs', 'Models', 'Zakupki'],
              MultiSelect: ['Clients', 'eng'],
              CheckBox: ['QtyA', 'QtyZ', 'currentNeed'],
              CustomRange: ['commonToOrder', 'commonCurrentNeed', 'Total'],
              Clear: ['actions'],
            }"
            :formatters="state.formatters"
            :property="scope.column.property"
            @updateData="updateData"
            @updateFilters="updateFilters"
            @resetFilters="resetFilters"
          />
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
import {
  tableName,
  templateHeaders,
  exportFileName,
  periods,
  reference,
} from "./data.js";
import {
  getMinimunBalance,
  getBalancePercent,
  getCurrentNeed,
  getRemonts,
  getToOrder,
  getCommonToOrder,
  getCommonCurrentNeed,
  getTotal,
  getSumPriceNeed,
  getBalancePerMonth, clearFiltersInLocalStorage,
} from "./utils.js";

import { splitStringByComma, parseTime } from "@/utils";
import { jira_url, jira_jql } from "@/settings.js";
import {
  getExpendedZip,
  getCurrentNeedForExpendedZip,
  insertSalesReportToDB,
} from "@/api/zip/expended.js";
import { getMovements } from "@/api/1c/atlas_1c.js";
import {
  createHeaders,
  setRemoteCustomSort,
  headersToObject,
  getSummariesRow,
  createSelectOptionsFromTableData
} from "@/components/DataTable/utils.js";

import TableColumns from "@/components/DataTable/columns.vue";
import TableFilters from "@/components/TableFilters/index.vue";
import TableOptions from "@/components/TableOptions/index.vue";
import OuterFilter from "./components/outer_filter.vue";
import Pagination from "@/components/Pagination";
import ExportExcel from "@/components/ExportExcel";

import { filterHandler } from "@/workers/filters.js";

import Vue, { computed, reactive, watch, onBeforeMount, onMounted } from "vue";
import store from "@/store";

const props = defineProps({
  firm: {
    type: Object,
    default: () => {},
  },
});

const state = reactive({
  Clients: [],
  Models: [],
  Engineers: [],
  JiraUsers: [],
  SalesReport: [],
  Movements: [],

  tableData: [],
  commonToOrder: [],
  commonCurrentNeed: [],
  Total: [],
  filteredTableData: [],
  paginatedTableData: [],
  tableHeaders: [],
  filters: {},
  options: {},
  formatters: [],
  listQuery: {
    page: 1,
    limit: 25,
  },

  jira_url,
  jira_jql,
  showHeader: true,
  showSortable: false,
  textAlign: true,
  total: 0,
  toggle: true,
  loading: false,
  WindowHeight: null,
  reference,
  templateHeaders,
  tableName,
  headersToObject,
  exportFileName,
  splitStringByComma,
});

const dateStart = "2026-01-01";
const dateEnd = parseTime(new Date(), "{y}-{m}-{d}");

const payloadForMovements = {
  dateStart,
  dateEnd,
  warehouse: ["444640d1-3adc-11ea-8264-001dd8b72066"],
};

watch(
  () => state.filteredTableData,
  () => {
    getPaginationData();
  },
  { deep: true, immediate: true }
);

watch(() => state.tableData, async () => {
    if (!state.filters['commonCurrentNeed'].length) {
      state.filters['commonCurrentNeed'] = [0, maxRangeCommonCurrentNeed()]
    }
    if (!state.filters['commonToOrder'].length) {
      state.filters['commonToOrder'] = [0, maxRangeCommonToOrder()]
    }
    if (!state.filters['Total'].length) {
      state.filters['Total'] = [0, maxRangeTotal()]
    }

    console.log(state.filters)

    setFormattersForOptions();
  })

const selectedHeaders = computed(() => {
  return state.tableHeaders.filter((header) => header.selected);
});

onBeforeMount(async () => {
  state.WindowHeight = window.innerHeight - 270;
  //await store.dispatch("models/models");
  //await store.dispatch("clients/getClients");
  //await store.dispatch("fetchJiraUsers");

  state.filters = JSON.parse(localStorage.getItem(state.reference)) || {};
});

onMounted(async () => {
  state.loading = true;
  window.addEventListener("resize", getWindowHeight);
  state.tableHeaders = createHeaders(state.templateHeaders);

  clearFiltersInLocalStorage(state.reference, ['commonCurrentNeed', 'commonToOrder', 'Total']);
  await getData();

  /* nextTick(() => {
    getOutwardFilters();
  }); */

  //

  state.commonToOrder = state.tableData.map((item) => {
    return { id: item.Zip_ID, qty: getToOrder(item) };
  })
})



async function getData(data) {
  console.time("Получаем расходуемый ЗИП: ");
  if (!state.loading) state.loading = true;
  state.tableData = state.filteredTableData = state.paginatedTableData = [];

  if (data?.type === "sale") {
    await getSalesReport(data);
    await setSalesReportToDB();
  }

  Promise.all([
    getMovements(payloadForMovements),
    getExpendedZip(data),
    getCurrentNeedForExpendedZip(data),
  ])
    .then(([movemmentsData, mainData, totalCurrentNeed]) => {
      if (!mainData?.length) {
        state.loading = false;
        return;
      }


      state.tableData = state.filteredTableData = mainData.map((obj) => {
        return {
          ...obj,
          currentNeed: getCurrentNeed(obj, totalCurrentNeed),
          Remonts: getRemonts(obj, totalCurrentNeed),
          commonCurrentNeed: getCommonCurrentNeed(obj, totalCurrentNeed),
          percent: getBalancePercent(obj),
          qtiIn: movemmentsData.find((mov) => mov.articul === obj.Arts)?.qtiIn,
          QtyM: getBalancePerMonth(obj, data?.period_number),
          Qmin: getMinimunBalance(obj, data?.period_number),
          toOrder: getToOrder(obj),
          commonToOrder: getCommonToOrder(obj, state.commonToOrder),
          SumPriceNeed: getSumPriceNeed(obj, totalCurrentNeed, state.commonToOrder),
          Total: getTotal(obj, totalCurrentNeed, state.commonToOrder),
        };
      });

      setTimeout(() => {
        updateData();
      }, 100)

      console.timeEnd("Получаем расходуемый ЗИП: ");

      state.loading = false;
    })
    .catch((error) => {
      console.error(
        "Ошибка получения данных: getExpendedZip, getCurrentNeedForExpendedZip",
        error
      );
    });
}

async function getSalesReport(data) {
  let start, end;
  const now = new Date();
  const prev_year = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
  const prev_3m = new Date(new Date().setMonth(new Date().getMonth() - 3));
  const prev_6m = new Date(new Date().setMonth(new Date().getMonth() - 6));
  const prev_9m = new Date(new Date().setMonth(new Date().getMonth() - 9));

  if (!data?.period_number) {
    start = prev_year.toISOString().slice(0, 19);
    end = now.toISOString().slice(0, 19);
  }

  if (data?.period_number === 3) {
    start = prev_3m.toISOString().slice(0, 19);
    end = now.toISOString().slice(0, 19);
  }

  if (data?.period_number === 6) {
    start = prev_6m.toISOString().slice(0, 19);
    end = now.toISOString().slice(0, 19);
  }

  if (data?.period_number === 9) {
    start = prev_9m.toISOString().slice(0, 19);
    end = now.toISOString().slice(0, 19);
  }

  console.log(start);
  console.log(end);

  state.SalesReport = await store.dispatch("atlas_1c/salesReport", { start, end });
}

async function setSalesReportToDB() {
  if (!state.SalesReport.length) return;
  const data = state.SalesReport.map((item) => {
    if (item.codeZip) return [Number(item.codeZip), item.qti];
  }).filter((i) => i);
  console.log(data);
  await insertSalesReportToDB(data);
}

/* async function getOutwardFilters() {
  const outwardData = await getFiltersForExpendedZip();

  const uniqModels = [...new Set(outwardData.map((i) => Number(i.model)))];
  const uniqClients = [...new Set(outwardData.map((i) => Number(i.client)))];
  const uniqEngineers = [...new Set(outwardData.map((i) => i.eng))];

  state.Models = uniqModels.map((id) =>
    store.state.models.models.find((i) => i.ID === +id)
  );
  state.Clients = uniqClients.map((id) =>
    store.state.clients.all.find((i) => i.ID === +id)
  );
  state.Engineers = uniqEngineers.map((eng) =>
    store.state.jira_users.JIRA_USERS.find((i) => i.user_name === eng)
  );
} */

/* function updateData(data) {
    state.filteredTableData = data || state.tableData
  } */

function updateData() {
  Vue.prototype.$worker
    .run(filterHandler, [
      JSON.stringify(state.filters),
      JSON.stringify(state.tableData),
      JSON.stringify(state.formatters),
    ])
    .then((res) => {
      state.filteredTableData = res || state.tableData;
      localStorage.setItem(state.reference, JSON.stringify(state.filters));
    })
    .catch(console.error);
}

function updateFilters(val) {
  state.filters = { ...val };
}

function resetFilters() {
  state.filters = {
    commonCurrentNeed: [0, maxRangeCommonCurrentNeed()],
    commonToOrder: [0, maxRangeCommonToOrder()],
    Total: [0, maxRangeTotal()],
  };
  updateData();
}

function getWindowHeight(event) {
  state.WindowHeight = event.target.innerHeight - 270;
}

function maxRangeCommonToOrder() {
  return Math.max(...state.tableData.map((i) => i.commonToOrder));
}

function maxRangeCommonCurrentNeed() {
  return Math.max(...state.tableData.map((i) => i.commonCurrentNeed.data));
}

function maxRangeTotal() {
  return Math.max(...state.tableData.map((i) => i.Total));
}

function getSummaries(params) {
  const { columns } = params;
  const props = ["SumPrice", "SumPriceNeed"];
  return getSummariesRow(columns, state.filteredTableData, props);
}

function getPaginationData() {
  state.paginatedTableData = state.filteredTableData.filter(
    (item, index) =>
      index < state.listQuery.limit * state.listQuery.page &&
      index >= state.listQuery.limit * (state.listQuery.page - 1)
  );
  state.total = state.filteredTableData.length;
}

function getJqlQuery(item) {
  return `"Фактические ЗИП и услуги" in (${item.Market_IDs}) AND "Статус партии" in ("Обработка акта", "Ожидание ремонта", "Ожидание товара, ЗИП", "На стороне клиента", "Проверка акта", "Диагностика") AND "Фирма исполнитель" = ${props.firm.id}`;
}

function formatterData(row, column, cellValue) {
  if (column.property === "percent") {
    return cellValue ? row[column.property].data : null;
  }
  if (
    column.property === "Price" ||
    column.property === "SumPrice" ||
    column.property === "SumPriceNeed"
  ) {
    return cellValue
      ? cellValue.toLocaleString("ru", { style: "currency", currency: "RUB" })
      : null;
  }
  return cellValue;
}



function customSort({ prop, order }) {
  if (!order) return;
  state.filteredTableData = state.tableData.sort((a, b) =>
    setRemoteCustomSort(a, b, prop, order)
  );
}

const extractDataFromObject = (value) => {
  if (typeof value === "object" && Object.hasOwn(value, 'data')) {
    return value.data;
  } else return value;
}

function setFormattersForOptions() {
  state.formatters = [
    { name: "currentNeed", formatter: extractDataFromObject.toString() },
    { name: "Clients" },
    { name: "eng" }
  ];

  state.options = {
    ...createSelectOptionsFromTableData({ data: state.tableData, columns: state.formatters.filter(i => !i.prop) }),
  }

}


</script>

<style scoped>
.cursor_btn {
  cursor: pointer;
  touch-action: none;
}
.resizeCheckbox {
  max-width: 120px !important;
  margin-top: 20px !important;
}
.el-dropdown {
  margin-right: 10px !important;
}
.v-input {
  font-size: 1.1em !important;
}
</style>
