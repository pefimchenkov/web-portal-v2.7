<!-- eslint-disable vue/no-mutating-props -->
<template>

  <el-row :gutter="24">
    <el-col :span="12" :xs="24">
      <user-card
        :user="user"
        :current-jira-user="currentJiraUser"
      />
    </el-col>

    <el-col :span="12" :xs="24">
      <el-card>
        <el-form>
          <el-form-item label="ФИО">
            <el-input :value="currentJiraUser?.display_name" readonly disabled />
          </el-form-item>
          <el-form-item label="Email">
            <el-input :value="currentJiraUser?.email" readonly disabled />
          </el-form-item>
          <el-form-item label="Username">
            <el-input :value="currentJiraUser?.user_name" readonly disabled />
          </el-form-item>
          <el-form-item label="Группы в JIRA">
            <el-input :value="format(currentJiraUser?.jira_groups)" type="textarea" rows="4" readonly />
          </el-form-item>



        </el-form>
      </el-card>
    </el-col>
  </el-row>

</template>

<script>

import UserCard from './UserCard.vue'

export default {
  name: 'Account',
  components: { UserCard },

  data() {
    return {
    }
  },

  props: {

    user: {
      type: Object,
      default: () => {
        return {
          name: '',
          roles: '',
          email: '',
          avatar: ''
        }
      }
    },

    currentJiraUser: {
      type: Object,
      default: () => {}
    }

  },


  methods: {

    format(data) {
      return data?.split(",").join(" / ")
    }


  }

}
</script>
