<template>

  <v-card v-loading="loading">
    <v-data-table
      :headers="headers"
      :items="TechProps"
      calculate-widths
      item-key="mainID"
      :mobile-breakpoint="750"
      sort-by="TH1"

      :footer-props="{
        itemsPerPageText: 'Строк на странице',
        itemsPerPageAllText: 'Все',
        itemsPerPageOptions: [50,150,500,-1],
        showFirstLastPage: true
      }"
    >
      <template #[`body.prepend`]="{ items }">
        <v-dialog v-model="dialogTechPropValue" max-width="550px" persistent :disabled="$acl.not.check('Edit')">
          <v-card>
            <v-card-title>Выбор значения для <span class="orange--text ml-2">"{{ TechPropName(items) }}"</span></v-card-title>

            <v-autocomplete
              v-model="TechPropValue"
              class="ml-3 pa-2"
              :items="TechPropValuesList"
              item-text="name"
              autocomplete
              return-object
              clearable
              hide-details
              no-data-text="Нет данных"
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
                :disabled="loading"
                :loading="loading"
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
          <v-icon v-if="$acl.check('Edit')" small class="mr-2" @click="editTechPropValue(item)">edit</v-icon>
        </td>
      </template>
    </v-data-table>
  </v-card>

</template>

<script>

import { AclRule } from 'vue-acl'

export default {
  props: {
    marketItem: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      loading: false,
      TechPropValue: [],
      TechPropValuesList: [],
      TechPropItemID: null,
      dialogTechPropValue: false,

      headers: [
        { text: 'id', align: 'center', value: 'mainID', divider: true },
        { text: 'Название', align: 'center', value: 'TH1', divider: true },
        { text: 'Значение', align: 'center', value: 'TH2', divider: true },
        { text: 'Действие', align: 'center', value: 'action', divider: true }
      ]
    }
  },

  computed: {
    Edit() {
      return new AclRule('leadEngineer').or('admin').generate()
    },

    TechProps() {
      return this.$store.getters.TechProps
    },

    TechPropsFit() {
      return this.$store.getters.techPropertiesFit
    },
    CurrentUser() {
      return this.$store.getters.currentUser
    },
    JiraUsers() {
      return this.$store.getters.jira_users
    },
    CurrentUserName() {
      return this.JiraUsers.find(user => user.email === this.CurrentUser.email).display_name
    }
  },

  watch: {
  },

  async created() {
    this.loading = true
    const { marketid, marketTypeID, elementTYPE } = this.marketItem
    await this.$store.dispatch('fetchTechProps', { id: marketid, typeID: marketTypeID, element: elementTYPE })
    setTimeout(() => {
      this.loading = false
    }, 1000)
  },

  methods: {
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

    saveTechPropValue(item) {
      if (!this.TechPropValue) {
        this.$store.commit('setInfo', 'Не выбрано ни одного значения!')
      } else {
        this.loading = true
        this.$store.dispatch('addTechPropValue', { CurrentUserName: this.CurrentUserName, TechPropValue: this.TechPropValue, marketID: this.marketItem.marketid, marketPN: this.marketItem.marketPN, item: item })
          .then(() => {
            setTimeout(() => {
              this.loading = false
            }, 1000)
            this.loading = false
            this.dialogTechPropValue = false
          })
      }
    },

    deleteTechPropFit(item) {
      if (confirm('Вы действительно хотите отвязать ТХ от Маркета?')) {
        // const id = this.TechPropsFit.find(fit => fit.th === item.elementID).id /* от 24.03.2021 - изменена логика, удалить позже!!
        this.show = true
        this.$store.dispatch('deleteTechPropFit', { CurrentUserName: this.CurrentUserName, marketID: this.marketItem.marketid, marketPN: this.marketItem.marketPN, id: item.id })
          .then(result => {
            if (result.data.success) {
              item.TH2 = null
              this.$store.commit('setData', result.data.text)
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

    TechPropName(items) {
      const name = items.find(item => item.mainID === this.TechPropItemID)
      if (!name) return false
      else return name.TH1
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
