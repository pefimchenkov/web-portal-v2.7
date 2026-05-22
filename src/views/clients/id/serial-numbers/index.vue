<template>
  <v-container v-loading="(loading && SerialNumbers.length === 0)" fluid>
    <v-row>
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

      <v-col cols="1" class="text-end">

        <Dialog
          v-if="$acl.check('Edit')"
          v-loading="loading"
          :edited-item="editedItem"
          :edited-index="editedIndex"
          :contracts="contractsForSN"
          :dialog="dialog"
          :title="formTitleSN"
          @triggerDialog="triggerDialog"
          @save="save"
        />

      </v-col>
    </v-row>

    <v-data-table
      :key="SerialNumbers.length"
      :headers="headers"
      :items="SerialNumbers"
      :mobile-breakpoint="750"
      item-key="ID"
      sort-by="ID"
      :search="search"
      sort-desc
      calculate-widths
      dense
      :footer-props="{
        itemsPerPageAllText: 'Все',
        itemsPerPageOptions: [25,50,250],
        showFirstLastPage: true,
        itemsPerPageText: 'Строк на странице',
      }"
      class="elevation-0 mb-2"
    >
      <template #[`item.ENDDATE`]="{item}">
        {{ item.ENDDATE !== 0 ? new Date(item.ENDDATE).toLocaleDateString('ru') : '' }}
      </template>
      <template #[`item.DATE`]="{item}">
        {{ item.DATE ? new Date(item.DATE).toLocaleDateString('ru') : null }}
      </template>
      <template #[`item.EMAIL`]="{item}">
        {{ item.EMAIL ? JiraUsers.find(user => user.email === item.EMAIL).display_name : '' }}
      </template>
      <template #[`item.actions`]="{item}">
        <v-icon small :disabled="$acl.not.check('Edit')" @click="edite(item)">edit</v-icon>
        <v-icon v-if="$acl.check('Edit')" v-loading="loading" element-loading-spinner="el-icon-loading" class="ml-3" small @click="remove(item)">delete</v-icon>
      </template>

      <template #no-data>
        <p class="my-5">Серийные номера отсутствуют</p>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>

import { AclRule } from 'vue-acl'
import { parseTime } from '@/utils'

import Dialog from './dialog'
import { add, remove, update } from '@/api/client/serial-numbers'

export default {

  components: {
    Dialog
  },

  props: {
    id: {
      type: String,
      required: true
    },
    parentSearch: {
      type: String,
      default: null
    }
  },

  data() {
    return {

      loading: false,
      search: null,
      dialog: false,

      editedItem: {},
      editedIndex: -1,

      headers: [
        { text: 'ID', value: 'ID' },
        { text: 'Модель', value: 'Model' },
        { text: 'SN', value: 'SN' },
        { text: 'Номер договора', value: 'Contract' },
        { text: 'Спецификация', value: 'SPEC' },
        { text: 'Срок действия', value: 'ENDDATE' },
        { text: 'Информация', value: 'TSDN' },
        { text: 'Магазин', value: 'Store' },
        { text: 'Город', value: 'City' },
        { text: 'Автор', value: 'EMAIL' },
        { text: 'Изменён', value: 'DATE' },
        { text: 'Действия', value: 'actions', sortable: false, align: 'center' }
      ]

    }
  },

  computed: {

    SerialNumbers() {
      return this.$store.getters['client/serial-numbers/sn_by_client']
    },

    contracts() {
      return this.$store.getters['client/contracts/contracts_by_client']
    },

    contractsForSN() {
      return this.contracts.filter(i => i.DOG_TYPE === 'Спецификация (контракт)')
    },

    JiraUsers() {
      return this.$store.state.jira_users.JIRA_USERS
    },

    formTitleSN() {
      return this.editedIndex === -1 ? 'Новая позиция' : 'Редактирование'
    },

    Edit() {
      return new AclRule('admin').or('nom').or('snEditor').or('serviceManager').generate()
    }

  },

  watch: {
    editedIndex(val) {
      if (val === -1) this.editedItem = {}
    },
    parentSearch: {
      immediate: true,
      handler(val) {
        this.search = val
      }
    }
  },

  async created() {
    this.loading = true
    if (!this.SerialNumbers.length) {
      await this.$store.dispatch('client/serial-numbers/getByClientId', { id: this.id })
    }
    this.loading = false
  },

  methods: {

    edite(item) {
      this.editedIndex = this.SerialNumbers.indexOf(item)
      this.editedItem = { ...item }
      delete (this.editedItem.SPEC)
      this.editedItem.ENDDATE = parseTime(this.editedItem.ENDDATE, '{y}-{m}-{d}')
      this.editedItem.Email = this.$store.getters["auth/currentUser"].email
      this.dialog = true
    },

    async save(item) {
      const res = (this.editedIndex === -1)
        ? await this.add(item)
        : await this.update(item)


      if (res) {
        await this.$store.dispatch('client/serial-numbers/getByClientId', { id: this.id })
        await this.$store.dispatch('client/serial-numbers/getAll')
        this.$message({ type: 'success', message: res.message })
        this.loading = false
        this.dialog = false

      }
    },

    async add(item) {
      this.loading = true
      item.EMAIL = this.$store.getters["auth/currentUser"].email
      item.Client = +this.id
      return await add(item)
    },

    async update(item) {
      this.loading = true
      return await update(item)
    },

    async remove(item) {
      const index = this.SerialNumbers.indexOf(item)
      const id = item.ID

      this.$confirm('Вы уверены, что хотите удалить запись с id ' + id + '?', 'ВНИМАНИЕ!',
        { confirmButtonText: 'Да',
          cancelButtonText: 'Нет',
          type: 'warning'
        }).then(() => {
        this.loading = true
        remove([id]).then(res => {
          this.$store.commit('client/serial-numbers/REMOVE', index)
          this.loading = false
          this.$message({
            type: 'success',
            message: res.message
          })
        })
      }).catch(() => {
        this.$notify({
          type: 'info',
          message: 'Удаление не выполнено..'
        })
        this.loading = false
      })
    },

    triggerDialog(val) {
      if (val) {
        this.dialog = true
      } else {
        this.editedIndex = -1
        this.dialog = false
      }
    }

  }

}
</script>

<style lang="scss" scoped>

</style>
