<template>
  <div>
    <Confirm ref="confirm" />

    <v-dialog v-model="dialog" width="500px" persistent>
      <el-card class="pa-3 mx-auto" outlined>
        <v-card-title class="subheading">{{ label }}</v-card-title>
        <v-text-field
          ref="name"
          v-model="name"
          label="* Наименование"
          validation
          :rules="reqRules"
          required
        />
        <v-card-actions>
          <v-spacer />
          <el-button
            type="info"
            plain
            @click="close"
          >
            Отменить
          </el-button>
          <el-button
            type="success"
            plain
            :disabled="localloading"
            :loading="localloading"
            @click.native="save()"
          >
            Сохранить
          </el-button>
        </v-card-actions>
      </el-card>
    </v-dialog>

    <el-card>
      <div slot="header" class="title">
        <span>Домены</span>
        <el-button class="mx-2" type="primary" size="mini" @click="open(null)">
          <i class="el-icon-plus"></i>
        </el-button>
      </div>
      <el-row v-for="(item, index) in domains" :key="index" class="text item" type="flex">
        <el-col>{{ item.id }}</el-col>
        <el-col>{{ item.NAME }}</el-col>
        <el-col style="display: flex; justify-content: end;">
                <i class="el-icon-edit" @click="open(item)" style="margin-right: 15px"></i>
                <i class="el-icon-delete" @click="del(item)"></i>
        </el-col>
      </el-row>
    </el-card>

  </div>
</template>

<script>
import Confirm from '@/components/shared/Confirm'
export default {
  components: {
    Confirm
  },
  // eslint-disable-next-line vue/require-prop-types
  props: ['domains', 'id'],

  data() {
    return {
      dialog: false,
      localloading: false,
      name: null,
      domainID: null,
      label: '',
      reqRules: [
        v => !!v || 'Обязательный параметр!'
      ],
      editedIndex: -1
    }
  },

  methods: {
    open(item) {
      if (item) {
        this.editedIndex = this.domains.indexOf(item)
        this.name = item.NAME.replace('@', '')
        this.domainID = item.id
      }
      this.dialog = true
      this.label = 'Добавление домена'
    },

    save() {
      if (this.$refs.name.validate()) {
        const fullName = '@' + this.name
        if (this.editedIndex === -1) {
          this.$store.dispatch('addDomains', { id: this.id, name: fullName })
            .then(() => {
              this.$store.commit('setData', 'Юрлицо успешно добавлено.')
              this.close()
            })
        } else {
          this.$store.dispatch('updateDomains', { id: this.domainID, clientID: this.id, name: fullName })
            .then(() => {
              this.$store.commit('setData', 'Юрлицо успешно добавлено.')
              this.close()
            })
        }
      } else {
        this.$store.commit('setError', 'Заполните требуемые поля!')
      }
    },

    async del(item) {
      if (await this.$refs.confirm.open('Удаление', 'Вы уверены?', { color: 'red' })) {
        this.$store.dispatch('deleteDomains', { id: item.id })
          .then(() => {
            this.$store.commit('setData', 'Данные успешно удалены.')
          })
      } else {
        this.$store.commit('setInfo', 'Удаление отменено.')
      }
    },
    
    close() {
      this.dialog = false
      this.name = null
      this.domainID = null
      this.editedIndex = -1
    }
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
