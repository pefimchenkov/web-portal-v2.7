<template>
  <v-container fluid>

    <v-data-table
      :headers="tableHeaders"
      :items="items"
      item-key="id"
      calculate-widths
      :mobile-breakpoint="550"
      sort-by="date"
      sort-desc
      dense
      class="elevation-2 ma-3"
      :footer-props="{
        itemsPerPageAllText: 'Строк на странице',
        itemsPerPageOptions: [30,150,300],
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
            input: ['num', 'invoiceNum'],
            date: ['date'],
          }"
          @updateFilters="updateFilters"
          @resetFilters="filters = {}"
        />

      </template>
      <template #[`item.date`]="{ item }">
        {{ new Date(item.date).toLocaleDateString('ru-RU') }}
      </template>
    </v-data-table>
  </v-container>
</template>

<script>

import { createHeaders } from '@/components/DataTable/utils.js'
export default {
  components: {
    Filters: () => import('@/components/DataTable/filters.vue')
  },
  props: {
    items: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      filters: {},
      tableHeaders: [],
      headers: [
        {
          text: 'Номер.',
          value: 'num'
        },
        {
          text: 'Дата',
          value: 'date'
        },
        {
          text: 'Номер реализации',
          value: 'invoiceNum'
        },
        {
          text: 'Сумма.',
          value: 'sum'
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
    updateFilters(val) {
      this.filters = val
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
