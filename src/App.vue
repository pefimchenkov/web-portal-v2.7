<template>
  <div id="app" data-app>
    <v-app>
      <router-view />

      <template v-if="error">
        <v-snackbar top :timeout="5000" color="error" :value="true" @input="closeError()">
          {{ error }}
          <v-btn dark text @click.native="closeError()">Close</v-btn>
        </v-snackbar>
      </template>
      <template v-if="success">
        <v-snackbar top :timeout="5000" color="success" :value="true" @input="successDone()">
          {{ success }}
          <v-btn dark text @click.native="successDone()">Закрыть</v-btn>
        </v-snackbar>
      </template>
      <template v-if="info">
        <v-snackbar top :timeout="5000" color="info" :value="true" @input="closeInfo()">
          {{ info }}
          <v-btn dark text @click.native="closeInfo()">Закрыть</v-btn>
        </v-snackbar>
      </template>

    </v-app>
  </div>
</template>

<script>
export default {
  name: 'App',

  computed: {

    error() {
      return this.$store.getters.error
    },
    success() {
      return this.$store.getters.data
    },
    info() {
      return this.$store.getters.info
    }

  },

  methods: {

    closeError() {
      this.$store.dispatch('setError')
    },

    successDone() {
      this.$store.dispatch('setData')
    },

    closeInfo() {
      this.$store.dispatch('setInfo')
    }

  }
}
</script>

<style lang="scss">

@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300&family=Mulish&family=Nunito:wght@300&family=Play&display=swap');

.v-snack {
  z-index: 9999 !important
}

.v-window {
    overflow: inherit !important;
}

.pointer {
  cursor: pointer;
}

#app, .v-application {
  font-family: 'Play', 'Mulish', 'Nunito', 'IBM Plex Sans', sans-serif;
  font-size: 0.840rem !important;
}

.v-data-table td {
  font-size: 0.840rem !important;
}

.v-application ol, .v-application ul {
  padding-left: 0 !important;
}

.el-submenu__title i {
  color: #fff !important
}

.v-tabs-bar,
.v-tabs-items {
  background-color: transparent !important;
}

.container {
  padding: 6px !important;
}

.v-tab {
  font-size: 0.845rem !important;
}

.v-label {
  font-size: 14px !important;
  font-weight: 500;
  /* top: 0px !important; */
}

.v-text-field.v-input--dense .v-label {
    top: 10px !important;
}

/* .title {
  font-size: 1.3em;
  line-height: 1.5em;
  padding: 5px;
  background: #f0f0f0;
} */

.btn {
  font-size: 12px !important;
}

.v-btn__content {
  font-size: 12px !important;
}
#mydrawer a.active {
  color: rgb(241, 241, 241) !important;
}
.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.05s;
  transition-property: height, opacity;
  transition-timing-function: ease;
  overflow: hidden;
}
.fill-container {
  display: flex;
  align-items: center;
  height: -webkit-fill-available !important;
}
#nprogress .bar {
  background: red !important;
}

.v-picker__title {
  color: initial !important;
}
.v-date-picker-table .v-btn.v-btn--active {
  color: initial !important;
}
.v-messages[role="alert"] {
    color: red !important
}
.el-notification[role="alert"] {
  z-index: 9999 !important;
}
.el-input__prefix {
  left: 8px;
}
.el-select-dropdown__list {
  max-width: 600px !important;
}
.el-range-editor--mini .el-range-input {
  font-size: 11px;
}

</style>
