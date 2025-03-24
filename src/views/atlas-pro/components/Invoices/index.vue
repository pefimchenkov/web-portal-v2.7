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
        itemsPerPageOptions: [50,150,500,],
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
            input: ['name', 'contractorName', 'project'],
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
      menu: false,
      filters: {},
      headers: [
        {
          text: 'Номер',
          value: 'num'
        },
        {
          text: 'Дата',
          value: 'date'
        },
        {
          text: 'Сумма',
          value: 'sum'
        },
        {
          text: 'Имя',
          value: 'contractorName'
        },
        {
          text: 'Проект',
          value: 'project'
        },
        {
          text: 'Действия',
          value: 'actions'
        }
      ]
    }
  },
  computed: {
    dateRangeText: {
      get() {
        if (this.filters.dates.length > 0) {
          const date0 = new Date(this.filters.dates[0]).toLocaleDateString('ru-RU')
          const date1 = this.filters.dates[1] ? new Date(this.filters.dates[1]).toLocaleDateString('ru-RU') : 'не выбрано'
          return date0 + ' ~ ' + date1
        } else return null
      },
      set() {
        this.filters.dates = []
      }
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
