<template>
  <v-toolbar color="#eaeff5" class="text-lg-right elevation-2 mb-1" dense style="width: 100%">
    <v-toolbar-title>{{ moduleName }}</v-toolbar-title>
    <v-divider class="mx-3" inset vertical />
    <!-- Опции таблицы -->
  </v-toolbar>
</template>

<script>
export default {
  data() {
    return {
      moduleName: null
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
