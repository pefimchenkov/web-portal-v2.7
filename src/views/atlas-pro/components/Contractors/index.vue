<template>
  <v-container fluid>

    <v-data-table
      :headers="tableHeaders"
      :items="items"
      calculate-widths
      :mobile-breakpoint="550"
      sort-by="contractor"
      dense
      :footer-props="{
        itemsPerPageAllText: 'Строк на странице',
        itemsPerPageOptions: [50,150,500,],
        showFirstLastPage: true
      }"
      class="elevation-1"
    >
      <template #[`body.prepend`]>
        <Filters
          v-if="headers.length > 0"
          :headers="tableHeaders"
          :filters="filters"
          :data="items"
          clear
          :options="{
            input: ['contractor', 'contractorInn', 'contractorInn', 'contractorKpp', 'bik', 'accountNum'],
            checkbox: ['isDeleted']
          }"
          :transform="[{ accountNum: 'boolean' }]"
          @updateFilters="updateFilters"
          @resetFilters="filters = {}"
        />
      </template>

      <template #[`item.isDeleted`]="{ item }">
        {{ item.isDeleted ? '(✖)' : null }}
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
      loading: false,
      tableHeaders: [],
      headers: [
        {
          text: 'ID',
          value: 'id'
        },
        {
          text: 'Контрагент',
          value: 'contractor'
        },
        {
          text: 'ИНН',
          value: 'contractorInn'
        },
        {
          text: 'КПП',
          value: 'contractorKpp'
        },
        {
          text: 'Номер счёта',
          value: 'accountNum'
        },
        {
          text: 'Помечен на удаление',
          value: 'isDeleted'
        },
        {
          text: 'БИК',
          value: 'bik'
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
