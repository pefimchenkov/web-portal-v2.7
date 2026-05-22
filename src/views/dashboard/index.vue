<template>
  <div class="dashboard-container">
    <component :is="currentRole" />
  </div>
</template>

<script>
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

    roles() {
      return this.$store.getters["auth/currentUser"]?.roles
    }

  },

  async created() {
    await this.$store.dispatch('getUsersKey');
  }

}
</script>
