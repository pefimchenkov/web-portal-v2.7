<template>
  <v-container v-loading="loading" :fill-height="loading">
    <!-- ДИАЛОГ ВЫПОЛНЕНИЯ -->

    <el-dialog :visible.sync="show">
      <v-card color="primary" dark>
        <v-card-text>
          Пожалуйста, дождитесь выполнения
          <v-progress-linear indeterminate color="white" class="mb-0" />
        </v-card-text>
      </v-card>
    </el-dialog>

    <el-row v-show="!loading" type="flex" justify="center" align="middle">
      <v-col xs="12" class="text-right pr-4">
        <el-button type="warning" @click="goBack()">Вернуться назад</el-button>
      </v-col>

      <v-col xs="12" class="text-left pl-4">
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="$acl.not.check('Edit')"
          @click.native="dialog = true"
        >
          Добавить
        </el-button>

        <el-dialog
          :visible.sync="dialog"
          :close-on-click-modal="false"
          :title="formText"
          center
        >
          <el-card class="pa-3" shadow="never">
            <v-text-field
              ref="nameTechProp"
              v-model="nameTechProp"
              class="ml-3"
              label="* Название"
              :rules="textRules"
              clearable
              outlined
              required
              validation
            />
            <v-combobox
              v-model="typeTechProp"
              class="ml-3"
              :items="AllTypes"
              item-text="name"
              label="Тип"
              return-object
              multiple
              autocomplete
              outlined
              small-chips
            >
              <template #selection="{ item, selected }">
                <v-chip
                  v-if="item === Object(item)"
                  :color="`blue lighten-3`"
                  label
                  :input-value="selected"
                >
                  <span class="pr-2">
                    {{ item.name }}
                  </span>
                  <v-icon small @click="deleteTechType(item, idTechProp)"
                    >close</v-icon
                  >
                </v-chip>
              </template>
            </v-combobox>
            <v-card-actions>
              <v-spacer />
              <el-button type="danger" plain @click="close()">
                Отменить
              </el-button>
              <el-button
                type="success"
                plain
                :disabled="localloading"
                :loading="localloading"
                @click.native="save()"
              >
                Сохранить
              </el-button>
            </v-card-actions>
          </el-card></el-dialog
        >
      </v-col>
    </el-row>

    <el-row type="flex" justify="center" align="middle">
      <v-col xs="12" offset-xs1 class="text-lg-right">
        <v-text-field
          v-model="search"
          class="mb-3"
          prepend-icon="search"
          label="Поиск"
          placeholder="Поиск"
          single-line
          clearable
        />
        <v-spacer />

        <v-data-table
          v-show="!loading"
          :headers="headers"
          :items="TechProperties"
          :search="search"
          show-expand
          :expanded.sync="expanded"
          :single-expand="true"
          item-key="id"
          :mobile-breakpoint="550"
          sort-by="id"
          sort-desc
          class="elevation-1"
          :footer-props="{
            itemsPerPageAllText: 'Все',
            itemsPerPageText: 'Строк на странице',
            itemsPerPageOptions: [25, 150, 250, -1],
            showFirstLastPage: true,
          }"
        >
          <template #[`item.types`]="{ item }">
            <v-chip
              v-if="item.types"
              color="success"
              label
              outlined
              @click="$acl.check('Edit') ? editItem(item) : false"
            >
              {{ item.types }}
            </v-chip>
          </template>
          <template #[`item.action`]="{ item }">
            <td class="justify-center layout">
              <v-icon
                small
                class="mr-2"
                :disabled="$acl.not.check('Edit')"
                @click="editItem(item)"
                >edit</v-icon
              >
              <v-icon
                small
                :disabled="$acl.not.check('Edit')"
                @click="deleteItem(item)"
                >delete</v-icon
              >
            </td>
          </template>

          <template #expanded-item="{ item }">
            <td :colspan="headers.length" class="text-left ma-5 pa-5">
              <v-chip
                v-for="obj in TPV(item)"
                :key="obj.id"
                class="ma-3 pa-3"
                color="primary"
                label
                outlined
              >
                <v-tooltip top>
                  <template #activator="{ on }">
                    <span
                      class="pr-1"
                      @click="$acl.check('Edit') ? editItemValue(obj) : false"
                      v-on="on"
                    >
                      <span class="px-1 mr-3 red white--text">
                        {{ obj.id }}</span
                      ><span>{{ obj.name }}</span>
                    </span>
                    <v-icon
                      v-if="$acl.check('Edit')"
                      small
                      @click="deleteItemValue(obj)"
                      >delete</v-icon
                    >
                  </template>
                  <span>Нажмите для редактирования</span>
                </v-tooltip>
              </v-chip>

              <v-btn
                    fab
                    x-small
                    color="primary"
                    dark
                    class="ml-5"
                    :disabled="$acl.not.check('Edit')"
                    @click="initItemValue()"
                  >
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>

              <el-dialog
                :visible.sync="dialogValue"
                :disabled="$acl.not.check('Edit')"
                close="handleClose"
              >

                <!-- Карточка добавления значения хар-ки -->
                <el-card>
                  <div slot="header">
                    <span>{{ formTextValue }}</span>
                    <span> {{ item.name }}</span>
                  </div>

                  <v-text-field
                    ref="nameTechPropValue"
                    v-model="nameTechPropValue"
                    class="ml-3"
                    label="введите значение"
                    :rules="textRules"
                    clearable
                    outlined
                    required
                    validation
                  />

                    <el-divider />
                    <div style="text-align: right">
                      <el-button
                      type="warning"
                      plain
                      @click="dialogValue = false"
                    >
                      Отменить
                    </el-button>
                    <el-button
                      type="success"
                      plain
                      :disabled="localloading"
                      :loading="localloading"
                      @click.native="saveValue(item.id, item.name)"
                    >
                      Сохранить
                    </el-button>
                    </div>

                </el-card>
                <!-- *********************** -->

              </el-dialog>
            </td>
          </template>
        </v-data-table>
      </v-col>
    </el-row>
  </v-container>
