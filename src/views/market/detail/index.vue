<template>
  <v-container v-loading="show" fluid>

    <v-dialog v-model="dialog" :max-width="imageWidth">
      <v-img v-if="selectedImage" width="100%" :src="selectedImage" @click.stop="close()" />
    </v-dialog>

    <v-container fluid>
      <v-row justify="center" align="center">
        <v-col xs="6" class="text-left">

          <v-skeleton-loader
            v-if="!ParentName"
            type="heading"
          />
          <h3 v-else class="headline mt-1 py-2">
            {{ ParentName }}
          </h3>

        </v-col>

        <v-col xs="6" class="text-right">
          <v-btn color="warning" @click="goBack()">Вернуться назад</v-btn>
        </v-col>

      </v-row>
    </v-container>

    <v-tabs v-model="active" centered fixed-tabs icons-and-text class="mt-3">
      <v-tabs-slider />

      <v-tab href="#tab-photo">Фото
        <v-icon>photo_album</v-icon>
      </v-tab>
      <v-tab href="#tab-2">Состав
        <v-icon>list</v-icon>
      </v-tab>
      <v-tab href="#tab-techprops">Тех. характеристики
        <v-icon>list</v-icon>
      </v-tab>
      <v-tab href="#tab-4" @click="getAvailability(id)">Наличие
        <v-icon>store</v-icon>
      </v-tab>
      <v-tab href="#tab-rating">Оценка качества
        <v-icon>star</v-icon>
      </v-tab>

      <!--TAB-PHOTO -->

      <v-tab-item :value="'tab-photo'">
        <Photo :id="id" />
      </v-tab-item>

      <!--TAB-PARTS -->

      <v-tab-item :value="'tab-2'" class="mt-3">
        <Parts
          :id="id"
          :parent-name="ParentName"
          :parent-zip-id="ParentZipId"
          :element-type="ElementType"
          :market-list="market"
          :model-market-list="ModelMarketList"
        />
      </v-tab-item>

      <!--TAB-RATING -->

      <v-tab-item :value="'tab-rating'">
        <Rating :id="id" />
      </v-tab-item>

      <!--TAB-4 -->

      <v-tab-item :value="'tab-4'">
        <div v-if="loadings">
          <v-layout row>
            <v-flex xs12 class="text-center pt-5">
              <v-progress-circular color="primary" indeterminate :size="100" />
            </v-flex>
          </v-layout>
        </div>
        <div v-else>
          <v-card
            class="elevation-3 mx-auto mt-5 mr-2 grey--text text--darken-3"
          >
            <v-container container--fluid grid-list-sm>
              <v-layout row wrap fill-height>
                <v-flex xs12 md12 lg6 xl6>
                  <v-card-title>Склад</v-card-title>

                  <v-data-table
                    :headers="headers_SKLAD"
                    :items="SKLAD"
                    class="elevation-2"
                    hide-default-footer
                  >
                    <template #item="{item}">
                      <tr>
                        <td class="text-center">{{ item.LINK }}</td>
                        <td class="text-center">{{ item.OSN }}</td>
                        <td class="text-center">{{ item.SER }}</td>
                        <td class="text-center">{{ item.GP }}</td>
                      </tr>
                    </template>
                  </v-data-table>

                </v-flex>
                <v-flex xs12 md12 lg6 xl6>
                  <v-card-title>Заказ</v-card-title>

                  <v-data-table
                    :headers="headers_SKLAD"
                    :items="ZAKUPKA"
                    class="elevation-2"
                    hide-default-footer
                  >
                    <template #item="{item}">
                      <tr>
                        <td class="text-center"><a :href="'http://support.atlas-pro24.local/browse/' + item.LINK" target="_blank">{{ item.LINK }}</a></td>
                        <td class="text-center">{{ item.OSN }}</td>
                        <td class="text-center">{{ item.SER }}</td>
                        <td class="text-center">{{ item.GP }}</td>
                      </tr>
                    </template>
                  </v-data-table>

                </v-flex>
              </v-layout>
              <v-layout row wrap fill-height>
                <v-flex xs12 md12 lg6 xl6>
                  <v-card-title>Склад в составе:</v-card-title>

                  <v-data-table
                    :headers="headers_SKLAD"
                    :items="SKLAD_IN"
                    class="elevation-2"
                    hide-default-footer
                  >
                    <template #item="{item}">
                      <tr>
                        <td class="text-center">{{ item.LINK }}</td>
                        <td class="text-center">{{ item.OSN_IN }}</td>
                        <td class="text-center">{{ item.SER_IN }}</td>
                        <td class="text-center">{{ item.GP_IN }}</td>
                      </tr>
                    </template>
                  </v-data-table>
                </v-flex>
                <v-flex xs12 md12 lg6 xl6>
                  <v-card-title>Заказ в составе:</v-card-title>

                  <v-data-table
                    :headers="headers_SKLAD"
                    :items="ZAKUPKA_IN"
                    class="elevation-2"
                    hide-default-footer
                  >
                    <template #item="{item}">
                      <tr>
                        <td class="text-center"><a :href="'http://support.atlas-pro24.local/browse/' + item.LINK" target="_blank">{{ item.LINK }}</a></td>
                        <td class="text-center">{{ item.OSN_IN }}</td>
                        <td class="text-center">{{ item.SER_IN }}</td>
                        <td class="text-center">{{ item.GP_IN }}</td>
                      </tr>
                    </template>
                  </v-data-table>

                </v-flex>
              </v-layout>
            </v-container>
          </v-card>
        </div>
      </v-tab-item>

      <!-- ================ TAB-5 Технические характеристики =============== -->

      <v-tab-item :value="'tab-techprops'">
        <v-container v-if="loadings" fluid>
          <v-layout row>
            <v-flex xs12 class="text-center pt-5">
              <v-progress-circular color="primary" indeterminate :size="100" />
            </v-flex>
          </v-layout>
        </v-container>
        <v-container v-else fluid>
          <v-layout row wrap>
            <v-flex xl12>
              <v-data-table
                :headers="headers_TechProps"
                :items="TechProps"
                class="elevation-2 mt-5"
                :items-per-page="50"
                item-key="mainID"
                :mobile-breakpoint="550"
                sort-by="mainID"
                no-data-text="Нет данных"
                :footer-props="{
                  itemsPerPageAllText: 'Все',
                  itemsPerPageText: 'Строк на странице',
                  itemsPerPageOptions: [50,250,500,-1],
                  showFirstLastPage: true
                }"
              >
                <template #[`body.prepend`]="{ items }">
                  <v-dialog v-model="dialogTechPropValue" max-width="550px" persistent :disabled="$acl.not.check('Edit')">
                    <v-card>
                      <v-card-title>Выбор значения для &nbsp;<span class="red--text"> {{ TechPropName(items) }} </span></v-card-title>

                      <v-autocomplete
                        v-model="TechPropValue"
                        class="ml-3 pa-2"
                        :items="TechPropValuesList"
                        item-text="name"
                        autocomplete
                        return-object
                        clearable
                        hide-details
                      />

                      <v-card-actions>
                        <v-spacer />
                        <v-btn
                          color="green darken-1"
                          text
                          @click="dialogTechPropValue=false"
                        >
                          Отменить
                        </v-btn>
                        <v-btn
                          color="green darken-1"
                          text
                          :disabled="localLoading"
                          :loading="localLoading"
                          @click.native="saveTechPropValue(items.find(item => item.mainID === TechPropItemID))"
                        >
                          Сохранить
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </template>

                <template #[`item.TH2`]="{ item }">
                  <span v-if="item.TH2">
                    {{ item.TH2 }}
                    &nbsp;&nbsp;[<v-icon small class="ma-2" :disabled="$acl.not.check('Edit')" @click="deleteTechPropFit(item)">delete</v-icon>]
                  </span>
                </template>

                <template #[`item.action`]="{ item }">
                  <td class="justify-center layout">
                    <v-icon small class="mr-2" :disabled="$acl.not.check('Edit')" @click="editTechPropValue(item)">edit</v-icon>
                  </td>
                </template>

              </v-data-table>
            </v-flex>
          </v-layout>
        </v-container>
      </v-tab-item>
    </v-tabs>
  </v-container>
