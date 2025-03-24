<template>
  <v-container>
    <v-layout row>
      <v-flex v-if="loading" xs12 class="text-xs-center pt-5">
        <v-progress-circular :size="60" color="primary" indeterminate />
      </v-flex>
      <v-flex v-else-if="!loading && orders.length !== 0" xs12 sm6 offset-sm3>
        <h1 class="text--secondary mb-3">Заказы</h1>
        <v-list subheader two-line>
          <v-list-tile v-for="order in orders" :key="order.id" avatar>
            <v-list-tile-action>
              <v-checkbox :input-value="order.done" color="success" @click="markDone(order)" />
            </v-list-tile-action>

            <v-list-tile-content>
              <v-list-tile-title>{{ order.name }}</v-list-tile-title>
              <v-list-tile-sub-title>{{ order.phone }}</v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-btn class="primary" :to="'/ad/' + order.adId">Открыть</v-btn>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </v-flex>
      <v-flex v-else xs12 class="text-xs-center pt-5">
        <h1 class="text--secondary">У вас ещё нет никаких заказов</h1>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  computed: {
    loading() {
      return this.$store.getters.loading
    },
    orders() {
      return this.$store.getters.orders
    }
  },
  created() {
    this.$store.dispatch('fetchOrders')
  },
  methods: {
    markDone(order) {
      this.$store
        .dispatch('markOrderDone', order.id)
        .then(() => {
          order.done = true
        })
        .catch(() => {})
    }
  }
}
</script>
