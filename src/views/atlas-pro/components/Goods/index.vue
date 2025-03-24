<template>
  <v-container fluid>

    <dialogEdit
      :visible="dialog"
      :name="editedItem.name"
      :part-num="editedItem.partNum"
      :art-t-s-d="editedItem.artTSD"
      :articul="editedItem.articul"
      :code-zip="editedItem.codeZip"
      :adresses_sale="editedItem.adresses_sale"
      :adresses_service="editedItem.adresses_service"
      :adresses_repair="editedItem.adresses_repair"
      :is-deleted="editedItem.isDeleted"
      @close="dialog = false"
      @update="update"
    />

    <v-data-table
      :headers="tableHeaders"
      :items="items"
      item-key="id"
      sort-by="qti"
      sort-desc
      multi-sort
      calculate-widths
      :mobile-breakpoint="550"
      dense
      class="elevation-1 ma-2"
      :footer-props="{
        itemsPerPageAllText: 'Строк на странице',
        itemsPerPageOptions: [30,150,350],
        showFirstLastPage: true
      }"
    >

      <template #[`body.prepend`]>
        <Filters
          v-if="headers.length > 0"
          :headers="tableHeaders"
          :filters="filters"
          :data="items"
          clear
          :options="{
            input: ['articul', 'name', 'partNum', 'artTSD', 'codeZip', 'adresses'],
            checkbox: ['isDeleted'],
            multiple: ['warehouse']
          }"
          @updateFilters="updateFilters"
          @resetFilters="filters = {}"
        />
      </template>

      <template #[`item.costPrice`]="{ item }">
        {{
          filters.costPrice
            ? (item.costPrice * 1.2).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })
            : item.costPrice.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })
        }}
      </template>

      <template #[`item.isDeleted`]="{ item }">
        {{ item.isDeleted ? ' (✖)' : '' }}
      </template>

      <template #[`item.qti`]="{ item }">
        {{ item.qti || 0 }}
      </template>

      <template #[`item.marketID`]="{ item }">
        {{ setElementID(item) }}
      </template>

      <template #[`item.adresses`]="{ item }">
        <el-tag
          v-for="(adress, i) in item.adresses"
          :key="i"
          :type="adress.autoUpdated ? '' : 'warning' "
          class="mx-2 my-1"
        >
            {{ adress.adress }}
        </el-tag>
      </template>

      <template #[`item.actions`]="{ item }">
        <v-btn icon x-small @click="edit(item)">
          <v-icon small>mdi-pencil</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import { createHeaders } from '@/components/DataTable/utils.js'
export default {
  components: {
    dialogEdit: () => import('./components/dialogEdit'),
    Filters: () => import('@/components/DataTable/filters.vue')
  },
  props: {
    items: {
      type: Array,
      default: () => []
    },
    market: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialog: false,
      editedItem: {},
      tableHeaders: [],
      filters: {},
      headers: [
        {
          text: 'Арт.',
          value: 'articul',
          sortable: true
        },
        {
          text: 'Имя',
          value: 'name',
          sortable: true
        },
        {
          text: 'Кол-во',
          value: 'qti',
          sortable: true
        },
        {
          text: 'Арт. ТСД',
          value: 'artTSD',
          sortable: true
        },
        {
          text: 'PN',
          value: 'partNum',
          sortable: true
        },
        {
          text: 'ID элемента',
          value: 'marketID',
          sortable: true,
          width: 50
        },
        {
          text: 'Код ЗИП (Маркет ID)',
          value: 'codeZip',
          sortable: true,
          width: 50
        },
        {
          text: 'Склад',
          value: 'warehouse',
          sortable: true
        },
        {
          text: 'Помечен на удаление',
          value: 'isDeleted',
          sortable: true,
          width: 100
        },
        {
          text: 'Усреднённая себестоимость',
          value: 'costPrice',
          sortable: true
        },
        {
          text: 'Адреса',
          value: 'adresses',
          sortable: true
        },
        {
          text: 'Действия',
          value: 'actions'
        }
      ]
    }
  },

  created() {
    this.tableHeaders = createHeaders(this.headers)
  },

  methods: {
    edit(item) {
      this.dialog = true
      
      this.editedItem = {
        ...item,
        adresses_sale: item.adresses.filter(i => i.warehouse === 'a4b55d3a-49e8-11ea-826d-001dd8b72066'),
        adresses_service: item.adresses.filter(i => i.warehouse === 'd494caa5-c02d-11ea-80da-0cc47a1243f5'),
        adresses_repair: item.adresses.filter(i => i.warehouse === '7b044cba-3d4f-11ea-8265-001dd8b72066')
      }
      console.log(this.editedItem)
    },

    updateFilters(val) {
      this.filters = val
    },

    update(data) {
      console.log(data);
      window.location.reload();
      /* const Item = this.items.find(item => item.articul === data.articul);
      Item.artTSD = data?.artTSD
      Item.codeZip = data?.codeZip
      Item.partNum = data?.partNum
      Item.name = data?.ShortName
      Item.adresses = data?.adresses */
    },

    setElementID(row) {
      const obj = this.market.find(item => JSON.stringify(item.marketid) === row.codeZip)
      if (obj) return obj.marketID
      else return null
    }

  }
}
</script>

<style lang="scss" scoped>

</style>
