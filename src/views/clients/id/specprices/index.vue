<template>
  <v-container
    v-loading="(loading && !Specprices.length)"
    fluid
  >
    <v-row justify="center" align="center">
      <v-col cols="5">
        <v-text-field
          v-model="search"
          prepend-icon="search"
          label="Поиск"
          placeholder="Введите данные для поиска"
          single-line
          clearable
        />
      </v-col>

      <v-spacer />

      <v-col cols="1" class="text-right">
        <v-dialog v-model="dialog" max-width="700px" persistent>

          <template #activator="{ on, attrs }">
            <el-button
              v-if="$acl.check('Edit')"
              type="primary"
              icon="el-icon-plus"
              v-bind="attrs"
              v-on="$acl.check('Edit') ? on : null"
            />
          </template>

          <el-card v-loading="localLoading">
            <div class="text-center title">{{ formTitle }}: {{ editedItem.ZIPNAME }} {{ editedItem.ART }}</div>

            <v-container grid-list-xs text-center>
              <v-row justify="center" align="center">
                <v-col cols="12">
                  <v-autocomplete
                    ref="zip"
                    v-model="objZip"
                    :items="Zip"
                    :item-text="namePlusArt"
                    label="* ЗИП"
                    required
                    validation
                    :rules="reqRules"
                    clearable
                    return-object
                  />
                </v-col>
                <v-col cols="12">
                  <v-combobox
                    v-if="editedIndex === -1"
                    v-model="editedItem.SPEC"
                    :items="contractKey"
                    item-text="IKEY"
                    label="Контракт"
                    filled
                    dense
                    required
                    validation
                    return-object
                    :rules="reqRules"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    ref="alias"
                    v-model="editedItem.alias"
                    label="* Псевдоним"
                    required
                    validation
                    :rules="reqRules"
                  />
                </v-col>
                <v-autocomplete
                  v-model="editedItem.model_fit"
                  :items="Models"
                  item-text="NAME"
                  label="Модель"
                  clearable
                  return-object
                />
                <v-col cols="9">
                  <v-text-field
                    ref="price"
                    v-model="editedItem.price"
                    label="* Цена"
                    :rules="priceRules"
                    required
                    validation
                  />
                </v-col>
                <v-col cols="3">
                  <v-combobox
                    ref="curr"
                    v-model="selectedCurrency"
                    label="Валюта"
                    :items="Currency"
                    item-text="name"
                    required
                    validation
                    return-object
                    :rules="currRules"
                  />
                </v-col>
                <v-col cols="9">
                  <v-text-field
                    ref="price_agent"
                    v-model="editedItem.price_agent"
                    label="Цена агента"
                    :rules="agentPriceRules"
                    validation
                  />
                </v-col>
                <v-col cols="3">
                  <v-combobox
                    ref="curr_agent"
                    v-model="selectedCurrencyAgent"
                    label="Валюта"
                    :items="Currency"
                    item-text="name"
                    return-object
                    validation
                    required
                    :rules="currAgentRules"
                  />
                </v-col>
                <v-col v-if="editedIndex !== -1" cols="6">

                  <el-switch
                    v-model="editedItem.nds"
                    :active-value="true"
                    :inactive-value="false"
                    disabled
                    :inactive-text="`Цена без НДС`"
                    :active-text="`Цена с НДС`"
                  />
                </v-col>
                <v-col cols="6">
                  <el-switch
                    v-model="editedItem.duplicate"
                    :active-value="1"
                    :inactive-value="null"
                    :inactive-text="`Нет дубликата`"
                    :active-text="`Есть дубликат`"
                  />
                </v-col>
              </v-row>
            </v-container>

            <div class="text-center" style="margin-top: 20px">
              <el-button
                type="warning"
                plain
                :disabled="localLoading"
                @click.native="close"
              >Отмена</el-button>
              <el-button
                type="success"
                plain
                :disabled="localLoading"
                :loading="localLoading"
                @click.native="saveItem"
              >Сохранить</el-button>
            </div>

          </el-card>
        </v-dialog>
      </v-col>
    </v-row>

    <v-data-table
      :headers="headers"
      :items="Specprices"
      calculate-widths
      :search="search"
      :items-per-page="28"
      item-key="ID"
      :mobile-breakpoint="550"
      sort-by="ID"
      sort-desc
      :footer-props="{
        itemsPerPageAllText: 'Все',
        itemsPerPageOptions: [30, 250, 500, -1],
        showFirstLastPage: true,
        itemsPerPageText: 'Строк на странице',
      }"
      class="elevation-0 mb-2"
    >
      <template #item="{ item }">
        <tr>
          <td>{{ item.ID }}</td>
          <td>{{ item.SPEC }}</td>

          <td v-if="typeof item.product === 'number'" class="text--left">
            {{ getName(item.product) }}
          </td>
          <td v-else>{{ item.product }}</td>
          <td>{{ item.alias }}</td>
          <td>{{ getModelName(item.model_fit) }}</td>
          <td>{{ item.ART }}</td>
          <td>
            {{ item.price_agent }}
            <v-icon
              v-if="item.currency_agent === 1 && item.price_agent"
              color="blue"
              small
            >mdi-currency-rub</v-icon>
            <v-icon
              v-else-if="item.currency_agent === 2 && item.price_agent"
              color="yellow darken-2"
              small
            >mdi-currency-eur</v-icon>
            <v-icon
              v-else-if="item.currency_agent === 3 && item.price_agent"
              color="green"
              small
            >mdi-currency-usd</v-icon>
          </td>
          <td>
            {{ item.price }}
            <v-icon
              v-if="item.currency === 1 && item.price"
              color="blue"
              small
            >mdi-currency-rub</v-icon>
            <v-icon
              v-else-if="item.currency === 2 && item.price"
              color="yellow darken-2"
              small
            >mdi-currency-eur</v-icon>
            <v-icon
              v-else-if="item.currency === 3 && item.price"
              color="green"
              small
            >mdi-currency-usd</v-icon>
          </td>
          <td>
            {{ item.pricends }}
            <v-icon
              v-if="item.currency === 1 && item.pricends"
              color="blue"
              small
            >mdi-currency-rub</v-icon>
            <v-icon
              v-else-if="item.currency === 2 && item.pricends"
              color="yellow darken-2"
              small
            >mdi-currency-eur</v-icon>
            <v-icon
              v-else-if="item.currency === 3 && item.pricends"
              color="green"
              small
            >mdi-currency-usd</v-icon>
          </td>
          <td>{{ item.duplicate || 'нет' }}</td>
          <td>
            {{ item.EMAIL
              ? JiraUsers.find(user => user.email === item.EMAIL)
                ? JiraUsers.find(user => user.email === item.EMAIL).display_name
                : `неверный формат`
              : ''
            }}
          </td>
          <td>
            {{ item.DATE
              ? new Date(item.DATE).toLocaleDateString("ru-RU")
              : 'нет даты'
            }}
          </td>

          <td>

            <v-menu
              bottom
              left
            >
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  v-bind="attrs"
                  v-on="on"
                >
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item v-if="$acl.check('Edit')" small class="mr-2" @click="editItem(item)">Редактировать</v-list-item>
                <v-list-item v-if="$acl.check('Admin')" small @click="deleteItem(item)">Удалить</v-list-item>
              </v-list>
            </v-menu>

          </td>

        </tr>
      </template>

      <template #no-data>
        <p class="my-5">Спеццены отсутствуют</p>
      </template>

    </v-data-table>
  </v-container>
