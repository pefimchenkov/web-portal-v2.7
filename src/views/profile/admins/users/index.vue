<template>
  <div class="mt-3">

    <el-dialog :visible.sync="dialog" :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false" width="400px">
      <Permissions
        v-if="dialog"
        :roles="userRoles || null"
        :_id="selected?._id || null"
        @close="closeDialog"
        @update="updateRoles"
      />
    </el-dialog>


    <v-card>
      <v-card-text class="body-1 grey lighten-5 text-center">Управление пользователями</v-card-text>
      <v-sheet class="pa-1 grey lighten-4">
        <v-text-field
          v-model="search"
          label="Найти пользователя"
          flat
          solo-inverted
          hide-details
          clearable
          clear-icon="mdi-close-circle-outline"
          @input="handleSearch"
        />
      </v-sheet>
      <v-row
        class="pa-4"
        justify="space-between"
      >
        <v-col cols="5">
          <v-treeview
            ref="tree"
            :active.sync="active"
            :items="items"
            item-text="name"
            item-key="_id"
            :load-children="fetchUsers"
            :open.sync="open"
            :search="search"
            activatable
            color="warning"
            open-on-click
            transition
            dense
            @update:active="$vuetify.goTo(0)"
          >
            <template #prepend="{ item }">
              <v-icon v-if="!item.children">mdi-account</v-icon>
            </template>
          </v-treeview>
        </v-col>
        <v-divider vertical />
        <v-col
          class="d-flex text-center"
        >
          <v-scroll-y-transition mode="out-in">
            <div
              v-if="!selected"
              class="title grey--text text--lighten-1 font-weight-light"
              style="align-self: center;"
            >
              Выберите пользователя
            </div>
            <el-card
              v-else
              :key="selected?._id"
              :body-style="{
                'padding':'20px',
                'width':'600px',
                'margin': '0 auto'
              }"
              style="margin: 0 auto; height: fit-content;"
            >
              <div>

                <v-img
                  v-loading="!avatar"
                  :lazy-src="avatar"
                  max-width="100"
                  :src="avatar"
                  style="margin: 0 auto;"
                >
                  <template #placeholder>
                    <v-row
                      class="fill-height ma-0"
                      align="center"
                      justify="center"
                    >
                      <v-progress-circular
                        indeterminate
                        color="grey lighten-5"
                      />
                    </v-row>
                  </template>
                </v-img>

                <h3 class="headline mb-2">
                  {{ selected?.name }}
                </h3>
                <div class="blue--text mb-2">{{ selected?.email }}</div>
                <div class="blue--text subheading font-weight-bold">{{ selected?._id }}</div>
              </div>

              <v-divider style="margin: 15px auto" />

              <el-row style="padding: 10px; line-height: 2.2em" class="text-left">
                <el-col tag="strong" :span="12">Компания:</el-col><el-col :span="12">{{ company }}</el-col>
                <el-col tag="strong" :span="12">Должность:</el-col><el-col :span="12">{{ position }}</el-col>
                <el-col tag="strong" :span="12">Адрес:</el-col><el-col :span="12">{{ address }}</el-col>
                <el-col tag="strong" :span="12">Email:</el-col><el-col :span="12">{{ email }}</el-col>
                <el-col tag="strong" :span="12">Телефон:</el-col><el-col :span="12">{{ phone }}</el-col>
              </el-row>

              <v-divider />

              <el-row type="flex" style="margin: 10px">
                <el-col class="text-right" tag="strong">Роль:</el-col>
                <el-col>{{ userRoles | translateRoles }}</el-col>
                <el-col >
                  <i class="el-icon-edit" style="cursor: pointer" @click="dialog = true"></i>
                </el-col>
              </el-row>

            </el-card>
          </v-scroll-y-transition>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script>

const pause = ms => new Promise(resolve => setTimeout(resolve, ms))

import { mapState } from 'vuex'
import Roles from './components/Permissions.js'

export default {


  filters: {
    translateRoles(val) {
      console.log(val)
      return val.map(item => Roles.find(i => i.eng === item)?.rus).join(', ')
    }
  },


  components: {
    Permissions: () => import('./components/Permissions.vue')
  },
  data() {
    return {
      active: [],
      avatar: null,
      open: [],
      users: [],
      search: null,
      dialog: false
    }
  },
  computed: {
    ...mapState({
      //fbUsers: state => state.fb.users,
      JiraUsers: state => state.jira_users.JIRA_USERS,
      config: state => state.fb.selectedUserData.config,
      company: state => state.fb.selectedUserData.info ? (state.fb.selectedUserData.info.company || 'не заполнено') : 'не заполнено',
      position: state => state.fb.selectedUserData.info ? (state.fb.selectedUserData.info.position || 'не заполнено') : 'не заполнено',
      address: state => state.fb.selectedUserData.info ? (state.fb.selectedUserData.info.address || 'не заполнено') : 'не заполнено',
      email: state => state.fb.selectedUserData.info ? (state.fb.selectedUserData.info.email || state.fb.selectedUserData.info.emailaddress) : 'не заполнено',
      phone: state => state.fb.selectedUserData.info ? (state.fb.selectedUserData.info.phone || 'не заполнено') : 'не заполнено',
      info: state => state.fb.selectedUserData.info
      // UserData: state => state.fb.selectedUserData
    }),

    Users() {
      return this.$store.getters["auth/users"]
    },

    items() {
      return [
        {
          name: 'Пользователи',
          children: this.users
        }
      ]
    },

    selected() {
      if (!this.active.length) return undefined
      //this.$store.dispatch('fb/getSelectedUserData', { uid: this.active[0] }, { root: true })
      return this.users.find(user => user._id === this.active[0])
    },


    filter() {
      return (item, search, textKey) => item[textKey].indexOf(search) > -1
    },

    userRoles() {
      return this.selected?.roles || []
    }
  },


  watch: {
    selected: 'randomAvatar'
  },


  async created() {
    await this.$store.dispatch('fetchJiraUsers')
    //await this.$store.dispatch('fb/getUsers', { root: true })
    await this.$store.dispatch('auth/getUsers', { root: true })
  },



  methods: {
    async fetchUsers(item) {
      try {
        const data = await this.getUsersFromDB()

        console.log(data)

        data.forEach(element => {
          if (this.JiraUsers.find(user => user.email === element.email)) {
            element.name = this.JiraUsers.find(user_1 => user_1.email === element.email).display_name
          }
        })

        const newData = data.filter(item_1 => item_1.name)
        item.children.push(...newData)

      } catch (err) {
        return console.warn(err)
      }
    },

    getUsersFromDB() {
      return new Promise(resolve => {
        pause(1000)
        resolve(this.Users)
      })
    },

    randomAvatar() {
      /* this.avatar = this.selected?.providerData[0]?.photoURL || `https://avataaars.io/` + avatars[Math.floor(Math.random() * avatars.length)] */
      this.avatar = `https://ui-avatars.com/api/?background=0D8ABC&rounded=true&size=64&color=fff&name=${this.selected?.name }`
    },

    closeDialog(payload) {
      this.dialog = payload.data
    },

    updateRoles(payload) {
      console.log(payload)
      this.selected.roles = payload
      this.$notify({ type: "success", message: "Роли успешно обновлены!" })
    },

    handleSearch(input) {
      if (input) {
        this.$refs.tree.updateAll(true)
      } else {
        this.$refs.tree.updateAll(false)
      }
    }
  }
}
</script>

<style scoped>
</style>
