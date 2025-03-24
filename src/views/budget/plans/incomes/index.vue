<template>
  <v-container fluid class="mt-2">

    <v-row justify="center" align="center">
      <v-col xs="12" sm="12" md="12" lg="12" xl="6">
        <Clients />
      </v-col>
      <v-divider :vertical="['xl','lg'].includes($vuetify.breakpoint.name)" :class="{'pa-1': !['xl','lg'].includes($vuetify.breakpoint.name)}" />
      <v-col xs="12" sm="12" md="12" lg="12" xl="6">
        <Projects />
      </v-col>
    </v-row>

  </v-container>
</template>

<script>

import Projects from './projects.vue'
import Clients from './clients.vue'

export default {

  components: {

    Projects,
    Clients

  },

  data() {
    return {

    }
  }

}
</script>

<style lang="scss" scoped>

</style>
