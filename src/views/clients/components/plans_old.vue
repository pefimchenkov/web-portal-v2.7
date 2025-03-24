<!-- eslint-disable vue/no-v-text-v-html-on-component -->
<template>
  <div>
    <Confirm ref="confirm" />

    <v-dialog v-model="dialog" width="500px" persistent>
      <el-card class="pa-3 mx-auto" outlined>
        <v-card-title class="subheading">Редактирование: «{{ label }}»</v-card-title>
        <v-text-field
          ref="plan"
          v-model="plan"
          label="* Сумма (план)"
          type="number"
          validation
          :rules="numberRule"
        />
        <v-autocomplete
          v-model="selectedUser"
          :items="jirausers"
          label="Ответственный менеджер"
          item-text="display_name"
          return-object
        />
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="green darken-1"
            text="text"
            @click="close"
          >
            Отменить
          </v-btn>
          <v-btn
            color="green darken-1"
            text="text"
            @click.native="save"
          >
            Сохранить
          </v-btn>
        </v-card-actions>
      </el-card>
    </v-dialog>

    <el-card v-if="editable && readonly" v-loading="loading" class="mx-auto mt-3">
      <v-toolbar class="elevation-2 grey lighten-3" dense>

        <v-toolbar-title><span :style="`color: #1976d2`">Планы:</span></v-toolbar-title>
        <v-spacer />
        <v-toolbar-title>План:
          <span :style="`color: darkorange`">{{ Sum ? toLocale(Sum) : 'нет данных' }}</span>
        </v-toolbar-title>
        <v-spacer />
        <v-toolbar-title>Факт:
          <span :style="`color: darkorange`">{{ editable.Fact ? toLocale(editable.Fact) : 'нет данных' }}</span>
        </v-toolbar-title>
        <v-spacer />
        <v-toolbar-title>Маржа:
          <span :style="`color: darkorange`">{{ Marja ? toLocale(Marja) : 'нет данных' }}</span>
        </v-toolbar-title>
      </v-toolbar>

      <v-list dense>
        <template v-for="(item, index) in Plans">
          <v-divider
            :key="index"
          />

          <v-list-item
            :key="item.title"
          >
            <v-icon
              :class="item.iconClass"
              small
              v-text="item.icon"
            />

            <!-- Название -->
            <v-list-item-content style="max-width: 150px">
              <v-list-item-title
                v-html="item.title"
              />
            </v-list-item-content>

            <!-- План -->
            <v-list-item-content v-if="item.plan || item.plan === 0">
              <v-list-item-title v-model="plan" class="text-left">
                <i
                  v-if="item.plan || item.plan === 0"
                  class="el-icon-delete"
                  @click="delItem(item, 'plan')"
                  style="cursor: pointer; margin-right: 10px;">
                </i>

                {{ !item.plan ? item.plan + ' ₽' : toLocale(item.plan) }}
              </v-list-item-title>
            </v-list-item-content>
            <v-list-item-content v-else>
              <v-list-item-title class="text-left grey--text">Не задан</v-list-item-title>
            </v-list-item-content>

            <!-- Проценты -->
            <v-list-item-content class="text-left" style="display: ruby">
              <i
                  v-if="item.type === 'manual'"
                  class="el-icon-delete"
                  @click="delCustomPercent(item)"
                  style="cursor: pointer; margin-right: 10px;">
                </i>

              <v-edit-dialog
                ref="custom"
                :return-value.sync="item.percent"
                large
                persistent
                cancel-text="Отмена"
                save-text="Сохранить"
                @save="saveCustomPercent(item.percent, item.value)"
              >
                
                {{ Math.round(item.percent * 100) }} % {{ item.type === 'manual' ? ' *' : '' }}

                <template #input>
                  <v-text-field
                    v-model="item.percent"
                    label="Редактирование"
                    single-line
                    counter
                    autofocus
                  />
                </template>
              </v-edit-dialog>
            </v-list-item-content>

            <!-- Куратор -->
            <v-list-item-content style="min-width: 250px">
              <v-progress-circular v-if="jirausers.length === 0" indeterminate color="primary" :width="1" />
              <v-list-item-title v-else class="text-left">
                <i
                  v-if="emailToName(item.curator) && item.curator.includes('*')"
                  class="el-icon-delete"
                  @click="delItem(item, 'curator')"
                  style="cursor: pointer; margin-right: 10px;">
                </i>
                <!-- <v-icon v-if="emailToName(item.curator) && item.curator.includes('*')" small style="margin-right: 10px;" @click="delItem(item, 'curator')">mdi-delete</v-icon> -->
                <span :style="emailToName(item.curator) && !item.curator.includes('*') ? `text-align: left; color: #939393` : ``">{{ emailToName(item.curator) }}</span>
              </v-list-item-title>
            </v-list-item-content>

            <v-icon small class="text-right ml-5" @click="open(item)">{{ item.editable ? 'mdi-pencil' : '' }}</v-icon>

          </v-list-item>
        </template>

        <v-divider style="margin-bottom: 7px" />

        <v-list-item class="my-3">
          <el-row type="flex" justify="center" align="middle">
            <el-col :span="16">
              <v-select
                v-model="percent"
                :items="percents"
                item-text="crm_name"
                label="Выберите процент"
                return-object
                color="success"
                hide-details
                outlined
                dense
                single-line
                prepend-inner-icon="mdi-percent"
                @change="show = true"
              >
                <template v-if="Plans.find(item => item.type === 'manual')" slot="append-outer">
                  <v-icon>add</v-icon>
                  <v-icon>mdi-hand-left</v-icon>
                </template>
              </v-select>
            </el-col>

            <el-col :span="8" :push="1">
              <el-button v-if="show" size="small" type="success" @click.prevent="savePercent()">
                Сохранить
              </el-button>
            </el-col>
          </el-row>
        </v-list-item>

        <v-list-item style="display: flex; text-align: center">
          <v-list-item-title style="text-align: right; margin-right: 15px">* - установлено вручную</v-list-item-title>
          <v-list-item-title style="text-align: left; margin-left: 15px">
            <!-- <v-icon>mdi-delete-circle-outline</v-icon> - можно удалить -->
            <i class="el-icon-delete"></i>  - можно удалить
          </v-list-item-title>
        </v-list-item>

      </v-list>

    </el-card>
  </div>
