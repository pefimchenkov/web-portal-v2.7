<template functional>
  <v-tooltip top>
    <template #activator="{on}">
      <span v-on="on">{{ props.row[props.column] }}</span>
    </template>
    <span>{{ 'Дата обновления -' + new Date(props.row['skladDATE']).toLocaleDateString('ru-Ru', { hour: 'numeric', minute: 'numeric' }) }}</span>
  </v-tooltip>
</template>

<script>

export default {
  name: 'SkladUpdated',
}
</script>
