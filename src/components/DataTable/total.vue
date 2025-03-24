<template>
  <tr :style="`background: ${variables.panelBg}`">
    <td v-for="(item, index) in headers" :key="index">
      <span v-if="isEnabled(item)">Итого:
        <el-input v-if="data.length" v-model="summ[item.value]" readonly size="small" style="margin-bottom: 5px;" />
      </span>
    </td>
  </tr>
</template>

<script>
import variables from '@/styles/variables.scss'
export default {
  props: {
    headers: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Array,
      default: () => []
    },
    data: {
      type: Array,
      default: () => {}
    },
    locale: {
      type: String,
      default: () => 'ru'
    },
    localeOptions: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      summ: {}
    }
  },
  computed: {
    variables() {
      return variables
    },
  },
  watch: {
    data(val) {
      this.columns.forEach(key => {
        this.summ[key] = val
          .map(obj => obj[key])
          .reduce((acc, curr) => {
            return acc + curr
          }, 0)
          .toLocaleString(this.locale, this.localeOptions)
      })
    }
  },
  methods: {
    isEnabled(item) {
      return this.columns.includes(item.value)
    }
  },
}
</script>

<style lang="scss" scoped>

</style>
