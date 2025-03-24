<template>
  <v-container grid-list-xl text-xs-center>
    <v-layout align-end row wrap class="mt-5">
      <v-flex xs4 offset-xs4>
        <v-card>
          <v-card-title class="info white--text subheading" primary-title>
            <span class="title">Страница не найдена!</span>
          </v-card-title>
          <v-card-text>Похоже, Вы перешли на <b>несуществующую</b> страницу или у Вас не хватает разрешений для <b>доступа</b> к этому ресурсу!</v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn flat class="info white--text" :to="this.$router.go(-1)">Назад</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  mounted() {
    console.log(this.$route.params)
  },
  methods: {
    redirect() {
      this.$router.push('error')
    }
  }
}
</script>
