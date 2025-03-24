<!-- eslint-disable vue/no-v-text-v-html-on-component -->
<template>
  <div>

    <el-card v-if="editable && readonly" v-loading="loading" class="mx-auto mt-3">

      <el-row type="flex" :gutter="20">
        <el-col :span="12">
          <el-table
            :data="firstPlans"
            stripe
            style="width: 100%">
            <el-table-column
              prop="name"
              label="Проект 1с"
              width="230"
            >
            </el-table-column>

            <el-table-column
              v-if="percent?.crm_id === 'client'"
              prop="retail"
              label="Процент"
            >
              <template slot-scope="{ row }">
                {{ row.retail }}
              </template>
            </el-table-column>

            <el-table-column
              v-if="percent?.crm_id === 'partner'"
              prop="partner"
              label="Процент"
            >
              <template slot-scope="{ row }">
                {{ row.partner }}
              </template>
            </el-table-column>
          </el-table>
        </el-col>

        <el-col :span="12">
          <el-table
            :data="secondPlans"
            stripe
            style="width: 100%">
            <el-table-column
              prop="name"
              label="Проект 1с"
              width="230"
            >
            </el-table-column>

            <el-table-column
              v-if="percent?.crm_id === 'client'"
              prop="retail"
              label="Процент"
            >
              <template slot-scope="{ row }">
                {{ row.retail }}
              </template>
            </el-table-column>

            <el-table-column
              v-if="percent?.crm_id === 'partner'"
              prop="partner"
              label="Процент"
            >
              <template slot-scope="{ row }">
                {{ row.partner }}
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>

      <el-row><el-col style="height: 42px"></el-col><el-col style="height: 42px"></el-col></el-row>

      <el-row type="flex" justify="center" align="middle"><!-- {{ percent }} -->
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
        </v-select>

        <el-button v-if="show" size="small" type="success" class="ml-2" @click.prevent="savePercent()">
          Сохранить
        </el-button>

      </el-row>

    </el-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { validNumber, validNumberWithPoint } from '@/utils/validate'

export default {

  components: {},


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
      loading: false,
      firstPlans: [],
      secondPlans: [],
      percent: {},
      show: false,

      numberRule: [
        v => validNumber(v) || 'Допускаются только цифры!'
      ],
      floatPointRule: [
        v => validNumberWithPoint(v) || 'Допускаются только цифры c плавающей точкой!'
      ],

      retail: [
        { id: 0, project: 'Ремонт', value: 50 },
        { id: 1, project: 'Аренда', value: 50 },
        { id: 2, project: 'Продажа (склад)', value: 50 },
        { id: 3, project: 'Продажа (новое)', value: 16 },
        { id: 4, project: 'Продажа (ЗИП)', value: 50 },
        { id: 5, project: 'Продажа (IT)', value: 10 },
        { id: 6, project: 'Сервисный контракт', value: 50 },
        { id: 7, project: 'Прочее', value: 10 }
      ],

      partner: [
        { id: 0, project: 'Ремонт', value: 35 },
        { id: 1, project: 'Аренда', value: 35 },
        { id: 2, project: 'Продажа (склад)', value: 35 },
        { id: 3, project: 'Продажа (новое)', value: 10 },
        { id: 4, project: 'Продажа (ЗИП)', value: 35 },
        { id: 5, project: 'Продажа (IT)', value: 10 },
        { id: 6, project: 'Сервисный контракт', value: 35 },
        { id: 7, project: 'Прочее', value: 10 }
      ],

    }
  },


  computed: {

    ...mapState({
      Projects: state => state.atlas_1c.getAtlasProjects.filter(item => item.name !== "Производство"),
      Users: state => state.jira.users,
    }),

    percents() {
      return this.$store.getters.percents.filter(item => item.crm_name !== null && item?.crm_id !== "dealer")
    },

  },


  async created() {
    if (!this.Projects?.length)
      await this.$store.dispatch('atlas_1c/getAtlasProjects');

    this.pause(1000)
    await this.$store.dispatch('fetchPercentCRM')
    this.percent = await this.$store.getters.percents.find(item => item?.crm_id === this.typecrm)

    const formattedProjects = this.Projects.map(item => {
      return {
        ...item,
        retail: this.retail.find(i => i.project === item.name)?.value,
        partner: this.partner.find(i => i.project === item.name)?.value,
      }
    })


    this.firstPlans = formattedProjects.slice(0, (this.Projects.length / 2))
    this.secondPlans = formattedProjects.slice(this.Projects.length / 2).reverse()


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



    async savePercent() {
      this.$confirm('Вы точно уверены?', 'Изменение типа процента')
        .then(() => {
          const payload = {
            id: this.id,
            type: this.percent?.crm_id,
            AIDC_SALE: this.percent.AIDC_SALE,
            AIDC_SALE_ZIP: this.percent.AIDC_SALE_ZIP,
            AIDC_SERV: this.percent.AIDC_SERV,
            IT: this.percent.IT
          }

          this.$store.dispatch('setPercent', payload)
          .then(res => {
            if (res.changedRows === 1) {
              this.$notify({ type: "success", message: "Тип процента успешно изменён." });
              this.$emit('updateCrmType', this.percent?.crm_id)
              this.show = false
            }
          })
        })
        .catch(err => console.log(err))

    },

  }
}
</script>

<style lang="scss" scoped>
</style>
