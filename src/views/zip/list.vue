<template>
  <v-container
    v-loading="loading"
    :fill-height="loading"
    fluid
  >
    <!-- Основной диалог добавления / редактирования -->

    <Dialog
      v-if="dialog"
      :show="dialog"
      :items="dialogItems"
      :options="dialogOptions"
      :action="action"
      :data="editedItem"
      @add="addZip"
      @update="updateZip"
      @watchForm="watchForm"
      @closeDialog="close"
    />

    <v-dialog v-model="dialogImg" :max-width="imageWidth">
      <v-img v-if="selectedImage" width="100%" :src="selectedImage" @click.stop="closeImg()" />
    </v-dialog>

    <v-toolbar
      :fixed="checkBox"
      class="text-lg-right elevation-2 mb-1"
      :style="`background: ${variables.panelBg}; width: 100%`"
      dense
    >
      <v-toolbar-title>Список ЗИП</v-toolbar-title>
      <v-divider class="mx-3" inset vertical />

      <!-- Открепить / Закрепить -->

      <v-checkbox
        v-model="checkBox"
        hide-details
        :label="checkBox ? 'Открепить' : 'Закрепить'"
        class="pl-2"
      />
      <v-spacer />

      <el-button
        type="primary"
        class="mr-5"
        @click="openDialogForAdd"
      >
        Добавить
      </el-button>

      <!-- Меню действий -->

      <el-dropdown trigger="click" :hide-on-click="false">
        <el-button icon="el-icon-s-operation">
          Действия
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>
            <TableColumns
              :headers="tableHeaders"
              name="zipColumn"
            />
          </el-dropdown-item>
          <el-dropdown-item>
            <!-- Экспорт -->
            <download-excel
              v-if="$refs[`${reference}`]"
              :fields="headersToObject(selectedHeaders)"
              :data="$refs[`${reference}`].$children[0].filteredItems"
              :name="exportFileName"
            >
              Экспорт в Excel
            </download-excel>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

    </v-toolbar>
    <v-spacer />

    <!-- Таблица данных -->

    <v-data-table
      :ref="reference"
      :key="key"
      :headers="selectedHeaders"
      :items="tableData"
      :fixed-header="checkBox"
      :height="checkBox ? ScreenHeight : null"
      calculate-widths
      item-key="zipID"
      :mobile-breakpoint="750"
      sort-by="zipID"
      dense
      sort-desc
      multi-sort
      no-data-text="Нет данных..."
      no-results-text="Ничего не найдено..."
      :footer-props="{
        itemsPerPageText: 'Строк на странице',
        itemsPerPageOptions: [25,50,150],
        showFirstLastPage: true
      }"

      class="elevation-2"
    >
      <template #[`body.prepend`]>
        <!-- Фильтры таблицы -->

        <Filters
          v-if="selectedHeaders.length"
          :headers="selectedHeaders"
          :filters="filters"
          :data="tableData"
          :reference="reference"
          clear
          :options="{
            input: ['zipID', 'zipNAME', 'zipPN', 'zipART'],
            switch: ['zipPHOTO'],
            multiple: ['zipCLASS', 'zipTYPE', 'zipMODELS'],
            select: ['zipemail'],
            date: ['zipdate']
          }"
          :transform="[
            { username: 'zipemail' },
          ]"
          @updateFilters="updateFilters"
          @resetFilters="filters = {}"
        />
      </template>

      <template #[`item.zipPHOTO`]="{ item }">
        <img
          v-if="setImgSrc(ZipImg, item.zipID)"
          v-lazyload
          src="../../assets/img/placeholder.png"
          :data-src="setImgSrc(ZipImg, item.zipID)"
          data-err="../../assets/img/broken-image.jpg"
          class="cursor_btn photo"
          @click="zoom($event, setImgSrc(ZipImg, item.zipID))"
        >
      </template>
      <template #[`item.zipID`]="{ item }">
        <span class="cursor_btn" @click="gotoMarket($router, item.zipID)">{{ item.zipID }}</span>
      </template>
      <template #[`item.zipemail`]="{ item }">
        {{ item.zipemail | getUserName }}
      </template>
      <template #[`item.zipdate`]="{ item }">
        {{ new Date(item.zipdate).toLocaleDateString('ru') }}
      </template>

      <!--     Меню действий внутри таблицы   -->

      <template #[`item.actions`]="{ item }">
        <v-menu bottom left>
          <template #activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item v-if="$acl.check('accessEdit')" small class="mr-2" @click="editItem(item)">Редактировать</v-list-item>
            <v-list-item v-if="$acl.check('accessDelete')" small @click="deleteItem(item)">Удалить</v-list-item>
            <v-list-item v-if="$acl.check('accessEdit')" text fab small left :to="'/zip/' + item.zipID">Подробнее</v-list-item>
          </v-list>
        </v-menu>
      </template>
      <!-- .................... -->

    </v-data-table>
  </v-container>
