<template>
  <div>
    <v-data-table
      :headers="headers_contr"
      :items="contracts"
      calculate-widths
      :search="search"
      :mobile-breakpoint="750"
      sort-desc
      dense
      :footer-props="{
        itemsPerPageOptions: [20,150,300],
        showFirstLastPage: true,
        itemsPerPageText: 'Строк на странице'
      }"
      class="elevation-0 mt-5"
    >

      <template #[`item.DOG_TYPE`]="{item}">
        <div
          :class="(item.DOG_TYPE !== 'Сервисный Договор' && item.DOG_TYPE !== 'Договор поставки') ? 'text-left grey--text pl-3 cursor_btn' : ''"
          @click="(item.DOG_TYPE !== 'Сервисный Договор' && item.DOG_TYPE !== 'Договор поставки') ? goToTab({ ...item, active: getItem(item).active }) : null"
        >
          <v-icon v-if="(item.DOG_TYPE !== 'Сервисный Договор' && item.DOG_TYPE !== 'Договор поставки')" style="margin-bottom: 5px">
            subdirectory_arrow_right
          </v-icon>
          <img
            class="pl-2"
            style="margin-bottom: -3px"
            :src="getItem(item).avatar"
          >
          {{ item.DOG_TYPE }}
        </div>
      </template>

      <template #no-data>
        <p class="my-5">Договоры отсутствуют</p>
      </template>

    </v-data-table>
  </div>
</template>

<script>

export default {
  props: {
    id: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      search: '',
      headers_contr: [
        { text: 'Тип', value: 'DOG_TYPE', sortable: false },
        { text: 'Ключ', value: 'ISSUEKEY', sortable: false },
        { text: '№ договора', value: 'NOM_DOG', sortable: false },
        { text: 'Статус', value: 'STATUS', sortable: false },
        { text: 'Описание', value: 'SUMMARY', sortable: false }
      ],
      list: [
        { name: 'Сервисный Договор', avatar: 'http://support.atlas-pro24.local/secure/viewavatar?size=xsmall&avatarId=14702&avatarType=issuetype' },
        { name: 'Договор поставки', avatar: 'http://support.atlas-pro24.local/secure/viewavatar?size=xsmall&avatarId=14702&avatarType=issuetype' },
        { name: 'Спецификация (разовый ремонт)', active: 'tab-specprices', avatar: 'http://support.atlas-pro24.local/secure/viewavatar?size=xsmall&avatarId=11506&avatarType=issuetype' },
        { name: 'Спецификация (контракт)', active: 'tab-sn', avatar: 'http://support.atlas-pro24.local/secure/viewavatar?size=xsmall&avatarId=11507&avatarType=issuetype' }
      ]
    }
  },

  computed: {

    contracts() {
      return this.$store.getters['client/contracts/contracts_by_client']
    }
  },

  async created() {
    if (!this.contracts.length) await this.$store.dispatch('client/contracts/getByClientId', { id: this.id })
  },

  methods: {
    IKEYPlusSumm: item => item.IKEY + ' — ' + item.SUMMARY,

    goToTab(data) {
      this.$emit('changeTab', data)
    },
    getItem(item) {
      const data = this.list.find(i => i.name === item.DOG_TYPE)
      return data || item
    }
  }
}
</script>

<style lang="scss" scoped>
  .cursor_btn {
    cursor: pointer;
  }
</style>
