<template>
  <v-container v-loading="loading" :fill-height="loading">

    <v-toolbar color="grey lighten-4" class="text-lg-right elevation-1 ma-6" height="55">
      <v-toolbar-title>Склад 1С</v-toolbar-title>
      <v-divider class="mx-3" inset vertical />
      <v-text-field
        v-model="search"
        class="mt-3"
        prepend-icon="search"
        label="Поиск"
        placeholder="Поиск"
        single-line
        clearable
      />
      <v-spacer />
    </v-toolbar>

    <v-data-table
      v-show="!loading"
      :headers="headers"
      :items="Stock1C"
      :search="search"
      :items-per-page="50"
      item-key="1c"
      :mobile-breakpoint="850"
      sort-by="1c"
      sort-desc
      :footer-props="{
        itemsPerPageAllText: 'Все',
        itemsPerPageText: 'Строк на странице',
        itemsPerPageOptions: [50,250,500,-1],
        showFirstLastPage: true
      }"
    >
      <template #[`item.date`]="{ item }">{{ new Date(item.date).toLocaleDateString('ru-RU') }}</template>
      <template #no-data>
        <v-alert
          type="warning"
          outlined
          class="ma-3"
        >
          Позиции с Маркет ID равным нулю отстутствуют.
        </v-alert>
      </template>
    </v-data-table>

  </v-container>
</template>

<script>
import { AclRule } from 'vue-acl'

export default {
  data() {
    return {

      loading: false,
      search: '',
      dialog: false,

      headers: [
        { text: '1С', value: '1c', align: 'center', divider: true },
        { text: 'Основной', value: 'qty', align: 'center', divider: true },
        { text: 'Сервисный', value: 'qtyser', align: 'center', divider: true },
        { text: 'Готовой Прод.', value: 'qtygp', align: 'center', divider: true },
        { text: 'Дата', value: 'date', align: 'center', divider: true }
      ]
    }
  },

  computed: {

    Stock1C() {
      return this.$store.getters.Stock1C
    },

    Edit() {
      return new AclRule('user').and('engineer').or('admin').generate()
    }
  },

  async created() {
    this.loading = true
    await this.$store.dispatch('FETCH_STOCK_1C')
    setTimeout(() => {
      this.loading = false
    }, 1000)
  }

}
</script>