</template>

<script>

import { addOne, updateOne, deleteOne } from '@/api/zip'
import { AclRule } from 'vue-acl'
import { mapState } from 'vuex'

import { getUserName } from '@/filters/jira-users'
import { createHeaders, headersToObject } from '@/components/DataTable/utils.js'
import { reference, exportFileName, templateHeaders, dialogItems, dialogOptions, marketFields } from './data.js'
import { setPhoto, setDateFormat, setImgSrc, modelPlusName, gotoMarket, idNameTypeArtPNModels, checkModels, hideDialogItems, showAllDialogItems, validateData } from './utils.js'
import variables from '@/styles/variables.scss'
import { parseTime } from '@/utils'
import hash from 'object-hash'

export default {

  components: {
    TableColumns: () => import('@/components/DataTable/columns.vue'),
    Filters: () => import('@/components/DataTable/filters.vue'),
    Dialog: () => import('@/components/Dialog')
  },

  filters: { getUserName },

  data() {
    return {
      /* Local data */
      tableData: [],
      tableHeaders: [],
      filters: {},
      json_fields: {},
      editedItem: {},
      prevItem: {},

      /* Ext. data / utils */
      templateHeaders,
      headersToObject,
      reference,
      exportFileName,
      dialogItems,
      dialogOptions,
      setImgSrc,
      modelPlusName,
      gotoMarket,
      idNameTypeArtPNModels,

      action: 'add',
      key: hash(templateHeaders),
      show: false,
      localloading: false,
      loading: false,
      checkBox: true,
      Filters: [],
      Parts: [],
      selectedImage: null,
      imageWidth: '',
      search: '',
      dialog: false,
      dialogImg: false,
      ScreenHeight: null,

      modelRules: [
        v => !!v || 'Обязательный параметр!',
        v => checkModels(this.Models, v) || 'В выбранных моделях есть недопустимые значения или поле пустое!'
      ],
    }
  },

  computed: {
    variables() { return variables },
    selectedHeaders() { return this.tableHeaders.filter(header => header.selected) },
    user() { return this.$store.getters.currentUser },
    accessEdit() { return new AclRule('leadEngineer').or('nom').or('admin').generate() },
    accessDelete() { return new AclRule('nom').or('admin').generate() },

    ...mapState({
      ProductsType: state => state.products_type.ProductsType,
      ProductsClass: state => state.products_class.ProductsClass,
      Conditions: state => state.conditions.Conditions,
      Models: state => state.models.models,
      Suppliers: state => state.suppliers.Suppliers,
      Market: state => state.market_new.Market.filter(item => item.elementTYPE === 1),
      ZipImg: state => state.zipImg.zipImg,
    })
  },

  watch: {
    dialog(val) {
      val || this.close()
    },
    dialogImg(val) {
      val || this.closeImg()
    },
  },

  async created() {
    this.tableHeaders = await createHeaders(this.templateHeaders)
  },

  beforeMount() {
    this.ScreenHeight = window.innerHeight - 210
  },

  async mounted() {
    this.loading = true
    if (!this.ProductsClass.length) await this.$store.dispatch('fetchProductsClass')
    if (!this.ProductsType.length) await this.$store.dispatch('fetchProductsType')
    if (!this.Models.length) await this.$store.dispatch('models/models')
    if (!this.Market.length) await this.$store.dispatch('market_new/get')
    if (!this.Conditions.length) await this.$store.dispatch('fetchConditions')
    if (!this.Suppliers.length) await this.$store.dispatch('fetchSuppliers')
    if (!this.ZipImg.length) await this.$store.dispatch('fetchZipImg')
    this.getZip(this.tableData)
    this.init();

  },

  methods: {
    init() {
      window.addEventListener('resize', this.setScreenHeight)
      if (window.location.hash) {
        const id = window.location.hash.replace(/[^0-9]/gim, '')
        this.filters.zipID = id
      }
    },

    async getZip(data) {
      if (!this.loading) this.loading = true
      if (!data || !data.length) this.tableData = await this.$store.dispatch('fetchZip')
      setPhoto(this.ZipImg, this.tableData)
      setDateFormat(this.tableData)
      this.dialogItems.forEach(obj => {
        if (Object.prototype.hasOwnProperty.call(obj, 'options')) {
          if (obj.value === 'zipTYPE') obj.options = [...this.ProductsType]
          if (obj.value === 'zipCLASS') obj.options = [...this.ProductsClass]
          if (obj.value === 'zipMODELS') obj.options = [...this.Models]
          if (obj.value === 'zipSUPPLIERS') obj.options = [...this.Suppliers]
          if (obj.value === 'zipCONDITIONS') obj.options = [...this.Conditions]
          if (obj.value === 'Parts') {
            obj.options = [...this.Market.map(obj => {
              return { ...obj, name: idNameTypeArtPNModels(obj) }
            })]
          }
        }
      })
      this.loading = false
    },

    openDialogForAdd() {
      showAllDialogItems(this.dialogItems)
      this.dialog = true
      this.action = 'add'
    },

    editItem(item) {
      const marketFieldsPlusParts = [ ...marketFields, 'Parts' ] // скрываем поле `Состав` от редактирования
      hideDialogItems(this.dialogItems, marketFieldsPlusParts) // скрываем блок `Маркет` от редактирования
      this.dialog = true
      this.action = 'update'
      const selectedModels = item.zipMODELS.split(', ').map(row => this.Models.find(item => item.MODEL === row))
      const selectedTypes = this.ProductsType.find(obj => obj.name === item.zipTYPE)
      const selectedClass = this.ProductsClass.find(obj => obj.name === item.zipCLASS)

      this.prevItem = {
        ...item,
        displayName: getUserName(item.zipemail),
      }
      this.editedItem = {
        ...item,
        zipMODELS: selectedModels,
        zipTYPE: selectedTypes,
        zipCLASS: selectedClass,
        email: this.user.email,
        displayName: getUserName(this.user.email),
        date: parseTime(new Date(), '{yy}-{m}-{d} {h}:{i}')
      }
    },

    async addZip(form) {
      const isValid = validateData(form)
      if (!isValid) {
        this.$message({ type: 'error', message: 'Заполните блок «Маркет» полностью, либо оставьте его пустым.' })
        return
      }
      const data = {
        ...form,
        email: this.user.email,
        displayName: getUserName(this.user.email),
        date: parseTime(new Date(), '{yy}-{m}-{d} {h}:{i}')
      }
      addOne(data)
        .then(res => {
          this.close()
          this.getZip()
          if (res.affectedRows) this.$notify({ type: 'success', message: 'Данные успешно добавлены.' })
        })
    },

    async updateZip(form) {
      updateOne({ newData: form, prevData: this.prevItem })
        .then(res => {
          this.close()
          this.getZip()
          if (res.affectedRows) this.$notify({ type: 'success', message: 'Данные успешно добавлены.' })
        })
    },

    deleteItem(item) {
      const index = this.tableData.indexOf(item)
      this.$confirm('Удаляем?', item.zipNAME)
        .then(() => {
          deleteOne({
            DISPLAY_NAME: getUserName(this.user.email),
            JIRA_ID: item.zipID
          })
            .then(() => {
              this.tableData.splice(index, 1)
              this.$message({ type: 'success', message: 'Успешно удалено.' })
            })
            .catch(err => this.$message({ type: 'error', message: err }))
        })
        .catch(() => {
          this.$notify({ type: 'error', message: 'Отменено пользователем' })
        })
    },

    updateFilters(val) {
      this.filters = val
    },

    watchForm(val) {
      if (typeof val === 'object' && val?.zipID) return
      Object.entries(val).forEach(item => {
        // добавляем поля `Время на установку` и `Модели` в блок Маркета для сокрытия при выборе класса `Услуга`
        if (item[0] === 'zipCLASS' && item[1]?.id === 7) {
          // marketFields.push('zipTIME', 'zipMODELS')
          // hideDialogItems(this.dialogItems, ['zipTIME', 'zipMODELS']) // если добавить marketFields - сокроем блок Маркета для услуги 
        }
        if (item[0] === 'zipCLASS' && item[1]?.id !== 7) {
          showAllDialogItems(this.dialogItems)
        }
      })
    },

    setScreenHeight(event) {
      this.ScreenHeight = event.target.innerHeight - 210
    },

    zoom(e, url) {
      e.preventDefault()
      this.openImg()
      this.selectedImage = url
      this.ZipImg.forEach(photo => {
        if (photo.url === url) {
          this.imageWidth = parseInt(photo.width)
        }
      })
    },

    openImg() {
      this.dialogImg = true
      this.localLoading = true
    },
    closeImg() {
      this.dialogImg = false
      this.localLoading = false
      this.selectedImage = null
    },

    close() {
      this.dialog = false
      this.editedItem = Object.assign({})
      this.editedIndex = -1
    },

  }
}
</script>

<style scoped>
.models {
	word-break: break-all
}
.cursor_btn {
	cursor: pointer;
	touch-action: none;
}
.photo {
	max-width: 100px !important;
  padding-top: 5px;
}
.el-dropdown {
  margin-right: 10px !important;
}
</style>
