<template>
  <v-container v-loading="loading" fluid>

    <Confirm ref="confirm" />

    <el-dialog :visible.sync="dialog" :close-on-click-modal="false" top="30vh" :title="label">
      <el-card class="pa-3 mx-auto" shadow="naver">

        <v-select
          ref="prop"
          v-model="prop"
          :items="propsUnknown"
          label="* Свойство"
          validation
          :rules="reqRules"
          required
          outlined
        />
        <v-textarea
          v-model="comment"
          label="Комментарий:"
          auto-grow
          outlined
          rows="3"
          row-height="25"
        />

        <div class="text-center">

          <el-button
            type="danger"
            plain
            @click="close"
          >
            Отменить
          </el-button>
          <el-button
            type="success"
            plain
            :disabled="loading"
            :loading="loading"
            @click.native="save()"
          >
            Сохранить
          </el-button>
        </div>

      </el-card>
    </el-dialog>

    <v-container fluid class="white elevation-1 mt-5">
      <el-row type="flex" justify="center" align="middle">
        <el-col :span="22">
          <span class="font-weight-bold">ЗИП ID: </span><span class="grey white--text px-2 py-1 mr-3">{{ id }}</span>
          <span class="font-weight-bold">Название: </span><span class="grey white--text px-2 py-1 mr-3">{{ zipName }}</span>
          <span class="font-weight-bold">На складе у инженера: </span><span class="grey white--text px-2 py-1 mr-3">{{ eng | getUserName }}</span>
        </el-col>
        <el-col :span="2">
          <el-button type="warning" icon="el-icon-arrow-left" @click.native="goBack">Назад</el-button>
        </el-col>
      </el-row>
    </v-container>

    <v-data-table
      :headers="headers"
      :items="EngineersStockDetails"
      calculate-widths
      item-key="ID"
      sort-by="ID"
      dense
      sort-desc
      no-data-text="Данные отсутствуют."
      class="elevation-1 ma-3"
      :footer-props="{
        itemsPerPageAllText: 'Все',
        itemsPerPageAllText: 'Строк на странице',
        itemsPerPageOptions: [50,250,500,-1],
        showFirstLastPage: true
      }"
    >
      <template #[`item.CREATED`]="{ item }">
        {{ new Date(item.CREATED).toLocaleDateString('ru') }}
      </template>
      <template #[`item.RESOLUTIONDATE`]="{ item }">
        {{ new Date(item.RESOLUTIONDATE).toLocaleDateString('ru') }}
      </template>
      <template #[`item.IssKey`]="{ item }">
        <a icon :href="settings.jira_url + item.IssKey" target="_blank">
          {{ item.IssKey }}
        </a>
      </template>
      <template #[`item.action`]="{ item }">
        <template v-if="item.email_address">

          <el-dropdown @command="handleCommand">
            <span>
              <i class="el-icon-more" />
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                v-if="(email === user || user === item.email_lead || $acl.check('Admin') || user === 'd.mirzoeva@tsd-group.ru')"
                :command="{command: 'edit', item}"
              >
                Отправить на рабочий стол
              </el-dropdown-item>
              <el-dropdown-item
                :command="{command: 'send', item}"
              >
                Отправить запрос на перемещение ЗИП
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>

        </template>
      </template>
      <template v-if="PersonalItems" #no-data>
        <v-row justify="center" align="center">
          <v-col cols="12" class="text-center">
            <div>Запчасти отстутствуют на складе</div>
          </v-col>
        </v-row>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import settings from '@/settings.js'
import Confirm from '@/components/shared/Confirm'
import { getUserName } from '@/filters/jira-users.js'

