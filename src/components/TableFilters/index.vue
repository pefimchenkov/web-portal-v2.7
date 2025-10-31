<template>
  <keep-alive>
    <component
      :is="isEnable(property)"
      :key="property"
      :reference="reference"
      :property="property"
      :filters="filters"
      :options="options"
      @input ="input"
      @resetFilters="resetFilters"
    />
  </keep-alive>

</template>

<script>
export default {
  components: {
    MultiSelect: () => import('./multiselect.vue'),
    Input: () => import('./input.vue'),
    InputNumber: () => import('./number-input.vue'),
    Select: () => import('./select.vue'),
    CheckBox: () => import('./checkbox.vue'),
    Switcher: () => import('./switcher.vue'),
    Date: () => import('./date.vue'),
    CustomRange: () => import('./customrange.vue'),
    Clear: () => import('./clear.vue')
  },


  props: {
    data: {
      type: Array,
      required: true
    },
    options: {
      type: Object,
      default: () => {}
    },
    types: {
      type: Object,
      default: () => {}
    },
    filters: {
      type: Object,
      required: true
    },
    formatters: {
      type: Array,
      default: () => []
    },
    property: {
      type: String,
      default: () => null
    },
    reference: {
      type: String,
      default: () => ''
    }
  },


  data() {
    return {
      filteredData: []
    }
  },


  /* created() {
    if (this.reference) {
      const fromLocalStorage = JSON.parse(localStorage.getItem(this.reference));
          if (fromLocalStorage && Object.keys(fromLocalStorage).length) {
            this.$emit('updateFilters', fromLocalStorage)
            this.filterHandler(fromLocalStorage)
          }
    }
  }, */


  methods: {

    isEnable(property) {
      const entries = Object.entries(this.types)
      const header = entries.find(e => e[1].includes(property))
      return header ? header[0] : null
    },

    resetFilters() {
      this.$emit('resetFilters')
      localStorage.removeItem(this.reference)
    },



    input() {
      this.$emit('updateData')
    }





    /* filterHandler(filters) {
      console.time('filterHandler')

      localStorage.setItem(this.reference, JSON.stringify(filters))

      if (!Object.keys(filters).length) {
        this.$emit('updateData', null)
      }
      
      this.filteredData = this.data.filter(row => {
        return this.searchQuery(row, filters).every(i => i);
      })

      this.$emit('updateData', this.filteredData)
      console.timeEnd('filterHandler')
    },



    searchQuery(row, filters) {
      const result = [];

      Object
        .entries(filters)
        .forEach(([filter, search]) => {
          if (typeof search === 'string' && !search) return result.push(true)
          if (typeof search === 'boolean') return result.push(this.switchAndCheckFilter(search, row[filter], filter))
          if (Array.isArray(search) && search.every(i => (i && typeof i === 'string'))) return result.push(this.multiselectFilter(search, row[filter], filter))
          if (typeof search === 'string' ?? search) return result.push(this.inputAndSelectFilter(search, row[filter], filter))
          if (typeof search === 'number' ?? search) return result.push(this.strongEqualInput(search, row[filter], filter))

          return Array.isArray(search) && search.every(i => (i && (new Date(i).getFullYear() !== 1970)))
            ? result.push(this.dateFilter(search, row[filter]))
            : result.push(this.customRangeFilter(search, row[filter]))
        })
        return result
    },



    

    inputAndSelectFilter(search, value, key = null) {
      if (search === 'нет данных') return !value

      const data = this.formatters.find(i => i?.name === key)
      if (typeof data === 'object' && typeof data?.formatter === 'function') {
        return ((data.formatter(value))?.toString())?.toLowerCase().includes(search.toString()?.toLowerCase())
      }
      return (value?.toString())?.toLowerCase().includes((search.toString())?.toLowerCase())
    },



    strongEqualInput(search, value, key = null) {
      const data = this.formatters.find(i => i?.name === key)
      if (typeof data === 'object' && typeof data?.formatter === 'function') {
        return ((data.formatter(value))?.toString())?.toLowerCase() === (search.toString()?.toLowerCase())
      }

      return typeof value === 'string' && (value?.includes('.') || value?.includes(','))
        ? (value === search?.toFixed(2))
        : (value?.toString() === search?.toString())
      
    },



    switchAndCheckFilter(search, value, key = null) {
      const data = this.formatters.find(i => i?.name === key)
      if (typeof data === 'object' && typeof data?.formatter === 'function') {
        return search ? data.formatter(value) : true
      }
      return search ? value : true
    },



    multiselectFilter(search, value, key = null) {
      const data = this.formatters.find(i => i?.name === key)
      const splittedData = !value
        ? ['нет данных']
        : value?.split(', ')

      if (typeof data === 'object' && typeof data?.formatter === 'function') {
        return search.length
          ? data.formatter(value)?.split(', ').some(el => {
            if (!el) return search.includes('нет данных')
            return search.includes(el)
          })
          : true
      }


      return search.length
        ? splittedData.some(el => {
            if (!el) return search.includes('нет данных')
            return search.includes(el)
          })
        : true
    },



    dateFilter(search, value) {
      if (!search || !search.length) return true

      const time = new Date(value).getTime()
      return (time >= search[0] && time <= search[1])
    },



    customRangeFilter(search, value) {
      if (!search) return true

      const min = Number(search[0]);
      const max = Number(search[1]);
      const rowValue = typeof value === 'object'
        ? value?.data
        : value
  
      if (rowValue === undefined || rowValue === '') return false
      return (rowValue >= min && rowValue <= max)
    } */





  },
}
</script>

<style lang="scss" scoped>

</style>
