<!-- eslint-disable vue/no-mutating-props -->
<template>

  <el-row :gutter="24">
    <el-col :span="12" :xs="24">
      <user-card :user="user" :info="info" :current-jira-user="currentJiraUser" />
    </el-col>

    <el-col :span="12" :xs="24">
      <el-card>
        <el-form>
          <el-form-item v-loading="Object.keys(currentJiraUser).length === 0" label="ФИО">
            <el-input v-model="currentJiraUser.display_name" readonly disabled />
          </el-form-item>
          <el-form-item label="Email">
            <el-input v-model.trim="currentJiraUser.email" readonly disabled />
          </el-form-item>
          <el-form-item label="Телефон">
            <el-input v-model.trim="info.phone" />
          </el-form-item>
          <el-form-item label="Компания">
            <el-input v-model="info.company" />
          </el-form-item>
          <el-form-item label="Должность">
            <el-input v-model="info.position" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="submit">Обновить</el-button>
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

  props: {

    info: {

      type: Object,
      default: () => {
        return {

          lastname: '',
          firstname: '',
          emailaddress: '',
          phone: '',
          company: '',
          position: ''

        }
      }

    },

    user: {

      type: Object,
      default: () => {
        return {

          name: '',
          role: '',
          email: '',
          avatar: ''

        }
      }

    },

    currentJiraUser: {

      type: Object,
      default: () => {
        return {

        }
      }

    }

  },

  computed: {

  },

  methods: {

    submit() {
      this.$store.dispatch('updateInfo')
        .then(() => {
          this.$message({

            message: 'Данные успешно обновлены!',
            type: 'success',
            duration: 5 * 1000

          })
        })
        .catch(error => {
          this.$message({

            message: error.message,
            type: 'error',
            duration: 5 * 1000

          })
        })
    }

  }

}
</script>
