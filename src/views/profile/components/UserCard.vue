<template>
  <el-card style="margin-bottom:15px;">
    <div slot="header" class="clearfix">
      <span>Обо мне</span>
    </div>

    <div class="user-profile">
      <div class="box-center">
        <pan-thumb
          :image="jiraAvatar"
          :height="'150px'"
          :width="'150px'"
          :hoverable="false"
        >
          <div>Привет</div>
          {{ user.role }}
        </pan-thumb>
      </div>
      <div class="box-center">
        <div class="user-name text-center">{{ currentJiraUser.display_name }}</div>
        <div class="user-role text-center text-muted">{{ user.role }}</div>
      </div>
    </div>

    <div class="user-bio">
      <div class="user-education user-bio-section">
        <div class="user-bio-section-header"><svg-icon icon-class="education" /><span>Заметки</span></div>
        <div class="user-bio-section-body">
          <div class="text-muted">
            {{ info.aboutme }}
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import PanThumb from '@/components/PanThumb'

export default {
  components: { PanThumb },
  props: {

    user: {
      type: Object,
      default: () => {
        return {
          name: '',
          email: '',
          avatar: '',
          role: ''
        }
      }
    },

    info: {
      type: Object,
      default: () => {
        return {
          aboutme: ''
        }
      }
    },

    currentJiraUser: {

      type: Object,
      default: () => {
        return {}
      }

    }
  },

  computed: {

    jiraAvatar() {
      return `http://support.atlas-pro24.local/secure/useravatar?ownerId=${this.currentJiraUser?.user_name}`
    }

  },

  methods: {

  }
}
</script>

<style lang="scss" scoped>
.box-center {
  margin: 0 auto;
  display: table;
}

.text-muted {
  color: #777;
  min-height: 56px;
}

.user-profile {
  .user-name {
    font-weight: bold;
  }

  .box-center {
    padding-top: 10px;
  }

  .user-role {
    padding-top: 10px;
    font-weight: 400;
    font-size: 14px;
  }

  .box-social {
    padding-top: 30px;

    .el-table {
      border-top: 1px solid #dfe6ec;
    }
  }

  .user-follow {
    padding-top: 20px;
  }
}

.user-bio {
  margin-top: 20px;
  color: #606266;

  span {
    padding-left: 4px;
  }

  .user-bio-section {
    font-size: 14px;
    padding: 10px 0;

    .user-bio-section-header {
      border-bottom: 1px solid #dfe6ec;
      padding-bottom: 10px;
      margin-bottom: 10px;
      font-weight: bold;
    }
  }
}
</style>