export default {

  filters: {

    getUserName

  },

  components: {

    Confirm

  },

  props: {

    id: {
      type: [Number, String],
      required: true
    },

    eng: {
      type: String,
      required: true
    },

    activeTab: {

      type: String,
      default: () => {
        const tab = localStorage.getItem('activeTabs')
        return JSON.parse(tab).engineersStock
      }
    }
  },

  data() {
    return {

      prop: '',
      comment: '',
      settings,
      dialog: false,
      loading: false,
      label: 'Перевод ЗИП в состояние: ',
      propsUnknown: ['Новый', 'Можно восстановить', 'Отсутствующий'],
      PersonalItems: [],
      reqRules: [
        v => !!v || 'Обязательный параметр!'
      ],

      editedItem: {},

      editedIndex: null,

      headers: [
        { text: 'ID',
          value: 'ID',
          selected: true,
          divider: true
        },
        { text: 'Номер ремонта',
          value: 'NomRem',
          selected: true,
          divider: true
        },
        { text: 'Номер задачи',
          value: 'IssKey',
          selected: true,
          width: 150,
          divider: true
        },
        { text: 'Тема',
          value: 'SUMMARY',
          selected: true,
          divider: true
        },
        { text: 'Статус',
          value: 'Status',
          selected: true,
          divider: true
        },
        { text: 'Дата создания',
          value: 'CREATED',
          selected: true,
          divider: true
        },
        { text: 'Результат диагностики',
          value: 'DiagResult',
          selected: true,
          divider: true
        },
        { text: 'Маркет ID',
          value: 'MarketId',
          selected: true,
          divider: true
        },
        { text: 'АРТ 1С',
          value: 'ART_1C',
          selected: true,
          divider: true
        },
        { text: 'Дата решения',
          value: 'RESOLUTIONDATE',
          selected: true,
          divider: true
        },
        { text: 'Ведущий',
          value: 'email_lead',
          selected: true,
          divider: true
        },
        { text: 'Действия',
          value: 'action',
          align: 'center',
          selected: true
        }
      ]
    }
  },
  computed: {

    ...mapGetters(['EngineersStock', 'EngineersStockArchive', 'EngineersStockDetails']),

    user() {
      return this.$store.getters.currentUser ? this.$store.getters.currentUser.email : null
    },
    displayName() {
      return this.$store.getters.currentUser ? this.$store.getters.currentUser.displayName : null
    },
    zipName() {
      return this.EngineersStockDetails.length > 0 ? this.EngineersStockDetails[0].ZipName : null
    },
    email() {
      return this.EngineersStockDetails.length > 0 ? this.EngineersStockDetails[0].Email : null
    }
  },
  mounted() {
    this.init()
  },
  methods: {

    async init() {
      this.loading = true
      window.scrollTo(0, 0)
      this.EngineersStock.length === 0
        ? await this.$store.dispatch('fetchEngineersStock')
        : null
      this.EngineersStockArchive.length === 0
        ? await this.$store.dispatch('fetchEngineersStockArchive')
        : null
      this.getPersonalItems()
      await this.$store.dispatch('fetchEngineersStockDetails', { ids: await this.PersonalItems.IDs, zipID: +this.id, userName: this.eng })
      this.loading = false
    },

    handleCommand(data) {
      if (data.command === 'edit') {
        this.open(data.item)
      }
      if (data.command === 'send') {
        this.send(data.item)
      }
    },

    getPersonalItems() {
      this.activeTab && this.activeTab === 'tab-archive'
        ? this.PersonalItems = this.EngineersStockArchive.find(item => (item.JIRA_ID === +this.id) && (item.Eng === this.eng || item.Eng === null))
        : this.PersonalItems = this.EngineersStock.find(item => (item.JIRA_ID === +this.id) && (item.Eng === this.eng || item.Eng === null))
    },

    open(item) {
      this.editedItem = Object.assign({}, item)
      this.editedIndex = this.EngineersStockDetails.indexOf(item)
      this.dialog = true
    },

    close() {
      this.dialog = false
      this.prop = null
      this.comment = ''
    },

    save() {
      if (this.prop) {
        const now = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        let type
        if (this.prop === 'Новый') type = 2
        if (this.prop === 'Можно восстановить') type = 1
        if (this.prop === 'Отсутствующий') type = 0
        this.$store.dispatch('setConditionStock', { jiraID: this.editedItem.ID, zipID: this.id, marketID: this.editedItem.MarketId, type: type, user: this.user, comment: this.comment, date: now })
          .then(() => {
            this.$store.commit('setData', 'Зип успешно перемещён.')
            this.dialog = false
          })
      } else {
        this.$store.commit('setError', 'Не все поля заполнены!')
      }
    },

    async send(item) {
      if (await this.$refs.confirm.open('Сделать запрос', 'Вы уверены?', { color: 'green' })) {
        await this.$store.dispatch('sendRequestForZip', { item: item, user: this.displayName ? this.displayName + ' (' + this.user + ')' : this.user, email: this.user })
          .then(() => {
            this.$store.commit('setData', 'Запрос успешно отправлен.')
          })
      } else {
        this.$store.commit('setInfo', 'Запрос отменён')
      }
    },

    goBack() {
      setTimeout(() => {
        this.$store.commit('LOAD_ENGINEERS_STOCK_DETAILS', [])
      }, 1000)

      this.$router.replace({ name: 'engineers_stock' })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
