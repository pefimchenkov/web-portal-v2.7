<template>
  <v-container v-loading="loading" fluid :fill-height="!loading">{{ 'WDADWDAWDAWDAWDWADAWDWA' }}

    <v-dialog
      v-model="show"
      width="600"
      @click="show = false"
    >
      <v-card
        color="primary"
        dark
      >
        <v-card-text>
          {{ infoText }}
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-toolbar color="grey lighten-3" class="text-lg-right elevation-2 mb-1" dense>
      <v-toolbar-title>Модели</v-toolbar-title>
      <v-divider class="mx-3" inset vertical />

      <!-- ОТКРЕП / ЗАКРЕП -->

      <v-checkbox
        v-model="toggle"
        :label="toggle ? 'Открепить' : 'Закрепить'"
        class="resizeCheckbox"
      />
      <v-divider class="mx-3" inset vertical />
      <v-spacer />

      <!-- МЕНЮ ДЕЙСТВИЙ -->

      <el-dropdown trigger="click" :hide-on-click="false">
        <el-button icon="el-icon-s-operation">
          Действия
        </el-button>

        <el-dropdown-menu slot="dropdown">

          <el-dropdown-item>
            <TableColumns :headers="headers" name="modelsColumn" />
          </el-dropdown-item>

        </el-dropdown-menu>
      </el-dropdown>

      <!-- ДИАЛОГ ДОБАВЛЕНИЯ НОВОЙ МОДЕЛИ -->

      <v-dialog v-if="Models.length > 0" v-model="dialog" max-width="650px" persistent scrollable :disabled="$acl.not.check('Edit')">
        <template #activator="{ on }">
          <el-button type="primary" icon="el-icon-plus" :disabled="$acl.not.check('Edit')" size="small" v-on="$acl.check('Edit') ? on : ''" />
        </template>

        <el-card class="box-card">
          <v-row justify="center" align="center">
            <v-col cols="12">
              <v-autocomplete
                ref="type"
                v-model="newItem.ModelsType"
                :items="ModelsType"
                item-text="name"
                label="Тип устройства"
                return-object
                :rules="ReqRules"
                hide-details
                validation
                filled
                dense
              />
            </v-col>
            <v-col cols="12">
              <v-autocomplete
                ref="brands"
                v-model="newItem.Brands"
                :items="Brands"
                item-text="name"
                label="Бренд"
                return-object
                validation
                hide-details
                filled
                dense
                :rules="ReqRules"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                ref="name"
                v-model="newItem.Name"
                label="Название модели"
                validation
                hide-details
                filled
                dense
                :rules="ReqRules"
              />
            </v-col>
            <v-col cols="12">
              <v-autocomplete
                ref="category"
                v-model="newItem.ModelsCategory"
                :items="ModelsCategory"
                item-text="name"
                label="Категория оборудования"
                return-object
                required
                filled
                dense
                hide-details
                validation
                :rules="ReqRules"
              />
            </v-col>
            <v-col cols="12">
              <v-autocomplete
                ref="profile"
                v-model="newItem.ModelsProfile"
                :items="ModelsProfile"
                item-text="name"
                label="Профильность оборудования"
                return-object
                required
                hide-details
                validation
                filled
                dense
                :rules="ReqRules"
              />
            </v-col>
            <v-col cols="12">
              <v-combobox
                ref="engineer"
                v-model="newItem.ModelsEngineers"
                :items="ModelsEngineers"
                item-text="engineer"
                label="Ответственный инженер"
                multiple
                autocomplete
                dense
                filled
                small-chips
                deletable-chips
                hide-selected
                return-object
              />
            </v-col>
          </v-row>

          <v-spacer />

          <el-button
            type="warning"
            icon="el-icon-circle-close"
            plain
            :disabled="localLoading"
            @click.native="close"
          >
            Отмена
          </el-button>
          <el-button
            type="success"
            icon="el-icon-finished"
            plain
            :disabled="localLoading"
            :loading="localLoading"
            @click.native="save"
          >Сохранить
          </el-button>
        </el-card>
      </v-dialog>

    </v-toolbar>

    <!-- ТАБЛИЦА МОДЕЛЕЙ -->

    <v-container v-show="Models.length > 0" fluid>
      <v-data-table
        :headers="computedHeaders"
        :items="Models"
        calculate-widths
        :fixed-header="toggle"
        :height="toggle ? WindowHeight : null"
        no-data-text="Данные отсутствуют."
        :items-per-page="50"
        item-key="marketid"
        :mobile-breakpoint="750"
        sort-by="ID"
        sort-desc
        dense
        class="elevation-2"
        :footer-props="{
          itemsPerPageText: 'Строк на странице',
          itemsPerPageOptions: [25,100,250],
          showFirstLastPage: true
        }"
      >

        <!-- ФИЛЬТРЫ -->

        <template v-if="Models.length > 0 && ['md','lg', 'xl'].includes($vuetify.breakpoint.name)" #[`body.prepend`]>
          <tr style="height: 50px !important;">
            <td v-if="computedHeaders.find(header => header.value === 'ID')">
              <v-text-field v-model="filters.ID" clearable type="number" />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'TYPE')">
              <v-autocomplete
                v-model="filters.TYPE"
                multiple
                :items="TYPE"
                item-text="name"
                deletable-chips
                outlined
                dense
                hide-details
                clearable
              />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'VENDOR')">
              <v-autocomplete
                v-model="filters.VENDOR"
                multiple
                :items="VENDOR"
                item-text="name"
                deletable-chips
                outlined
                dense
                hide-details
                clearable
              />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'MODEL')">
              <v-text-field
                v-model="filters.MODEL"
                outlined
                hide-details
                dense
                clearable
                type="text"
              />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'EMAIL')">
              <v-text-field
                v-model="filters.EMAIL"
                outlined
                hide-details
                clearable
                dense
                type="text"
              />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'DATE')">
              <v-text-field
                v-model="filters.DATE"
                outlined
                hide-details
                clearable
                dense
                type="text"
              />
            </td>
            <td v-if="computedHeaders.find(header => header.value === 'EDIT')" />
          </tr>
        </template>

        <!-- ФОРМАТИРОВАННЫЕ ДАННЫЕ -->

        <template #[`item.ID`]="{ item }">
          <div class="text-left cursor_btn" @click="gotoMarket(item.ID)">
            <v-tooltip top>
              <template #activator="{ on }">
                <span v-on="on">{{ item.ID }}</span>
              </template>
              <span>Нажмите для перехода в Маркет</span>
            </v-tooltip>
          </div>
        </template>

        <template #[`item.EMAIL`]="{ item }">
          {{ item.EMAIL ? JiraUsers.find(user => user.email === item.EMAIL).display_name : '' }}
        </template>

        <template #[`item.DATE`]="{ item }">
          {{ new Date(item.DATE).getTime() | parseTime('{d}.{m}.{y}') }}
        </template>

        <template #[`item.EDIT`]="{ item }">
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
              <v-list-item v-if="$acl.check('Edit')" @click="editItem(item)">Редактировать</v-list-item>
              <v-list-item v-if="$acl.check('Edit')" @click="deleteItem(item)">Удалить</v-list-item>
            </v-list>
          </v-menu>
        </template>

      </v-data-table>
    </v-container>

  </v-container>
