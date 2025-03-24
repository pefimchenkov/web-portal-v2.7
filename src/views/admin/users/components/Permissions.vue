<template>
  <v-card>
    <v-card-title>Выберите роли:</v-card-title>
    <v-divider />
    <v-card-text>
      <v-checkbox v-model="rolesObj[0].admin" class="mx-2" label="Администратор" hide-details />
      <v-checkbox v-model="rolesObj[1].agent" class="mx-2" label="Посредник" hide-details />
      <v-checkbox v-model="rolesObj[2].superFinancier" class="mx-2" label="Супер-финансист" hide-details />
      <v-checkbox v-model="rolesObj[3].limitedFinancier" class="mx-2" label="Финансист (с ограничениями)" hide-details />
      <v-checkbox v-model="rolesObj[4].financier" class="mx-2" label="Финансист" hide-details />
      <v-checkbox v-model="rolesObj[5].leadEngineer" class="mx-2" label="Ведущий инженер" hide-details />
      <v-checkbox v-model="rolesObj[6].engineer" class="mx-2" label="Инженер" hide-details />
      <v-checkbox v-model="rolesObj[7].serviceManager" class="mx-2" label="Сервис менеджер" hide-details />
      <v-checkbox v-model="rolesObj[8].manager" class="mx-2" label="Менеджер" hide-details />
      <v-checkbox v-model="rolesObj[9].crm" class="mx-2" label="CRM" hide-details />
      <v-checkbox v-model="rolesObj[10].nom" class="mx-2" label="Номенклатура" hide-details />
      <v-checkbox v-model="rolesObj[11].user" class="mx-2" label="Пользователь" hide-details />
    </v-card-text>
    <v-card-actions>
      <div style="margin: 0 auto">
        <v-btn color="blue darken-1" text @click="close()">Закрыть</v-btn>
        <v-btn color="blue darken-1" text @click="save()">Сохранить</v-btn>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script>

import { translateRoles } from '@/filters/translateRoles'

export default {
  filters: {
    translateRoles
  },
  props: {
    roles: {
      type: Array,
      required: true
    },
    uid: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      rolesObj: [
        { admin: false },
        { agent: false },
        { superFinancier: false },
        { limitedFinancier: false },
        { financier: false },
        { leadEngineer: false },
        { engineer: false },
        { serviceManager: false },
        { manager: false },
        { crm: false },
        { nom: false },
        { user: false }
      ]
    }
  },
  watch: {
    roles(val, oldval) {
      if (val !== oldval) {
        for (const obj of this.rolesObj) {
          obj[Object.keys(obj)[0]] = false
        }
        val.forEach(role => {
          const Obj = this.rolesObj.find(obj => Object.prototype.hasOwnProperty.call(obj, role))
          Obj[role] = true
        })
      }
    }
  },
  created() {
    this.roles.forEach(role => {
      const Obj = this.rolesObj.find(obj => Object.prototype.hasOwnProperty.call(obj, role))
      Obj[role] = true
    })
  },
  methods: {
    close() {
      this.$emit('close', { data: false })
    },
    save() {
      const result = []
      for (const obj of this.rolesObj) {
        const Obj = Object.entries(obj)[0]
        if (Obj[1] === true) result.push(Obj[0])
      }
      this.$store.dispatch('fb/saveUserRoles', { uid: this.uid, roles: result.join('&') }, { root: true })
      this.$emit('close', { data: false })
      this.$emit('update', { data: result.join('&') })
    }
  }
}
</script>

<style scoped>
</style>
