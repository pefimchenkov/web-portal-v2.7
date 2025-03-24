<template>
  <v-container v-loading="(specprices.length === 0)" :fill-height="(specprices.length === 0)" fluid>

    <v-toolbar v-show="specprices.length > 0" text color="white" class="elevation-1 grey lighten-3 mb-2" dense :height="['xs', 'sm'].includes($vuetify.breakpoint.name) ? '90px' : '48px'">
      <v-toolbar-title>Спеццены</v-toolbar-title>
      <v-divider class="mx-3" inset vertical />
      <v-checkbox
        v-model="checkBox"
        hide-details
        :label="checkBox ? 'Открепить' : 'Закрепить'"
        class="pl-2"
      />
      <v-spacer />

      <v-row justify="center" align="center">
        <v-col xs="12" sm="6" md="2">
          <v-btn v-if="$acl.check('LeadEngineer')" color="success" small>
            <download-excel
              :fields="json_fields"
              :fetch="getExel"
              name="specprices_list.xls"
            >
              <v-icon class="mr-3 pb-1">save_alt</v-icon>Экспорт в excel
            </download-excel>
          </v-btn>
          <v-spacer />
        </v-col>
        <v-spacer />
        <v-col xs="12" sm="6" md="3">
          <a href="/static/Цены_по_договору_CONTRACT_437_Образец_v3.xls" style="text-decoration: underline">Образец файла для импорта</a>
          <v-spacer />
        </v-col>
        <v-col xs="12" sm="6" md="6">
          <app-upload-file v-if="$acl.check('Edit')" :id="ID" />
        </v-col>
      </v-row>

    </v-toolbar>

    <v-container v-loading="loading" class="ma-0 pa-0" fluid>

      <v-data-table
        ref="dataTable"
        :headers="headers"
        :items="specprices"
        :fixed-header="checkBox"
        :height="checkBox ? WindowHeight : null"
        calculate-widths
        item-key="ID"
        :mobile-breakpoint="750"
        sort-by="ID"
        sort-desc
        dense
        :footer-props="{
          itemsPerPageAllText: 'Все',
          itemsPerPageAllText: 'Строк на странице',
          itemsPerPageOptions: [50,150,500],
          showFirstLastPage: true
        }"
      >

        <template #[`item.product`]="{item}">
          {{ typeof(item.product) === 'number' ? getName(item.product) : item.product }}
        </template>

        <template #[`item.SPEC`]="{item}">
          <v-tooltip top max-width="320">
            <template #activator="{ on }">
              <span style="cursor: pointer" @click="gotoClientSpec(item.client)" v-on="on">{{ item.SPEC }}</span>
            </template>
            <span>Нажмите для перехода в блок договоров клиента <span style="color:yellow">{{ getClientName(item.client) }}</span></span>
          </v-tooltip>
        </template>

        <template #[`item.client`]="{item}">
          {{ getClientName(item.client) }}
        </template>

        <template #[`item.EMAIL`]="{ item }">
          {{ item.EMAIL | getUserName }}
        </template>

        <template #[`item.price_agent`]="{item}">
          <v-icon v-if="item.currency_agent === 1 && item.price_agent" color="blue" small>mdi-currency-rub</v-icon>
          <v-icon v-else-if="item.currency_agent === 2 && item.price_agent" color="yellow darken-2" small>mdi-currency-eur</v-icon>
          <v-icon v-else-if="item.currency_agent === 3 && item.price_agent" color="green" small>mdi-currency-usd</v-icon>
          <v-icon v-else-if="item.currency_agent === 5 && item.price" color="red" small>mdi-currency-kzt</v-icon>
          {{ item.price_agent ? item.price_agent.toLocaleString('ru') : '' }}
        </template>

        <template #[`item.price`]="{item}">
          <v-icon v-if="item.currency === 1 && item.price" color="blue" small>mdi-currency-rub</v-icon>
          <v-icon v-else-if="item.currency=== 2 && item.price" color="yellow darken-2" small>mdi-currency-eur</v-icon>
          <v-icon v-else-if="item.currency === 3 && item.price" color="green" small>mdi-currency-usd</v-icon>
          <v-icon v-else-if="item.currency === 5 && item.price" color="red" small>mdi-currency-kzt</v-icon>
          {{ item.price ? item.price.toLocaleString('ru') : '' }}
        </template>

        <template #[`item.pricends`]="{item}">
          <v-icon v-if="item.currency === 1 && item.pricends" color="blue" small>mdi-currency-rub</v-icon>
          <v-icon v-else-if="item.currency=== 2 && item.pricends" color="yellow darken-2" small>mdi-currency-eur</v-icon>
          <v-icon v-else-if="item.currency === 3 && item.pricends" color="green" small>mdi-currency-usd</v-icon>
          <v-icon v-else-if="item.currency === 5 && item.price" color="red" small>mdi-currency-kzt</v-icon>
          {{ item.pricends ? item.pricends.toLocaleString('ru') : '' }}
        </template>

        <template #[`item.DATE`]="{item}">
          {{ new Date(item.DATE).toLocaleDateString('ru') }}
        </template>

        <template #[`item.model_fit`]="{item}">
          {{ getModelName(item.model_fit) }}
        </template>

      </v-data-table>
    </v-container>

  </v-container>
