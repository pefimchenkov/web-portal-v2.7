<template>
  <div>
    <el-button
      icon="el-icon-plus"
      type="primary"
      @click="$emit('triggerDialog', true)"
    />

    <el-dialog
      :visible.sync="show"
      :show-close="false"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      destroy-on-close
      width="40%"
    >

      <div class="title text-center mb-5">{{ title }}</div>
      <el-row>
        <el-col :span="24" class="mb-5">
          <v-text-field
            ref="modelSN"
            v-model="item.Model"
            label="Модель *"
            :rules="textRules"
            hide-details
            outlined
            dense
            required
            validation
          />
        </el-col>

        <el-col :span="24" class="mb-5">
          <v-text-field
            ref="SN"
            v-model="item.SN"
            label="SN *"
            :rules="textRules"
            required
            outlined
            dense
            validation
          />
        </el-col>

        <el-col :span="24" class="mb-5">
          <v-text-field
            ref="contractSN"
            v-model="item.Contract"
            label="№ договора *"
            :rules="textRules"
            hide-details
            required
            outlined
            dense
            validation
          />
        </el-col>

        <el-col v-if="editedIndex === -1" :span="24" class="mb-5">
          <v-combobox
            ref="specSN"
            v-model="item.SPEC"
            :items="contracts"
            :item-text="IKEYPlusSumm"
            label="Спецификация *"
            hide-details
            required
            validation
            outlined
            dense
            :rules="textRules"
            clearable
            return-object
          />
        </el-col>

        <el-col :span="24" class="mb-5">
          <v-menu
            ref="menu"
            v-model="menu"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="290px"
          >
            <template #activator="{ on, attrs }">
              <v-text-field
                ref="enddateSN"
                v-model="item.ENDDATE"
                label="Срок окончания"
                prepend-icon="event"
                readonly
                v-bind="attrs"
                v-on="on"
              />
            </template>
            <v-date-picker v-model="item.ENDDATE" scrollable locale="ru" @input="menu = false" />
          </v-menu>
        </el-col>

        <el-col :span="24" class="mb-5">
          <v-text-field
            ref="tsdnSN"
            v-model="item.TSDN"
            hide-details
            outlined
            dense
            label="Дополнительная информация"
            validation
          />
        </el-col>

        <el-col :span="24" class="mb-5">
          <v-text-field
            ref="storySN"
            v-model="item.Store"
            label="Магазин"
            hide-details
            outlined
            dense
            validation
          />
        </el-col>

        <el-col :span="24" class="mb-5">
          <v-text-field
            ref="citySN"
            v-model="item.City"
            label="Город"
            hide-details
            outlined
            dense
            validation
          />
        </el-col>

      </el-row>

      <div class="text-center">
        <el-button @click.stop="close">Отмена</el-button>
        <el-button @click.stop="save">Сохранить</el-button>
      </div>

    </el-dialog>
  </div>
</template>

<script>
export default {

  props: {
    dialog: {
      type: Boolean,
      default: () => false
    },
    editedItem: {
      type: Object,
      default: () => {}
    },
    editedIndex: {
      type: Number,
      default: () => null
    },
    contracts: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: () => ''
    }
  },

  data() {
    return {
      show: false,
      menu: false,
      item: {},
      textRules: [v => !!v || 'Обязательный параметр!']
    }
  },

  watch: {
    dialog(val) {
      this.show = val
    },
    show(val) {
      if (val) this.item = { ...this.editedItem }
    }
  },

  methods: {

    isRequiredFieldsFilled() {
      return this.editedIndex === -1
        ? (this.$refs.modelSN.validate() && this.$refs.SN.validate() && this.$refs.enddateSN.validate() && this.$refs.specSN.validate() && this.$refs.contractSN.validate() && this.$refs.tsdnSN.validate())
        : (this.$refs.modelSN.validate() && this.$refs.SN.validate() && this.$refs.enddateSN.validate() && this.$refs.contractSN.validate() && this.$refs.tsdnSN.validate())
    },

    IKEYPlusSumm: item => item.ISSUEKEY + ' — ' + item.SUMMARY,

    close() {
      this.$emit('triggerDialog', false)
    },
    save() {
      if (this.isRequiredFieldsFilled()) this.$emit('save', this.item)
      else this.$message({ type: 'warning', message: 'Соответствующие поля не заполнены!' })
    }
  }

}
</script>

<style lang="scss" scoped>

.el-row {
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
  }

</style>
