<template>
  <div  class="pa-5">
    <Confirm ref="confirm" />

    <!--     Панель тулбара     -->
    <div slot="header" class="clearfix" :style="{background: setColor(statusCRM), color: '#fff', padding: '15px', 'border-radius': '5px'}">
      <el-row v-loading="!crmData.key" type="flex" justify="center" align="middle">
        <el-col>
          <span style="text-align: center">{{ clientName }}</span>
        </el-col>
        <el-col>
          <div style="text-align: center">Статус: {{ translateStatus(typeCRM) }}</div>
        </el-col>
        <el-col>
          <div style="text-align: center;">
            Задача: {{ crmData.key }}
          </div>
        </el-col>
        <el-col v-if="statusCRM === 1" style="text-align: center">
          <el-button type="warning" size="small" plain @click="deactivateCRM()">Приостановить</el-button>
        </el-col>
      </el-row>

    </div>

    <!--    Вкладки    -->

    <el-tabs type="border-card">

      <el-tab-pane label="CRM компоненты">
        <div v-if="!marker" justify="center" align="center" class="my-10">
          <v-col justify="center" align="center">
            <div>Нет карточки CRM !</div>
            <div>Для продолжения работы необходимо создать карточку в Jira CRM.</div>
          </v-col>
        </div>

        <div v-else-if="statusCRM === null || statusCRM === 2" justify="center">
          <v-col justify="center">
            <p v-if="statusCRM === null" class="title text-center mt-5">Не активирован.</p>
            <p v-if="statusCRM === 2" class="title text-center mt-5">Приостановлен.</p>
            <p class="title text-center mt-5">
              <el-button type="primary" icon="el-icon-check" size="small" @click="activateCRM()">
                Активировать {{ crmData  }}
              </el-button>
            </p>
          </v-col>
        </div>
        
        <div v-else>
          <el-row>
            <el-col>
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
            <el-col>
              <Plans
                :id="id"
                :client-name="clientName"
                :crm-key="crmData.key"
                :editable="editable"
                :readonly="readonly"
                :jirausers="jira_users"
                :typecrm="typeCRM"
                @update-crm-type="updateCrmType"
              />
            </el-col>
            <el-col>
              <Subscribe
                :key="client.CRM"
                :crm-data="crmData"
                @crmkey="setCrmKey()"
              />
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>

      <el-tab-pane label="Комментарии">
        <v-row v-if="Object.keys(crmData).length > 0 && crmData.fields" class="user-activity" justify="center" align="center">

          <template
            v-for="(post) in crmData.fields.comment.comments"
          >

            <v-col
              v-if="post.body.includes('(*g)')"
              :key="post.id"
              cols="12"
              class="post"
            >
              <div class="user-block">
                <img class="img-circle" :src="post.author.avatarUrls['32x32']">
                <span class="username text-muted"><b>{{ post.author.displayName }}</b></span>
                <span class=""> - {{ new Date(post.created).toLocaleDateString('ru-Ru', { hour: 'numeric', minute: 'numeric'}) }}</span>
              </div>
              <p style="margin: 10px 0 0 50px">
                {{ post.body.replace('(*g)', '') }}
              </p>
            </v-col>

          </template>

        </v-row>
      </el-tab-pane>

    </el-tabs>

  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import People from './people'
import Plans from './plans'
import Subscribe from './subscribe'
import Confirm from '@/components/shared/Confirm'