</template>

<script>

import UploadFile from '../components/bulkImportFromFile.vue'
import { AclRule } from 'vue-acl'
import { mapGetters, mapState } from 'vuex'
import { getUserName } from '@/filters/jira-users'

export default {

  filters: {

    getUserName

  },

  components: {

    appUploadFile: UploadFile

  },

  data() {
    return {
      loading: false,
      ID: 'ALIASES',
      search: '',
      pagination: { 'sortBy': 'ID', 'descending': true },
      dialog: false,
      checkBox: true,
      WindowHeight: null,

      json_fields: {},

      headers: [
        { text: 'id', value: 'ID', divider: true },
        { text: 'Спецификация', value: 'SPEC', divider: true },
        { text: 'ЗИП', value: 'ZIPNAME', divider: true },
        { text: 'Псевдоним', value: 'alias', divider: true },
        { text: 'Модели', value: 'model_fit', divider: true },
        { text: 'Клиент', value: 'client', divider: true },
        { text: 'Артикул 1С', value: 'ART', divider: true },
        { text: 'Цена посредник', value: 'price_agent', align: 'rigth', divider: true, width: '120px' },
        { text: 'Спеццена', value: 'price', align: 'rigth', divider: true, width: '120px' },
        { text: 'Спеццена (с НДС)', value: 'pricends', align: 'rigth', divider: true, width: '120px' },
        { text: 'Автор', value: 'EMAIL', divider: true },
        { text: 'Дата изменения', value: 'DATE', divider: true }
      ]
    }
  },

  computed: {
    ...mapGetters(['zip', 'specprices', 'clients']),
    ...mapState({
      models: state => state.models.models
    }),

    Edit() {
      return new AclRule('admin').or('leadEngineer').generate()
    }
  },

  async created() {
    this.loading = true
    if (this.zip.length === 0) await this.$store.dispatch('fetchZip')
    if (this.clients.length === 0) await this.$store.dispatch('clients/getClients')
    if (this.models.length === 0) await this.$store.dispatch('models/models')
    if (this.specprices.length === 0) await this.$store.dispatch('fetchSpecprices')
    this.loading = false
  },

  beforeMount() {
    this.WindowHeight = window.innerHeight - 220
  },

  mounted() {
    window.addEventListener('resize', this.getWindowHeight)
  },

  methods: {

    getWindowHeight(event) {
      this.WindowHeight = event.target.innerHeight - 220
    },

    getName(id) {
      var obj = {}

      obj = this.zip.find(x => x.zipID === id)

      for (var key in obj) {
        if (key === 'zipNAME') {
          return obj[key] + ' (' + obj.zipID + ')'
        }
      }
    },

    getModelName(id) {
      return this.models.find(item => item.ID === +id)
        ? this.models.find(item => item.ID === +id).MODEL
        : id
    },

    getClientName(id) {
      var obj = {}
      obj = this.clients.find(x => x.ID === id)
      for (var key in obj) {
        if (key === 'NAME') {
          return obj[key]
        }
      }
    },

    gotoClientSpec(id) {
      id = JSON.stringify(id)
      this.$router.push({ name: 'Client', params: { id }})
    },

    async getExel() {
      await this.headers.forEach(item => {
        this.json_fields[item.text] = item.value
      })
      return this.$refs.dataTable.$children[0].filteredItems
    }
  }

}
</script>