</template>

<script>
import { AclRule } from "vue-acl";
import { mapGetters, mapState } from "vuex";

export default {
  props: {
    id: {
      type: Number,
      default: () => null,
    },
  },

  data() {
    return {
      AllTypes: [],
      nameTechPropValue: "",
      nameTechProp: "",
      typeTechProp: [],
      idTechProp: null,
      idTechPropValue: null,
      formTextValue: "Добавление значения к свойству",
      formText: "Добавление нового свойства",
      expanded: [],
      show: false,
      singleExpand: false,
      infoText: "Добавление нового свойства",
      search: "",
      localloading: false,
      loading: false,
      dialog: false,
      dialogValue: false,
      headers: [
        { text: "Название", value: "name", align: "left" },
        { text: "Связанные Типы", value: "types", align: "left" },
        { text: "id", value: "id", align: "left" },
        { text: "Ред.", value: "action", align: "center" },
      ],
      textRules: [(v) => !!v || "Обязательный параметр!"],
      itemIndex: -1,
      editedItem: {
        id: null,
        name: "",
      },
      editedItemValue: {
        name: "",
      },
    };
  },

  computed: {
    Edit() {
      return new AclRule("admin").or("nom").generate();
    },
    ...mapGetters({
      TechProperties: "techProperties",
      TechPropertiesValues: "techPropertiesValues",
    }),
    ...mapState({
      ModelsType: (state) => state.models.types,
      ProductsType: (state) => state.products_type.ProductsType,
    }),
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
  },
  async created() {
    this.loading = true;
    await this.$store.dispatch("fetchTechProperties");
    await this.$store.dispatch("fetchTechPropertiesValues");
    await this.$store.dispatch("fetchProductsType");
    await this.$store.dispatch("models/types");

    this.AllTypes = [
      ...this.ModelsType.map((i) => ({ ...i, element: 2 })),
      ...this.ProductsType.map((i) => ({ ...i, element: 1 })),
    ];
    this.loading = false;
  },

  methods: {
    TPV(item) {
      return this.$store.getters.techPropertiesValues.filter(
        (value) => value.parent_id === item.id
      );
    },
    open() {
      this.dialog = true;
      this.localloading = true;
    },
    close() {
      this.dialog = false;
      this.localloading = false;
      this.editedItem = Object.assign({});
      this.itemIndex = -1;
      this.typeTechProp = [];
      this.nameTechProp = "";
      this.formText = "Добавление нового свойства";
    },
    closeValue() {
      this.dialogValue = false;
      this.localloading = false;
      this.editedItem = Object.assign({});
      this.itemIndex = -1;
      this.nameTechPropValue = "";
      this.formTextValue = "Добавление значения к свойству";
    },
    goBack() {
      this.$router.go(-1);
    },
    editItem(item) {
      console.log(item);
      this.itemIndex = this.$store.getters.techProperties.indexOf(item);
      this.nameTechProp = item.name;
      this.idTechProp = item.id;
      this.formText = "Редактирование свойства - " + item.name;
      this.$store.dispatch("fetchTechPropertiesTypes", item.id).then((res) => {
        this.AllTypes.filter((item) => {
          return res.forEach((r) => {
            if (r.zip === item.id && item.element === r.element) {
              this.typeTechProp.push(item);
            }
          });
        });
      });
      this.dialog = true;
    },

    handleClose() {
      this.dialogValue = false;
    },

    initItemValue() {
      this.dialogValue = true;
      this.nameTechPropValue = "";
      this.formTextValue = "Добавление значения свойства";
    },
    editItemValue(item) {
      this.itemIndex = this.$store.getters.techPropertiesValues.indexOf(item);
      console.log(this.itemIndex);
      this.nameTechPropValue = item.name;
      this.idTechPropValue = item.id;
      this.formTextValue = "Редактирование значения свойства";
      this.dialogValue = true;
    },
    deleteTechType(item, id) {
      this.$store
        .dispatch("checkUseTypeInProp", { item: item, id: id })
        .then((res) => {
          if (res.length > 0) {
            this.$store.commit("setError", "Этот тип привязан где то еще!");
          } else {
            const index = this.typeTechProp.indexOf(item);
            this.typeTechProp.splice(index, 1);
          }
        });
    },
    deleteItem(item) {
      if (
        confirm("Вы уверены, что хотите удалить свойство " + item.name + "?")
      ) {
        this.$store
          .dispatch("checkUseValueInProp", {
            parent_id: item.parent_id,
            tpv: this.TechPropertiesValues.filter(
              (tpv) => item.id === tpv.parent_id
            ),
          })
          .then((res) => {
            if (res && res.length > 0) {
              this.$store.commit(
                "setError",
                "Характеристика привязана в Маркете. Для начала удалите эти связи."
              );
            } else {
              this.show = true;
              this.infoText = "Внимание! Идёт удаление...";
              this.$store.dispatch("deleteTechProperty", item).then(() => {
                this.show = false;
              });
            }
          });
      }
    },
    deleteItemValue(item) {
      if (
        confirm("Вы уверены, что хотите удалить значение " + item.name + "?")
      ) {
        this.$store
          .dispatch("checkUseValueInProp", {
            parent_id: item.parent_id,
            id: item.id,
          })
          .then((res) => {
            if (res && res.length > 0) {
              this.$store.commit(
                "setError",
                "Характеристика привязана в Маркете. Для начала удалите эти связи."
              );
            } else {
              this.show = true;
              this.infoText = "Внимание! Идёт удаление...";
              this.$store.dispatch("deleteTechPropertyValue", item).then(() => {
                this.show = false;
              });
            }
          });
      }
    },
    save() {
      if (this.$refs.nameTechProp.validate()) {
        this.localloading = true;
        if (this.itemIndex === -1) {
          this.$store.dispatch(
            "createTechProperty",
            this.typeTechProp.length === 0
              ? { name: this.nameTechProp }
              : { name: this.nameTechProp, types: this.typeTechProp }
          );
          this.$store.dispatch("setData", "Свойство успешно добавлено!");
        } else {
          this.$store.dispatch(
            "updateTechProperty",
            this.typeTechProp.length === 0
              ? { name: this.nameTechProp, id: this.idTechProp }
              : {
                  name: this.nameTechProp,
                  types: this.typeTechProp,
                  id: this.idTechProp,
                }
          );
          this.$store.dispatch("setData", "Свойство успешно обновлено!");
        }
        this.close();
      } else {
        this.$store.dispatch("setError", "Заполните обязательное поле!");
      }
    },
    saveValue(itemId, itemName) {
      if (this.$refs.nameTechPropValue.validate()) {
        this.localloading = true;
        if (this.itemIndex === -1) {
          this.$store.dispatch("createTechPropertyValue", {
            name: this.nameTechPropValue,
            parent_id: itemId,
          });
          this.$store.dispatch(
            "setData",
            "Значение для свойства `" +
              itemName +
              "` успешно добавлено!"
          );
        } else {
          this.$store.dispatch("updateTechProperty", {
            name: this.nameTechPropValue,
            id: this.idTechPropValue,
            parent_id: true,
          });
          this.$store.dispatch(
            "setData",
            "Значение для свойства `" +
              itemName +
              "` успешно обновлено!"
          );
        }
        this.closeValue();
      } else {
        this.$store.dispatch("setError", "Заполните обязательное поле!");
      }
    },
  },
};
</script>

<style scoped>
.cursor_btn {
  cursor: pointer;
}
.text_center {
  text-align: center !important;
}
.overall {
  z-index: 0 !important;
}
</style>

