<!-- eslint-disable vue/no-mutating-props -->
<template>
  <tr v-if="categories.length" :style="`background: ${variables.panelBg}`">
    {{
      getTransformType()
    }}
    <td v-for="header in headers" :key="header.id" style="height: 40px">
      <!-- Инпут -->
      <el-input
        v-if="enableFilter('input', header.value)"
        v-model="filters[header.value]"
        size="small"
        clearable
        placeholder="текст"
        @focus="setWidth(header, filters[header.value])"
        @blur="resetWidth(header, filters[header.value])"
        @clear="clearWidth(header)"
      />

      <!-- Селект -->
      <el-select
        v-if="enableFilter('select', header.value)"
        v-model="filters[header.value]"
        size="small"
        clearable
        filterable
        placeholder="список"
        @visible-change="changeSelectWidth(header, filters[header.value], $event)"
        @clear="clearWidth(header)"
      >
        <el-option v-for="item in getOptions(header.value)" :key="item" :value="item" />
      </el-select>

      <!-- Мультиселект -->
      <el-select
        v-if="enableFilter('multiple', header.value)"
        v-model="filters[header.value]"
        size="small"
        clearable
        filterable
        multiple
        collapse-tags
        placeholder="мульти-список"
        @visible-change="changeSelectWidth(header, filters[header.value], $event)"
        @clear="clearWidth(header)"
      >
        <el-option 
          v-for="item in getOptions(header.value)"
          :key="item"
          :value="item"
          style="max-width: 800px;"
        >
          <span style="overflow: hidden">{{ item }}</span>
        </el-option>
      </el-select>

      <!-- Переключатель -->
      <el-switch
        v-if="enableFilter('switch', header.value)"
        v-model="filters[header.value]"
        active-text="Наличие"
        inactive-text="Всё"
      >
        />
      </el-switch>

      <!-- Чекбокс  -->
      <el-checkbox
        v-if="enableFilter('checkbox', header.value)"
        v-model="filters[header.value]"
      />

      <!-- Дата // :picker-options="pickerOptions" -->
      <el-date-picker
        v-if="enableFilter('date', header.value)"
        v-model="filters[header.value]"
        format="dd.MM.yy"
        placeholder="Выбор диапазона"
        :default-time="['00:00:00', '23:59:59']"
        type="daterange"
        value-format="timestamp"
        start-placeholder="От"
        end-placeholder="До"
        size="small"
        style="max-width: 190px"
      />

      <!-- Инпут диапазонный кастомный -->

      <template v-if="enableFilter('customrange', header.value)">
        <el-input-number v-model="filters[header.value][0]" :min="0" size="mini" />
        <el-input-number v-model="filters[header.value][1]" :min="0" size="mini" />
      </template>

      <!-- Слайдер диапазонный кастомный -->
      <!-- <div
        v-if="enableFilter('slider', header.value)"
      >
        <el-slider
          :key="key"
          v-model="filters[header.value]"
          range
          show-stops
          :max="slideMax"
        />
      </div> -->

      <!-- ОЧИСТКА ФИЛЬТРОВ -->
      <div style="display: flex">
        <el-tooltip class="item" effect="dark" content="Сбросить фильтры" placement="top">
          <i
            v-if="clear && header.value === 'actions'"
            class="el-icon-delete"
            style="font-size: 1.3em; cursor: pointer; margin: auto"
            :class="{
              isFiltersEmpty: dataInFilters,
              isFiltersNotEmpty: dataInFilters,
            }"
            @click="resetAll"
          />
        </el-tooltip>
      </div>
    </td>
  </tr>
</template>

<script>
import {
  filterForInput,
  filterForObjectInput,
  filterForSelect,
  filterForMultipleSelect,
  filterForSwitch,
  filterForDate,
  filterForCustomRange
} from '@/components/DataTable/utils.js'

import { getUserName } from '@/filters/jira-users.js'
import { translateCRMStatus } from '@/views/clients/utils.js'
import variables from '@/styles/variables.scss'

