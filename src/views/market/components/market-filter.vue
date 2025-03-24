<template>
  <v-card
    class="mx-auto"
    max-width="400"
    tile
  >

    <v-list v-loading="loading" expand flat min-width="400">

      <v-list-item-group color="success">

        <v-list-item v-if="selects.length > 0">
          <v-btn
            block
            depressed
            small
            elevation="0"
            @click="resetAll"
          >
            Сбросить
          </v-btn>
        </v-list-item>
        <v-list-item>
          <v-autocomplete
            :key="type.id || 1"
            v-model.lazy="type"
            placeholder="Тип устройства"
            :items="types"
            item-text="name"
            no-data-text="нет данных"
            hide-details
            filled
            dense
            return-object
            @input="setType"
          />
        </v-list-item>
        <v-list-item
          v-for="select of selects"
          :key="select.id || 2"
          :style="getItems(select.name).length === 0 ? 'cursor: auto !important;' : ''"
        >
          <v-select
            v-model="filter[select.name]"
            :label="select.name"
            :items="getItems(select.name)"
            :disabled="getItems(select.name).length === 0"
            item-text="name"
            no-data-text="нет данных"
            item-color="success"
            color="success"
            :success="!!filter[select.name]"
            multiple
            return-object
            hide-details
            clearable
            outlined
            :filled="getItems(select.name).length === 0"
            dense
            :style="'heith: 10px !important;'"
            class="font-weight-medium"
            @input="setField(filter)"
          />
        </v-list-item>
        <v-list-item>
          <v-btn
            block
            depressed
            small
            elevation="0"
            @click="resetAll"
          >
            Сбросить
          </v-btn>
        </v-list-item>

      </v-list-item-group>

    </v-list>

  </v-card>
</template>

<script>
import { getTechProps, getTechPropsVal } from '@/helpers/market/tech-props-filter'

export default {
  props: {
    types: {
      type: [Array, Object],
      default: null
    }
  },
  data() {
    return {
      type: {},
      selects: [],
      items: [],
      filter: [],
      tp: {},
      init: true,
      loading: false
    }
  },

  watch: {
    type(val) {
      this.loading = true
      this.selects = []
      if (!this.init) {
        localStorage.setItem('techPropsFilter', JSON.stringify({ type: val }))
        this.setField([])
        this.tp.props = []
        this.filter = []
      }
      this.setPropsAndValues(val)
      this.init = false
    }
  },

  async created() {
    this.tp = await JSON.parse(localStorage.getItem('techPropsFilter'))
    if (this.tp) this.type = this.tp.type
  },

  methods: {
    getItems(name) {
      const item = this.items.find(item => item.name === name)
      return item
        ? item.values
        : []
    },

    setPropsAndValues(val) {
      getTechProps(val).then(res => {
        const props = [...res]

        getTechPropsVal(props)
          .then(res => {
            this.items = res.sort(i => {
              return i.values.length > 0
                ? -1
                : 1
            })

            this.items.forEach(item => {
              const obj = props.find(el => el.name === item.name)
              this.selects.push(obj)
            })

            if (this.tp && this.tp.props) {
              this.selects.forEach(item => {
                const arr = this.tp.props.find(el => {
                  return el[0]
                    ? el[0].parent_id === item?.id
                    : el.parent_id === item?.id
                })
                this.filter[item.name] = arr
              })
            }

            this.selects.sort(item => {
              const obj = this.filter[item.name]

              if (obj) return -1
              else return 1
            })

            this.loading = false
          })
      })
    },

    setType() {
      this.$emit('setType', this.type)
    },

    setField(val) {
      const new_arr = []
      for (const item in val) {
        if (val[item]) {
          if (val[item].length === 0) {
            delete val[item]
          } else {
            new_arr.push(val[item])
          }
        }
      }
      localStorage.setItem('techPropsFilter', JSON.stringify({ type: this.type, props: new_arr }))
      this.$emit('setTpFilter', new_arr)
      // this.setPropsAndValues(this.type)
    },

    clearField(val) {
      this.$emit('clearTpFilter', val)
    },

    resetAll() {
      this.$emit('resetTpFilter')
      this.filter = this.type = []
      localStorage.removeItem('techPropsFilter')
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
