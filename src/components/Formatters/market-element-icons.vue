<template>
  <span>
    <router-link :to="{ path: `/zip/list/#${this.id}` }" style="cursor: pointer">
      {{ row[column] }}
    </router-link>
    <v-icon v-if="row['elementTYPE'] === 1 && row['marketPARTS'] === 0" class="mr-1">memory</v-icon>
    <v-icon v-if="row['elementTYPE'] === 1 && row['marketPARTS'] > 0" class="mr-1">mdi-cogs</v-icon>

    <v-icon v-if="row['elementTYPE'] === 2 && row['marketPARTS'] === 0" class="mr-1">phone_android</v-icon>
    <v-icon v-if="row['elementTYPE'] === 2 && row['marketPARTS'] > 0" class="mr-1">phonelink_setup</v-icon>
  </span>
</template>

<script>

export default {
  name: 'ElementIcons',
  props: ['row', 'column', 'id'],
}
</script>
