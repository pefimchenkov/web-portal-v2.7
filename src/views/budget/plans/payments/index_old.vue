<template>
  <v-container fluid class="mt-10">

    <v-row justify="center" align="center">
      <v-card
        class="mb-10"
        width="200"
      >
        <v-card-text>

          <v-select
            v-model="fontSize"
            label="Размер шрифта"
            :items="labelsFont"
          />

        </v-card-text>
      </v-card>
    </v-row>
    <v-row justify="center" align="center">
      <v-col xs="12" sm="12" md="12" lg="12" xl="6">
        <ExpenseItem :font-size="fontSize" />
      </v-col>
      <v-divider :vertical="['xl','lg'].includes($vuetify.breakpoint.name)" :class="{'pa-1': !['xl','lg'].includes($vuetify.breakpoint.name)}" />
      <v-col xs="12" sm="12" md="12" lg="12" xl="6">
        <PaymentReceiver :font-size="fontSize" />
      </v-col>
    </v-row>

  </v-container>
</template>

<script>

import ExpenseItem from './expense_item.vue'
import PaymentReceiver from './payment_receiver.vue'

export default {

  components: {

    ExpenseItem,
    PaymentReceiver

  },

  data() {
    return {

      fontSize: 12,
      labelsFont: [10, 12, 14, 16]

    }
  }

}
</script>

<style lang="scss" scoped>

</style>
