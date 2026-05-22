<!-- eslint-disable vue/no-v-text-v-html-on-component -->
<template>
  <div>

    <v-dialog v-model="dialog" width="500px" persistent>
      <el-card class="pa-5 mx-auto">
        <p class="title" style="margin-bottom: 20px">Редактирование: «{{ label }}»</p>
        <v-autocomplete
          v-model="selectedUser"
          :items="jirausers"
          label="* ответственный"
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

    <el-card
      v-if="editable && readonly"
      class="mx-auto mt-3">

      <v-list dense>
        <div v-for="(item, index) in People" :key="item.title">
          <v-list-item
            
          >
            <v-icon small class="mr-3">{{ item.icon }}</v-icon>

            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>

            <v-list-item-content>
              <v-progress-circular v-if="jirausers.length === 0" indeterminate color="primary" :width="1" />
              <v-list-item-title v-else>{{ emailToName(item.value) }}</v-list-item-title>
            </v-list-item-content>

            <v-icon
              v-if="item.editable && typecrm"
              small
              @click="open(item)">
              {{ item.editable ? 'mdi-pencil' : '' }}
            </v-icon>
            
            <el-tooltip v-else-if="item.editable && !typecrm" content="Не выбран тип процента!" placement="top">
              <i class="el-icon-error" style="font-size: 1.3em; color: #a3a3a3"></i>
            </el-tooltip>

          </v-list-item>
          <v-divider
            :key="index"
          />
        </div>
      </v-list>

    </el-card>

  </div>
</template>

<script>
export default {
  // eslint-disable-next-line vue/require-prop-types
  props: ['editable', 'readonly', 'jirausers', 'id', 'clientName', 'crmKey', 'typecrm'],

  data() {
    return {
      dialog: false,
      selectedUser: {},
      previousUser: {},
      url: '',
      label: '',
      loading: false
    }
  },

  computed: {

    People() {
      return [
        { icon: 'mdi-account', iconClass: 'grey lighten-1 white--text', title: 'Куратор', value: this.editable.HEAD_MANAGER, editable: true },
        { icon: 'mdi-account', iconClass: 'grey lighten-1 white--text', title: 'Менеджер', value: this.editable.MANAGER, editable: true },
        { icon: 'mdi-account', iconClass: 'grey lighten-1 white--text', title: 'Сервис-менеджер (клиент)', value: this.editable.SM_SERV, editable: true },
        { icon: 'mdi-account', iconClass: 'grey lighten-1 white--text', title: 'Ведущий инженер (клиент)', value: this.editable.LEAD_ENG, editable: true },
        { icon: 'mdi-account', iconClass: 'grey lighten-1 white--text', title: 'Бухгалтер (клиент)', value: this.editable.BUH, editable: true },
        { icon: 'mdi-account', iconClass: 'grey lighten-1 white--text', title: 'Сервис-менеджер (договор)', value: this.readonly.SMs, editable: false },
        { icon: 'mdi-account', iconClass: 'grey lighten-1 white--text', title: 'Ведущий инженер (договор)', value: this.readonly.VIs, editable: false },
        { icon: 'mdi-account', iconClass: 'grey lighten-1 white--text', title: 'Бухгалтер (договор)', value: this.readonly.Buhs, editable: false }
      ]
    },

    currentUser() {
      return this.$store.getters["auth/currentUser"]
    },

    currentUserName() {
      return this.jirausers
        ? this.jirausers.find(user => user.email === this.currentUser.email)?.display_name
        : this.currentUser.displayName
    }
  },


  created() {
    // this.pause(1000)
  },


  methods: {
    pause(t) {
      this.loading = true
      return setTimeout(() => {
        return (this.loading = false)
      }, t)
    },

    open(item) {
      this.dialog = true;
      const { title, value } = item;
      this.label = title;
      this.selectedUser = this.previouseUser = this.jirausers.find(user => user.user_name === value);

      if (title === 'Куратор') this.url = 'updateCurator';
      if (title === 'Менеджер') this.url = 'updateManager';
      if (title === 'Сервис-менеджер (клиент)') this.url = 'updateSM';
      if (title === 'Ведущий инженер (клиент)') this.url = 'updateLeadEng';
      if (title === 'Бухгалтер (клиент)') this.url = 'updateBUH';
    },

    async save() {

      const data = {
          id: this.id,
          clientName: this.clientName,
          currentUserName: this.currentUserName,
          selectedUser: this.selectedUser,
          previouseUser: this.previouseUser,
          crmKey: this.crmKey
        }

      if (!this.selectedUser) {
        this.$notify({ type: "error", message: "Пользователь не выбран, что будем сохранять то?" });
        return;
      }

        await this.$store.dispatch(this.url, data)
        this.$notify({ type: "success", message: "Данные успешно обновлены!" })
        this.close()
    },

    close() {
      this.dialog = false
      this.selectedUser = this.previousUser = {}
    },

    emailToName(value) {
      if (value) {
        const user = this.jirausers.find(user => value.includes(user.user_name))
        return user ? user.display_name : value
      }
    }

  }
}
</script>

<style lang="scss" scoped>
</style>
