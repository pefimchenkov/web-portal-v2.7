<template>
  <v-container
    v-loading="!tableData.length"
    :fill-height="!tableData.length"
    fluid
  >
    <el-dialog
      v-if="dialogCRM"
      :visible.sync="dialogCRM"
      :close-on-click-modal="false"
      destroy-on-close
      width="900px"
      top="5vh"
    >
      <CRM
        :id="crmItemId"
        :marker="crmMarker"
        @updateCrmStatus="updateCrmStatus"
      />
    </el-dialog>

    <Dialog
      v-if="dialog"
      :show="dialog"
      :items="dialogItems"
      :options="dialogOptions"
      :action="action"
      :data="editedItem"
      @add="addClient"
      @update="updateClient"
      @closeDialog="close"
    />

    <v-toolbar
      :fixed="checkBox"
      class="text-lg-right elevation-2 mb-1"
      :style="`background: ${variables.panelBg}`"
      dense
    >
      <v-toolbar-title>Список клиентов</v-toolbar-title>
      <v-divider class="mx-3" inset vertical />

      <v-checkbox
        v-model="toggle"
        :label="toggle ? 'Открепить' : 'Закрепить'"
        class="resizeCheckbox"
      />

      <v-spacer />

      <el-button
        type="primary"
        class="mr-5"
        @click="addItem"
      >
        Добавить
      </el-button>

      <!-- Меню действий-->

      <el-dropdown trigger="click" :hide-on-click="false">
        <el-button icon="el-icon-s-operation">
          Действия
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>
            <TableColumns
              :headers="tableHeaders"
              name="clientsColumn"
            />
          </el-dropdown-item>
          <el-dropdown-item>
            <!-- ЭКСПОРТ -->
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

    <!-- Таблица данных -->

    <v-container v-show="tableData.length > 0" fluid>
      <v-data-table
        :ref="reference"
        :key="key"
        :headers="selectedHeaders"
        :items="tableData"
        calculate-widths
        item-key="ID"
        :fixed-header="toggle"
        :height="toggle ? WindowHeight : null"
        :mobile-breakpoint="550"
        sort-by="NAME"
        locale="ru"
        dense
        class="elevation-2"
        :footer-props="{
          itemsPerPageAllText: 'Все',
          itemsPerPageOptions: [30, 150, 300, -1],
          showFirstLastPage: true,
          itemsPerPageText: 'Строк на странице',
        }"
      >
        <template #[`body.prepend`]>
          <!-- Строка ИТОГО -->

          <TotalRow
            v-if="$refs[`${reference}`]"
            :data="$refs[`${reference}`].$children[0].filteredItems"
            :headers="selectedHeaders"
            :columns="['PLAN', 'MARJA_PLAN', 'FACT', 'MARJA_FACT']"
            :locale-options="{ style: 'currency', currency: 'RUB' }"
          />

          <!-- Фильтры таблицы -->

          <Filters
            v-if="selectedHeaders.length"
            :headers="selectedHeaders"
            :filters="filters"
            :data="tableData"
            :reference="reference"
            clear
            :options="{
              input: ['NAME', 'LEGPERS', 'LEGPERS_ATLAS', 'Jira'],
              checkbox: ['FACT', 'PLAN', 'MARJA_PLAN'],
              select: ['HEAD_MANAGER', 'MANAGER', 'OM_SALE', 'OM_SALE_ZIP', 'OM_SERV', 'OM_IT', 'CRM', 'PROJECT'],
            }"
            :transform="[
              { status: 'CRM' },
              { username: 'HEAD_MANAGER' },
              { username: 'MANAGER' },
              { username: 'OM_SALE' },
              { username: 'OM_SALE_ZIP' },
              { username: 'OM_SERV' },
              { username: 'OM_IT' },
            ]"
            @updateFilters="updateFilters"
            @resetFilters="filters = {}"
          />
        </template>

        <template #[`item.CRM`]="{ item }">
          <v-icon :color="setColorCRM(item.CRM)" small>mdi-alert-decagram</v-icon>
        </template>
        <template #[`item.EDO`]="{ item }">
          <v-icon v-if="item.EDO" small>mdi-check-bold</v-icon>
        </template>

        <template #[`item.LEGPERS`]="{ item }">
          <v-tooltip right>
            <template #activator="{ on }">
              <span class="d-inline-block text-truncate" style="max-width: 200px;" v-on="on">{{ item.LEGPERS }}</span>
            </template>
            <span class="ma-2 d-inline-block" style="max-width: 200px;">{{ item.LEGPERS }}</span>
          </v-tooltip>
        </template>

        <template
          v-for="currency in ['PLAN', 'MARJA_PLAN', 'FACT', 'MARJA_FACT']"
          #[`item.${currency}`]="{ item }"
        >
          {{ item[currency] && item[currency].toLocaleString('ru', { style: 'currency', currency: 'RUB' }) }}
        </template>

        <template
          v-for="username in ['HEAD_MANAGER', 'MANAGER', 'OM_SALE', 'OM_SALE_ZIP', 'OM_SERV', 'OM_IT']"
          #[`item.${username}`]="{ item }"
        >
          {{ item[username] | getUserName }}
        </template>

        <template #[`item.PERCENT`]="{ item }">
          {{ item.FACT ? item.PERCENT + '%' : null }}
        </template>

        <template #[`item.marker`]="{ item }">
          <template v-for="(data, index) in markerName(item.marker)">
            <v-chip v-if="data" :key="index" label class="mr-2 my-1">{{ data }}</v-chip>
          </template>
        </template>

        <template #[`item.Jira`]="{ item }">
          <div v-if="item.Jira">
            <a :href="$options._settings.jira_url + item.Jira" target="_blank">{{ item.Jira }}<br></a>
          </div>
        </template>

        <!-- Меню действий -->

        <template #[`item.actions`]="{ item }">
          <v-menu
            bottom
            left
          >
            <template #activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item v-if="$acl.check('Financier') || $acl.check('ServiceManager')" @click="editItem(item)">Редактировать</v-list-item>
              <v-list-item v-if="$acl.check('Financier')" @click="openCRM(item.ID, item.Jira)">CRM</v-list-item>
              <v-list-item v-if="$acl.check('Financier')" @click="deleteClient(item)">Удалить</v-list-item>
              <v-list-item v-if="$acl.check('Financier') || $acl.check('ServiceManager') || $acl.check('Engineer')" :to="'/clients/' + item.ID">Подробнее</v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </v-container>

  </v-container>

