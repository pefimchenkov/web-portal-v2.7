<template>

  <el-dropdown trigger="click" @command="handleCommand">
    <el-button size="mini" @click="getData">
      <svg-icon icon-class="exchange" class="mr-1" />
      Курсы валют
    </el-button>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item disabled>
        <div>
          <span style="margin-right: 10px">ЦБ:</span>
          <span style="margin-right: 10px">{{ "$ " + parseFloat(cbr_dollar).toFixed(2) }}</span>
          <span>{{ "€ " + parseFloat(cbr_euro).toFixed(2) }}</span>
        </div>
      </el-dropdown-item>
      <el-dropdown-item>
        <div>
          <span style="margin-right: 10px">Вебпортал:</span>
          $ <span style="margin-right: 10px">{{ dollar }}</span>
          € <span style="margin-right: 10px">{{ euro }}</span>
          ( <EditRate v-if="$acl.check('Edit')" :open-edit-dialog="openEditDialog" @closeDialog="openEditDialog = false" /> )
        </div>
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>

</template>

<script>

import { eventBus } from '@/main.js'
import { AclRule } from 'vue-acl'
import EditRate from './edit-rate.vue'

import { mapGetters } from 'vuex'

export default {

  components: { EditRate },

  data() {
    return {

      openEditDialog: false

    }
  },

  computed: {

    ...mapGetters(['dollar', 'euro', 'cbr_dollar', 'cbr_euro']),

    Edit() {
      return new AclRule('admin').or('nom').generate()
    }

  },


  methods: {

    handleCommand() {
      this.openEditDialog = true
      
    },

    async getData() {
      if (!this.cbr_dollar && !this.cbr_euro) {
        console.log('get rate')
        await this.$store.dispatch('getCurrency');
        await this.$store.dispatch('getRatefromCB');
      }

      eventBus.$on('Rate', (data) => {
        data.forEach(item => {
          if (item.name === 'Dollar') this.$store.commit('SET_DOLLAR', item.value);
          if (item.name === 'Euro') this.$store.commit('SET_EURO', item.value);
        })
      })
    }

  }

}
</script>

<style lang='scss' scoped>
</style>
