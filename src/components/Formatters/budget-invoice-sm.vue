<template>
  <div>
    <span v-if="is_manual" :style="{ 'color': is_manual ? 'red' : '' }">*&nbsp;</span>
    <span :style="{ 'color': is_manual ? '#a92f09' : ''}">{{ sm }}</span>
  </div>
</template>

<script>

export default {
  props: ['row', 'column'],
  data() {
    return {
    }
  },

  computed: {
    sm() {
      return this.row[this.column]
    },

    is_manual() {
      return this.row['is_manual']
    }

  },

}
</script>

<style scoped>
</style>