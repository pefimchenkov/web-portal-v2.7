<template>
  <v-container v-loading="show" class="mt-5" fluid>

    <v-row justify="center" align="center">

      <v-col xs="6" class="text-right pr-4">
        <el-button type="warning" icon="el-icon-arrow-left" @click="goBack()">
          Вернуться назад
        </el-button>
      </v-col>

      <v-col xs="6" class="text-left pl-4">

        <el-button type="primary" icon="el-icon-plus" :disabled="$acl.not.check('Edit')" @click="addItem">
          Добавить
        </el-button>

        <el-dialog :visible.sync="dialog" :close-on-click-modal="false" top="30vh">

          <el-card class="pa-3 ma-3" shadow="never">
            <v-card-title class="subheading">{{ infoText }}</v-card-title>
            <v-card-text>
              <v-text-field
                ref="name"
                v-model="editedItem.name"
                label="* Название"
                :rules="textRules"
                clearable
                required
                validation
                hide-details
                outlined
                style="margin-bottom: 10px !important;"
              />
              <v-text-field
                v-if="active === 'tab-type'"
                ref="name"
                v-model="editedItem.install_time"
                label="* Время на установку"
                :rules="install_timeRules"
                clearable
                required
                validation
                outlined
              />

              <!-- ==== СЛАЙДЕР ==== -->
              <v-range-slider
                v-if="active === 'tab-type'"
                v-model="range"
                :max="max"
                :min="min"
                hide-details
                label="Диапазон %"
                class="align-center"
              >
                <template #prepend>
                  <v-text-field
                    v-model="range[0]"
                    :value="range[0]"
                    class="mt-0 pt-0"
                    hide-details
                    type="number"
                    style="width: 60px"
                  />
                </template>
                <template #append>
                  <v-text-field
                    v-model="range[1]"
                    :value="range[1]"
                    class="mt-0 pt-0"
                    hide-details
                    type="number"
                    style="width: 60px"
                  />
                </template>
              </v-range-slider>

            <!-- =============== -->
            </v-card-text>

            <v-card-actions>
              <v-spacer />
              <el-button
                plain
                type="warning"
                @click="close"
              >
                Отменить
              </el-button>
              <el-button
                plain
                type="success"
                :disabled="localloading"
                :loading="localloading"
                @click.native="save"
              >
                Сохранить
              </el-button>
            </v-card-actions>
          </el-card>
        </el-dialog>
      </v-col>

    </v-row>
    <v-tabs v-model="active" centered fixed-tabs icons-and-text class="mt-3">
      <v-tabs-slider />

      <v-tab href="#tab-class">Классы ЗИП
        <v-icon>list</v-icon>
      </v-tab>
      <v-tab href="#tab-type">Типы ЗИП
        <v-icon>list</v-icon>
      </v-tab>
      <v-tab href="#tab-supplier">Поставщики
        <v-icon>list</v-icon>
      </v-tab>

      <!--КЛАССЫ ЗИП-->

      <v-tab-item :value="'tab-class'">
        <div v-if="!loading && ZipClass.length > 0">
          <v-row justify="center" align="center">
            <v-col xs="12" sm="12" md="12" lg="8" offset-xs0 offset-sm0 offset-md0 offset-lg2 class="text-lg-right">
              <v-text-field
                v-model="search"
                class="mb-3"
                prepend-icon="search"
                label="Поиск"
                placeholder="Поиск"
                single-line
                clearable
              />

              <v-spacer />

              <v-data-table
                :headers="headers"
                :items="ZipClass"
                :search="search"
                calculate-widths
                item-key="marketid"
                :mobile-breakpoint="750"
                sort-by="name"
                class="elevation-2"
                :footer-props="{
                  itemsPerPageAllText: 'Все',
                  itemsPerPageText: 'Строк на странице',
                  itemsPerPageOptions: [10,50,150,-1],
                  showFirstLastPage: true
                }"
              >

                <!--     Меню действий    -->

                <template #[`item.edit`]="{ item }">
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
                      <v-list-item v-if="$acl.check('Edit')" small @click="deleteItem(item)">Удалить</v-list-item>
                    </v-list>
                  </v-menu>
                </template>

              <!-- ---------------------- -->

              </v-data-table>
            </v-col>
          </v-row>
        </div>
        <div v-else>
          <v-container fill-height>
            <v-row justify="center" align="center">
              <v-progress-circular indeterminate :size="100" color="primary" />
            </v-row>
          </v-container>
        </div>
      </v-tab-item>

      <!--ТИПЫ ЗИП -->

      <v-tab-item :value="'tab-type'">
        <div v-if="!loading && ZipType.length !== 0">
          <v-row justify="center" align="center">
            <v-col xs="12" sm="12" md="12" lg="8" offset-xs0 offset-sm0 offset-md0 offset-lg2 class="text-lg-right">
              <v-text-field
                v-model="search"
                class="mb-3"
                prepend-icon="search"
                label="Поиск"
                placeholder="Поиск"
                single-line
                clearable
              />
              <v-spacer />
              <v-data-table
                :headers="headersType"
                :items="ZipType"
                :search="search"
                calculate-widths
                :items-per-page="10"
                item-key="name"
                :mobile-breakpoint="750"
                sort-by="name"
                class="elevation-2"
                :footer-props="{
                  itemsPerPageAllText: 'Все',
                  itemsPerPageText: 'Строк на странице',
                  itemsPerPageOptions: [10,50,150,-1],
                  showFirstLastPage: true
                }"
              >
                <template #[`item.zipratio`]="{ item }">
                  {{ item.zipratio_from ? item.zipratio_from + '%' : '' }} - {{ item.zipratio_upto ? item.zipratio_upto + '%' : '' }}
                </template>

                <!--     Меню действий    -->

                <template #[`item.edit`]="{ item }">
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
                      <v-list-item v-if="$acl.check('Edit')" small @click="deleteItem(item)">Удалить</v-list-item>
                    </v-list>
                  </v-menu>
                </template>

              <!-- ---------------------- -->

              </v-data-table>
            </v-col>
          </v-row>
        </div>
        <div v-else>
          <v-container fill-height>
            <v-row justify="center" align="center">
              <v-progress-circular indeterminate :size="100" color="primary" />
            </v-row>
          </v-container>
        </div>
      </v-tab-item>

      <!--ПОСТАВЩИКИ ЗИП-->

      <v-tab-item :value="'tab-supplier'">
        <div v-if="!loading && Supplier.length !== 0">
          <v-row justify="center" align="center">
            <v-col xs="12" sm="12" md="12" lg="8" offset-xs0 offset-sm0 offset-md0 offset-lg2 class="text-lg-right">
              <v-text-field
                v-model="search"
                class="mb-3"
                prepend-icon="search"
                label="Поиск"
                placeholder="Поиск"
                single-line
                clearable
              />
              <v-spacer />
              <v-data-table
                :headers="headers"
                :items="Supplier"
                :search="search"
                calculate-widths
                :items-per-page="10"
                item-key="marketid"
                :mobile-breakpoint="750"
                sort-by="name"
                class="elevation-2"
                :footer-props="{
                  itemsPerPageAllText: 'Все',
                  itemsPerPageText: 'Строк на странице',
                  itemsPerPageOptions: [10,50,150,-1],
                  showFirstLastPage: true
                }"
              >

                <!--     Меню действий    -->

                <template #[`item.edit`]="{ item }">
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
                      <v-list-item v-if="$acl.check('Edit')" small @click="deleteItem(item)">Удалить</v-list-item>
                    </v-list>
                  </v-menu>
                </template>

              <!-- ---------------------- -->

              </v-data-table>
            </v-col>
          </v-row>
        </div>
        <div v-else>
          <v-container fill-height>
            <v-row justify="center" align="center">
              <v-progress-circular indeterminate :size="100" color="primary" />
            </v-row>
          </v-container>
        </div>
      </v-tab-item>
    </v-tabs>
  </v-container>
