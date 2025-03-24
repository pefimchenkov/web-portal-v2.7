<template>

  <el-tabs
    ref="atlas"
    v-model="active"
    v-loading="loading"
    type="border-card"
    style="padding: 10px; margin: 10px"
  >
    <el-tab-pane
      v-for="item in items"
      :key="item.name"
      :name="item.name"
      :label="item.label"
    >
      <keep-alive>
        <component :is="item.component" :items="item.data" :market="market" />
      </keep-alive>

    </el-tab-pane>
  </el-tabs>

</template>

<script>

export default {
  components: {
    Goods: () => import('./components/Goods/index.vue'),
    Sales: () => import('./components/Sales/index.vue'),
    Invoices: () => import('./components/Invoices/index.vue'),
    Contractors: () => import('./components/Contractors/index.vue')
  },
  data() {
    return {
      items: [
        { name: 'getAtlasGoods',
          label: 'Склад',
          component: 'Goods',
          data: []
        },
        { name: 'getAtlasSales',
          label: 'Реализации',
          component: 'Sales',
          data: []
        },
        { name: 'getAtlasInvoice',
          label: 'Счета',
          component: 'Invoices',
          data: []
        },
        { name: 'getAtlasContractors',
          label: 'Контрагенты',
          component: 'Contractors',
          data: []
        },
      ],
      active: 'getAtlasGoods',
    }
  },

  computed: {
    isVisible() {
      return this.items[this.active]?.length
    },

    warehouses() {
      return this.$store.state.atlas_1c['warehouses']
    },

    market() {
      return this.$store.state.market_new.Market
    }
  },

  watch: {
    active: {
      immediate: true,
      handler(n, o) {
        if (n !== o) this.getData();
      }
    }
  },

  async created() {
    this.getMarket();
    if (!this.warehouses.length)
        await this.$store.dispatch(`atlas_1c/getAtlasWarehouses`)
  },

  methods: {
    getMarket() {
      if (!this.market.length) {
        this.$store.dispatch('market_new/get');
      }
    },

    async getData() {
      this.loading = true;

      let data = this.$store.state.atlas_1c[this.active].length
        ? this.$store.state.atlas_1c[this.active]
        : await this.$store.dispatch(`atlas_1c/${this.active}`)

      const item = this.items.find(i => i.name === this.active);
      

      if (item.data.length) {
        this.loading = false;
        return item.data;
      }

      if (this.active === 'getAtlasGoods') {
        item.data = data.map(i => {
          const obj = this.warehouses.find(j => j["Ссылка"] === i.warehouse)
          return { ...i, warehouse: obj ? obj["Наименование"] : null }
        })
      } else if (this.active === 'getAtlasContractors') {
        item.data = data.filter((value, index, self) => index === self.findIndex(t => t.id === value.id))
      } else {
        item.data = data
      }

      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