</template>

<script>
import Photo from './components/photo'
import Parts from './components/parts/index.vue'
import Rating from './components/rating'
import Api from '@/services/___Api'
import { getMarketParts } from '@/api/market'

import { AclRule } from 'vue-acl'
import { mapGetters } from 'vuex'

export default {

  components: {

    Rating,
    Parts,
    Photo

  },

  props: {

    id: {

      type: String,
      required: true

    },

    name: {

      type: String,
      default: () => null

    }
  },

  data() {
    return {

      show: false,
      marketRating: 0,
      marketComment: '',
      selectedImage: null,

      imageWidth: '',

      ParentName: '',
      ParentType: '',
      ParentZipId: null,
      TechPropValue: [],
      TechPropValuesList: [],
      TechPropItemID: null,
      ElementType: null,
      ModelMarketList: [],
      photos: [],
      photosWidth: [],
      window: 0,

      dialog: false,

      dialogTechPropValue: false,
      localLoading: false,
      active: 'tab-1',
      tab: '',
      Zip: [],

      SKLAD: [],
      SKLAD_IN: [],
      ZAKUPKA: [],
      ZAKUPKA_IN: [],

      textRules: [v => !!v || 'Обязательный параметр!'],
      pagination: { 'sortBy': 'id', 'descending': true },

      headers_SKLAD: [
        { text: 'Название', align: 'center', value: 'link', divider: true },
        { text: 'Основной', align: 'center', value: 'base', divider: true },
        { text: 'Серисный', align: 'center', value: 'service', divider: true },
        { text: 'Г.П.', align: 'center', value: 'gp' }
      ],

      headers_TechProps: [
        { text: 'id', align: 'center', value: 'mainID', divider: true },
        { text: 'Название', align: 'center', value: 'TH1', divider: true },
        { text: 'Значение', align: 'center', value: 'TH2', divider: true },
        { text: 'Действие', align: 'center', value: 'action', divider: true }
      ]

    }
  },

  computed: {

    ...mapGetters({ market: 'market_new/market' }),

    loadings() {
      return this.$store.getters.loading
    },

    Edit() {
      return new AclRule('leadEngineer').or('admin').generate()
    },

    TechProps() {
      return this.$store.getters.TechProps
    },

    TechPropsFit() {
      return this.$store.getters.techPropertiesFit
    }

  },
  watch: {

    dialog(val) {
      val || this.close()
    }

  },

  async created() {
    await this.$store.dispatch('market_new/get')
      .then(async res => {
        if (res?.length) {
          await this.getParentParams()
          await this.$store.dispatch('fetchTechProps', { id: this.id, typeID: this.ParentTypeID, element: this.ElementType })
          await this.$store.dispatch('fetchTechPropertiesFit')
        }
    })

    this.getModelMarketList(this.market.find(item => parseInt(item.marketid) === parseInt(this.id)).marketID)
  },

  methods: {

    getParentParams() {
      const obj = this.market.find(item => parseInt(item.marketid) === parseInt(this.id))
      this.ParentTypeID = obj.marketTypeID
      this.ParentName = obj.marketNAME + ' (' + obj.marketART + ', ' + obj.marketPN + ')'
      this.ElementType = obj.elementTYPE
      this.ParentZipId = obj.marketID
    },
    async getModelMarketList(elemID) {
      this.ModelMarketList = await getMarketParts({ id: elemID })
    },
    async getAvailability(elemID) {
      await Api()
        .post('market/get_sklad', [elemID])
        .then(res => {
          res.data.dataSklad ? this.SKLAD = res.data.dataSklad : this.SKLAD = []
          res.data.dataSkladIn ? this.SKLAD_IN = res.data.dataSkladIn : this.SKLAD_IN = []
        })
        .catch(error => {
          if (error) throw error
        })
      await Api()
        .post('market/get_zakupka', [elemID])
        .then(res => {
          res.data.dataZakupka ? this.ZAKUPKA = res.data.dataZakupka : this.ZAKUPKA = []
          res.data.dataZakupkaIn ? this.ZAKUPKA_IN = res.data.dataZakupkaIn : this.ZAKUPKA_IN = []
        })
        .catch(error => {
          if (error) throw error
        })
    },

    deleteTechPropFit(item) {
      if (confirm('Вы действительно хотите отвязать ТХ от Маркета?')) {
        this.show = true
        this.$store.dispatch('deleteTechPropFit', { id: item.id })
          .then(result => {
            if (result.success) {
              item.TH2 = null
              this.$store.commit('setData', result.text)
              this.show = false
            } else {
              this.$store.commit('setError', 'Ошибка в процессе удаления значения, обратитесь к администратору!')
              this.show = false
            }
          })
      } else {
        this.$store.commit('setInfo', 'Удаление отменено')
      }
    },

    goBack() {
      this.$router.push({ name: "market_list" })
    },

    editTechPropValue(item) {
      this.dialogTechPropValue = true
      this.TechPropItemID = item.mainID
      this.$store.dispatch('fetchTechPropValues', item.mainID)
        .then(res => {
          this.TechPropValuesList = res
          this.TechPropValue = this.TechProps.find(prop => prop.mainID === item.mainID).TH2
          this.editedIndex = this.TechProps.indexOf(item)
        })
    },

    TechPropName(items) {
      const name = items.find(item => item.mainID === this.TechPropItemID)
      if (!name) return false
      else return name.TH1
    },

    saveTechPropValue(item) {
      if (this.TechPropValue === undefined) {
        this.$store.commit('setInfo', 'Не выбрано ни одного значения!')
      } else {
        this.localLoading = true
        this.$store.dispatch('addTechPropValue', { TechPropValue: this.TechPropValue, marketID: this.id, item: item })
        this.dialogTechPropValue = false
        this.localLoading = false
      }
    }

  }
}
</script>

<style scoped>
.cursor_btn {
	cursor: pointer
}
.text_center {
	text-align: center !important;
}
.maxWidth {
	max-width: 200px !important;
}
.zIndex {
	z-index:1;
}
</style>

