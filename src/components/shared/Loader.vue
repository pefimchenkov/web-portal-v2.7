<template>
  <v-row align="center" :style="`width: ${width || 500}px; margin: auto 0`">
    <v-col
      v-for="n in qty || 56 "
      :key="n"
      class="el"
    />
  </v-row>
</template>

<script>
export default {
  name: 'Loader',
  // eslint-disable-next-line vue/require-prop-types
  props: ['width', 'qty', 'grid'],
  data() {
    return {}
  },
  mounted() {
    const targets = this.$el.children
    this
      .$anime({
        targets: targets,
        loop: true,
        duration: 300,
        delay: this.$anime.stagger(150, { grid: this.grid || [14, 4], from: 'center' }),
        scale: [
          { value: 0.1, easing: 'easeOutSine', duration: 400 },
          { value: 1, easing: 'easeInOutQuad', duration: 1100 }
        ]
      })
  }
}
</script>

<style scoped>
.el {
	background-color: rgb(209, 234, 243);
	margin: 5px;
}
</style>
