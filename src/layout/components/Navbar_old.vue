<template>
  <v-app-bar fixed dark color="primary" app>

    <v-app-bar-nav-icon class="hidden-md-and-up" @click="drawer = !drawer" />

    <router-link to="/" tag="span" class="mr-10">
      <v-icon dark large class="mr-3">mdi-semantic-web</v-icon>
      <span class="font-weight-medium white--text" style="white-space: nowrap; cursor: pointer">WEB ПОРТАЛ</span>
    </router-link>

    <v-toolbar-items class="hidden-sm-and-down">
      <template v-if="zip">
        <v-menu v-if="isUserLoggedIn" offset-y open-on-hover>
          <template #activator="{ on }">
            <v-btn color="primary" dark v-on="on">
              <v-icon left>{{ zip.icon }}</v-icon>
              {{ zip.title }}
            </v-btn>
          </template>
          <v-list>
            <v-list-item v-for="(item, index) in items_zip" :key="index" :to="item.url">
              <v-list-item-action>{{ item.title }}</v-list-item-action>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>

      <template v-if="models">
        <v-menu v-if="isUserLoggedIn" offset-y open-on-hover>
          <template #activator="{ on }">
            <v-btn color="primary" dark v-on="on">
              <v-icon left>{{ models.icon }}</v-icon>
              {{ models.title }}
            </v-btn>
          </template>
          <v-list>
            <v-list-item v-for="(item, index) in items_models" :key="index" :to="item.url">
              <v-list-item-action>{{ item.title }}</v-list-item-action>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>

      <v-btn v-for="link in links" :key="link.title" text :to="link.url">
        <v-icon left>{{ link.icon }}</v-icon>
        {{ link.title }}
      </v-btn>

      <template v-if="deals">
        <v-menu offset-y open-on-hover>
          <template #activator="{ on }">
            <v-btn color="primary" dark v-on="on">
              <v-icon left>{{ deals.icon }}</v-icon>
              {{ deals.title }}
            </v-btn>
          </template>
          <v-list>
            <v-list-item v-for="(item, index) in items_deals" :key="index" :to="item.url">
              <v-list-item-action>{{ item.title }}</v-list-item-action>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>

      <template v-if="budget">
        <v-menu offset-y open-on-hover>
          <template #activator="{ on }">
            <v-btn color="primary" dark v-on="on">
              <v-icon left>{{ budget.icon }}</v-icon>
              {{ budget.title }}
            </v-btn>
          </template>
          <v-list>
            <template v-for="(item, index) in items_budget">
              <v-list-item v-if="item.access" :key="index" :to="item.url">
                <v-list-item-action>{{ item.title }}</v-list-item-action>
              </v-list-item>
            </template>
          </v-list>
        </v-menu>
      </template>

      <template v-if="dictionaries">
        <v-menu v-if="isUserLoggedIn" offset-y open-on-hover>
          <template #activator="{ on }">
            <v-btn color="primary" dark v-on="on">
              <v-icon left>{{ dictionaries.icon }}</v-icon>
              {{ dictionaries.title }}
            </v-btn>
          </template>
          <v-list>
            <template
              v-for="(item, index) in items_dictionary"
            >
              <v-list-item
                :key="index"
                :to="item.url"
              >
                <v-list-item-action>{{ item.title }}</v-list-item-action>
              </v-list-item>
            </template>
          </v-list>
        </v-menu>
      </template>
    </v-toolbar-items>
    <v-spacer />

    <!-- СООБЩИТЬ О ПРОБЛЕМЕ  -->
    <v-icon v-if="isUserLoggedIn" large dark class="mr-5" @click="dialog = true">mdi-bullhorn</v-icon>

    <!--   ПРОФИЛЬ   -->
    <v-menu
      v-if="isUserLoggedIn"
      rounded
      offset-y
    >
      <template #activator="{ attrs, on }">
        <v-avatar
          v-if="userAvatar && userAvatar !== 'account_circle'"
          class="mr-3"
          v-bind="attrs"
          size="36"
          v-on="on"
        >
          <img :src="userAvatar">
        </v-avatar>

        <v-icon
          v-else-if="userAvatar && userAvatar === 'account_circle'"
          x-large
          v-on="on"
        >{{ userAvatar }}
        </v-icon>

        <v-progress-circular v-else :size="50" color="amber" indeterminate />
      </template>
      <v-list>
        <v-list-item>
          <router-link to="/user" tag="span">
            <v-btn
              text
            >
              Профиль
            </v-btn>
          </router-link>
        </v-list-item>
        <v-list-item>
          <v-btn
            v-if="isUserLoggedIn"
            text
            @click="onLogout"
          >
            Выйти
          </v-btn>
        </v-list-item>
      </v-list>
    </v-menu>
    <!-- ---------------------- -->

  </v-app-bar>
</template>