export default {
  name: 'Filters',
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    reference: {
      type: String,
      default: () => null,
    },
    headers: {
      type: Array,
      default: () => [],
    },
    filters: {
      type: Object,
      default: () => {},
    },
    options: {
      type: Object,
      default: () => {},
    },
    transform: {
      type: Array,
      default: () => [],
    },
    clear: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      inputMaxWidth: 300,
      slideMax: 1000,

      funcs: {
        input: filterForInput,
        objectinput: filterForObjectInput,
        select: filterForSelect,
        multiple: filterForMultipleSelect,
        checkbox: filterForSwitch,
        switch: filterForSwitch,
        date: filterForDate,
        customrange: filterForCustomRange,

        username: getUserName,
        status: translateCRMStatus,
        boolean: filterForSwitch,
      },

      pickerOptions: {
        disabledDate(time) {
          return (time.getTime()) > Date.now()
        },
      },
    }
  },

  computed: {
    variables() {
      return variables
    },
    categories() {
      return Object.keys(this.options)
    },
    dataInFilters() {
      return Object.values(this.filters).some((item) => {
        if (Array.isArray(item) && item.every(i => !i)) return
        if (Array.isArray(item)) return item.length > 0
        else return item
      })
    },
    transformKeys() {
      return this.transform.map((o) => Object.keys(o)[0])
    },
    transformValues() {
      return this.transform.map((o) => Object.values(o)[0])
    },
  },

  watch: {
    headers: {
      deep: true,
      handler(n, o) {
        if (n.length !== o.length) this.addFilterToHeader(this.headers)
      },
    },
    filters: {
      deep: true,
      handler(data) {
        const filters = Object.keys(data)
        if (data && filters.length) {
          localStorage.setItem(this.reference, JSON.stringify(data))
        }
      },
    },
    reference: {
      immediate: true,
      handler(val) {
        if (val) {
          const fromLocalStorage = JSON.parse(localStorage.getItem(val))
          if (fromLocalStorage) {
            const entry = Object.entries(fromLocalStorage)
            entry.forEach(item => {
              const header = this.headers.find(i => i.value === item[0])
              if (header && !header.width) {
                if (typeof item[1] === 'object' && item[1].length) header.width = this.inputMaxWidth
                if (typeof item[1] !== 'object' && item[1]) header.width = this.inputMaxWidth
              }
              if (Array.isArray(item[1]) && item[1].length === 2 && (!item[1][0] && !item[1][1])) {
                fromLocalStorage[header.value] = this.filters[header.value]
              }
            })
            this.$emit('updateFilters', fromLocalStorage)
          }
        }
      },
    },
  },

  mounted() {
    this.addFilterToHeader(this.headers)
  },

  methods: {
    enableFilter(types, val) {
      if (this.categories.includes(types)) {
        return this.options[types].includes(val)
      }
    },

    getOptions(header) {
      const uniqOptions = [...new Set(this.data.map((item) => item[header]))].sort() // .filter(i => i) - убираем пустые позиции
      if (this.transformValues.find((i) => i === header)) {
        const idx = this.transformValues.indexOf(
          this.transformValues.find((v) => v === header)
        )
        if (typeof this.funcs[this.transformKeys[idx]] === 'function') { return uniqOptions.map((i) => this.funcs[this.transformKeys[idx]](i)) }
      } else {
        return uniqOptions
      }
    },

    addFilterToHeader(headers) {
      headers.forEach((header) => {
        const type = this.getTransformType(header.value)
        this.categories.forEach((category) => {
          if (this.options[category].includes(header.value)) {
            header.filter = (value) =>
              this.funcs[category](value, this.filters[header.value], this.funcs[type])
          }
        })
      })
    },

    getTransformType(header) {
      if (this.transformValues.includes(header)) {
        const idx = this.transformValues.indexOf(
          this.transformValues.find((v) => v === header)
        )
        return this.transformKeys[idx]
      }
    },

    resetAll() {
      this.$emit('resetFilters')
      localStorage.removeItem(this.reference)
    },

    /* динамическая ширина поля ввода */
    changeSelectWidth(header, data, event) {
      if (data && data.length) return
      if (event) {
        header.initWidth = header.width
        header.width = this.inputMaxWidth
      } else {
        header.width = header.initWidth ?? ''
      }
    },

    setWidth(header, data) {
      if (data) return
      header.initWidth = header.width
      header.width = this.inputMaxWidth
    },

    resetWidth(header, data) {
      if (data) return
      header.width = header.initWidth ?? ''
    },

    clearWidth(header) {
      header.width = header.initWidth ?? ''
    },

  },
}
</script>

<style lang="scss" scoped>
.isFiltersEmpty {
  color: #999;
}
.isFiltersNotEmpty {
  color: red;
}
</style>
