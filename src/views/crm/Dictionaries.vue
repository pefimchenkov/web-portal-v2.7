<template>
  <div>
    <v-tabs
      v-if="$acl.check('SuperFinancier')"
      v-model="active"
      icons-and-text
      grow
      background-color="white lighten-3"
    >
      <v-tabs-slider />

      <v-tab href="#tab-nofact-legpers">Непопавший факт: Юрлица
        <v-icon color="blue darken-2">mdi-archive</v-icon>
      </v-tab>
      <v-tab href="#tab-nofact-projects">Непопавший факт: Проекты 1С
        <v-icon color="blue darken-2">mdi-archive</v-icon>
      </v-tab>
      <v-tab-item :value="`tab-nofact-legpers`">
        <NofactLegpers :legpers="NoFactLegpers" />
      </v-tab-item>
      <v-tab-item :value="`tab-nofact-projects`">
        <NofactProjects :projects="NoFactProjects" />
      </v-tab-item>
    </v-tabs>
    <v-alert
      v-else
      outlined
      type="warning"
      prominent
      border="left"
      class="ma-5 pa-5 text-center"
    >
      Извините, но у Вас нет доступа к этому разделу. Для получения доступа обратитесь к вашему руководителю.
    </v-alert>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import NofactLegpers from '@/views/crm/components/nofact-legpers'
import NofactProjects from '@/views/crm/components/nofact-projects'

export default {
  components: {
    NofactLegpers,
    NofactProjects
  },

  data() {
    return {
      active: 'tab-nofact-legpers'
    }
  },

  computed: {
    ...mapGetters(['NoFactLegpers', 'NoFactProjects'])
  },

  created() {
    this.$store.dispatch('fetchNoFactLegpers')
    this.$store.dispatch('fetchNoFactProjects')
  }
}
</script>

<style lang="scss" scoped>
</style>
