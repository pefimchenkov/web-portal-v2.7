<template>
  <v-container
    v-loading="loading"
    fluid
    class="mt-5"
  >

    <v-row justify="center" align="center">
      <v-col cols="6" class="text-right pr-4">
        <el-button type="warning" icon="el-icon-arrow-left" @click="goBack()">
          Назад
        </el-button>
      </v-col>

      <v-col cols="6" class="text-left pl-4">
        <el-button type="primary" icon="el-icon-plus" :disabled="$acl.not.check('Edit')" @click="addItem">
          Добавить
        </el-button>
        <el-dialog :visible.sync="dialog" :close-on-click-modal="false" top="30vh">

          <el-card shadow="never">
            <div slot="header" class="clearfix">
              <span>{{ infoText }}</span>
            </div>
            <v-text-field
              ref="name"
              v-model="editedItem.name"
              label="* Название"
              :rules="textRules"
              clearable
              required
              validation
              outlined
            />
            <v-card-actions>
              <v-spacer />
              <el-button
                type="danger"
                plain
                @click="dialog=false"
              >
                Отменить
              </el-button>
              <el-button
                type="success"
                plain
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

      <v-tab href="#tab-type">Типы оборудования
        <v-icon>list</v-icon>
      </v-tab>
      <v-tab href="#tab-vendor">Вендор
        <v-icon>list</v-icon>
      </v-tab>

      <!--ТИПЫ ОБОРУДОВАНИЯ -->

      <v-tab-item :value="'tab-type'">
        <div v-if="!loading && ModelsType.length > 0">
          <v-row justify="center" align="center">
            <v-col xs="12" sm="12" md="12" lg="8" offset-xs0 offset-sm0 offset-md0 offset-lg2 class="text-lg-right">
              <v-text-field
                v-model="search"
                class="my-3"
                prepend-icon="search"
                label="Поиск"
                placeholder="Поиск"
                single-line
                clearable
              />

              <v-spacer />

              <v-data-table
                :headers="headers_type"
                :items="ModelsType"
                :search="search"
                calculate-widths
                :items-per-page="10"
                item-key="marketid"
                :mobile-breakpoint="550"
                sort-by="id"
                sort-desc
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
            <v-layout row justify-center align-center>
              <v-progress-circular indeterminate :size="80" color="primary" />
            </v-layout>
          </v-container>
        </div>
      </v-tab-item>

      <!--  ВЕНДОРЫ  -->

      <v-tab-item :value="'tab-vendor'">
        <div v-if="!loading && ModelsVendor.length !== 0">

          <v-row align="center" justify="center">
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
                :headers="headers_vendor"
                :items="ModelsVendor"
                :search="search"
                calculate-widths
                :items-per-page="10"
                item-key="marketid"
                :mobile-breakpoint="550"
                sort-by="id"
                sort-desc
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
            <v-layout row justify-center align-center>
              <v-progress-circular indeterminate :size="80" color="primary" />
            </v-layout>
          </v-container>
        </div>
      </v-tab-item>
    </v-tabs>
  </v-container>
</template>

<script>
import Api from '@/services/___Api'
import { AclRule } from 'vue-acl'
import { mapState } from 'vuex'

export default {

  // eslint-disable-next-line vue/require-prop-types
  props: ['id'],

  data() {
    return {

      show: false,
      loading: false,
      infoText: 'Добавление нового типа',
      imageWidth: '',
      search: '',
      dialog: false,
      localLoading: false,
      active: 'tab-type',
      tab: '',
      headers_type: [
        { text: 'id', value: 'id', align: 'center' },
        { text: 'Название', value: 'name', align: 'center' },
        { text: 'Ред.', value: 'edit', align: 'center' }
      ],
      headers_vendor: [
        { text: 'id', value: 'id', align: 'center' },
        { text: 'Название', value: 'name', align: 'center' },
        { text: 'Ред.', value: 'edit', align: 'center' }
      ],
      pagination: {
        'sortBy': 'id',
        'descending': true
      },
      textRules: [v => !!v || 'Обязательный параметр!'],
      editedItem: {
        id: null,
        name: ''
      }

    }
  },
  computed: {
    ...mapState({
      ModelsType: state => state.models.types,
      ModelsVendor: state => state.models.vendors
    }),
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
      if (val === 'tab-vendor') {
        this.infoText = 'Добавление нового вендора'
      }
    }
  },
  async created() {
    this.loading = true
    await this.$store.dispatch('models/types')
    await this.$store.dispatch('models/vendors')
    this.loading = false
  },

  methods: {
    open() {
      this.dialog = true
    },
    close() {
      this.dialog = false
      this.selectedImage = null
      this.editedItem = Object.assign({})
      this.editedIndex = -1
    },
    goBack() {
      this.$router.go(-1)
    },
    addItem() {
      this.dialog = true
      if (this.active === 'tab-type') this.infoText = 'Добавление нового типа'
      if (this.active === 'tab-vendor') this.infoText = 'Добавление нового вендора'
    },
    editItem(item) {
      if (this.active === 'tab-type') {
        this.infoText = 'Редактирование типа с id ' + item.id
        this.editedIndex = this.ModelsType.indexOf(item)
      }
      if (this.active === 'tab-vendor') {
        this.infoText = 'Редактирование вендора с id ' + item.id
        this.editedIndex = this.ModelsVendor.indexOf(item)
      }
      this.editedItem = Object.assign({}, item)
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
        index = this.ModelsType.indexOf(item)
        conf = 'Вы уверены, что хотите удалить этот тип?'
        url = 'models/del_type'
        resultArr = this.ModelsType
      }
      if (this.active === 'tab-vendor') {
        index = this.ModelsVendor.indexOf(item)
        conf = 'Вы уверены, что хотите удалить этого вендора?'
        url = 'models/del_vendor'
        resultArr = this.ModelsVendor
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
      } else {
        this.$store.commit('setLoading', false)
      }
    },
    save() {
      if (this.$refs.name.validate()) {
        let url = ''
        let success = ''
        let obj
        if (this.editedIndex > -1) {
          if (this.active === 'tab-type') {
            url = 'models/edit_type'
            success = 'Данные успешно обновлены'
            obj = this.ModelsType[this.editedIndex]
          }
          if (this.active === 'tab-vendor') {
            url = 'models/edit_vendor'
            success = 'Данные успешно обновлены'
            obj = this.ModelsVendor[this.editedIndex]
          }
          Api()
            .post(url, this.editedItem)
            .then(res => {
              if (res.data.success === true) {
                Object.assign(obj, this.editedItem)
                this.$store.dispatch('setData', success)
                this.dialog = false
              } else {
                this.$store.dispatch('setError', res.data.error)
              }
            })
            .catch(err => {
              this.$store.dispatch('setError', err.message)
            })
        } else {
          if (this.active === 'tab-type') {
            url = 'models/set_type'
            success = 'Новый тип успешно добавлен'
          }
          if (this.active === 'tab-vendor') {
            url = 'models/set_vendor'
            success = 'Новый вендор успешно добавлен'
          }
          Api()
            .post(url, [this.editedItem.name])
            .then(res => {
              if (res.data.success === true) {
                this.editedItem.id = res.data.lastId
                this.active === 'tab-type' ? this.ModelsType.push(this.editedItem) : this.ModelsVendor.push(this.editedItem)
                this.$store.dispatch('setData', success)
                this.dialog = false
              } else {
                this.$store.dispatch('setError', res.data.error)
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

