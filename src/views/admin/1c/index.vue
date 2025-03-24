<template>
  <v-container fluid grid-system-md class="text-center">
    <v-btn
      color="primary"
      class="mb-5"
      @click="getJSON"
    >Получить json
    </v-btn>
    <v-card>
      <v-progress-circular v-if="list.length === 0 && loading" indeterminate width="1" size="50" class="my-5" />
      <v-data-table
        v-else
        :headers="headers"
        :items="list.data"
      />
    </v-card>
  </v-container>
</template>

<script>
import axios from 'axios'
export default {
  data() {
    return {
      loading: false,
      list: [],
      headers: [
        {
          text: 'Арт.',
          value: 'articul'
        },
        {
          text: 'Имя',
          value: 'name'
        },
        {
          text: 'Кол-во',
          value: 'qti'
        },
        {
          text: 'PN.',
          value: 'partNum'
        },
        {
          text: 'Арт. ТСД',
          value: 'articulTSD'
        }
      ]
    }
  },
  methods: {
    async getJSON() {
      this.loading = true
      const res = await axios({
        method: 'get',
        url: '/getDataFrom1C'
      })
      this.list = res.data
      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
