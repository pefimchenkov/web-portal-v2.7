<template>
  <div>
    <el-row>

    <div class="mb-2" style="text-align: end; background: #f3f3f3;">
    <label>Размер шрифта:&nbsp;&nbsp;</label>
      <el-select
            v-model="fontSize"
            size="mini"
          >
              <el-option
                v-for="item in labelsFont"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
          </el-select>
    </div>

      <el-col>
        <PaymentReceiver
          :font-size="fontSize"
          @changeData="changeData"
          @changeFirm="changeFirm"
        />
      </el-col>
    </el-row>

      <el-divider></el-divider>

    <el-row>
      <el-col>
        <PaymentReceiverNull
          v-if="firm"
          :font-size="fontSize"
          :date="date"
          :firm="firm"
        />
      </el-col>
    </el-row>
  
  </div>

</template>

<script>

// import ExpenseItem from './expense_item.vue'
import PaymentReceiver from './payment_receiver.vue'
import PaymentReceiverNull from './payment_receiver_null.vue'

export default {

  components: {

    PaymentReceiverNull,
    PaymentReceiver

  },

  data() {
    return {
      firm: null,
      fontSize: 12,
      labelsFont: [10, 12, 14, 16],
      date: null,

    }
  },


  methods: {
    changeData({ date, firm }) {
      this.date = date;
      this.firm = firm
    },

    changeFirm({ firm }) {
      this.firm = firm
    }
  }

}
</script>

<style lang="scss" scoped>

</style>
