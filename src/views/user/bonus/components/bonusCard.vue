<template>
  <div>
    <template v-if="loader">
      <v-row justify="center" align="center" class="mt-10">
        <div style="margin: auto">
          <Loader />
        </div>
      </v-row>
    </template>

    <v-row v-else-if="!JiraUser && !loader" justify="center" align="center" style="margin-top: 20px">
      <v-col cols="6" offset="" class="text-center">
        <v-alert
          outlined
          type="warning"
          prominent
          border="left"
        >
          Внимание, похоже, Вы используете не ваш основной электронный адрес. Обратитесь к вашему руководителю.
        </v-alert>
      </v-col>
    </v-row>

    <template v-else>
      <v-dialog v-model="dialogSale">
        <bonusDialogSale
          :key="name"
          :name="name"
          :role="selectedUserRole"
          :email="JiraUser ? JiraUser.email : email"
          :quarter="parseInt(quarter)"
          :month="parseInt(month)"
          :typedate="typeDate"
          @dialogToggle="changeDialog"
        />
      </v-dialog>

      <v-dialog v-model="dialogProfit">
        <bonusDialogProfit
          v-if="dialogToggle"
          :key="name"
          :name="name"
          :role="selectedUserRole"
          :email="JiraUser ? JiraUser.email : email"
          :quarter="parseInt(quarter)"
          :month="parseInt(month)"
          :typedate="typeDate"
          @dialogToggle="changeDialog"
        />
        
        <bonusDialogSC
          v-else
          :key="name"
          :name="name"
          :role="selectedUserRole"
          :email="JiraUser ? JiraUser.email : email"
          :quarter="parseInt(quarter)"
          :month="parseInt(month)"
          :typedate="typeDate"
          @dialogToggle="changeDialog"
        />
      </v-dialog>

      <v-row justify="center" align="center">
        <v-col cols="8">
          <v-progress-linear
            v-if="Jira_Users.length === 0"
            color="green"
            indeterminate
          />
          <template v-else><!-- {{ BonusProfitSum }} {{ Object.keys(BonusProfitSum).length }} -->
            <v-row>
              <v-col xs="12" sm="8" md="12" lg="2" align="center">
                <v-radio-group
                  v-model="typeDate"
                  style="margin: 0 auto"
                  @change="reloadAllBonus(JiraUser ? JiraUser.email : null)"
                >
                  <v-radio
                    label="квартал"
                    value="quarter"
                  />
                  <v-radio
                    label="месяц"
                    value="month"
                  />
                </v-radio-group>
              </v-col>
              <v-col v-if="typeDate === 'quarter'" xs="12" sm="12" md="12" lg="4" align="center">
                <v-select
                  v-model="quarter"
                  :items="Quarters"
                  item-text="name"
                  outlined
                  label="Выберите квартал"
                  :disabled="loading"
                  @change="reloadAllBonus(JiraUser ? JiraUser.email : null)"
                />
              </v-col>
              <v-col v-if="typeDate === 'month'" xs="12" sm="12" md="12" lg="4" align="center">
                <v-select
                  v-model="month"
                  :items="Months"
                  item-text="name"
                  outlined
                  label="Выберите месяц"
                  :disabled="loading"
                  @change="reloadAllBonus(JiraUser ? JiraUser.email : null)"
                />
              </v-col>
              <v-col xs="12" sm="12" md="12" lg="4">
                <v-autocomplete
                  v-if="quarter && $acl.check('Financier')"
                  v-model="JiraUser"
                  :items="Jira_Users"
                  item-text="display_name"
                  label="Выберите пользователя"
                  return-object
                  outlined
                  validate-on-blur
                  :disabled="loading"
                  @change="reloadAllBonus(JiraUser ? JiraUser.email : null)"
                />
              </v-col>
            </v-row>
          </template>
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col v-for="item in items" :key="item.name" sm="12" md="12" lg="4" xl="4">
          <v-boilerplate
            v-if="Object.keys(BonusProfitSum).length === 0 || Object.keys(BonusSaleSum).length === 0"
            class="mb-3"
            type="article, actions"
          />
          <v-card v-else max-width="500" outlined class="elevation-1" style="margin: 0 auto;">

            <v-card-text>
              <div class="card-panel-icon-wrapper">
                <svg-icon icon-class="coins" class-name="card-panel-icon" />
              </div>
              <div class="overline ml-3 font-weight-bold">{{ item.name }}</div>

              <v-list-item three-line>
                <v-list-item-content>
                  <v-list-item-subtitle
                    class="title mt-3"
                  >{{ item.titleX }} -
                    <span
                      v-anime="{
                        innerHTML: [
                          0,
                          JiraUser.email === 'nouser@tsd-group.ru' ? null :
                          item.pointsX ? item.pointsX : item.pointsX

                        ],
                        round: 1,
                        duration: 2000,
                        easing: 'easeOutQuint'
                      }"
                    />
                    <p class="body-1">{{ item.titleSC }}</p>
                  </v-list-item-subtitle>
                  <v-list-item-subtitle
                    v-if="item.name === 'Продажи' || item.name === 'Доходность'"
                    class="title mt-2"
                  >{{ item.title }} -
                    <span
                      v-anime="{
                        innerHTML: [
                          0,
                          JiraUser.email === 'nouser@tsd-group.ru' ? null :
                          item.points ? item.points : item.points

                        ],
                        round: 1,
                        duration: 2000,
                        easing: 'easeOutQuint'
                      }"
                    />
                    <p class="body-1">{{ item.titleSCX }}</p>
                  </v-list-item-subtitle>
                  <v-divider />
                  <v-list-item-subtitle
                    class="mt-3 text--disabled"
                  >Нажмите "Подробнее" чтобы увидеть
                    детализацию</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

            </v-card-text>

            <v-card-actions>
              <v-row>
                <v-col class="text-end">
                  <v-btn
                    :disabled="!+item.points && !+item.pointsX"
                    text
                    @click="loadUserBonus(item)"
                  >Подробнее</v-btn>
                </v-col>
              </v-row>
            </v-card-actions>

          </v-card>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<script>
