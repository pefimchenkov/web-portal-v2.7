<template>

  <v-container v-loading="loading">
    <v-row align="center">

      <v-col cols="2">
        <v-text-field
          v-model="searchParts"
          prepend-icon="search"
          label="Поиск"
          placeholder="Введите данные для поиска"
          single-line
          clearable
        />
      </v-col>

      <v-spacer />

      <v-btn v-if="showSaveBtn" color="error" :loading="localLoading" :disabled="localLoading" class="mr-2" @click.native="closePartsDialog()">
        <v-icon class="mr-2">cancel</v-icon>Отменить
      </v-btn>
      <v-btn v-if="showSaveBtn" color="success" dark :loading="localLoading" :disabled="localLoading" class="" @click.native="saveParts()">
        <v-icon class="mr-2">save</v-icon>Сохранить
      </v-btn>

      <v-spacer />

      <v-row v-if="positionDetailed.Approved === 2 && Parts.length > 0" justify="center" align="center">
        <v-col>
          <v-card class="pa-2 text-center">
            <span class="font-weight-bold">Отменил:</span>
            {{ positionDetailed.Approve_Person | getUserName }},
            {{ new Date(positionDetailed.Approve_Date).toLocaleDateString('ru-RU', { hour: '2-digit', minute: '2-digit' }) }}
          </v-card>
        </v-col>

        <v-col>
          <v-btn color="success" dark :loading="localLoading" :disabled="(localLoading || showSaveBtn || Math.round(totalPercent()) !== 100)" class="ml-5" @click="approveParts">
            <v-icon small class="mr-2">done</v-icon>Подтвердить
          </v-btn>
        </v-col>
      </v-row>

      <v-row v-if="positionDetailed.Approved === 1 && Parts.length > 0" justify="center" align="center">
        <v-col>
          <v-card class="pa-2 text-center">
            <span class="font-weight-bold">Подтвердил:</span>
            {{ positionDetailed.Approve_Person | getUserName }},
            {{ new Date(positionDetailed.Approve_Date).toLocaleDateString('ru-RU', { hour: '2-digit', minute: '2-digit' }) }}
          </v-card>
        </v-col>

        <v-col>
          <v-btn color="error" dark :loading="localLoading" :disabled="localLoading" class="ml-5" @click="disapproveParts">
            <v-icon small class="mr-2">cancel</v-icon>Отменить
          </v-btn>
        </v-col>
      </v-row>

      <v-row v-if="positionDetailed.Approved === 0 || !positionDetailed.Approved || !Parts.length" justify="center" align="center">
        <v-col>
          <v-card v-if="!Parts.length" class="pa-2 text-center">нет состава</v-card>
        </v-col>
        <v-col>

          <v-btn v-if="PartsId.length" color="success" dark :loading="localLoading" :disabled="(localLoading || showSaveBtn || Math.round(totalPercent()) !== 100)" class="ml-5" @click="approveParts">
            <v-icon small class="mr-2">done</v-icon>Подтвердить
          </v-btn>
        </v-col>
      </v-row>

      <!-- =================  ВСЕГО ПРОЦЕНТОВ ================ -->

      <v-card :class="{ 'error': totalPercent() > 100, 'success': Math.round(totalPercent()) === 100, 'grey': Math.round(totalPercent()) < 100 }" class="pa-2" style="color:#fff">
        {{ 'Всего: ' + Math.round(totalPercent()) + '%' }}
      </v-card>

      <!-- ================== ДИАЛОГ ДОБАВЛЕНИЯ СОСТАВА ================= -->

      <v-col xs="12" sm="12" md="2" lg="2" xl="2" class="text-right">

        <v-dialog :key="positionDetailed.Approved" v-model="dialogParts" max-width="1100px" persistent>

          <v-spacer />

          <template v-if="positionDetailed.Approved !== 1" #activator="{ on }">
            <v-btn v-if="PartsId.length > 0 && $acl.check('Edit')" color="primary" dark :loading="localLoading" v-on="$acl.check('Edit') ? on : ''">
              <v-icon small class="mr-2">edit</v-icon>Редактировать
            </v-btn>
            <v-btn v-else color="primary" dark :loading="localLoading" v-on="$acl.check('Edit') ? on : ''">
              <v-icon small class="mr-2">add</v-icon>Добавить
            </v-btn>
          </template>

          <v-card>

            <v-card-title>
              <span class="headline">{{ formTitleParts }} для {{ parentName }}</span>
            </v-card-title>

            <v-card-text>
              <v-container grid-list-md>
                <v-row>

                  <v-col xs="12">

                    <v-autocomplete
                      v-if="!Parts.length"
                      v-model="donorsParts"
                      label="Импортировать из донора"
                      no-data-text="Нет возможных доноров для копии"
                      :items="Donors"
                      :item-text="(item) => `${item.PN} - ${item.ART_1C} (в составе: ${item.zid} шт.)`"
                      return-object
                    />

                    <v-combobox
                      v-model="Parts"
                      :items="elementType === 2 ? modelMarketList : marketList"
                      :item-text="setIdNameTypeArtPN"
                      label="Выбрать состав в ручную"
                      :search-input.sync="search"
                      multiple
                      small-chips
                      deletable-chips
                      clearable
                      hide-selected
                      return-object
                      :allow-overflow="true"
                      class="font-weight-medium"
                      @change="search = ''"
                    >
                      <template #no-data>
                        <v-list-item>
                          <v-list-item-content>
                            <v-list-item-title>
                              Результат поиска "<strong>{{ search }}</strong>" отсутствует. Пожалуйста, вводите правильные данные!
                            </v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                      </template>
                      <template #selection="{ item, parent}">
                        <v-chip
                          color="blue lighten-4"
                          label
                          small
                        >
                          {{ setIdNameTypeArtPN(item) }}
                        </v-chip>
                        <v-icon
                          small
                          @click="parent.selectItem(item)"
                        >close</v-icon>
                      </template>
                    </v-combobox>

                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer />
              <v-btn color="blue darken-1" text @click.native="preview"><v-icon class="mr-2">mdi-eye</v-icon>Предварительный просмотр</v-btn>
            </v-card-actions>

          </v-card>

        </v-dialog>

        <!-- ===================================================== -->

      </v-col>
    </v-row>

    <v-data-table
      :key="Parts.length"
      ref="dataTable"
      :headers="headers"
      :items="Parts"
      fixed-header
      calculate-widths
      :items-per-page="10"
      item-key="id"
      :mobile-breakpoint="550"
      sort-by="marketNAME"
      class="elevation-2 mt-5"
      no-data-text="У данной позиции отсутствуют составные части"
      :footer-props="{
        itemsPerPageAllText: 'Все',
        itemsPerPageText: 'Строк на странице',
        itemsPerPageOptions: [10,30,150,-1],
        showFirstLastPage: true
      }"
    >
      <template #item="{item}">
        <tr :class="item.id ? '' : 'green accent-1'">
          <td class="text-left">{{ item.id }}</td>
          <td class="text-left">{{ item.marketid }}</td>
          <td class="text-left">{{ item.marketNAME }}</td>
          <td class="text-left">{{ item.marketART }}</td>
          <td class="text-left">{{ item.marketSUPPLIER }}</td>
          <td class="text-left">{{ item.marketCOND }}</td>
          <td class="text-left">{{ item.marketPN }}</td>
          <td class="text-center">
            <v-edit-dialog
              v-if="!showSaveBtn && positionDetailed.Approved !== 1"
              :return-value.sync="item.percent"
              :large="!(item.percent < item.zipratio_from || item.percent > item.zipratio_upto)"
              cancel-text="Отмена"
              save-text="Сохранить"
              @save="(item.percent < item.zipratio_from || item.percent > item.zipratio_upto) ? cancelAdd(item, item.percent) : addPercents(item.id, item.percent)"
            >
              <v-icon v-if="item.percent" x-small class="mr-2" @click.stop="removePercents(item.id)">mdi-close-thick</v-icon>
              <v-icon x-small class="ml-3 mr-1">mdi-pencil</v-icon>

              <span :class="{ 'primary--text': !item.percent }">
                {{ item.percent ? `${item.percent}% *` : item.autopercent ? `${item.autopercent}%` : 0 }}
              </span>

              <template #input>
                <v-text-field
                  ref="percent"
                  v-model="item.percent"
                  type="number"
                  label="Редактирование"
                  validation
                  :rules="[(v) => checkRange(v, item.zipratio_from, item.zipratio_upto)]"
                />
                {{ `Доступный диапазон: ${item.zipratio_from || 0 } - ${item.zipratio_upto || 0 }%` }}
              </template>

            </v-edit-dialog>
            <span v-else>
              <span :class="{ 'primary--text': !item.percent }">
                {{ item.percent ? `${item.percent}% *` : item.autopercent ? `${item.autopercent}%` : 0 }}
              </span>
            </span>
          </td>

          <td class="text-center">
            <v-icon v-if="positionDetailed.Approved !== 1 && showDeleteButton(item) && $acl.check('Edit')" small @click="deleteItemParts(item)">delete</v-icon>
          </td>
        </tr>

      </template>

      <template #[`body.append`]>
        <td class="py-2 text-center" :colspan="headers.length">* - добавлен вручную</td>
      </template>

    </v-data-table>
  </v-container>

