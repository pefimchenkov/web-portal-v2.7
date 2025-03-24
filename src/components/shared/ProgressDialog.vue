<template>
  <v-dialog
    :value="dialog"
    width="800"
    @click="close"
  >
    <v-card
      color="warning"
      dark
      class="pa-4"
    >
      <v-card-text
        class="white--text"
      >
        {{ infoText }}
        <v-progress-linear
          indeterminate
          color="white"
          class="ma-3"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  // eslint-disable-next-line vue/require-prop-types
  props: ['show', 'infoText'],
  data() {
    return {
    }
  },
  computed: {
    dialog() {
      return this.show
    }
  },
  watch: {
    show(val) {
      console.log(val)
      this.showLocal = val
    }
  },
  mounted() {
  },
  methods: {
    close() {
      this.dialog = false
    }
  }
}
</script>
