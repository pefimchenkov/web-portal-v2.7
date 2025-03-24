<template>
  <div>
    <Confirm ref="confirm" />

    <el-row
      v-if="statusCRM === null || statusCRM === 2"
      type="flex"
      justify="center"
      align="middle"
    >
      <el-col>
        <p v-if="statusCRM === null" class="title text-center mt-3 mb-10">Не активирован</p>
        <p v-if="statusCRM === 2" class="title text-center mt-3 mb-10">Деактивирован</p>

        <p class="title text-center mt-3 mb-10">
          <el-button type="primary" size="small" @click.prevent="activateCRM"
            >Активировать
          </el-button
          >
        </p>
      </el-col>
    </el-row>


    <el-row v-else  justify="center" :gutter="10" class="mb-3">
      <el-col
        v-if="statusCRM === 1"
        :span="24"
        class="text-center mb-5">
        <el-button
          type="danger"
          size="small"
          @click.prevent="deactivateCRM"
          >Деактивировать
        </el-button
        >
      </el-col>

      <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
        <People
          :id="id"
          :client-name="clientName"
          :editable="editable"
          :readonly="readonly"
          :jirausers="jira_users"
          :crm-key="crmData.key"
          :typecrm="typeCRM"
        />
      </el-col>

      <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
        <Plans
          :id="id"
          :client-name="clientName"
          :editable="editable"
          :readonly="readonly"
          :jirausers="jira_users"
          :typecrm="typeCRM"
        />
      </el-col>
    </el-row>

    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
        <Legpers :id="id" :legpers="legpers" :client-name="clientName" />
      </el-col>

      <el-col :xs="12" :sm="12" :md="12" :lg="4" :xl="4">
        <Delay :id="id" :delay="editable?.PAY_DELAY" />
      </el-col>

      <el-col :xs="12" :sm="12" :md="12" :lg="8" :xl="8">
        <Domains :id="id" :domains="domains" />
      </el-col>

    </el-row>
    
  </div>

</template>

<script>
import { mapGetters, mapState } from "vuex";

import People from "../../components/people";
import Plans from "../../components/plans";
import Legpers from "../../components/legpers";
import Domains from "../../components/domains";
import Delay from "../../components/delay";
import Confirm from "@/components/shared/Confirm";

export default {
  components: {
    People,
    Plans,
    Legpers,
    Domains,
    Delay,
    Confirm,
  },

  props: {
    id: {
      type: Number,
      required: true,
    },
  },

  computed: {
    ...mapGetters([
      "editable",
      "readonly",
      "jira_users",
      "clients",
      "legpers",
      "domains",
      "currentUser",
    ]),

    ...mapState({ crmData: (state) => state.jira.CrmData }),

    client() {
      return this.clients.find((client) => +client.ID === +this.id);
    },

    statusCRM() {
      return this.client.CRM;
    },

    typeCRM() {
      return this.client.CRM_TYPE;
    },

    clientName() {
      return this.client.NAME;
    },

    userName() {
      const user = this.jira_users.find((user) => user.email === this.currentUser.email);
      return user.display_name;
    },
  },

  async created() {
    await this.$store.dispatch("fetchEditableCRM", parseInt(this.id));
    await this.$store.dispatch("fetchReadonlyCRM", parseInt(this.id));
    await this.$store.dispatch("fetchLegPers", parseInt(this.id));
    await this.$store.dispatch("fetchClientsDomains", parseInt(this.id));
    await this.$store.dispatch("fetchJiraUsers");
    await this.$store.dispatch("jira/getCrmData", { client_id: this.id }, { root: true });
  },

  methods: {
    async activateCRM() {
      if (!this.crmData?.fields?.status)
        return this.$notify({
          type: "warning",
          message: "Нет данных о статусе задачи в JIRA, обновите страницу ещё раз.",
        });

      await this.$confirm("Вы уверены?", { color: "orange" })
        .then(async () => {
          const response = await this.$store.dispatch("activateCRM", {
            id: this.id,
            crm_status: this.statusCRM,
            key: this.crmData.key,
            user: this.userName,
            issue_status: this.crmData.fields.status.name,
          });
          if (response.responseFromDB.affectedRows === 1) this.client.CRM = 1;
          else this.$notify(`Что-то пошло не так: ${response}`);
        })
        .catch((e) => console.log(e));
    },


    async deactivateCRM() {
      if (!this.crmData?.fields?.status)
        return this.$notify({
          type: "warning",
          message: "Нет данных о статусе задачи в JIRA, обновите страницу ещё раз.",
        });
      await this.$confirm("Вы уверены?", { color: "orange" })
        .then(async () => {
          const response = await this.$store.dispatch("deactivateCRM", {
            id: this.id,
            key: this.crmData.key,
            user: this.userName,
            issue_status: this.crmData.fields.status.name,
          });
          if (response.responseFromDB.affectedRows === 1) this.client.CRM = 2;
          else this.$notify(`Что-то пошло не так: ${response}`);
        })
        .catch((e) => console.log(e));
    },


  },
};
</script>

<style lang="scss" scoped></style>
