<template>
    <div :style="{ cursor: 'pointer', backgroundColor: !!checked ? '#b8ffb8' : '' }">
      <el-dialog
        title="Кол-во ЗИП на складе ИМ"
        :visible.sync="show"
        :close-on-click-modal="false"
        destroy-on-close
        width="450px"
        >
        <div v-if="info">Редактор: {{  info.user  }}</div>
        <div v-if="info" style="margin-bottom: 10px">Дата: {{  info.date  }}</div>

        <el-form>
          <el-form-item>
            <el-input v-model="qty" type="number" placeholder="Кол-во"></el-input>
          </el-form-item>

          <el-form-item>
            <el-input type="textarea" v-model="comment" placeholder="Комментарий"></el-input>
          </el-form-item>

          <el-form-item>
            <el-row type="flex" justify="center">
              <div>
                <div>Стелаж</div>
                <el-input type="number" v-model="rack" style="width: 100px"  class="mr-3"></el-input>
              </div>
              <div>
                <div>Полка</div>
                <el-input type="number" v-model="shelf" style="width: 100px"  class="mr-3"></el-input>
              </div>
              <div>
                <div>Место</div>
                <el-input type="number" v-model="place" style="width: 100px"  class=""></el-input>
              </div>
            </el-row>
          </el-form-item>

          <el-divider>Сообщение для отправки по почте:</el-divider>

          <el-form-item>
            <el-row type="flex" align="" :gutter="15">
              <el-col :span="18">
                <el-input type="textarea" rows="3" v-model="comment_email" placeholder="Комментарий"></el-input>
              </el-col>
              <el-col :span="6" style="display: flex; flex-direction: column;">
                <el-input v-model="qty_email" type="number" placeholder="Кол-во" class="mb-2"></el-input>
                <el-button :disabled="isDisabled()" type="success" size="mini" @click="send" >Отправить</el-button>
              </el-col>
  
            </el-row>

          </el-form-item>

          <el-divider />


          <el-form-item>
            <el-checkbox v-model="checked">Проверено: </el-checkbox>
          </el-form-item>

        </el-form>

        <span slot="footer">
          <el-button
            type="primary"
            :disabled="comment === comment_old && qty === qty_old && checked === checked_old"
            @click="save">
            Сохранить
          </el-button>
        </span>
      </el-dialog>
      
      <div
        @click="setVisible"
        style="width: 100%; height: 20px"
        >
        {{ row[column] }}
      </div>
    
    </div>
</template>

<script>

import { update, getInfo, sendRequest } from '@/api/market/sklad-im.js'
import { getUserName } from '@/filters/jira-users'

export default {
  name: 'EditSkladIm',
  props: ['row', 'column'],

  data() {
    return {
      qty: null,
      qty_email: null,
      comment: null,
      comment_email: null,
      rack: '',
      rack_old: '',
      shelf: '',
      shelf_old: '',
      place: '',
      place_old: '',
      comment_old: null,
      qty_old: null,
      show: false,
      info: null,
      checked: false,
      checked_old: false,
    }
  },

  computed: {
    user() {
      return this.$store.getters.currentUser
    }
  },

  mounted() {
    this.qty = this.row[this.column];
    this.checked = this.row['marketIMChecked']

  },

  methods: {
    cancel() {
      this.show = false;
      this.qty = null;
    },

    setVisible() {
      this.show = true;
      this.getInfo();
    },

    isDisabled() {
      return !this.comment_email && !this.qty_email;
    },
    

    save() {
      const data = {
          market_id: this.row.marketid,
          name: this.row.marketNAME,
          pn: this.row.marketPN,
          condition: this.row.marketCOND,
          articul: this.row.marketART,
          price: this.row.marketPRICE,
          qty: Number(this.qty),
          qty_old: this.qty_old,
          comment: this.comment,
          comment_old: this.comment_old,
          checked: !!this.checked,
          checked_old: !!this.checked_old,
          rack: this.rack,
          rack_old: this.rack_old,
          shelf: this.shelf,
          shelf_old: this.shelf_old,
          place: this.place,
          place_old: this.place_old,
          email: this.user.email,
          display_name: getUserName(this.user.email)
      }

      update(data)
        .then(res => {
          if (res.affectedRows) {
            this.$notify({ type: "success", message: "Данные успешно обновлены" })
          }
          // eslint-disable-next-line vue/no-mutating-props
          this.row[this.column] = this.qty;
          // eslint-disable-next-line vue/no-mutating-props
          this.row["marketIMComment"] = this.comment;
          // eslint-disable-next-line vue/no-mutating-props
          this.row["marketIMAddress"] = this.rack + ' * ' + this.shelf + ' * ' + this.place;
        })
        .catch(err => {
          this.$notify({ type: "error", message: err.message })
        })

      this.show = false;
    },


    send() {
      sendRequest({
        market_id: this.row.marketid,
        name: this.row.marketNAME,
        articul: this.row.marketART,
        qty: this.qty_email,
        comment: this.comment_email,
        email: this.user.email,
        display_name: getUserName(this.user.email)
      })
      .then(() => {
        this.$notify({ type: "success", message: "Запрос успешно отправлен" })
      })
      .catch(err => {
        this.$notify({ type: "error", message: "Ошибка при отправки запроса: " + err.message })
      })
      .finally(() => this.show = false)
    },


    getInfo() {
      getInfo({ market_id: this.row.marketid })
        .then(res => {
          if (res.length && !this.qty) {
            this.qty = 0;
          }

          console.log('getInfo', res)

          this.info = res.map(item => {
            this.comment = item.comment;
            this.comment_old = item.comment;
            this.qty_old = item.qty;
            this.qty = item.qty;
            this.checked = !!item.checked;
            this.rack = item.rack;
            this.rack_old = item.rack;
            this.shelf = item.shelf;
            this.shelf_old = item.shelf;
            this.place = item.place;
            this.place_old = item.place;
            this.checked_old = !!item.checked;

            return { user: getUserName(item.user), comment: item.comment, date: new Date(item.date).toLocaleDateString("ru") }
          })[0];


        })
    }
  },
}
</script>

<style lang="scss" scoped>
</style>
