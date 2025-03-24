<template>

    <el-card>
      <div slot="header" class="title">
        <span>Отсрочка:</span>
        <el-button
            type="success"
            @click="save"
            :disabled="!isDaysNotSet"
            size="mini"
            class="ml-2"
            style="height: 32px;"
          >
            <el-icon class="el-icon-success" style="font-size: 1.35em"></el-icon>
          </el-button>
      </div>
        
        <el-row type="flex" style="margin: 3px 0">
          <el-input
            placeholder="Введите число"
            v-model="days"
            type="text"
            :minlength="0"
            :maxlength="3"
            onkeypress="return event.charCode >= 48 && event.charCode <= 57"
            clearable
            size="large"
          >
          </el-input>
        </el-row>
    </el-card>

</template>

<script>

import { setDelay } from '@/api/crm';

export default {
  props: ['id', 'delay'],

  data() {
    return {
      localloading: false,
      days: 0,
    }
  },

  computed: {
    isDaysNotSet() {
      return !!this.days;
    }
  },

  watch: {
    delay(val) {
      this.days = val
    }
  },

  methods: {

    save() {

      setDelay({ id: this.id, PAY_DELAY: this.days })
        .then(res => {
          if (res.affectedRows > 0) {
            this.$notify({ type: "success", message: "Отсрочка успешно установлена" })
          } else {
            this.$notify({ type: "error", message: "Ошибка в процессе установки отсрочки" })
          }
        })

    },


  }
}
</script>

<style lang="scss" scoped>
.text {
  font-size: 14px;
}

.item {
  margin-bottom: 20px;
}

.title {
  display: flex;
  justify-content: space-between;
}

.box-card {
  max-width: 680px;
}
</style>