import Loader from '@/components/shared/Loader'
import bonusDialogSale from './bonusDialogSale'
import bonusDialogProfit from './bonusDialogProfit'
import bonusDialogSC from './bonusDialogSC'
import { mapState } from 'vuex'
import moment from 'moment'

export default {
  components: {
    bonusDialogSale,
    bonusDialogProfit,
    bonusDialogSC,
    Loader,
    VBoilerplate: {
      functional: true,
      render(h, { data, props, children }) {
        return h(
          'v-skeleton-loader',
          {
            ...data,
            props: {
              boilerplate: false,
              elevation: 2,
              ...props
            }
          },
          children
        )
      }
    }
  },

  data() {
    return {
      loader: false,
      dialogSale: false,
      dialogProfit: false,
      dialogToggle: true,
      name: '',
      stop: false,
      quarter: moment().quarter(),
      month: moment().month() + 1,
      typeDate: 'quarter',
      JiraUser: null
    }
  },

  computed: {
    loading() {
      return this.$store.getters.loading
    },
    userRole() {
      return this.$store.getters["auth/currentUser"]?.roles
    },
    Quarters() {
      return [
        { name: 'Текущий кв.', value: moment().quarter() },
        { name: 'Предыдущий кв.', value: moment().quarter() - 1 }
      ]
    },
    Months() {
      return [
        { name: 'Текущий мес.', value: moment().month() + 1 },
        { name: 'Предыдущий мес.', value: moment().month() }
      ]
    },
    // eslint-disable-next-line vue/return-in-computed-property
    MonthsInQuarter() {
      const year = new Date().getFullYear()
      if (this.typeDate === 'quarter') {
        if (this.quarter === 1) return { months: [1, 2, 3], year }
        else if (this.quarter === 2) return { months: [4, 5, 6], year }
        else if (this.quarter === 3) return { months: [7, 8, 9], year }
        else if (this.quarter === 4) return { months: [10, 11, 12], year }
        else if (this.quarter === 0) return { months: [10, 11, 12], year: year - 1 }
      }
      if (this.typeDate === 'month') {
        if (this.month === 0) {
          return { months: [12, 12, 12], year: year - 1 }
        } else return { months: [this.month, this.month, this.month], year: year }
      }
    },
    ...mapState({
      BonusSaleSum: state => state.user.BonusSaleSum,
      BonusProfitSum: state => state.user.BonusProfitSum,
      BonusProfitSCSum: state => state.user.BonusProfitSCSum,
      Jira_Users: state => state.jira_users.JIRA_USERS,
      fbUser: state => state.fb.user,
      selectedUserRole: state => state.user.selectedUserRole
    }),
    pointsXSale() {
      return this.BonusSaleSum
        ? this.BonusSaleSum.pointsX
        : 0
    },
    pointsXProfit() {
      return this.BonusProfitSum
        ? this.BonusProfitSum.pointsX + this.BonusProfitSum.pointsXSC
        : 0
    },
    pointsSale() {
      return this.BonusSaleSum
        ? this.BonusSaleSum.points
        : 0
    },
    pointsProfit() {
      return this.BonusProfitSum
        ? this.BonusProfitSum.points + this.BonusProfitSum.pointsSC
        : 0
    },
    // eslint-disable-next-line vue/return-in-computed-property
    email() {
      const user = this.$store.getters["auth/currentUser"]
      if (user) return user.email
    },
    items() {
      return [
        {
          name: 'Продажи',
          titleX: 'Бонусы',
          title: 'Сумма баллов в теории',
          pointsX: this.pointsXSale,
          points: this.pointsSale
        },
        {
          name: 'Доходность',
          titleX: 'Бонусы',
          titleSC: this.BonusProfitSum.pointsSC !== 0 ? '(с учётом СК - ' + this.BonusProfitSum.pointsSC + ')' : '',
          title: 'Сумма баллов в теории',
          titleSCX: this.BonusProfitSum.pointsXSC !== 0 ? '(с учётом СК - ' + this.BonusProfitSum.pointsXSC + ')' : '',
          pointsX: this.pointsProfit,
          points: this.pointsXProfit
        },
        {
          name: 'Прочие',
          titleX: 'Прочие бонусы',
          title: 'Сумма баллов в теории',
          pointsX: '...',
          points: '...'
        }
      ]
    }
  },

  watch: {
    JiraUser(val) {
      const res = val === undefined ? this.JiraUser = {} : this.JiraUser
      return res
    }
  },
  async beforeCreate() {
    this.$store.dispatch('getBonusSale', this.email)
    this.$store.dispatch('getBonusProfit', this.email)
  },

  async created() {
    this.loader = true
    await this.$store.dispatch('fetchJiraUsers')
    this.JiraUser = this.Jira_Users.find(user => user.email === this.email) || null
    if (this.JiraUser) {
      await this.$store.dispatch('fb/getUserByEmail', { email: this.email })
        .then(res => {
          if (res) this.$store.dispatch('getUserRoleByUID', this.fbUser.uid)
        })
      await this.$store.dispatch('getBonusSaleSum', { email: this.email, MonthsInQuarter: this.MonthsInQuarter })
      await this.$store.dispatch('getBonusProfitSum', { email: this.email, MonthsInQuarter: this.MonthsInQuarter })
      await this.$emit('loading', true)
    }
    this.loader = false
  },

  methods: {
    loadUserBonus(item) {
      if (item.name === 'Продажи') {
        this.dialogSale = true
        this.dialogProfit = false
      }
      if (item.name === 'Доходность') {
        this.dialogSale = false
        this.dialogProfit = true
      }
      this.name = item.name
    },
    async reloadAllBonus(email) {
      if (email) {
        await this.$store.dispatch('fb/getUserByEmail', { email: email })
          .then(res => {
            if (res) this.$store.dispatch('getUserRoleByUID', this.fbUser.uid)
          })
        await this.$store.dispatch('getBonusSaleSum', { email: email, MonthsInQuarter: this.MonthsInQuarter })
        await this.$store.dispatch('getBonusProfitSum', { email: email, MonthsInQuarter: this.MonthsInQuarter })
        this.$store.dispatch('getBonusSale', email)
        this.$store.dispatch('getBonusProfit', email)
        this.$store.dispatch('getBonusProfitSC', { email, MonthsInQuarter: this.MonthsInQuarter })
      } else {
        this.$store.commit('setError', 'Сотрудник не выбран!')
      }
    },
    dataForChart() {
      this.$store.dispatch('dataForChart')
        .then(res => {
          console.log(res)
        })
    },
    changeDialog(data) {
      this.dialogToggle = data.toggle
    }
  }
}
</script>

<style lang="scss" scoped>

  .card-panel-icon-wrapper {
      position: relative;
      left:-30px;
      top: -30px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      border-radius: 6px;
      font-size: 62px;
      color:rgb(255, 255, 255);
      background: #f79d36;
      padding: 10px;
    }

</style>
