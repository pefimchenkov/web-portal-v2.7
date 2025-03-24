<template>
  <div style="margin: 5px 5px">
    <Form v-loading="state.loading" @data="getData" />

    <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
      <el-alert
        v-if="state.isTreolanLoaded"
        :title="state.titleTreolan"
        :type="state.statusTreolan"
        :closable="false"
        effect="dark"
        center
        show-icon
      >
      </el-alert>
      <el-alert
        v-if="state.isMarvelLoaded"
        :title="state.titleMarvel"
        :type="state.statusMarvel"
        :closable="false"
        center
        effect="dark"
        show-icon
      >
      </el-alert>
      <el-alert
        v-if="state.isMerlionLoaded"
        :title="state.titleMerlion"
        :type="state.statusMerlion"
        :closable="false"
        center
        effect="dark"
        show-icon
      >
      </el-alert>
    </div>

    <!-- Таблица артикулов -->

    <el-table
      v-if="state.data.length"
      v-loading="state.loading"
      :data="responseArts"
      border
      row-key="art"
      :header-cell-style="{ 'background': '#f0f0f0', 'color': '#6e6e6e' }"
      style="width: 100%; margin: 10px auto;"
    >
      <el-table-column prop="art" label="Артикул" width="200" align="center" />
      <el-table-column label="Площадка" align="center">
        <template slot-scope="scope">
          <div style="display: flex; gap: 10px">

          <!-- Таблица данных площадок -->
            <el-table
              v-for="firm in state.firms"
              :key="firm.prop"
              :data="filteredData([scope.row.firms[firm.prop]])"
              border
              size="mini"
              fit
              stripe
              :header-cell-style="tableRowClassName"
              style="width: 100%; margin: 0px auto"
            >
            <el-table-column :label="firm.label" align="center">
              <el-table-column
                v-for="column in selectedHeadersItems"
                :key="column.id"
                :prop="column.value"
                :label="column.text"
                show-overflow-tooltip
                :formatter="column.formatter ? null : formatterData"
              >
              </el-table-column>
            </el-table-column>
            </el-table>
            <!-- ===================== -->

          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- ================== -->
  </div>
</template>

<script setup>
import { getTreolan } from "@/api/b2b/treolan.js";
import { getMerlion } from "@/api/b2b/merlion.js";

import { templateHeadersItems, firms } from "./data.js";
import { createHeaders } from "@/components/DataTable/utils.js";
// import { firmSpanMethod } from "./utils.js";

import { reactive, computed, onBeforeMount } from "vue";

import Form from "./form";

const state = reactive({
  firms,
  tableHeadersItems: [],
  loading: false,
  data: [],
  isTreolanLoaded: false,
  isMarvelLoaded: false,
  isMerlionLoaded: false,
  titleMarvel: "Марвел",
  titleTreolan: "Треолан",
  titleMerlion: "Мерлион",
  statusMarvel: "info",
  statusTreolan: "info",
  statusMerlion: "info",
});

const selectedHeadersItems = computed(() => state.tableHeadersItems);
const responseArts = computed(() => state.data);

function tableRowClassName({ column }) {
  if (column.label === "Марвел") {
    return { background: "#fdf5e678" };
  } else if (column.label === "Мерлион") {
    return { background: "#e9fdfa63" };
  } else if (column.label === "Треолан") {
    return { background: "#e6d1f752" };
  }
  return "";
}

function filteredData(data) {
  if (Object.hasOwn(data[0], 'ExternalItemIdError')) return []
  else return data
}

onBeforeMount(() => {
  state.tableHeadersItems = createHeaders(templateHeadersItems);
});

function formatterData(row, column, cellValue) {
  if (column.property === "WarePrice") {
    return cellValue
      ? Number(cellValue.split(/[ ,]+/)[0]).toLocaleString("ru") + ' ' + row.WarePriceCurrency
      : null;
  }
  return cellValue;
}

/** */
/**  Общий промис на получение всех данных */
/** */
function getData({ marvelTemplate, treolanTemplate, merlionTemplate }) {
  state.loading = true;
  state.data = [];
  Promise.allSettled([
    getDataFromMarvel(marvelTemplate),
    getDataFromTreolan(treolanTemplate),
    getItemsFromMerlion(merlionTemplate),
  ])
    .then((res) => {
      const concated = res
        .filter((i) => i.status === "fulfilled")
        .map((i) => i.value)
        .flat();

      state.data = treolanTemplate.map((item) => {
        return {
          art: item,
          firms: {
            marvel: concated.find(
              (i) => i.partner === "Марвел" && i.WareArticle === item
            ),
            treolan: concated.find(
              (i) => i.partner === "Треолан" && i.WareArticle === item
            ),
            merlion: concated.find(
              (i) => i.partner === "Мерлион" && i.WareArticle === item
            ),
          },
        };
      });
      console.log(state.data);
    })
    .catch((err) => {
      console.log("Ошибка ::: ", err.message);
    })
    .finally(() => (state.loading = false));
}

/** */
/**  Получение данных от каждой компании  */
/** */
const getDataFromMarvel = async (payload) => {
  state.isMarvelLoaded = true;
  state.titleMarvel = "Получение данных от Марвел...";
  state.statusMarvel = "warning";
  const response = await fetch(
    `https://b2b.marvel.ru/Api/GetItems?user=tsd-group11&password=V20L_tWnjR&secret&secretKey=&packStatus=0&responseFormat=1&items=${payload}`,
    { method: "POST" }
  );
  const json = await response.json();
  const jsonPlusPartner = json?.Body?.CategoryItem.map((i) => {
    return { ...i, partner: "Марвел" };
  });
  console.log("Марвел: ", jsonPlusPartner);
  state.statusMarvel = "success";
  state.titleMarvel = "Данные от Марвел успешно загружены.";
  return jsonPlusPartner;
};

const getDataFromTreolan = async (payload) => {
  state.isTreolanLoaded = true;
  state.titleTreolan = "Получение данных от Треолан...";
  state.statusTreolan = "warning";
  const json = await getTreolan(payload);
  const jsonPlusPartner = json?.map((i) => {
    return { ...i, partner: "Треолан" };
  });
  console.log("Треолан: ", jsonPlusPartner);
  state.statusTreolan = "success";
  state.titleTreolan = "Данные от Треолан успешно загружены.";
  return jsonPlusPartner;
};

const getItemsFromMerlion = async (payload) => {
  state.isMerlionLoaded = true;
  state.titleMerlion = "Получение данных от Мерлион...";
  state.statusMerlion = "warning";
  const json = await getMerlion(payload);
  const jsonPlusPartner = json?.map((i) => {
    return { ...i, partner: "Мерлион" };
  });
  console.log("Мерлион: ", jsonPlusPartner);
  state.statusMerlion = "success";
  state.titleMerlion = "Данные от Мерлион успешно загружены.";
  return jsonPlusPartner;
};
</script>

<style lang="scss" scoped>
.main {
  display: flex;
  width: 100%;
  height: 90vh;
}

.el-table__empty-block {
  min-height: 30px !important;
}

.el-table__empty-text {
  line-height: 35px !important;
  color: #a70101;
}

.marvel-row {
  background-color: oldlace !important;
}

.merlion-row {
  background-color: #f0f9eb !important;
}
.treolan-row {
  background-color: #3fed55 !important;
}
</style>
