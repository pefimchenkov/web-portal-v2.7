<template>
  <div class="dashboard-container">
    <component :is="currentRole" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import authDashboard from './auth'
import noAuthDashboard from './noauth'

export default {

  name: 'Dashboard',
  components: { authDashboard, noAuthDashboard },

  data() {
    return {

      currentRole: 'authDashboard'

    }
  },

  computed: {

    ...mapGetters({ roles: 'userRole' })

  },

  async created() {

    const user = await this.$store.dispatch('getUsersKey');
    console.log('USERS: ', user)

  }

}
</script>