</template>

<script>
import Api from '@/services/___Api'
import { AclRule } from 'vue-acl'

export default {
  // eslint-disable-next-line vue/require-prop-types
  props: ['id'],
  data() {
    return {
      ZipClass: [],
      ZipType: [],
      Supplier: [],
      show: false,
      infoText: '',
      search: '',
      localloading: false,
      dialog: false,
      active: 'tab-class',
      tab: '',

      min: 0,
      max: 100,
      range: [0, 100],

      headers: [
        { text: 'id', value: 'id', align: 'center' },
        { text: 'Название', value: 'name', align: 'left' },
        { text: 'Ред.', value: 'edit', align: 'right' }
      ],

      headersType: [
        { text: 'id', value: 'id', align: 'center' },
        { text: 'Название', value: 'name', align: 'left' },
        { text: 'Время на установку', value: 'install_time', align: 'left' },
        { text: 'Диапазон цен (комплектация)', value: 'zipratio', align: 'center' },
        { text: 'Ред.', value: 'edit', align: 'right' }
      ],

      pagination: {
        'sortBy': 'id',
        'descending': true
      },

      textRules: [v => !!v || 'Обязательный параметр!'],

      install_timeRules: [
        v => !!v || 'Обязательный параметр!',
        v => /^[0-9.]+$/.test(v) || 'Допускаются только числа!'
      ],

      /* zipratio: [
        v => /^100$|^[123456789][0-9]$|^[0-9]$/.test(v) || 'Допускаются только числа от 0 до 100!'
      ], */

      editedItem: {

        id: null,
        name: '',
        install_time: null,
        zipratio_from: null,
        zipratio_upto: null

      }
    }
  },

  computed: {
    loading() {
      return this.$store.getters.loading
    },
    Edit() {
      return new AclRule('admin').or('nom').or('leadEngineer').generate()
    }
  },

  watch: {

    dialog(val) {
      val || this.close()
    },

    active(val) {
      if (val === 'tab-type') {
        this.infoText = 'Добавление нового типа'
      }
      if (val === 'tab-class') {
        this.infoText = 'Добавление нового класса'
      }
      if (val === 'tab-supplier') {
        this.infoText = 'Добавление нового поставщика'
      }
    },
    range: {

      deep: true,
      handler(val) {
        if (val[1] === 0 || val[1] === '0') this.range[0] === 100
        if (val[0] === 0 || val[0] === '0') this.range[1] === 100
      }

    }

  },

  async created() {
    await this.$store.dispatch('fetchProductsType')
    await this.$store.dispatch('fetchProductsClass')
    await this.$store.dispatch('fetchSuppliers')
    await this.getType()
    await this.getClass()
    await this.getSupplier()
    await this.init()
  },
  methods: {
    async init() {
      this.$store.commit('setLoading', false)
    },
    getType() {
      this.ZipType = this.$store.getters.productstype
    },
    getClass() {
      this.ZipClass = this.$store.getters.productsclass
    },
    getSupplier() {
      this.Supplier = this.$store.getters.suppliers
    },
    open() {
      this.dialog = true
      this.localLoading = true
    },
    close() {
      this.dialog = false
      this.localLoading = false
      this.infoText = ''
      this.editedItem = {}
      this.range = [0, 100]
      this.editedIndex = -1
    },

    goBack() {
      this.$router.go(-1)
    },

    addItem() {
      this.dialog = true
      if (this.active === 'tab-type') this.infoText = 'Добавление нового типа'
      if (this.active === 'tab-class') this.infoText = 'Добавление нового класса'
      if (this.active === 'tab-supplier') this.infoText = 'Добавление нового поставщика'
    },

    editItem(item) {
      if (this.active === 'tab-type') {
        this.infoText = 'Редактирование типа ЗИП с id ' + item.id
        this.editedIndex = this.ZipType.indexOf(item)
      }
      if (this.active === 'tab-class') {
        this.infoText = 'Редактирование класса ЗИП с id ' + item.id
        this.editedIndex = this.ZipClass.indexOf(item)
      }
      if (this.active === 'tab-supplier') {
        this.infoText = 'Редактирование поставщика ЗИП с id ' + item.id
        this.editedIndex = this.Supplier.indexOf(item)
      }

      this.editedItem = Object.assign({}, item)

      if (item.zipratio_from) this.range[0] = item.zipratio_from
      if (item.zipratio_upto) this.range[1] = item.zipratio_upto

      this.dialog = true
    },

    deleteItem(item) {
      let index = null
      let conf = ''
      let url = ''
      let resultArr = []
      function SpliceFromArr(arr, i) {
        return arr.splice(i, 1)
      }
      if (this.active === 'tab-type') {
        index = this.ZipType.indexOf(item)
        conf = 'Вы уверены, что хотите удалить этот тип?'
        url = 'zip/del_type'
        resultArr = this.ZipType
      }
      if (this.active === 'tab-class') {
        index = this.ZipClass.indexOf(item)
        conf = 'Вы уверены, что хотите удалить этот класс?'
        url = 'zip/del_class'
        resultArr = this.ZipClass
      }
      if (this.active === 'tab-supplier') {
        index = this.Supplier.indexOf(item)
        conf = 'Вы уверены, что хотите удалить этого поставщика?'
        url = 'zip/del_supplier'
        resultArr = this.Supplier
      }
      if (confirm(conf)) {
        this.$store.commit('clearError')
        this.show = true
        this.infoText = 'Внимание! Идёт удаление, дождитесь результата!'
        Api()
          .post(url, [item.id])
          .then(response => {
            if (response.data.success) {
              this.show = false
              SpliceFromArr(resultArr, index)
              this.$store.dispatch('setData', 'Элемент с id ' + item.id + ' успешно удалён')
            } else {
              this.show = false
              this.$store.dispatch('setError', response.data.error)
            }
          })
          .catch(error => {
            this.$store.commit('setLoading', false)
            this.$store.commit('setError', error)
          })
      } else {
        this.$store.commit('setLoading', false)
        this.$store.commit('setInfo', 'Удаление отменено')
      }
    },

    save() {
      if (this.$refs.name.validate()) {
        this.localloading = true
        let url = ''
        let success = ''
        let obj
        let payload

        if (this.editedIndex > -1) {
          if (this.active === 'tab-type') {
            url = 'zip/edit_type'
            success = 'Данные успешно обновлены'
            obj = this.ZipType[this.editedIndex]
            this.editedItem.zipratio_from = this.range[0]
            this.editedItem.zipratio_upto = this.range[1]
          }

          if (this.active === 'tab-class') {
            url = 'zip/edit_class'
            success = 'Данные успешно обновлены'
            obj = this.ZipClass[this.editedIndex]
          }

          if (this.active === 'tab-supplier') {
            url = 'zip/edit_supplier'
            success = 'Данные успешно обновлены'
            obj = this.Supplier[this.editedIndex]
          }

          Api()
            .post(url, this.editedItem)
            .then(res => {
              if (res.data.success === true) {
                Object.assign(obj, this.editedItem)
                this.$store.dispatch('setData', success)
                this.localloading = false
                this.dialog = false
              } else {
                this.$store.dispatch('setError', res.data.error)
                this.localloading = false
              }
            })
            .catch(err => {
              this.$store.dispatch('setError', err.message)
            })
        } else {
          if (this.active === 'tab-type') {
            url = 'zip/add_type'
            payload = this.editedItem
            payload.zipratio_from = this.range[0]
            payload.zipratio_upto = this.range[1]
            success = 'Новый тип успешно добавлен'
          }
          if (this.active === 'tab-class') {
            url = 'zip/add_class'
            payload = [this.editedItem]
            success = 'Новый класс успешно добавлен'
          }
          if (this.active === 'tab-supplier') {
            url = 'zip/add_supplier'
            payload = [this.editedItem]
            success = 'Новый поставщик успешно добавлен'
          }

          Api()
            .post(url, payload)
            .then(res => {
              if (res.data.success === true) {
                this.editedItem.id = res.data.lastId
                if (this.active === 'tab-type') {
                  this.ZipType.push(this.editedItem)
                }
                if (this.active === 'tab-class') {
                  this.ZipClass.push(this.editedItem)
                }
                if (this.active === 'tab-supplier') {
                  this.Supplier.push(this.editedItem)
                }
                this.$store.dispatch('setData', success)
                this.localloading = false
                this.dialog = false
              } else {
                this.$store.dispatch('setError', res.data.error)
                this.localloading = false
              }
            })
            .catch(err => {
              this.$store.dispatch('setError', err.message)
            })
        }
      } else {
        this.$store.commit('setError', ' Не заполнено требуемое поле! ')
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
.overall {
	z-index: 0 !important;
}
</style>

