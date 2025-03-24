<template>
  <div>
    <el-card class="board">
      <el-steps :active="active" finish-status="wait" align-center>
        <el-step title="Выбор партии и перенос ремонтов" />
        <el-step title="Редактирование данных" />
        <el-step :status="alert.status" title="Подтверждение" />
      </el-steps>

      <!-- ВЫБОР ПАРТИИ -->
      <el-row v-if="active === 0" class="box-card">
        <el-col :span="24">
          <el-select
            v-model="parcel"
            placeholder="Выберите партию"
            style="width: 100% !important"
            clearable
            autocomplete
            filterable
          >
            <el-option
              v-for="item in parcels"
              :key="item.ID"
              :label="combineParcelName(item)"
              :value="item.ID"
            >
              <span style="color: #8492a6; font-size: 13px">{{ combineParcelName(item) }}</span>
            </el-option>
          </el-select>
        </el-col>
      </el-row>

      <!-- РЕДАКТИРОВАНИЕ ДАННЫХ -->
      <el-row
        v-if="(active === 1 || active === 2)"
        v-loading="loading"
        class="box-card"
        :gutter="12"
      >
        <el-col :span="24" class="pa-2">
          <label class="grey--text">Тема <span class="error--text">*</span></label>
          <el-input
            v-model="summary"
            :disabled="active === 2"
          />
        </el-col>
        <el-col :span="24" class="pa-2">
          <label class="grey--text">Описание <span class="error--text">*</span></label>
          <el-input
            v-model="description"
            :disabled="active === 2"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 15}"
          />
        </el-col>
      </el-row>

      <div v-if="!summary && !description && active === 2" class="red--text text-center pb-5">* Не заполнены обязательные поля!</div>

      <!-- СТАКАНЫ -->
      <div class="components-container board">
        <Kanban
          v-if="active === 0"
          :key="1"
          :list="old_repairs"
          :group="group"
          class="kanban todo"
          :header-text="`Отгрузка`"
        />
        <Kanban
          v-if="active === 0 || active === 2"
          :key="2"
          :list="new_repairs"
          :group="group"
          class="kanban done"
          :header-text="`Остаётся в ремонте`"
        />
      </div>

      <!-- ПАНЕЛЬ ДЕЙСТВИЙ -->
      <div class="text-center">
        <el-button
          v-if="active !== 0"
          :disabled="loading"
          plain
          type="warning"
          @click="active--"
        >Назад
        </el-button>
        <el-button
          v-if="active <= 1"
          :disabled="(new_repairs.length === 0 || old_repairs.length === 0 || loading)"
          plain
          type="primary"
          @click="active++"
        >Дальше
        </el-button>
        <el-button
          v-if="(summary && description && active === 2)"
          :disabled="loading"
          plain
          type="success"
          @click="divideParcel()"
        >Подтвердить
        </el-button>
        <el-button
          v-if="(((old_repairs.length > 0 && new_repairs.length === 0) && active < 1))"
          :disabled="loading"
          plain
          type="success"
          @click="moveAllUsedParts()"
        >{{ `Автоперенос >> *` }}
        </el-button>
        <el-button
          v-if="((old_repairs.find(i => i.checked) && active < 1))"
          :disabled="loading"
          plain
          type="success"
          @click="moveAllCheckedParts()"
        >{{ `Перенос выбранных >> *` }}
        </el-button>
        <el-button
          v-if="(new_repairs.length > 0 && active < 1)"
          :disabled="loading"
          plain
          type="warning"
          @click="resetKanban()"
        >{{ `Сбросить` }}
        </el-button>
      </div>

      <!-- ФИНИШ -->
      <div v-loading="loading && active >= 3" class="pa-5">
        <el-alert
          v-show="!loading"
          v-if="active >= 3"
          :title="alert.type === 'success' ? `Новая партия ${alert.description} успешно создана. Количество привязанных к этой партии ремонтов - ${alert.remontCount}` : `Ошибка при создании новой партии!`"
          :type="alert.type"
          :description="alert.type === 'success'
            ? `ВНИМАНИЕ! ВЫ ПЕРЕНАПРЛЯЕТЕСЬ В JIRA ДЛЯ ДАЛЬНЕЙШЕЙ РАБОТЫ С ЭТОЙ ПАРТИЕЙ`
            : alert.description"
          show-icon
          effect="dark"
          class="ma-5"
          style="width: auto;"
          @close="reset"
        />
        <pre>
          {{ LOG }}
        </pre>
      </div>
      <div class="px-7"><span class="blue--text">*</span> - В новую партию автоматически переносятся всё нескомплектованные ремонты. </div>

    </el-card>
  </div>