<script>
export default {

  data() {
    return {
      drawer: false,
      loading: true,
      dialog: false,

      items_zip: [
        { title: 'Список ЗИП', url: '/zip/list' },
        { title: 'Спеццены', url: '/zip/specprices' },
        { title: 'Серийные номера', url: '/zip/sn' },
        { title: 'Справочники ЗИП', url: '/zip/dictionary' }
      ],
      items_deals: [
        { title: 'Со счетами', url: '/deals/list' },
        { title: 'Нет счетов', url: '/deals/list_no_bills' }
      ],
      items_models: [
        { title: 'Список Моделей', url: '/models/list' },
        { title: 'Справочники оборудования', url: '/models/dictionary' }
      ],
      items_dictionary: [
        { title: 'Технические характеристики', url: '/dictionaries/tech_properties' },
        { title: 'Справочники ЗИП', url: '/zip/dictionary' },
        { title: 'Справочники Моделей', url: '/models/dictionary' },
        { title: 'Справочники CRM', url: '/crm/dictionaries' },
        { title: 'Склад 1С', url: '/dictionaries/stock_1c' },
        { title: 'Склад инженеров', url: '/engineers_stock' },
        { title: 'Атлас Про', url: '/atlas_pro' }
      ],

      fab: false
    }
  },

  computed: {

    userRole() {
      return this.$store.getters.userRole
    },

    links() {
      if (this.isUserLoggedIn) {
        const Roles = this.userRole.split('&')
        if (Roles.find(item => item !== 'user' && item !== 'limitedFinancier')) {
          return Roles.find(item => item === 'agent')
            ? [{ title: 'Маркет', icon: 'shopping_basket', url: '/market/list' }]
            : [{ title: 'Маркет', icon: 'shopping_basket', url: '/market/list' }, { title: 'Клиенты', icon: 'people', url: '/clients' }]
        } else return false
      } else {
        return [
          { title: 'Вход', icon: 'lock', url: '/login' },
          { title: 'Регистрация', icon: 'face', url: '/registration' }
        ]
      }
    },

    zip() {
      if (this.isUserLoggedIn) {
        const Roles = this.userRole.split('&')
        if (
          Roles.find(item => item === 'admin') ||
          Roles.find(item => item === 'financier') ||
          Roles.find(item => item === 'engineer') ||
          Roles.find(item => item === 'leadEngineer')
        ) {
          return { title: 'ЗИП', icon: 'memory' }
        } else return false
      } else return false
    },

    models() {
      if (this.isUserLoggedIn) {
        const Roles = this.userRole.split('&')
        if (
          Roles.find(item => item === 'admin') ||
          Roles.find(item => item === 'financier') ||
          Roles.find(item => item === 'engineer') ||
          Roles.find(item => item === 'leadEngineer')
        ) {
          return { title: 'Модели', icon: 'phone_android' }
        } else return false
      } else return false
    },

    deals() {
      if (this.isUserLoggedIn) {
        const Roles = this.userRole.split('&')
        if (
          Roles.find(item => item === 'admin') ||
          Roles.find(item => item === 'financier')
        ) {
          return { title: 'Сделки', icon: 'mdi-cash-multiple' }
        } else return false
      } else return false
    },
    budget() {
      if (this.isUserLoggedIn) {
        const Roles = this.userRole.split('&')
        if (
          Roles.find(item => item === 'admin') ||
          Roles.find(item => item === 'financier') ||
          Roles.find(item => item === 'limitedFinancier')
        ) {
          return { title: 'Бюджет', icon: 'mdi-cash-multiple' }
        } else return false
      } else return false
    },

    dictionaries() {
      if (this.isUserLoggedIn) {
        const Roles = this.userRole.split('&')
        if (
          Roles.find(item => item === 'admin') ||
          Roles.find(item => item === 'financier') ||
          Roles.find(item => item === 'engineer') ||
          Roles.find(item => item === 'leadEngineer') ||
          Roles.find(item => item === 'manager')
        ) {
          return { title: 'Справочники', icon: 'list' }
        } else return false
      } else return false
    },

    items_budget() {
      return [
        { title: 'Контроль поступлений', url: '/budget/income', access: this.userRole.split('&').find(item => item === 'admin' || item === 'financier' || item === 'superFinancier') },
        { title: 'Контроль расходов', url: '/budget/pays', access: this.userRole.split('&').find(item => item === 'admin' || item === 'financier' || item === 'superFinancier') },
        { title: 'Финансы', url: '/budget/finance', access: this.userRole.split('&').find(item => item === 'admin' || item === 'financier' || item === 'superFinancier' || item === 'limitedFinancier') },
        { title: 'Планирование', url: '/budget/plans', access: this.userRole.split('&').find(item => item === 'admin' || item === 'financier' || item === 'superFinancier') }
      ]
    },

    userAvatar() {
      if (this.$store.getters.currentUser) {
        if (!this.$store.getters.currentUser.photoURL) {
          return 'account_circle'
        }
        return this.$store.getters.currentUser.photoURL
      } else {
        return false
      }
    },
    isUserLoggedIn() {
      return this.$store.getters.isUserLoggedIn
    }

  },

  methods: {

    onLogout() {
      this.$store.dispatch('LogoutUser')
      this.$router.push('/')
    }
  }

}
</script>

<style lang="scss" scoped>

</style>