export default {
  components: {
    People,
    Plans,
    Subscribe,
    Confirm
  },


  props: {
    id: {
      type: Number,
      required: true
    },
    marker: {
      type: String,
      default: null
    }
  },


  data() {
    return {
      tab: 'tab-crm'
    }
  },

  watch: {
    typeCRM(val) {
      console.log(val)
    }
  },


  computed: {
    ...mapGetters(['editable', 'readonly', 'jira_users', 'currentUser', 'clients']),
    ...mapState({ crmData: (state) => state.jira.CrmData }),

    client() {
      return this.clients.find(client => +client.ID === this.id);
    },
    
    statusCRM() {
      return this.client?.CRM;
    },

    typeCRM: {
      get() {
        return this.client?.CRM_TYPE;
      },
      set(val) {
        this.client.CRM_TYPE = val
      }
    },

    clientName() {
      return this.client?.NAME;
    },

    userName() {
      const user = this.jira_users.find(user => user.email === this.currentUser.email)
      return user.display_name
    }
  },

  async created() {
    await this.$store.dispatch('fetchEditableCRM', this.id);
    await this.$store.dispatch('fetchReadonlyCRM', this.id);
    await this.$store.dispatch('clients/getClients');
    await this.$store.dispatch('jira/getCrmData', { client_id: this.id }, { root: true });
    if (this.jira_users.length === 0) {
      await this.$store.dispatch('fetchJiraUsers');
    }

  },


  beforeDestroy() {
    this.crmData.key = null
  },

  methods: {
    setColor(status) {
      if (!status) status = 0
      const colors = [
        'grey',
        'green',
        'orange'
      ]
      return colors[status]
    },

    translateStatus(val) {
      if (!isNaN(val)) val = 'num'

      const ru = {
        client: 'Клиент',
        partner: 'Партнёр',
        dealer: 'Оптовик',
        null: 'Не задан',
        num: 'НАДО ПРОВЕРИТЬ!!!'
      }
      return ru[val]
    },

    updateCrmStatus() {
      this.$emit('updateCrmStatus', this.statusCRM)
    },

    async activateCRM() {
      if (await this.$refs.confirm.open('Активация:', 'Вы уверены?', { color: 'orange' })) {
        this.$store.dispatch('activateCRM', { id: this.id, crm_status: this.statusCRM, key: this.crmData.key, user: this.userName })
          .then(res => {
            if (res) this.client.CRM = 1
            this.$emit('updateCrmStatus', { status: 1 })
            this.$store.commit('setData', 'Активация прошла успешно.')
          })
          .catch(() => {})
      } else {
        this.$store.commit('setInfo', 'Активация отменена.')
      }
    },

    async deactivateCRM() {
      if (await this.$refs.confirm.open('Деактивация:', 'Вы уверены?', { color: 'orange' })) {
        this.$store.dispatch('deactivateCRM', { id: this.id, key: this.crmData.key, user: this.userName })
          .then(res => {
            if (res) this.client.CRM = 2
            this.$emit('updateCrmStatus', { status: 2 })
            this.$store.commit('setData', 'Деактивация прошла успешно.')
          })
          .catch(() => {})
      } else {
        this.$store.commit('setInfo', 'Деактивация отменена.')
      }
    },

    updateCrmType(data) {
      this.typeCRM = data
    }
  }
}
</script>

<style lang="scss" scoped>

.clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }

  .user-activity {
  .user-block {

    .username,
    .description {
      display: inline-block;
      margin-left: 20px;
      padding: 2px 0;
    }

    .username{
      font-size: 14px;
      color: #000;
    }

    :after {
      clear: both;
    }

    .img-circle {
      border-radius: 50%;
      width: 32px;
      height: 32px;
      float: left;
    }

    span {
      font-weight: 500;
      font-size: 12px;
    }
  }

  .post {
    font-size: 14px;
    border-bottom: 1px solid #d2d6de;
    margin-bottom: 10px;
    padding-bottom: 10px;
    color: #666;

    .image {
      width: 100%;
      height: 100%;

    }

    .user-images {
      padding-top: 20px;
    }
  }

  .list-inline {
    padding-left: 0;
    margin-left: -5px;
    list-style: none;

    li {
      display: inline-block;
      padding-right: 5px;
      padding-left: 5px;
      font-size: 13px;
    }

    .link-black {

      &:hover,
      &:focus {
        color: #999;
      }
    }
  }

}

.box-center {
  margin: 0 auto;
  display: table;
}

.text-muted {
  color: #777;
}

</style>