</template>

<script>
import Api from '@/services/Api'
import { AclRule } from 'vue-acl'
import GetConfig from '@/services/GetConfig'
import { mapGetters } from 'vuex'
import _ from 'lodash'

import { parseTime } from '@/utils'
import TableColumns from '@/components/DataTable/columns.vue'

export default {

  filters: {
    parseTime
  },

  components: {

    TableColumns

  },

  data() {
    return {
      filters: {
        ID: null,
        TYPE: [],
        VENDOR: [],
        MODEL: '',
        EMAIL: '',
        DATE: ''
      },

      multiSelects: {
        TYPE: [],
        VENDOR: []
      },

      menu: false,
      show: false,
      toggle: true,
      infoText: '',
      localLoading: false,
      loading: false,
      dialog: false,
      WindowHeight: null,

      headers: [
        { text: 'id',
          value: 'ID',
          selected: localStorage.modelsColumn ? localStorage.modelsColumn['ID'] : false,
          visible: this.$acl.check('Admin'),
          divider: true,
          filter: value => {
            if (!this.filters.ID) return true
            return value === +this.filters.ID
          }
        },
        { text: 'Тип',
          value: 'TYPE',
          divider: true,
          visible: true,
          selected: localStorage.modelsColumn ? localStorage.modelsColumn['TYPE'] : false,
          filter: value => {
            if (this.filters.TYPE.length === 0) return true
            if (!value) return false
            return value.includes(this.filters.TYPE.find(item => item === value))
          }
        },
        { text: 'Бренд',
          value: 'VENDOR',
          divider: true,
          visible: true,
          selected: localStorage.modelsColumn ? localStorage.modelsColumn['VENDOR'] : false,
          filter: value => {
            if (this.filters.VENDOR.length === 0) return true
            if (!value) return false
            return value.includes(this.filters.VENDOR.find(item => item === value))
          }
        },
        { text: 'Название',
          value: 'MODEL',
          divider: true,
          visible: true,
          selected: localStorage.modelsColumn ? localStorage.modelsColumn['MODEL'] : false,
          filter: value => {
            if (!this.filters.MODEL) return true
            if (!value) return false
            return value.toLowerCase().includes(this.filters.MODEL.toLowerCase())
          }
        },
        { text: 'Автор',
          value: 'EMAIL',
          divider: true,
          visible: true,
          selected: localStorage.modelsColumn ? localStorage.modelsColumn['EMAIL'] : false,
          filter: value => {
            if (!this.filters.EMAIL) return true
            if (!value) return false
            return value.toLowerCase().includes(this.filters.EMAIL.toLowerCase())
          }
        },
        { text: 'Дата',
          value: 'DATE',
          divider: true,
          visible: true,
          selected: localStorage.modelsColumn ? localStorage.modelsColumn['DATE'] : false,
          filter: value => {
            if (!this.filters.DATE) return true
            if (!value) return false
            return value.toLowerCase().includes(this.filters.DATE.toLowerCase())
          }
        },
        { text: 'Ред.',
          value: 'EDIT',
          visible: true,
          selected: localStorage.modelsColumn ? localStorage.modelsColumn['EDIT'] : false,
          sortable: false,
          align: 'center',
          divider: true
        }
      ],

      pagination: { sortBy: 'ID', descending: true },
      editedItem: {
      },

      editedIndex: -1,
      newItem: {
        ModelsCategory: {},
        Brands: {},
        ModelsProfile: {},
        ModelsEngineers: [],
        ModelsType: {},
        Name: ''
      },

      ReqRules: [
        v => !!v || 'Обязательный параметр!'
      ]
    }
  },

  computed: {
    ...mapGetters({
      Models: 'models',
      Brands: 'brands',
      ModelsCategory: 'models_category',
      ModelsProfile: 'models_profile',
      ModelsEngineers: 'models_engineers',
      ModelsType: 'models_type',
      JiraUsers: 'jira_users'
    }),

    computedHeaders() {
      return this.headers.filter(header => header.selected)
    },
    loadings() {
      return this.$store.getters.loadings
    },
    Edit() {
      return new AclRule('admin').or('nom').or('leadEngineer').generate()
    },
    TYPE() {
      return _.uniq(this.ModelsType)
    },
    VENDOR() {
      return _.uniq(this.Brands)
    }
  },

  beforeMount() {
    this.WindowHeight = window.innerHeight - 240
  },

  mounted() {
    const obj = {}
    for (const key in this.filters) {
      this.$watch(['filters', key].join('.'), (newVal) => {
        if (newVal === null) newVal = ''
        obj[key] = newVal
        localStorage.setItem('filtersModels', JSON.stringify(obj))
      })
    }

    if (localStorage.filtersModels) {
      var ls = JSON.parse(localStorage.filtersModels)
      if (ls) {
        Object.keys(this.filters).forEach(key => {
          Object.entries(ls).forEach((item) => {
            if (JSON.parse(localStorage.getItem('filtersModels'))[item[0]] && JSON.parse(localStorage.getItem('filtersModels'))[item[0]] !== 'null' && item[0] === key) {
              this.filters[item[0]] = JSON.parse(localStorage.getItem('filtersModels'))[item[0]]
            }
          })
        })
      }
    }

    window.addEventListener('resize', this.getWindowHeight)
  },

  async created() {
    this.loading = true

    if (this.Models.length === 0) await this.$store.dispatch('fetchModels')
    if (this.Brands.length === 0) await this.$store.dispatch('fetchBrands')
    if (this.ModelsCategory.length === 0) await this.$store.dispatch('fetchModelsCategory')
    if (this.ModelsProfile.length === 0) await this.$store.dispatch('fetchModelsProfile')
    if (this.ModelsEngineers.length === 0) await this.$store.dispatch('fetchModelsEngineers')
    if (this.ModelsType.length === 0) await this.$store.dispatch('fetchModelsType')
    await this.init()

    this.loading = false

    /* чтение конфига */
    GetConfig.getColumn('modelsColumn')
      .then((data) => {
        if (data) {
          this.headers.forEach(header => {
            if (header.visible === false) return
            for (var key in data) {
              if (key === header.value) {
                header.selected = data[key]
              }
            }
          })
          console.log('Данные о сохранеённых колонках успешно загружены: ', data)
        }
      })
      .catch(error => {
        this.show = true
        this.infoText = error.message
      })
  },

  methods: {
    getWindowHeight(event) {
      this.WindowHeight = event.target.innerHeight - 240
    },

    getName(id) {
      var obj = {}
      obj = this.$store.getters.zip.find(x => x.ID === id)
      for (var key in obj) {
        if (key === 'NAME') {
          return obj[key] + ' {' + obj.ID + '}'
        }
      }
    },
    getClientName(id) {
      var obj = {}
      obj = this.$store.getters.clients.find(x => x.ID === id)
      for (var key in obj) {
        if (key === 'NAME') {
          return obj[key]
        }
      }
    },
    gotoMarket(id) {
      this.$router.replace('/zip_prices/#' + id)
    },
    init() {
      if (window.location.hash) {
        const id = window.location.hash.replace(/[^0-9]/gim, '')
        this.search = id
      }
    },
    showAllColumn() {
      this.headers.forEach(header => {
        header.selected = true
      })
    },
    saveColumnFB() {
      const modelsColumn = {}
      const id = 'modelsColumn'
      this.headers.forEach(header => {
        header.selected === null || header.selected === undefined ? modelsColumn[header.value] = false : modelsColumn[header.value] = header.selected
      })
      this.menu = false
      this.$store.dispatch('createLocalStorage', [modelsColumn, id])
    },
    /*  ----------------------------------------------- Добавление, редактирование, удаление модели  ------------------------------------------- */
    editItem(item) {
      this.editedIndex = this.Models.indexOf(item)
      this.newItem.ModelsType = this.ModelsType.find(obj => obj.name === item.TYPE)
      this.newItem.ModelsCategory = this.ModelsCategory.find(obj => obj.id === item.CATEGORY)
      this.newItem.ModelsProfile = this.ModelsProfile.find(obj => obj.id === item.PROFILE)
      this.newItem.Brands = this.Brands.find(obj => obj.name === item.VENDOR)
      this.newItem.Name = item.MODEL
      this.newItem.ID = item.ID

      Api()
        .post('models/get_data', [item.ID])
        .then(response => {
          this.dialog = true
          this.newItem.ModelsEngineers = response.data.engineers
          if (!this.newItem.ModelsCategory) {
            this.newItem.ModelsCategory = this.ModelsCategory.find(obj => obj.id === response.data.category[0].CAT_EQ)
          }
          if (!this.newItem.ModelsProfile) {
            this.newItem.ModelsProfile = this.ModelsProfile.find(obj => obj.id === response.data.profile[0].BASIC)
          }
        })
    },
    deleteItem(item) {
      const index = this.Models.indexOf(item)
      const userId = this.$store.getters.currentUser.email
      if (confirm('Вы уверены, что хотите удалить эту Модель?')) {
        this.$store.commit('clearError')
        this.show = true
        this.infoText = 'Внимание! Идёт удаление...'
        Api()
          .post('models/del', [item.ID, userId])
          .then(response => {
            this.show = false
            this.Models.splice(index, 1)
            this.$store.commit('setData', response.data)
          })
          .catch(error => {
            this.$store.commit('setLoading', false)
            this.$store.commit('setError', error.message)
          })
      } else {
        this.$store.commit('setLoading', false)
        this.$store.commit('setInfo', 'Удаление отменено')
      }
    },
    save() {
      if (this.$refs.name.validate() && this.$refs.type.validate() && this.$refs.brands.validate() && this.$refs.category.validate() &&
					this.$refs.profile.validate() && this.$refs.engineer.validate()) {
        this.newItem.email = this.$store.getters.currentUser.email
        const newModel = {}
        newModel.VENDOR = this.newItem.Brands.name
        newModel.TYPE = this.newItem.ModelsType.name
        newModel.MODEL = this.newItem.Name
        newModel.EMAIL = this.newItem.email
        newModel.DATE = parseTime(new Date().getTime(), '{y}.{m}.{d} {h}:{m}')
        if (this.editedIndex === -1) {
          Api()
            .post('models/add', this.newItem)
            .then(response => {
              newModel.ID = response.data.lastId
              this.Models.push(newModel)
              this.$store.dispatch('setData', response.data.success)
            })
            .catch(err => {
              console.log(err)
            })
        } else {
          Api()
            .post('models/edit', this.newItem)
            .then(response => {
              Object.assign(this.Models[this.editedIndex], newModel)
              this.$store.dispatch('setData', response.data)
            })
            .catch(err => {
              console.log(err)
            })
        }
        this.dialog = false
      } else {
        this.$store.dispatch('setError', 'Не заполнены обязательные поля!')
      }
    },
    close() {
      this.newItem = {}
      this.dialog = false
    }
    /*  -------------------------------------------------------------------------------------------------------------------------------------- */
  }
}
</script>
<style scoped>
.cursor_btn {
	cursor: pointer;
	touch-action: none;
}
.resizeCheckbox {
    max-width: 120px !important;
	margin-top: 20px !important;
}
.el-dropdown {
  margin-right: 10px !important;
}
</style>

