<template>
  <span :style="{ 'color': checkDolg(column)}">{{ typeof row[column] === "number" ? row[column].toLocaleString("ru") : null }}</span>
</template>

<script>

export default {
  props: ['row', 'column'],

  mounted() {
    this.checkDolg(this.column) 
  },

  methods: {

    checkDolg(column) {
      if (column === 'dolg_red') return 'red'
    // if (column === 'dolg_orange') return 'orange'
    },

  }
}
</script>