</template>

<script>

import {
  get,
  add,
  remove,
  approve,
  disapprove,
  donors,
  add_percents,
  remove_percents } from '@/api/parts'
import { getUserName } from '@/filters/jira-users'
import { AclRule } from 'vue-acl'

export default {

  filters: {

    getUserName

  },

  props: {

    id: {

      type: String,
      required: true

    },
    parentName: {

      type: String,
      default: null

    },

    parentZipId: {

      type: Number,
      default: null

    },

    elementType: {

      type: Number,
      default: null

    },

    marketList: {

      type: Array,
      default: () => []

    },

    modelMarketList: {

      type: Array,
      default: () => []

    }

  },

  data() {
    return {

      loading: false,
      localLoading: false,
      dialogParts: false,
      searchParts: '',
      search: '',
      showSaveBtn: false,
      formTitleParts: 'Редактирование состава',
      Parts: [],
      tempParts: [],
      PartsId: [],
      Donors: [],
      donorsParts: null,
      totalPercentFromDB: null,

      editedItemParts: {
        NAME: '',
        ART: '',
        SUPP: '',
        COND: '',
        PN: '',
        MODELS: {}
      },

      headers: [
        { text: 'id', value: 'id', divider: true },
        { text: 'Маркет ID', value: 'marketid', divider: true },
        { text: 'Имя', value: 'NAME', divider: true },
        { text: 'Артикул', value: 'ART', divider: true },
        { text: 'Производитель', value: 'SUPP', divider: true },
        { text: 'Состояние', value: 'COND', divider: true },
        { text: 'PN', value: 'PN', divider: true },
        { text: 'Процент', value: 'percent', align: 'center', divider: true },
        { text: 'Действия', value: 'actions', sortable: false, align: 'center', divider: true }
      ]

    }
  },

  computed: {

    Edit() {
      return new AclRule('leadEngineer').or('admin').generate()
    },

    jiraUsers() {
      return this.$store.getters.jira_users
    },

    currentUser() {
      return this.$store.getters.currentUser
    },

    positionDetailed() {
      return this.marketList.find(item => item.marketid === +this.id)
    }

  },

  watch: {

    donorsParts: {

      handler: function(val) {
        if (val) this.getCurrentParts(val.id, 1)
      }

    },

    Parts(val) {
      if (!val.length) this.donorsParts = null
    }

  },

  async created() {
    this.loading = true

    await this.$store.dispatch('fetchParts')
    await this.getParts()
    await this.getDonors(this.parentZipId)
    await this.getCurrentParts(this.id)
    // await this.getTotalPercents({ id: this.id })
  },

  methods: {

    getParts() {
      this.PartsId = this.$store.getters.Parts.filter(part => +part.mid === +this.id)
    },

    getCurrentParts(id, flag = null) {
      this.Parts = []

      get({ id })
        .then(res => {
          if (flag === 1) {
            const ids = res.map(item => item.marketid)
            this.Parts = this.marketList.filter(item => ids.includes(item.marketid))
          } else {
            this.Parts = [...res]
            this.tempParts = [...this.Parts]

            this.Parts.forEach(item => {
              if (!item.zipratio_from && !item.zipratio_upto) {
                item.zipratio_from = 0
                item.zipratio_upto = 100
              }
            })

            this.percentCalculate()

            setTimeout(() => {
              this.loading = false
            }, 1000)
          }
        })
    },

    getDonors(id) {
      if (this.PartsId.length === 0) {
        donors({ id })
          .then(res => {
            this.Donors = [...res]
            if (!res.length) this.$store.commit('setInfo', 'Доступные доноры отсутствуют..')
            else this.$store.commit('setData', `Есть ${res.length} доступных донора.`)
          })
      }
    },

    /* async getTotalPercents(id) {
      await get_percents(id)
        .then(res => {
          this.totalPercentFromDB = res
        })
    }, */

    manualTotalPercent() {
      let sum = 0;
      this.Parts.forEach(item => {
        sum += (+item.percent || 0)
      })

      return sum;
    },

    autoTotalPercent() {
      let sum = 0;
      this.Parts.forEach(item => {
        console.log(item.autopercent)
        if (!Object.hasOwn(item, 'percent')) sum = sum + Number(item.autopercent)
        else sum = sum + (item.percent ? 0 : Number(item.autopercent))
        
      })

      return sum;
    },

    totalPercent() {
      return this.Parts.reduce((acc, item) => {
        return item.percent
          ? +item.percent + acc
          : item.autopercent
            ? +item.autopercent + acc
            : 0 + acc
      }, 0)
    },

    closePartsDialog() {
      this.dialogParts = false
      this.localLoading = false
      this.showSaveBtn = false
      this.donorsParts = null

      if (!this.Parts.length) this.Parts = [...this.tempParts]
      else this.Parts = this.Parts.filter(item => item.id)

      this.percentCalculate()
    },

    setIdNameTypeArtPN(item) {
      return `(${item.marketid}) [${item.marketART || 'нет'}, ${item.marketCOND || 'нет'}, ${item.marketSUPPLIER || 'нет'}] ${item.marketNAME} (${item.marketPN})`
    },

    preview() {
      this.dialogParts = false
      this.localLoading = false
      this.showSaveBtn = true

      this.percentCalculate()
    },

    checkRange(v, from, upto) {
      if (v < from || +v > upto) return 'Внимание, выход за пределы диапазона'
      else return true
    },

    percentCalculate() {

      const sum = this.Parts.reduce((acc, item) => {
        return item.percent
          ? item.percent
          : !item.zipratio_from
            ? 0 + acc
            : ((item.zipratio_from + item.zipratio_upto) / 2) + acc
      }, 0)

      this.Parts.forEach(item => {
        item.id
          ? item.isRANGE
            ? item.autopercent = Number(((((item.zipratio_from + item.zipratio_upto)/2)*100)/sum).toFixed(2))
            : item.autopercent = 0
          : !item.zipratio_from
            ? item.autopercent = 0
            : item.autopercent = Number(((((item.zipratio_from + item.zipratio_upto)/2)*100)/sum).toFixed(2))
      })

      const ratio = (100 - this.manualTotalPercent()) / this.autoTotalPercent();

      this.Parts.forEach(item => {
        if (!item.percent) {
          console.log('да')
          item.autopercent = Number((item.autopercent * ratio).toFixed(2));
        }
      })
    },

    showDeleteButton(item) {
      if (!this.showSaveBtn) return true
      return (this.showSaveBtn && !item.id)
    },

    async saveParts() {
      this.loading = true

      add([this.id, this.Parts])
        .then(res => {
          this.Parts = this.PartsId = [...res]
          this.Parts.forEach(item => {
            if (!item.zipratio_from && !item.zipratio_upto) {
              item.zipratio_from = 0
              item.zipratio_upto = 100
            }
          })
          this.percentCalculate()
          this.$store.dispatch('setData', 'Данные успешно сохранены')

          this.localLoading = false
          this.loading = false
          this.showSaveBtn = false
        })
    },

    copyParts() {
      this.dialogParts = true
      this.formTitleParts = 'Копирование состава'
    },

    async approveParts() {
      const data = {

        id: this.id,
        user: this.jiraUsers.find(user => user.email === this.currentUser.email)

      }

      const percents = this.Parts.map(item => {
        return { id: item.id, percent: item.percent || item.autopercent }
      })

      await this.$confirm('Вы уверены? Продолжаем?', 'ВНИМАНИЕ!', {
        confirmButtonText: 'Да',
        cancelButtonText: 'Нет',
        type: 'warning'
      })
        .then(() => {
          approve(data)
            .then(res => {
              if (res.affectedRows > 0) {
                percents.forEach(obj => {
                  add_percents({ id: obj.id, percent: obj.percent })
                })

                this.positionDetailed.Approved = 1
                this.positionDetailed.Approve_Person = this.jiraUsers.find(user => user.email === this.currentUser.email).display_name
                this.positionDetailed.Approve_Date = new Date()
              }
            })
        })
        .catch(e => console.log(e))
    },

    async disapproveParts() {
      const data = {

        id: this.id,
        user: this.jiraUsers.find(user => user.email === this.currentUser.email)

      }

      await this.$confirm('Вы уверены? Продолжаем?', 'ВНИМАНИЕ!', {
        confirmButtonText: 'Да',
        cancelButtonText: 'Нет',
        type: 'warning'
      })
        .then(() => {
          disapprove(data)
            .then(res => {
              if (res.affectedRows > 0) {
                this.positionDetailed.Approved = 2
                this.positionDetailed.Approve_Person = this.jiraUsers.find(user => user.email === this.currentUser.email).display_name
                this.positionDetailed.Approve_Date = new Date()
              }
            })
        })
    },

    deleteItemParts(item) {
      if (!item.id) {
        const index = this.Parts.indexOf(item)
        this.Parts.splice(index, 1)
        this.percentCalculate()
        this.Parts.find(part => !part.id) ? this.showSaveBtn = true : this.showSaveBtn = false
        return false
      }

      if (confirm('Вы действительно хотите удалить эту составную часть?')) {
        const index = this.Parts.indexOf(item)
        this.loading = false

        remove([item.id])
          .then(() => {
            this.loading = false
            this.Parts.splice(index, 1)
            this.percentCalculate()
            this.$store.commit('setData', 'Составная часть c id ' + item.id + ' успешно удалена')
          })
      }
    },

    addPercents(id, percent) {
      if (this.$refs.percent.validate()) {
        this.loading = true

        add_percents({ id, percent })
          .then(async res => {
            if (res.affectedRows > 0) {
              // await this.getTotalPercents({ id: this.id })
              this.percentCalculate()
              this.$store.dispatch('setData', 'Процент успешно установлен.')
            } else {
              this.$store.dispatch('setError', 'Произошла ошибка при добавлении %. Обратитесь к администратору системы')
            }
            this.loading = false
          })
      } else {
        this.$store.commit('setError', 'Установленный процент не соответвует данному диапазону!')
      }
    },

    cancelAdd() {
      this.$store.commit('setError', 'Установленный процент не соответвует данному диапазону, данные не сохранены!')
    },

    removePercents(id) {
      this.loading = true

      remove_percents({ id })
        .then(async res => {
          if (res.affectedRows > 0) {
            const item = this.Parts.find(item => item.id === id)
            item.percent = null
            this.percentCalculate()
            // await this.getTotalPercents({ id: this.id })
            this.$store.dispatch('setData', 'Процент успешно удалён.')
          } else {
            this.$store.dispatch('setError', 'Произошла ошибка при удалении %. Обратитесь к администратору системы')
          }
          this.loading = false
        })
    }

  }

}

</script>

<style lang="scss" scoped>
</style>
