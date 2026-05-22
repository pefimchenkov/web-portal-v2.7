<template>
  <v-container v-loading="loading" fluid :fill-height="loading">

    <el-card class="mx-auto mb-2" style="width: 100%">
      <el-row>
        <el-col :span="12" class="text-left">
          <el-skeleton v-if="!ParentName" :rows="1" animated>
            <el-skeleton-item variant="h3" />
          </el-skeleton>
          <h2 v-else>{{ ParentName }}</h2>
        </el-col>
        <el-col :span="12" class="text-right">
          <el-button size="small" type="primary" @click="goBack">Вернуться к списку</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-tabs v-model="active" type="border-card" style="width: 100%">

      <el-tab-pane label="Договоры" name="tab-contracts">
        <Contracts
          v-if="active === 'tab-contracts'"
          :id="id"
          @changeTab="changeTab"
        />
      </el-tab-pane>

      <el-tab-pane label="Спеццены" name="tab-specprices">
        <SpecPrices
          v-if="active === 'tab-specprices'"
          :id="id"
          :parent-search="search"
          :spec="spec"
          @clearSearch="search = null"
        />
      </el-tab-pane>

      <el-tab-pane label="Серийные номера" name="tab-sn">
        <SerialNumbers
          v-if="active === 'tab-sn'"
          :id="id"
          :parent-search="search"
          @clearSearch="search = null"
        />
      </el-tab-pane>

      <el-tab-pane label="CRM" name="tab-crm">
        <Crm
          v-if="(crmAccess && active === 'tab-crm')"
          :id="+id" :status-c-r-m="statusCRM"
        >
        </Crm>
        
        <v-container v-else-if="!crmAccess && !userRoles">
          <v-row justify="center" align="center" style="height: 300px;">
            <v-progress-circular :size="100" color="primary" indeterminate />
          </v-row>
        </v-container>

        <v-container v-else>
          <v-row justify="center" align="center" style="height: 300px;">
            У вас нет доступа к содержимому этого раздела! Обратитесь к вашему руководителю.
          </v-row>
        </v-container>
        
      </el-tab-pane>

    </el-tabs>

  </v-container>
</template>

<script>

import { AclRule } from 'vue-acl'

export default {
  components: {
    Contracts: () => import('./contracts/index.vue'),
    SpecPrices: () => import('./specprices/index.vue'),
    SerialNumbers: () => import('./serial-numbers/index.vue'),
    Crm: () => import('./crm/index')
  },

  data() {
    return {

      window: 0,
      id: '',
      search: '',
      spec: null,
      menu: false,
      dialog: false,
      dialogSN: false,
      localLoading: false,
      loading: false,
      active: 'tab-contracts',
      tab: '',
      items: [{ title: 'Псевдонимы' }, { title: 'Договора' }],

      textRules: [v => !!v || 'Обязательный параметр!'],
      editedIndexSN: -1

    }
  },

  computed: {

    clients() {
      return this.$store.getters.clients || []
    },

    JiraUsers() {
      return this.$store.state.jira_users.JIRA_USERS || []
    },

    formTitleSN() {
      return this.editedIndexSN === -1 ? 'Новая позиция' : 'Редактирование'
    },

    Edit() {
      return new AclRule('leadEngineer').or('snEditor').or('financier').or('admin').generate()
    },

    userRoles() {
      return this.$store.getters["auth/currentUser"]?.roles
    },

    crmAccess() {
      return (this.userRoles.find(item => item === 'admin') || this.userRoles.find(item => item === 'financier') || this.userRoles.find(item => item === 'crm'))
    },

    ParentName() {
      const obj = this.clients.find(item => parseInt(item.ID) === parseInt(this.id))
      return obj ? obj.NAME + ' (' + obj.PROJECT + ')' : null
    },

    statusCRM() {
      const obj = this.clients.find(item => parseInt(item.ID) === parseInt(this.id))
      return obj ? !!obj.CRM : false
    }
  },

  watch: {

    '$route.params': {
      immediate: true,
      handler(val) {
        if (!this.id) this.id = val.id;
      }
    },

    dialog(val) {
      val || this.close()
    },

    active(val) {
      localStorage.setItem('clientDetailTab', val);
    }

  },

  async created() {
    this.loading = true;
    await this.$store.dispatch('clients/getClients');
    this.init();
    this.loading = false;
  },

  methods: {

    close() {
      this.dialog = false;
      this.localLoading = false;
    },

    changeTab(data) {
      this.active = data.active;
      this.search = data.ISSUEKEY;
      this.spec = data.ISSUEKEY + ' {' + data.SUMMARY + '}';
    },

    init() {
      const savedTab = localStorage.getItem('clientDetailTab');
      this.active = savedTab || 'tab-contracts';

      if (window.location.hash === '#tab-3') {
        this.active = 'tab-specprices';
      }
    },

    goBack() {
      console.log(window.history)
      this.$router.push({ name: 'clients' });
    }
  }
}
</script>

<style lang="scss" scoped>

.cursor_btn {

	cursor: pointer !important;

}
</style>

