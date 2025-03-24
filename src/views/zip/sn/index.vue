<template>
  <v-container v-loading="loading" :fill-height="loading" fluid>

    <v-toolbar v-show="!loading" text color="white" class="elevation-1 grey lighten-3 mb-2" dense :height="['xs', 'sm'].includes($vuetify.breakpoint.name) ? '90px' : '48px'">
      <v-toolbar-title>Серийные номера</v-toolbar-title>
      <v-divider class="mx-3" inset vertical />

      <v-checkbox
        v-model="checkBox"
        hide-details
        :label="checkBox ? 'Открепить' : 'Закрепить'"
        class="pl-2"
      />
      <v-spacer />

      <v-row justify="center" align="center">
        <v-col xs="12" sm="6" md="4">
          <v-btn v-if="$acl.check('LeadEngineer')" color="success" small>
            <download-excel
              :fields="json_fields"
              :fetch="getExel"
              name="sn_list.xls"
            >
              <v-icon class="mr-3 pb-1">save_alt</v-icon>Экспорт в excel
            </download-excel>
          </v-btn>
          <v-spacer />
        </v-col>
        <v-col xs="12" sm="6" md="4">
          <a href="/static/example_sn.xls" style="text-decoration: underline">Образец файла для импорта</a>
          <v-spacer />
        </v-col>
        <v-col xs="12" sm="6" md="4">
          <UploadFile v-if="$acl.check('Edit')" :id="ID" @setLoading="setLoading" />
        </v-col>
      </v-row>

    </v-toolbar>

    <v-container v-loading="loading" class="ma-0 pa-0" fluid>

      <v-data-table
        ref="dataTable"
        :headers="headers"
        :items="SN"
        :fixed-header="checkBox"
        :height="checkBox ? WindowHeight : null"
        calculate-widths
        item-key="ID"
        :mobile-breakpoint="750"
        no-data-text="ДАННЫХ НЕТ"
        no-results-text="ДАННЫЕ НЕ НАЙДЕНЫ "
        sort-by="ID"
        sort-desc
        dense
        :footer-props="{
          itemsPerPageOptions: [25,100,250],
          showFirstLastPage: true,
          itemsPerPageText: 'Строк на странице'
        }"
      >
        <template #[`body.prepend`]>
          <tr>
            <td
              v-for="header in headers"
              :key="header.ID"
              class="py-2"
            >
              <v-autocomplete
                v-if="header.value === 'Client'"
                v-model="filters.Client"
                :items="clients"
                clearable
                outlined
                dense
                hide-details
              />
              <v-autocomplete
                v-if="header.value === 'Model'"
                v-model="filters.Model"
                :items="models"
                clearable
                outlined
                dense
                hide-details
              />
              <v-text-field
                v-if="header.value === 'SN'"
                v-model="filters.SN"
                type="text"
                outlined
                dense
                clearable
                hide-details
              />
              <v-text-field
                v-if="header.value === 'TSDN'"
                v-model="filters.TSDN"
                type="text"
                outlined
                dense
                clearable
                hide-details
              />
              <v-text-field
                v-if="header.value === 'Contract'"
                v-model="filters.Contract"
                type="text"
                outlined
                dense
                clearable
                hide-details
              />
              <v-text-field
                v-if="header.value === 'SPEC'"
                v-model="filters.SPEC"
                type="text"
                outlined
                dense
                clearable
                hide-details
              />
              <v-menu
                v-if="header.value === 'ENDDATE'"
                ref="menuENDDATE"
                v-model="menuENDDATE"
                :close-on-content-click="false"
                :return-value.sync="filters.enddates"
                transition="scale-transition"
                offset-y
                min-width="290px"
              >
                <template #activator="{ on, attrs }">
                  <v-text-field
                    v-model="enddateRangeText"
                    readonly
                    v-bind="attrs"
                    clearable
                    style="font-size: 13px;"
                    label="Выберите диапазон"
                    prepend-icon="mdi-calendar"
                    v-on="on"
                  />
                </template>
                <v-date-picker
                  v-model="filters.enddates"
                  range
                  no-title
                  scrollable
                  locale="ru-RU"
                >
                  <v-spacer />
                  <v-btn
                    text
                    color="primary"
                    @click="filters.enddates = []"
                  >
                    Сброс
                  </v-btn>
                  <v-btn
                    text
                    color="primary"
                    @click="$refs.menuENDDATE[0].save(filters.enddates)"
                  >
                    OK
                  </v-btn>
                </v-date-picker>
              </v-menu>
              <v-text-field
                v-if="header.value === 'Store'"
                v-model="filters.Store"
                type="text"
                outlined
                clearable
                dense
                hide-details
              />
              <v-autocomplete
                v-if="header.value === 'City'"
                v-model="filters.City"
                :items="citys"
                clearable
                outlined
                dense
                hide-details
              />
              <v-autocomplete
                v-if="header.value === 'EMAIL'"
                v-model="filters.EMAIL"
                :items="emails"
                clearable
                outlined
                dense
                hide-details
              />
              <v-menu
                v-if="header.value === 'DATE'"
                ref="menuDATE"
                v-model="menuDATE"
                :close-on-content-click="false"
                :return-value.sync="filters.dates"
                transition="scale-transition"
                offset-y
                min-width="290px"
              >
                <template #activator="{ on, attrs }">
                  <v-text-field
                    v-model="dateRangeText"
                    readonly
                    v-bind="attrs"
                    clearable
                    style="font-size: 13px;"
                    label="Выберите диапазон"
                    prepend-icon="mdi-calendar"
                    v-on="on"
                  />
                </template>
                <v-date-picker
                  v-model="filters.dates"
                  range
                  no-title
                  scrollable
                  locale="ru-RU"
                >
                  <v-spacer />
                  <v-btn
                    text
                    color="primary"
                    @click="filters.dates = []"
                  >
                    Сброс
                  </v-btn>
                  <v-btn
                    text
                    color="primary"
                    @click="$refs.menuDATE[0].save(filters.dates)"
                  >
                    OK
                  </v-btn>
                </v-date-picker>
              </v-menu>
            </td>
          </tr>
        </template>

        <template #[`item.Client`]="{ item }">
          {{ getClientName(item.Client) }}
        </template>
        <template #[`item.ENDDATE`]="{ item }">
          {{ item.ENDDATE | formatDateRu('DD.MM.YYYY') }}
        </template>
        <template #[`item.DATE`]="{ item }">
          {{ item.DATE | formatDateRu('DD.MM.YYYY') }}
        </template>
        <template #[`item.EMAIL`]="{ item }">
          {{ item.EMAIL | getUserName }}
        </template>

      </v-data-table>
    </v-container>
  </v-container>
