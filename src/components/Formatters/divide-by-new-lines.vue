<template>
  <span v-html="divide(row[column])" :style="{ 'font-weight': isManyRows > 0 ? 'bold' : null }"></span>
</template>

<script>

export default {
  name: 'DivideByNewLines',
  props: ['row', 'column'],

  computed: {
    isManyRows() {
      const arr = this.row[this.column].split(',');
      return arr.length - 1
    }
  },

  methods: {
    divide(data) {
      return data.replace(',', "<br>")
    }
  }
}
</script>