</template>
<script>

// import Sticky from '@/components/Sticky'
import settings from '@/settings'
import { get, getRepairsByParcel, getAllRepairs, getUsedParts, getParcelData, divideParcel } from '@/api/repairs/parcels'

export default {

  _SETTINGS: settings,
  name: 'DragKanban',
  components: { Kanban: () => import('@/components/Kanban') },

  data() {
    return {

      active: 0,
      parcel: '',
      summary: '',
      description: '',
      loading: false,
      parcels: [],
      old_repairs: [],
      new_repairs: [],
      used_parts: [],
      fieldsClone: null,
      fieldsUpdate: null,
      moved: false,

      alert: {
        type: null,
        description: null,
        status: null
      },
      LOG: null,
      group: 'repairs'

    }
  },

  computed: {

    selectedParcel() {
      return this.parcels.find(i => i.ID === this.parcel)
    },
    key() {
      return this.parcels.find(i => i.ID === this.parcel).ISSUEKEY
    },
    id() {
      return this.parcels.find(i => i.ID === this.parcel).ID
    },
    status() {
      return this.parcels.find(i => i.ID === this.parcel).STATUS
    },
    createScreenId() {
      return this.parcels.find(i => i.ID === this.parcel).FIELDSCREENCREATE
    },
    updateScreenId() {
      return this.parcels.find(i => i.ID === this.parcel).FIELDSCREENUPDATE
    }

  },

  watch: {

    '$route.query.parcel': {

      immediate: true,
      async handler(val) {
        if (val) {
          this.parcel = +val
          await this.combainDataOperatios()
        }
      }

    },

    parcel(n, o) {
      if (n !== o) {
        this.new_repairs = []
        this.old_repairs = []
        this.used_parts = []
        this.height = 'auto'
        this.combainDataOperatios()
      }
    },

    active(val) {
      if (val === 1) {
        this.loading = true

        getParcelData({ key: this.key, createScreenId: this.createScreenId, updateScreenId: this.updateScreenId })
          .then(res => {
            this.summary = res.dataForCreate.summary
            this.description = res.dataForCreate.description
            this.fieldsClone = { ...res.dataForCreate }
            this.fieldsUpdate = { ...res.dataForUpdate }
            setTimeout(() => {
              this.loading = false
            }, 1000)
          })
      }
    },

    new_repairs: {
      deep: true,
      handler(val) {
        val.forEach(e => {
          e.checked = true
        })
      }
    }

  },

  async created() {
    await this.getParcels()
  },

  methods: {

    divideParcel() {
      this.loading = true
      this.active++

      this.fieldsClone.summary = this.summary
      this.fieldsClone.description = this.description

      const forCreate = {

        fields: {
          project: {
            id: '14800' // this.selectedParcel.project
          },
          issuetype: {
            id: this.selectedParcel.issuetype
          },
          ...this.fieldsClone
        }

      }
      const forUpdate = {

        fields: {
          ... this.fieldsUpdate
        }

      }

      divideParcel({
        forCreate,
        forUpdate,
        repairs: this.new_repairs,
        key: this.key,
        id: this.id,
        status: this.status
      })
        .then(res => {
          this.LOG = { ...res }

          this.alert.description = res.createdIssue.key
          this.alert.type = 'success'
          this.alert.status = 'success'
          this.alert.remontCount = res.changedParent.length

          if (res && res.createdIssue && res.createdIssue.key) {
            setTimeout(() => {
              window.location.href = this.$options._SETTINGS.jira_url + res.createdIssue.key
            }, 3000)
          }
        })
        .catch(e => {
          this.alert.type = 'error'
          this.alert.status = 'error'
          if (e && e.data && e.data.message) this.alert.description = typeof (e.data.message) === 'object' ? e.data.message : e.data.message.message
        })

      setTimeout(() => {
        this.active++
        this.loading = false
      }, 1000)
    },

    async combainDataOperatios() {
      await this.getRepairs()
      await this.getUsedParts()
      await this.markAsUsed()
    },

    getParcels() {
      get()
        .then(res => {
          this.parcels = [...res]
        })
    },

    async getRepairs() {
      const all = await getAllRepairs({ id: this.parcel })
      return new Promise((resolve) => {
        return getRepairsByParcel({ id: this.parcel })
          .then(res => {

            console.log('REPAIRS', res)

            this.old_repairs = this.xformRemonts([...res])
            const empty = all.filter(i => (!this.old_repairs.find(j => j.Remont === i.Remont)))

            empty.forEach(i => {
              this.old_repairs.push({ Remont: i.Remont, group: [] })
            })

            resolve()
          })
      })
    },

    getUsedParts() {
      return new Promise((resolve) => {
        return getUsedParts({ id: this.parcel })
          .then(res => {
            this.used_parts = this.xformParts([...res])
            resolve()
          })
      })
    },

    xformRemonts(data) {
      for (let i = 0; i < data.length; i++) {
        data[i].marked = 1
      }

      const allRemont = data.map(el => el.Remont)
      const count = v => data.filter(i => i.Remont === v)
      const getStatus = v => [...new Set(count(v).map(i => i.istatus))]
      const uniq = [...new Set(allRemont)]
      return uniq.map(v => ({ Remont: v, status: getStatus(v), checked: false, group: count(v) }))
    },

    xformParts(data) {
      const res = []
      const moreThenOneQty = data.filter(i => i.qty > 1)
      const onlyOneQty = data.filter(i => i.qty === 1)

      moreThenOneQty.forEach(element => {
        for (let i = 1; i <= element.qty; i++) {
          res.push(element)
        }
      })

      res.forEach(i => (i.qty = 1))
      return [...res, ...onlyOneQty]
    },

    markAsUsed() {
      return new Promise((resolve) => {
        this.used_parts.forEach(part => {
          return this.old_repairs.some(repair => {
            return repair.group.some(item => {
              if ((item.id === part.market_id) && item.marked === 1) return (item.marked = 2)
              if (item.Class_ID === 7) return (item.marked = 0)
            })
          })
        })

        resolve()
      })
    },

    moveAllUsedParts() {
      this.new_repairs = this.old_repairs.filter(item => (item.group.some(i => i.marked === 1)) || item.group.length === 0)
      this.old_repairs = this.old_repairs.filter(item => item.group.find(i => i.marked) && (item.group.every(i => i.marked === 2) || item.group.every(i => i.marked === 0) || (item.group.every(i => i.marked === 2 || i.marked === 0))))
    },

    moveAllCheckedParts() {
      this.new_repairs = [...this.new_repairs, ...this.old_repairs.filter(i => i.checked)]
      this.old_repairs = this.old_repairs.filter(i => !i.checked)
    },

    resetKanban() {
      this.old_repairs = [...this.old_repairs, ...this.new_repairs]
      this.old_repairs.forEach((item, i) => (this.old_repairs[i].checked = false))
      this.new_repairs = []
    },

    combineParcelName(item) {
      return item.ISSUEKEY + ' - ' + item.NOMER + ' - ' + item.TYPE + ' (' + item.STATUS + ')' + ' - счёт: ' + (item.SCHET || 'нет') + ' [' + item.QTY + ' шт]'
    },

    reset() {
      this.loading = true

      setTimeout(() => {
        this.active = 0
        this.parcel = null
        this.summary = ''
        this.description = ''
        this.alert = {}
        this.LOG = null
        this.loading = false
      }, 1000)
    }

  }

}
</script>

<style lang="scss">

  .box-card {
    max-width: 970px;
    min-width: 570px;
    margin: 10px auto;
    padding: 10px;
    // margin: 10px;
  }
  .board {
    width: 1000px;
    min-width: 600px;
    margin: 20px auto;
    display: flex;
    justify-content: space-around;
    flex-direction: row;
    align-items: flex-start;
  }
.kanban {
  &.todo {
    .board-column-header {
      background-color: #358635  !important;
    }
  }
  &.done {
    .board-column-header {
      background: #c62626 !important;
    }
  }
}
</style>