</template>

<script>

import { AclRule } from 'vue-acl'
import { getNds, getModels, add, update, remove } from '@/api/spec-prices'

export default {
  props: {
    id: {
      type: String,
      required: true
    },
    parentSearch: {
      type: String,
      default: () => null
    },
    spec: {
      type: String,
      default: () => null
    }
  },

  data() {
    return {
      search: '',
      dialog: false,
      localLoading: false,
      loading: false,

      Specprices: [],
      Models: [],
      objZip: {},
      selectedCurrency: { name: null },
      selectedCurrencyAgent: { name: null },

      editedIndex: -1,

      editedItem: {
        ID: null,
        price: '',
        nds: false,
        currency: '',
        client: null,
        product: '',
        ART: '',
        SPEC: '',
        model_fit: null,
        duplicate: false
      },

      headers: [
        { text: 'ID', value: 'ID' },
        { text: 'Спецификация', value: 'SPEC' },
        { text: 'ЗИП', value: 'ZIPNAME' },
        { text: 'Псевдоним', value: 'alias' },
        { text: 'Модель', value: 'model_fit' },
        { text: 'Артикул 1С', value: 'ART' },
        { text: 'Цена посредник', value: 'price_agent', align: 'rigth' },
        { text: 'Спеццена', value: 'price', align: 'rigth' },
        { text: 'Спеццена (с НДС)', value: 'pricends', align: 'rigth' },
        { text: 'Дубль', value: 'duplicate' },
        { text: 'Автор', value: 'EMAIL' },
        { text: 'Дата изменения', value: 'DATE' },
        { text: 'Ред', value: 'actions' }
      ],

      priceRules: [
        (v) => !!v || 'Цена - обязательный параметр!',
        (v) => /^[0-9.]+$/.test(v) || 'Допускаются только цифры или цифры c точкой.'
      ],

      agentPriceRules: [
        (v) => {
          if (!v) return true
          else {
            return /^[0-9.]+$/.test(v) || 'Допускаются только цифры или цифры c точкой.'
          }
        }
      ],

      reqRules: [(v) => !!v || 'Обязательный параметр!'],
      currRules: [(v) => !!v?.id || 'Валюта - обязательный параметр!'],
      currAgentRules: [(v) => {
        if (!this.editedItem.price_agent) return true
        if (this.editedItem.price_agent && !!v.id) return true
        return 'Валюта - обязательный параметр!'
      }]
    }
  },

  computed: {
    Zip() {
      return this.$store.getters.zip
    },
    Currency() {
      return this.$store.getters.currency
    },
    JiraUsers() {
      return this.$store.state.jira_users.JIRA_USERS
    },
    formTitle() {
      return this.editedIndex === -1 ? 'Новая позиция' : 'Редактирование'
    },
    Edit() {
      return new AclRule('leadEngineer').or('snEditor').or('financier').or('admin').generate()
    },
    contractKey() {
      return this.$store.getters.contractkey.filter(item => +item.ID === +this.id)
    }
  },

  watch: {
    parentSearch: {
      immediate: true,
      handler(val) {
        this.search = val
      }
    },
    search(val) {
      if (!val) this.$emit('clearSearch')
    },
    async objZip(val) {
      this.Models = [...await getModels({ zipid: val.zipID })]
    }
  },

  async created() {
    this.loading = true
    if (!this.Specprices.length) await this.$store.dispatch('fetchSpecprices')
    if (!this.Models.length) await this.$store.dispatch('models/models')
    if (!this.Zip.length) await this.$store.dispatch('fetchZip')
    if (!this.Currency.length) await this.$store.dispatch('getCurrency')
    this.getSpecprices(this.id)
    this.loading = false
  },

  methods: {

    getSpecprices(clientId) {
      try {
        this.Specprices = this.$store.getters.specprices.filter(i => i.client === +clientId)
        const i = this.$store.getters.specprices.length - 1
        this.lastItemId = this.$store.getters.specprices[i].ID
      } catch (error) {
        this.$store.commit('setError', error.message)
      }
    },

    getName(id) {
      var obj = {}

      obj = this.$store.getters.zip.find((x) => x.zipID === id)
      for (var key in obj) {
        if (key === 'zipNAME') {
          return obj[key] + ' {' + obj.zipID + '}'
        }
      }
    },

    getCur(id) {
      var obj = {}

      obj = this.$store.getters.currency.find(x => x.id === id)

      for (var key in obj) {
        if (key === 'name') {
          return obj[key]
        }
      }
    },

    namePlusArt: (item) => item.zipNAME + ' — ' + item.zipART,

    getModelName(item) {
      if (item && typeof item === 'object') return item.NAME

      return this.$store.state.models.models.find(i => i.ID === +item)
        ? this.$store.state.models.models.find(i => i.ID === +item).MODEL
        : null
    },
    close() {
      this.dialog = false
      this.localLoading = false

      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },

    async editItem(item) {
      this.dialog = true
      this.localLoading = true

      this.Models = [...await getModels({ zipid: item.product })]

      await getNds({ spec_id: item.spec_id })
        .then((response) => {
          this.editedItem = Object.assign({}, item)
          this.editedIndex = this.Specprices.indexOf(item)
          this.editedItem.nds = false
          this.editedItem.product = item.ZIPNAME
          this.editedItem.model_fit = this.Models.find(i => i.ID === +item.model_fit)
          this.editedItem.email = this.$store.getters["auth/currentUser"].email

          typeof item.product === 'number'
            ? (this.objZip = this.Zip.find((z) => z.zipID === item.product))
            : (this.objZip = this.Zip.find((z) => z.zipNAME === item.product))

          this.selectedCurrency = this.Currency.find(cur => cur.id === item.currency)
          this.selectedCurrencyAgent = this.Currency.find(cur => cur.id === item.currency_agent)

          if (response > 0) {
            this.editedItem.nds = true
            this.editedItem.price = this.editedItem.pricends
          }

          setTimeout(() => {
            this.localLoading = false
          }, 1000)
        })
    },

    //  -----------------Блок API ----------------  //

    saveItem() {
      if (this.editedIndex > -1) {
        if (this.$refs.price.validate() && this.$refs.alias.validate() && this.$refs.zip.validate() && this.$refs.curr.validate()) {
          this.localLoading = true

          this.editedItem.price = parseFloat(this.editedItem.price)
          this.editedItem.email = this.$store.getters["auth/currentUser"].email
          this.editedItem.product = this.objZip.zipID

          this.editedItem.currency = this.selectedCurrency?.id
          this.editedItem.currency_agent = this.selectedCurrencyAgent?.id

          update(this.editedItem)
            .then((response) => {
              if (response.affectedRows) {
                this.$store.commit('setData', 'Данные успешно обновлены.')
              }

              if (this.editedItem.nds && this.editedItem.nds === true) {
                this.editedItem.pricends = (parseFloat(this.editedItem.price)).toFixed(2)
                this.editedItem.price = parseFloat(
                  (this.editedItem.price / 1.22).toFixed(2)
                )
              } else {
                this.editedItem.pricends = parseFloat(
                  (this.editedItem.price * 1.22).toFixed(2)
                )
              }

              this.editedItem.ART = this.objZip.zipART
              this.editedItem.EMAIL = this.$store.getters["auth/currentUser"].email

              this.editedItem.duplicate
                ? (this.editedItem.duplicate = 1)
                : (this.editedItem.duplicate = '')

              Object.assign(this.Specprices[this.editedIndex], this.editedItem)
              this.localLoading = false
              this.close()
            })
            .catch((error) => {
              this.$store.commit('setError', error.message)
            })
        } else {
          this.$store.commit('setError', ' Заполните соответствующие поля! ')
        }
      } else {
        if (this.$refs.price.validate() && this.$refs.alias.validate() && this.$refs.curr.validate() && this.$refs.curr_agent.validate()) {
          this.localLoading = true

          const email = this.$store.getters["auth/currentUser"].email
          const spec_id = this.editedItem?.SPEC?.SPECID

          getNds({ spec_id })
            .then((response) => {
              if (response) {
                this.editedItem.pricends = parseFloat(this.editedItem.price)
                this.editedItem.price = parseFloat(
                  (this.editedItem.price / 1.22).toFixed(2)
                )
              } else {
                this.editedItem.pricends = this.editedItem.price * 1.22
              }

              const data = {
                client_id: +this.id,
                zip_id: this.objZip.zipID,
                spec_id,
                alias: this.editedItem.alias,
                model_fit: this.editedItem.model_fit,
                price: +this.editedItem.price,
                price_agent: +this.editedItem?.price_agent,
                pricends: this.editedItem.pricends,
                currency: this.selectedCurrency?.id,
                currency_agent: this.selectedCurrencyAgent?.id,
                user: email
              }

              add(data)
                .then(res => {
                  if (res.affectedRows) {
                    this.$store.commit('setData', 'Данные успешно добавлены.')
                  }

                  this.editedItem.EMAIL = this.$store.getters["auth/currentUser"].email
                  this.editedItem.ART = this.objZip.zipART
                  this.editedItem.SPEC = this.editedItem.SPEC.IKEY
                  this.editedItem.product = this.objZip.zipNAME
                  this.editedItem.ID = +res.insertId
                  this.editedItem.client = +this.id
                  this.editedItem.currency = this.selectedCurrency?.id
                  this.editedItem.currency_agent = this.selectedCurrencyAgent?.id
                  this.editedItem.DATE = new Date()
                  this.editedItem.spec_id = spec_id

                  this.Specprices.push(this.editedItem)
                  this.close()
                })
            })
        } else {
          this.$store.commit('setError', ' Заполните соответствующие поля! ')
        }
      }
    },

    async deleteItem(item) {
      await this.$confirm('Вы уверены? Продолжаем?', 'ВНИМАНИЕ!', {
        confirmButtonText: 'Да',
        cancelButtonText: 'Нет',
        type: 'warning'
      })
        .then(() => {
          const { ID } = item

          remove({ id: ID })
            .then(response => {
              if (response.affectedRows > 0) {
                this.Specprices = this.Specprices.filter(item => item.ID !== ID)
                this.$store.commit('setData', 'Удаление прошло успешно.')
              }
            })
        })
    }

  }
}
</script>

<style lang="scss" scoped>
</style>
