<template>
  <div>
    <h3 style="margin-bottom: 10px">Выберите роли:</h3>
    <v-divider />
    <div v-for="(permission, i) in permissions" :key="i">
      <v-checkbox  v-model="permission['selected']" class="mx-2" :label="permission['rus']" hide-details />
    </div>
    <div style="display: flex; margin: 15px 0 0 0">
      <el-button style="flex: 1" type="info" plain @click="close()">Закрыть</el-button>
      <el-button style="flex: 1" type="success" plain @click="save()">Сохранить</el-button>
    </div>
  </div>
</template>

<script>

import data from './Permissions.js'
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
    _id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      permissions: []
    }
  },

  created() {
    console.log('created')
    this.permissions = [...data]

    for (const item of this.permissions) {
      if (this.roles.includes(item.eng)) item.selected = true
      else item.selected = false
    }
  },
  methods: {
    close() {
      this.$emit('close', { data: false })
    },
    async save() {
      const result = []
      for (const item of this.permissions) {
        if (item.selected) result.push(item.eng)
      }

      const user = await this.$store.dispatch('auth/saveUserRoles', { _id: this._id, roles: result }, { root: true })
      this.$emit('close', { data: false })
      this.$emit('update', user.roles )
    }
  }
}
</script>

<style scoped>
</style>