</template>

<script>
import { addOne, updateOne, deleteOne } from '@/api/clients'
import { templateHeaders, reference, projects, exportFileName, dialogItems, dialogOptions } from './data.js'
import { calcTotals, setColorCRM, createPayloadForDb, hideDialogItems, showDialogItems, filterDataForUpdate } from './utils.js'
import { getUserName } from '@/filters/jira-users.js'
import { createHeaders, headersToObject } from '@/components/DataTable/utils.js'
import hash from 'object-hash'
import variables from '@/styles/variables.scss'
import settings from '@/settings'

export default {

  _settings: settings,

  components: {

    CRM: () => import('./components/crm'),
    TableColumns: () => import('@/components/DataTable/columns.vue'),
    TotalRow: () => import('@/components/DataTable/total.vue'),
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
      atlasContractors: [],

      toggle: true,
      dialog: false,
      dialogCRM: false,
      crmItemId: null,
      crmMarker: null,
      checkBox: false,
      WindowHeight: null,
      action: 'add',
      key: hash(templateHeaders),

      /* From ext data */
      templateHeaders,
      reference,
      headersToObject,
      exportFileName,
      dialogItems,
      dialogOptions,

      /* From utils (bs logic) */
      setColorCRM,
      createPayloadForDb
    }
  },
  computed: {
    variables() { return variables },
    selectedHeaders() { return this.tableHeaders.filter(header => header.selected) },
    userRole() { return this.$store.getters["auth/currentUser"]?.roles },
    calcTableData() { return this.$refs[`${reference}`].$children[0].filteredItems },
  },

  watch: {
    dialog(val) { (val || this.close()) },
  },

  async created() {
    this.tableHeaders = await createHeaders(this.templateHeaders)
  },

  beforeMount() {
    this.WindowHeight = window.innerHeight - 240
  },

  mounted() {
    this.getAtlasContractors()
    this.getClients()
    window.addEventListener('resize', this.getWindowHeight)
  },


  methods: {

    /* ------------ API методы ------------- */
    getClients() {
      this.$store.dispatch('clients/getClients')
        .then(res => {
          this.tableData = [...res]
          this.tableData.forEach(client => {
            calcTotals(client)
            let row = this.atlasContractors?.find(contr => contr.id === client.LEGPERS_ATLAS)
            client.LEGPERS_ATLAS = row?.contractor
          })
        })
    },

    async getAtlasContractors() {
      this.atlasContractors = !this.$store.state.atlas_1c.getAtlasContractors.length
      ? await this.$store.dispatch('atlas_1c/getAtlasContractors')
      : this.$store.state.atlas_1c.getAtlasContractors
    },

    async addClient(form) {
      const payload = await createPayloadForDb(form, projects)
      addOne(payload)
        .then(res => {
          const new_row = { ID: res.insertId, LEGPERS: payload.dataForLegpers.name, ...payload.dataForClients }
          this.tableData.push(new_row)
          this.key = hash(new_row)
          this.$notify({ type: 'success', message: 'Информация успешно добавлена.' })
          this.close()
        })
        .catch(err => {
          console.log(err)
          this.$notify({ type: 'error', message: err })
        })
    },

    async updateClient(form) {
      const payload = await createPayloadForDb(form, projects)
      updateOne(payload.dataForClients)
        .then(() => {
          const current = this.tableData.find(i => i.ID === form.ID)
          const index = this.tableData.indexOf(current)
          this.tableData[index] = { ...current, ...form }
          this.key = hash(form)
          this.$notify({ type: 'success', message: 'Информация успешно обновлена.' })
        })
        .catch(err => {
          console.log(err)
          this.$notify({ type: 'error', message: err })
        })
    },

    deleteClient(item) {
      const index = this.tableData.indexOf(item)
      this.$confirm('Удаляем?', item.NAME)
        .then(() => {
          deleteOne({ ID: item.ID })
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
    /* -------------------------------------------- */

    updateFilters(val) {
      this.filters = val
    },

    markerName(item) {
      return item
        ? item.split(' ')
        : item
    },

    closeCrmDialog() {
      this.$emit('closeCrmDialog')
      this.$store.dispatch('jira/clearCrmData', { root: true })
    },

    getWindowHeight(event) {
      this.WindowHeight = event.target.innerHeight - 240
    },

    addItem() {
      this.dialog = true
      this.action = 'add'
      showDialogItems(this.dialogItems)
    },

    editItem(item) {
      this.action = 'update'
      this.dialog = true
      this.editedItem = filterDataForUpdate(item)
      hideDialogItems(this.dialogItems)
    },

    openCRM(id, jira) {
      this.dialogCRM = true
      this.crmItemId = id
      this.crmMarker = jira
    },

    close() {
      this.dialog = false
      this.editedItem = {}
    },

    updateCrmStatus(data) {
      const { status } = data
      this.tableData.find(client => client.ID === this.crmItemId).CRM = status
    },

  }
}
</script>
<style scoped>
.resizeCheckbox {
  max-width: 120px !important;
  margin-top: 20px !important;
}
.el-dropdown {
  margin-right: 10px !important;
}
</style>

