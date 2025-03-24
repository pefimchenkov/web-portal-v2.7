<template>
  <v-container fluid>

    <v-tabs
      v-model="active"
      centered
    >
      <v-tabs-slider />

      <v-tab href="#tab-1c">Строки выписки
      </v-tab>
      <v-tab href="#tab-jira">Оплаты
      </v-tab>

      <v-tab-item v-loading="!OneC?.length" :value="`tab-1c`">
        <OneC
          v-if="OneC"
          :pays="OneC"
        />
      </v-tab-item>
      <v-tab-item :value="`tab-jira`">
        <Jira v-if="OneC" :buhs="OneC" />
      </v-tab-item>

    </v-tabs>

  </v-container>
</template>

<script>

import OneC from './1c.vue'
import Jira from './jira.vue'

export default {

  components: {

    OneC, Jira

  },

  data() {
    return {

      active: `tab-1c`

    }
  },

  computed: {

    OneC() {
      return this.$store.getters['budget/pays/oneC'];
    },

  },

  created() {
    this.$store.dispatch('budget/pays/oneC', { root: true });
  }

}
</script>

<style lang="scss" scoped>

</style>
