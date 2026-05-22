<template>
  <div class="app-container">
    <div v-if="user">
      <el-row :gutter="20">

        <el-col :span="24"> <!-- :span="18" :xs="24" -->
          <el-card>
            <el-tabs v-model="activeTab">
              <!-- <el-tab-pane label="Активность" name="activity">
                <Activity />
              </el-tab-pane> -->
              <el-tab-pane label="Личные данные" name="account">
                <Account :user="user" :current-jira-user="currentJiraUser" />
              </el-tab-pane>
              <el-tab-pane label="Данные по зарплате" name="finance">
                <Finance />
              </el-tab-pane>
              <el-tab-pane v-if="user.roles.includes('admin')" label="Админка" name="admins">
                <Admins />
              </el-tab-pane>

            </el-tabs>
          </el-card>
        </el-col>

      </el-row>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
// import UserCard from './components/UserCard'
// import Activity from './components/Activity'

export default {
  name: 'Profile',
  components: {
    Finance: () => import('./components/Finance.vue'),
    Account: () => import('./components/Account.vue'),
    Admins: () => import('./admins/users/index.vue')
  },

  data() {
    return {

      user: {},
      activeTab: 'account'

    }
  },

  computed: {

    ...mapGetters(['jira_users']),

    currentUser() {
      return this.$store.getters['auth/currentUser']
    },

    currentJiraUser() {
      return this.jira_users.find(u => u.email === this.user.email);
    },

    userRoles() {
      return this.$store.getters['auth/currentUser']?.roles
    }

  },

  async created() {
    this.getUser();
  },

  methods: {

    getUser() {
      this.user = {
        name: this.currentUser?.displayName,
        roles: this.userRoles.join(' | '),
        email: this.currentUser?.email,
        avatar: this.currentUser?.photoURL
      }
    }

  }
}

</script>

<style scope>
  .app-container {
    width: 100%
  }
</style>
