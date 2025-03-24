
<template>
  <div>
    <Confirm ref="confirm" />

    <!-- Диалог добавления / редактирования -->

    <el-dialog
      :title="label"
      :visible.sync="dialog"
      width="50%"
      :close-on-click-modal="false"
      @close="close"
    >
      <v-text-field
          ref="name"
          v-model="name"
          label="* Наименование"
          validation
          outlined
          dense
          :rules="reqRules"
          required
        />
      <v-autocomplete
          ref="form"
          v-model="form"
          :items="Forms"
          label="* Правовая форма"
          required
          outlined
          dense
          :rules="reqRules"
          validation
          return-object
          item-text="name"
        />
        <v-text-field
          ref="code1c"
          v-model="code1c"
          label="* Код по 1с"
          validation
          outlined
          dense
          :rules="artRules"
          required
        />
        <el-select
          ref="articulAtlas"
          v-model="articulAtlas"
          placeholder="Артикул Атлас"
          clearable
          autocomplete
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="item in contractorsAtlas"
            :key="item.name"
            :label="item.contractor + ' (р.с: ' + item.accountNum + ')' + ' [инн: ' + item.contractorInn + ']'"
            :value="item.id"
          ></el-option>
        </el-select>

      <span slot="footer" class="dialog-footer">
        <el-button type="info" plain @click="close"> Очистить </el-button>
          <el-button
            type="success"
            plain
            :disabled="localloading"
            :loading="localloading"
            @click.native="save"
          >
            Сохранить
          </el-button>
      </span>
    </el-dialog>

    <el-card>
      <div slot="header" class="title">
        <span>Юрлица</span>
        <el-button class="mx-2" type="primary" size="mini" @click="open(null)">
          <i class="el-icon-plus"></i>
        </el-button>
      </div>
      <el-row
        v-for="(item, index) in legpers"
        :key="index"
        class="text item"
        type="flex"
      >
        <el-col style="max-width: 50px">{{ item.id }}</el-col>
        <el-col v-if="item.form  && item.just_name">{{ item.form + " «" + item.just_name + "»" }}</el-col>
        <el-col v-else>{{ item.name }}</el-col>
        <el-col style="max-width: 100px">{{ item.id_1c }}</el-col>
        <el-col>{{ item["1c_atlas_id"] }}</el-col>
        <el-col style="display: flex; justify-content: space-between; max-width: 70px; align-items: center;" class="ml-3">
          <i
            class="el-icon-edit cursor-btn"
            @click="open(item)"
            >
          </i>
          <i
            class="el-icon-delete cursor-btn"
            @click="del(item)"
            >
          </i>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import Confirm from "@/components/shared/Confirm";
import { validCode1C } from "@/utils/validate";
export default {
  components: {
    Confirm,
  },
  // eslint-disable-next-line vue/require-prop-types
  props: ["legpers", "id", "clientName"],
  data() {
    return {
      dialog: false,
      localloading: false,
      name: "",
      legpersID: null,
      contractorsAtlas: [],
      form: {},
      code1c: "",
      articulAtlas: "",
      label: "",
      editedIndex: -1,
      artRules: [
        (v) => !!v || "Обязательный параметр!",
        (v) => validCode1C(v) || "Правильно: Буквы ` КА ` кириллицей и от 8 до 11 цифр!",
      ],
      reqRules: [(v) => !!v || "Обязательный параметр!"],
      Forms: [
        { id: 1, name: "ООО" },
        { id: 2, name: "ЗАО" },
        { id: 3, name: "АО" },
        { id: 4, name: "ИП" },
        { id: 5, name: "ОАО" },
        { id: 6, name: "Филиал" },
        { id: 7, name: "ПАО" },
        { id: 8, name: "Обособленное подразделение" },
        { id: 9, name: "ФГУП" },
        { id: 10, name: "ФЧКОО" },
        { id: 11, name: "ТОО" },
        { id: 12, name: "ОСГ" },
        { id: 13, name: "УК" },
        { id: 14, name: "НАО" },
        { id: 15, name: "ФГБУ" },
        { id: 16, name: "АНОО" },
        { id: 17, name: "СК" },
        { id: 18, name: "ТД" },
      ],
    };
  },

  created() {
    this.getContractors();
  },

  watch: {
    articulAtlas(val) {
      console.log(val);
    },
  },

  methods: {
    async getContractors() {
      this.contractorsAtlas = await this.$store.dispatch("atlas_1c/getAtlasContractors");

      // console.log('this.contractorsAtlas', this.contractorsAtlas)
    },

    open(item) {
      if (item) {
        console.log(this.legpers);
        this.editedIndex = this.legpers.indexOf(item);
        console.log(this.editedIndex);

        this.name = item.just_name;
        this.form = this.Forms.find((obj) => obj.name === item.form);
        this.code1c = item.id_1c;
        this.articulAtlas = this.legpers[this.editedIndex]["1c_atlas_id"];
        this.legpersID = item.id;
        this.label = "Редактирование: «Юрлица»";
      } else {
        this.label = "Добавление: «Юрлица»";
      }
      this.dialog = true;
    },





    save() {
      const fullName = this.form.name + " «" + this.name + "»";
      const item = this.legpers[this.editedIndex];

      console.log('item', item)

      if (
        this.$refs.name.validate() &&
        this.$refs.form.validate() &&
        this.$refs.code1c.validate()
      ) {
        if (this.editedIndex === -1) {
          this.$store
            .dispatch("addLegPers", {
              id: this.id,
              clientName: this.clientName,
              justName: this.name,
              form: this.form,
              fullName: fullName,
              code1c: this.code1c,
              atlas_id: this.articulAtlas,
            })
            .then(() => {
              this.$store.commit("setData", "Юрлицо успешно добавлено.");
              
              item.id_1c = this.code1c;
              item.name = this.form.name + " «" + this.name + "»";
              item["1c_atlas_id"] = this.articulAtlas;
              this.close();
            });
        } else {
          this.$store
            .dispatch("updateLegPers", {
              id: this.legpersID,
              clientID: this.id,
              justName: this.name,
              form: this.form,
              fullName: fullName,
              code1c: this.code1c,
              atlas_id: this.articulAtlas,
            })
            .then(() => {
              this.$store.commit("setData", "Юрлицо успешно обновлено.");

              item.id_1c = this.code1c;
              item.name = this.form.name + " «" + this.name + "»";
              item["1c_atlas_id"] = this.articulAtlas;
              this.close();
              this.dialog = false;
            });
        }
      } else {
        this.$store.commit("setError", "Заполните требуемые поля!");
      }
    },





    async del(item) {
      if (
        await this.$refs.confirm.open("Удаление", "Вы уверены?", {
          color: "red",
        })
      ) {
        this.$store.dispatch("deleteLegPers", { id: item.id }).then(() => {
          this.$store.commit("setData", "Данные успешно удалены.");
        });
      } else {
        this.$store.commit("setInfo", "Удаление отменено.");
      }
    },

    close() {
      this.name = null;
      this.form = {};
      this.code1c = null;
      this.articulAtlas = null;
      this.editedIndex = -1;
    },

  },
};
</script>

<style lang="scss" scoped>
.cursor-btn {
    border: 1px solid #c1bcbc;
    border-radius: 5px;
    padding: 5px;
    position: relative;
    top: -3px;
    cursor: pointer;
}

.text {
  font-size: 14px;
}

.item {
  margin-bottom: 20px;
}

.title {
  display: flex;
  justify-content: space-between;
}

.box-card {
  max-width: 690px;
}
</style>
