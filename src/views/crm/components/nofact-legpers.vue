<template>
  <v-container fluid>
    <div>
      <v-toolbar text color="white" class="text-lg-right elevation-2 mb-1">
        <v-toolbar-title>Непопавший факт: Юрлица</v-toolbar-title>
        <v-divider class="mx-3" inset vertical />
        <v-spacer />
      </v-toolbar>
      <v-data-table
        :headers="headers"
        :items="legpers"
        :search="search"
        item-key="1c"
        :mobile-breakpoint="750"
        sort-by="1c"
        sort-desc
        no-data-text="Данные отсутствуют."
        :footer-props="{
          itemsPerPageAllText: 'Все',
          itemsPerPageText: 'Строк на странице',
          itemsPerPageOptions: [50,250,500,-1],
          showFirstLastPage: true
        }"
      >

        <template #[`item.Sum`]="{item}">
          {{ item.Sum.toLocaleString('ru') + ' р.' }}
        </template>
      </v-data-table>
    </div>
  </v-container>
</template>

<script>

export default {

  props: {

    legpers: {

      type: Array,
      required: true

    }

  },

  data() {
    return {

      search: '',
      dialog: false,

      headers: [
        { text: 'Артикул в документе', value: 'client_1c', align: 'left', divider: true },
        { text: 'Артикул в 1C', value: '1c_id', align: 'left', divider: true },
        { text: 'Клиент в 1С', value: 'name', align: 'left', divider: true },
        { text: 'Кол-во вхождений', value: 'qty', align: 'left', divider: true },
        { text: 'Сумма', value: 'Sum', align: 'left', divider: true },
        { text: 'Проекты 1С', value: 'Projects', align: 'left', divider: true }
      ]

    }
  }

}
</script>

<style scoped>

</style>
