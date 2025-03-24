<template>
  <v-menu
    ref="menu"
    v-model="menu"
    :close-on-content-click="false"
    :return-value.sync="localFilter"
    transition="scale-transition"
    offset-y
    min-width="290px"
  >
    <template #activator="{ on, attrs }">
      <v-text-field
        v-model="dateRangeText"
        label="Выберите диапазон"
        prepend-icon="mdi-calendar"
        readonly
        v-bind="attrs"
        clearable
        style="font-size: 13px;"
        v-on="on"
      />
    </template>
    <v-date-picker
      v-model="localFilter"
      range
      no-title
      scrollable
      locale="ru-RU"
    >
      <v-spacer />
      <v-btn
        text
        color="primary"
        @click="resetFilter"
      >
        Сброс
      </v-btn>
      <v-btn
        text
        color="primary"
        @click="saveFilter"
      >
        OK
      </v-btn>
    </v-date-picker>
  </v-menu>
</template>

<script>

export default {

  props: {

    filter: {

      type: Array,
      required: true

    }

  },

  data() {
    return {

      menu: false

    }
  },

  computed: {

    localFilter: {

      get() {
        return this.filter
      },
      set(val) {
        this.$emit('updateFilter', val)
      }

    },

    dateRangeText: {
      get() {
        if (this.filter.length > 0) {
          const date0 = new Date(this.filter[0]).toLocaleDateString('ru-RU')
          const date1 = this.filter[1] ? new Date(this.filter[1]).toLocaleDateString('ru-RU') : 'не выбрано'
          return date0 + ' ~ ' + date1
        } else return null
      },
      set(val) {
        if (!val) this.$emit('resetFilter')
      }
    }

  },

  methods: {

    saveFilter() {
      this.$refs.menu.save(this.localFilter)
    },

    resetFilter() {
      this.localFilter = []
      this.$emit('resetFilter')
    }

  }

}

</script>

<style lang="scss" scoped>
</style>