</template>

<script>
import UploadFile from '../components/bulkImportFromFile.vue'
import { AclRule } from 'vue-acl'

import { getUserName } from '@/filters/jira-users'
import { formatDateRu } from '@/services/helpers'
import { mapGetters } from 'vuex'

export default {
  components: {
    UploadFile
  },
  filters: {
    getUserName,
    formatDateRu
  },
  data() {
    return {
      ID: 'SN',
      pagination: { 'sortBy': 'ID', 'descending': true },
      dialog: false,
      loading: false,
      menuDATE: false,
      menuENDDATE: false,
      checkBox: true,
      WindowHeight: null,

      filters: {
        dates: [],
        enddates: []
      },

      multiSelects: {
        istatus: [],
        ci: [],
        ci_type: [],
        pp: []
      },

      json_fields: {},

      headers: [
        { text: 'ID', value: 'ID', divider: true },
        { text: 'Клиент',
          value: 'Client',
          divider: true,
          filter: (value) => {
            return value
              ? this.filters.Client
                ? this.getClientName(value) === this.filters.Client
                : true
              : false
          }
        },
        { text: 'Модель',
          value: 'Model',
          divider: true,
          filter: (value) => {
            return this.filters.Model
              ? this.filters.Model !== 'Нет информации'
                ? value === this.filters.Model
                : value === null
              : true
          }
        },
        {
          text: 'SN',
          value: 'SN',
          divider: true,
          filter: (value) => {
            if (!this.filters.SN) return true
            if (value === null && this.filters.SN) return false
            if (this.filters.SN === ' ') return value === ''
            return value.toLowerCase().includes(this.filters.SN.toLowerCase())
          }
        },
        { text: 'Информация',
          value: 'TSDN',
          divider: true,
          filter: (value) => {
            if (!this.filters.TSDN) return true
            if (value === null && this.filters.TSDN) return false
            if (this.filters.TSDN === ' ') return value === ''
            return value.toLowerCase().includes(this.filters.TSDN.toLowerCase())
          }
        },
        { text: 'Номер договора',
          value: 'Contract',
          divider: true,
          filter: (value) => {
            if (!this.filters.Contract) return true
            if (value === null && this.filters.Contract) return false
            if (this.filters.Contract === ' ') return value === ''
            return value.toLowerCase().includes(this.filters.Contract.toLowerCase())
          }
        },
        { text: 'Спецификация',
          value: 'SPEC',
          divider: true,
          filter: (value) => {
            if (!this.filters.SPEC) return true
            if (value === null && this.filters.SPEC) return false
            if (this.filters.SPEC === ' ') return value === ''
            return value.toLowerCase().includes(this.filters.SPEC.toLowerCase())
          }
        },
        { text: 'Срок действия',
          value: 'ENDDATE',
          divider: true,
          width: 250,
          filter: value => {
            if (this.filters.enddates.length === 0) return true
            if (!value || isNaN(Date.parse(value))) return false

            const Arr = this.filters.enddates.map(item => Math.round(new Date(item).getTime() / 1000.0))
            const first = Math.min(...Arr)
            const last = Math.max(...Arr)
            const date = new Date(value)

            const formatted = `${date.getFullYear()}-${(date.getMonth() + 1) < 10
              ? '0' + (date.getMonth() + 1)
              : date.getMonth() + 1}-${date.getDate() < 10
              ? '0' + date.getDate()
              : date.getDate()}`

            const newVal = Math.round(new Date(formatted).getTime() / 1000.0)

            return first === last || Arr.length < 2
              ? newVal === first || newVal === last
              : (newVal >= first && newVal <= last)
          }
        },
        {
          text: 'Магазин',
          value: 'Store',
          divider: true,
          filter: (value) => {
            if (this.filters.Store) {
              if (value) {
                return value.toLowerCase().includes(this.filters.Store.toLowerCase())
              }
            } else return true
            if (this.filters.Store === ' ') return value === null
          }
        },
        {
          text: 'Город',
          value: 'City',
          divider: true,
          filter: (value) => {
            return this.filters.City
              ? this.filters.City !== 'Нет информации'
                ? value === this.filters.City
                : value === null
              : true
          }
        },
        { text: 'Автор',
          value: 'EMAIL',
          divider: true,
          filter: (value) => {
            return this.filters.EMAIL
              ? this.filters.EMAIL !== 'Нет информации'
                ? getUserName(value) === this.filters.EMAIL
                : value === null
              : true
          }
        },
        { text: 'Изменён',
          value: 'DATE',
          divider: true,
          width: 250,
          filter: value => {
            if (this.filters.dates.length === 0) return true
            if (!value || isNaN(Date.parse(value))) return false

            const Arr = this.filters.dates.map(item => Math.round(new Date(item).getTime() / 1000.0))
            const first = Math.min(...Arr)
            const last = Math.max(...Arr)
            const date = new Date(value)

            const formatted = `${date.getFullYear()}-${(date.getMonth() + 1) < 10
              ? '0' + (date.getMonth() + 1)
              : date.getMonth() + 1}-${date.getDate() < 10
              ? '0' + date.getDate()
              : date.getDate()}`

            const newVal = Math.round(new Date(formatted).getTime() / 1000.0)

            return first === last || Arr.length < 2
              ? newVal === first || newVal === last
              : (newVal >= first && newVal <= last)
          }
        }
      ]
    }
  },

  computed: {

    ...mapGetters({
      clientsFromStore: 'clients',
      jira_users: 'jira_users'
    }),

    SN() {
      return this.$store.getters['client/serial-numbers/sn'] || []
    },
    Edit() {
      return new AclRule('admin').or('leadEngineer').generate()
    },
    citys() {
      return this.SN.map(item => item.City === null ? 'Нет информации' : item.City) || []
    },
    models() {
      return this.SN.map(item => item.Model === null ? 'Нет информации' : item.Model) || []
    },
    clients() {
      return [...new Set(this.SN.map(item => item.Client === null ? 'Нет информации' : this.getClientName(item.Client)))].filter(n => n) || []
    },
    emails() {
      return this.SN.map(item => item.EMAIL === null ? 'Нет информации' : getUserName(item.EMAIL)) || []
    },
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
    },
    enddateRangeText: {
      get() {
        if (this.filters.enddates.length > 0) {
          const date0 = new Date(this.filters.enddates[0]).toLocaleDateString('ru-RU')
          const date1 = this.filters.enddates[1] ? new Date(this.filters.enddates[1]).toLocaleDateString('ru-RU') : 'не выбрано'
          return date0 + ' ~ ' + date1
        } else return null
      },
      set() {
        this.filters.enddates = []
      }
    }

  },

  beforeMount() {
    this.WindowHeight = window.innerHeight - 210
  },

  async created() {
    this.loading = true
    if (this.jira_users.length === 0) await this.$store.dispatch('fetchJiraUsers')
    if (this.clientsFromStore.length === 0) await this.$store.dispatch('clients/getClients')
    if (this.SN.length === 0) await this.$store.dispatch('client/serial-numbers/getAll')
    this.loading = false
  },

  mounted() {
    window.addEventListener('resize', this.getWindowHeight)
  },

  methods: {

    setLoading(data) {
      this.loading = data
    },

    getWindowHeight(event) {
      this.WindowHeight = event.target.innerHeight - 210
    },

    getClientName(id) {
      for (var key in this.clientsFromStore.find(x => x.ID === id)) {
        if (key === 'NAME') {
          return this.clientsFromStore.find(x => x.ID === id)[key]
        }
      }
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
