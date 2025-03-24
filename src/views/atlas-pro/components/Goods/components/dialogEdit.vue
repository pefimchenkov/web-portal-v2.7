<template>
  <el-row type="flex" justify="center" align="middle">
    <el-dialog
      v-loading="loading"
      :visible.sync="visible_"
      :close-on-click-modal="false"
      width="80%"
      top="5vh"
      title="Добавление операции"
      center
      @close="$emit('close')"
    >
      <el-card shadow="never">
        <v-card-title>
          <span class="headline">{{ articul_ }}</span>
        </v-card-title>

        <v-container>
          <v-row align="center" justify="center">
            <v-col cols="12">
              <v-text-field
                ref="name"
                v-model="name_"
                required
                validate
                :rules="reqRules"
                label="Имя *"
                outlined
                dense
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                ref="pn"
                v-model="partNum_"
                required
                validate
                :rules="reqRules"
                label="PN *"
                outlined
                dense
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                ref="codeZip"
                v-model="codeZip_"
                required
                validate
                :rules="marketRules"
                label="Код ЗИП (Маркет ID) *"
                outlined
                dense
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                ref="artTSD"
                v-model="artTSD_"
                validate
                label="Артикул ТСД"
                outlined
                dense
              />
            </v-col>
            <v-col cols="12">
              <el-row type="flex" :gutter="10">
                <el-col>
                  <h4 class="mb-3">Склад СЦ</h4>
                  <v-combobox
                    v-model="adresses_service_"
                    label="Адреса **"
                    chips
                    multiple
                    append-icon=""
                    outlined
                  >
                    <template v-slot:selection="{ attrs, item, select, selected }">
                      <v-chip
                        small
                        v-bind="attrs"
                        :input-value="selected"
                        close
                        :disabled="disabledService(item)"
                        @click="select"
                        @click:close="removeFromAdesessService(item)"
                      >
                        {{ item }}
                      </v-chip>
                    </template>
                  </v-combobox>
                </el-col>
                <el-col>
                  <h4 class="mb-3">Склад отдела продаж</h4>
                  <v-combobox
                    v-model="adresses_sale_"
                    label="Адреса **"
                    chips
                    multiple
                    append-icon=""
                    outlined
                  >
                    <template v-slot:selection="{ attrs, item, select, selected }">
                      <v-chip
                        small
                        v-bind="attrs"
                        :input-value="selected"
                        close
                        :disabled="disabledSale(item)"
                        @click="select"
                        @click:close="removeFromAdesessSale(item)"
                      >
                        {{ item }}
                      </v-chip>
                    </template>
                  </v-combobox>
                </el-col>
                <el-col>
                  <h4 class="mb-3">Склад производство</h4>
                  <v-combobox
                    v-model="adresses_repair_"
                    label="Адреса **"
                    chips
                    multiple
                    append-icon=""
                    outlined
                  >
                    <template v-slot:selection="{ attrs, item, select, selected }">
                      <v-chip
                        small
                        v-bind="attrs"
                        :input-value="selected"
                        close
                        :disabled="disabledRepair(item)"
                        @click="select"
                        @click:close="removeFromAdesessRepair(item)"
                      >
                        {{ item }}
                      </v-chip>
                    </template>
                  </v-combobox>
                </el-col>
              </el-row>
            </v-col>
          </v-row>
        </v-container>
        <small style="display: block">* обязательные к заполнению</small>
        <small style="display: block">** - Добавляя адрес, не забудьте зафиксировать его клавишей "Enter" </small>

        <el-row class="my-3 text-center"
          ><el-button
            type="success"
            plain
            @click="save(articul_, partNum_, codeZip_, name_, artTSD_, adresses_service_, adresses_sale_, adresses_repair_)"
            >Сохранить</el-button
          ></el-row
        >
      </el-card></el-dialog
    >
  </el-row>
</template>

<script>
// import axios from "axios";

import { updateAtlasGoods } from '@/api/1c/atlas_1c'