</template>

<script>
import { validNumber, validNumberWithPoint } from '@/utils/validate'
import Confirm from '@/components/shared/Confirm'

export default {
  components: {
    Confirm
  },
  props: {
    editable: {
      type: [Array, Object],
      required: true
    },
    readonly: {
      type: [Array, Object],
      required: true
    },
    jirausers: {
      type: Array,
      required: true
    },
    id: {
      type: Number,
      required: true
    },
    typecrm: {
      type: String,
      default: () => ''
    },
    clientName: {
      type: String,
      default: () => ''
    },
    crmKey: {
      type: String,
      default: () => ''
    }
  },
  data() {
    return {
      dialog: false,
      loading: false,
      plan: null,
      percent: {},
      selectedUser: {},
      previousUser: {},
      customPercent: null,
      url: '',
      label: '',
      show: false,
      numberRule: [
        v => validNumber(v) || 'Допускаются только цифры!'
      ],
      floatPointRule: [
        v => validNumberWithPoint(v) || 'Допускаются только цифры c плавающей точкой!'
      ]
    }
  },
  computed: {
    Plans() {
      return [
        { icon: 'mdi-currency-usd',
          iconClass: 'grey darken-1 white--text mr-3',
          title: 'Продажи (новое)',
          value: 'AIDC_SALE',
          plan: this.editable.AIDC_SALE,
          curator: this.editable.OM_SALE,
          percent: this.editable.P_SALE,
          type: this.editable.P_SALE_type,
          editable: true
        },
        { icon: 'mdi-currency-usd',
          iconClass: 'grey darken-1 white--text mr-3',
          title: 'Продажи (склад)',
          value: 'AIDC_SALE_ZIP',
          plan: this.editable.AIDC_SALE_ZIP,
          curator: this.editable.OM_SALE_ZIP,
          percent: this.editable.P_SALE_ZIP,
          type: this.editable.P_SALE_ZIP_type,
          editable: true
        },
        { icon: 'mdi-currency-usd',
          iconClass: 'grey darken-1 white--text mr-3',
          title: 'Сервис',
          value: 'AIDC_SERV',
          plan: this.editable.AIDC_SERV,
          curator: this.editable.OM_SERV,
          percent: this.editable.P_SERV,
          type: this.editable.P_SERV_type,
          editable: true
        },
        { icon: 'mdi-currency-usd',
          iconClass: 'grey darken-1 white--text mr-3',
          title: 'IT',
          value: 'IT',
          plan: this.editable.IT,
          curator: this.editable.OM_IT,
          percent: this.editable.P_IT,
          type: this.editable.P_IT_type,
          editable: true
        }
      ]
    },
    percents() {
      return this.$store.getters.percents.filter(item => item.crm_name !== null)
    },
    Marja() {
      return this.editable.AIDC_SALE * this.editable.P_SALE + this.editable.AIDC_SALE_ZIP * this.editable.P_SALE_ZIP + this.editable.AIDC_SERV * this.editable.P_SERV + this.editable.IT * this.editable.P_IT
    },
    Sum() {
      return (this.editable.AIDC_SALE * 1 + this.editable.AIDC_SALE_ZIP * 1 + this.editable.AIDC_SERV * 1 + this.editable.IT * 1)
    },
    currentUser() {
      return this.$store.getters.currentUser
    },
    currentUserName() {
      return this.jirausers
        ? this.jirausers.find(user => user.email === this.currentUser.email)?.display_name
        : this.currentUser.displayName
    }
  },


  watch: {
    percent(obj) {
      if (obj) {
        this.Plans.forEach(item => {
          const idx = this.Plans.indexOf(item)
          if (item.type !== 'manual') {
            this.Plans[idx].percent = obj[item.value]
          }
        })
      }
    }
  },


  async created() {
    this.pause(1000)
    await this.$store.dispatch('fetchPercentCRM')
    this.percent = await this.$store.getters.percents.find(item => item.crm_id === this.typecrm)
  },


  methods: {
    pause(t) {
      this.loading = true
      return setTimeout(() => {
        return (this.loading = false)
      }, t)
    },

    
    validate(item) {
      return /^[0-9.]+$/.test(item)
    },


    toLocale(item) {
      if (item) return item.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })
    },


    emailToName(curator) {
      if (curator) {
        const user = this.jirausers.find(user => curator.includes(user.user_name))
        const nodata = curator.split(' ').find(i => !!i)
        const asterisk = curator.split(' ').find(i => i === '*')
        return user
          ? asterisk ? user.display_name + ' *' : user.display_name
          : nodata
            ? null
            : asterisk ? curator + ' *' : curator
      }
    },


    getUrl(data) {
      if (data === 'Продажи (новое)') this.url = 'updateAIDC_SALE'
      if (data === 'Продажи (склад)') this.url = 'updateAIDC_SALE_ZIP'
      if (data === 'Сервис') this.url = 'updateAIDC_SERV'
      if (data === 'IT') this.url = 'updateIT'
    },


    open(item) {
      this.dialog = true
      this.label = item.title
      this.getUrl(item.title)
      this.plan = item.plan
      this.selectedUser = this.previouseUser = this.jirausers.find(user => item.curator.includes(user.user_name))
    },


    close() {
      this.dialog = false
      this.selectedUser = this.previousUser = {}
      this.plan = null
    },


    save() {
      if (this.$refs.plan.validate()) {
        this.$store.dispatch(
          this.url,
          {
            id: this.id,
            clientName: this.clientName,
            currentUserName: this.currentUserName,
            selectedUser: this.selectedUser,
            previouseUser: this.previouseUser,
            plan: this.plan,
            crmKey: this.crmKey
          })
          .then(() => {
            this.$store.commit('setData', 'Данные успешно обновлены.')
            this.close()
          })
      } else {
        this.$store.commit('setError', 'Не все необходимые поля заполнены, что будем сохранять то?')
      }
    },


    async savePercent() {
      if (await this.$refs.confirm.open('Изменение типа процента', 'Вы точно уверены?', { color: 'orange' })) {
        const payload = {
          id: this.id,
          type: this.percent.crm_id,
          AIDC_SALE: this.percent.AIDC_SALE,
          AIDC_SALE_ZIP: this.percent.AIDC_SALE_ZIP,
          AIDC_SERV: this.percent.AIDC_SERV,
          IT: this.percent.IT
        }

        this.$store.dispatch('setPercent', payload)
          .then(res => {
            if (res.changedRows === 1) {
              this.$store.commit('setData', 'Процент применён.')
              this.show = false
            }
          })
      }
    },


    async saveCustomPercent(percent, value) {
      if (!this.validate(percent)) {
        this.$notify({ type: "error", message: "Введите корректные данные!" })
        return;
      }

      await this.$store.dispatch('setCustomPercent', { id: this.id, name: value, percent: percent })
      this.$notify({ type: "success", message: "Процент успешно установлен" })
      this.show = false
    },

    
    async delItem(item, type) {
      if (await this.$refs.confirm.open('Удаление', 'Вы уверены?', { color: 'orange' })) {
        this.previouseUser = this.jirausers.find(user => item.curator.includes(user.user_name))

        const plan = type === 'plan'
          ? null
          : item.plan

        const user_name = type === 'curator'
          ? null
          : item.curator

        const payload = {
          id: this.id,
          clientName: this.clientName,
          currentUserName: this.currentUserName,
          selectedUser: { user_name },
          previouseUser: this.previouseUser,
          manager: this.editable.MANAGER,
          plan,
          crmKey: this.crmKey
        }

        this.getUrl(item.title)

        this.$store.dispatch(this.url, payload)
          .then(() => {
            this.$notify({ type: "success", message: "Данные успешно удалены" })
          })
          .catch(err => {
            console.log(err?.message)
            this.$notify({ type: "error", message: "Ошибка при удалении данных!" })
          })
          .finally(() => this.close())
      }
    },


    async delCustomPercent(obj) {
      if (await this.$refs.confirm.open('Удаление', 'Вы уверены?', { color: 'orange' })) {
        const res = await this.$store.dispatch('deleteCustomPercent', { id: this.id, value: obj.value })
        if (res.affectedRows > 0) {
          this.$notify({ type: "success", message: "Данные успешно удалены" })
        } else {
          this.$notify({ type: "error", message: "Ошибка при удаления данных" })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