export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      default: null,
    },
    partNum: {
      type: String,
      default: null,
    },
    artTSD: {
      type: String,
      default: null,
    },
    codeZip: {
      type: String,
      default: null,
    },
    adresses_service: {
      type: Array,
      default: () => [],
    },
    adresses_sale: {
      type: Array,
      default: () => [],
    },
    adresses_repair: {
      type: Array,
      default: () => [],
    },
    articul: {
      type: String,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      visible_: false,
      name_: null,
      partNum_: null,
      artTSD_: null,
      codeZip_: null,
      adresses_service_: [],
      adresses_sale_: [],
      adresses_repair_: [],
      articul_: null,
      loading: false,

      reqRules: [(v) => !!v || "обязательный параметр!"],

      marketRules: [
        (v) => {
          if (v || this.isDeleted) return true;
          else return "обязательный параметр!";
        },
        (v) => {
          if (v === undefined || v === "" || v === null) return true;
          else return /^[0-9]{1,6}$/.test(v) || "Правильно: До 6 цифр!";
        },
      ],
    };
  },

  watch: {
    visible(val) {
      this.visible_ = val;
    },

    name(val) {
      this.name_ = val;
    },

    codeZip(val) {
      this.codeZip_ = val;
    },

    adresses_service(val) {
      this.adresses_service_ = val.map(i => i.adress);
    },

    adresses_sale(val) {
      this.adresses_sale_ = val.map(i => i.adress);
    },

    adresses_repair(val) {
      this.adresses_repair_ = val.map(i => i.adress);
    },

    partNum(val) {
      this.partNum_ = val;
    },

    artTSD(val) {
      this.artTSD_ = val;
    },

    articul(val) {
      this.articul_ = val;
    },

    adresses_service_(val) {
      const not_editable_adresses = this.adresses_service.filter(i => !i.autoUpdated).map(i => i.adress)
      not_editable_adresses.forEach(el => {
        if (!val.includes(el)) this.adresses_service_.push(el)
      })
    },

    adresses_sale_(val) {
      const not_editable_adresses = this.adresses_sale.filter(i => !i.autoUpdated).map(i => i.adress)
      not_editable_adresses.forEach(el => {
        if (!val.includes(el)) this.adresses_sale_.push(el)
      })
    },

    adresses_repair_(val) {
      const not_editable_adresses = this.adresses_repair.filter(i => !i.autoUpdated).map(i => i.adress) 
      not_editable_adresses.forEach(el => {
        if (!val.includes(el)) this.adresses_repair_.push(el)
      })
    }
  },

  methods: {
    save(id, pn, codeZip = null, name, artTSD, adresses_service, adresses_sale, adresses_repair) {
      this.loading = true
      let new_adresses_service = []
      let new_adresses_sale = []
      let new_adresses_repair = []

      if (this.$refs.name.validate() && this.$refs.pn.validate() && this.$refs.codeZip.validate() && this.$refs.artTSD.validate()) {

        const not_editable_adresses_service = this.adresses_service.filter(i => !i.autoUpdated).map(i => i.adress)
        const not_editable_adresses_sale = this.adresses_sale.filter(i => !i.autoUpdated).map(i => i.adress)
        const not_editable_adresses_repair = this.adresses_repair.filter(i => !i.autoUpdated).map(i => i.adress)

        adresses_service.forEach(a => {
          if (not_editable_adresses_service.includes(a)) return
          new_adresses_service.push({ adress: a, autoUpdated: true, warehouse: 'd494caa5-c02d-11ea-80da-0cc47a1243f5' })
        })

        adresses_sale.forEach(a => {
          if (not_editable_adresses_sale.includes(a)) return
          new_adresses_sale.push({ adress: a, autoUpdated: true, warehouse: 'a4b55d3a-49e8-11ea-826d-001dd8b72066' })
        })

        adresses_repair.forEach(a => {
          if (not_editable_adresses_repair.includes(a)) return
          new_adresses_repair.push({ adress: a, autoUpdated: true, warehouse: '7b044cba-3d4f-11ea-8265-001dd8b72066' })
        })
      
        const data = {
          articul: id,
          codeZip: codeZip,
          partNum: pn,
          ShortName: name,
          artTSD: artTSD,
          adresses: [ ...new_adresses_service, ...new_adresses_sale, ...new_adresses_repair ],
        };

        console.log(data)

        updateAtlasGoods(data)
          .then(res => {
            if (res.data === "ОК") {
              this.$notify({ type: "success", message: "Данные успешно обновлены!" })
              setTimeout(() => {
                this.$emit('close')
                this.$emit('update', data)
              }, 1000)
            }
            /* const all_asresses = [
              ...data.adresses,
              ...not_editable_adresses_service.map(a => ({ adress: a, autoUpdated: false })),
              ...not_editable_adresses_sale.map(a => ({ adress: a, autoUpdated: false })),
              ...not_editable_adresses_repair.map(a => ({ adress: a, autoUpdated: false }))
          ]
            data.adresses = all_asresses */
          })
          .catch(err => {
            console.log(err)
            return this.$store.commit("setError", err.message);
          })
          .finally(() => this.loading = false)

      } else {
        return this.$store.commit("setError", "Не заполнены необходимые поля!");
      }
    },

    removeFromAdesessService(item) {
      this.adresses_service_ = this.adresses_service_.filter(i => i !== item)
    },
    removeFromAdesessSale(item) {
      this.adresses_sale_ = this.adresses_sale_.filter(i => i !== item)
    },
    removeFromAdesessRepair(item) {
      this.adresses_repair_ = this.adresses_repair_.filter(i => i !== item)
    },
    disabledService(item) {
      const el = this.adresses_service.find(i => i.adress === item)
      if (!el) return false
      return !el?.autoUpdated
    },
    disabledSale(item) {
      const el = this.adresses_sale.find(i => i.adress === item)
      if (!el) return false
      return !el?.autoUpdated
    },
    disabledRepair(item) {
      const el = this.adresses_repair.find(i => i.adress === item)
      if (!el) return false
      return !el?.autoUpdated
    },
  },
};
</script>
