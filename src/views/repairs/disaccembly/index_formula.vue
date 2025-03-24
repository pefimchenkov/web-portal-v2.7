<template>
  <el-row :gutter="10">

    <el-card
      id="formula"
      :body-style="{color: 'darkredred', display: 'flex', justifyContent: 'center', alignItems: 'end'}"
      style="margin: 10px; padding: 10px"
    >
        <span style="display: flex; align-items: center; height: 100%; font-size: 2.1em; margin: 5px;">Цена = </span>
        <div
          v-for="(item) in elements"
          :key="item.id"
        >
          <div v-if="!['action', 'bracket'].includes(item.type)">
            {{ item.title + ' №' + item.count }}
            <span v-if="item.options && item.value" style="color: red">{{ '(' + getOptionName(item.value, item.options) + ')' }}</span>
          </div>

          <!-- компонент знака -->
          <component
            v-if="['action', 'bracket'].includes(item.type)"
            :is="item.element"
            :value="item.value"
            :style="{'width': item?.width, 'margin': '5px', 'padding-left': '5px', 'font-size': '28px', 'display': 'flex', 'align-items': 'center', 'height': '100%'}"
          >
          {{ item.value }}
        </component>

          <!-- компонент выбора -->
          <div v-else style="display: flex; flex-direction: column-reverse">

            <component
              v-model="item.value"
              :is="item.element"
              :value="item.value"
              :style="{'width': item?.width, 'margin': '5px' }"
            >
            <template v-if="item.options">
              <el-option
              v-for="option in item.options"
              :key="option?.name"
              :value="option?.value"
            >
              {{ option?.name }}
              </el-option>
              </template>
            </component>

            <el-date-picker
              v-if="item.element === 'el-select'"
              v-model="item.date"
              type="monthrange"
              range-separator="To"
              start-placeholder="Start month"
              end-placeholder="End month"
              :style="{'width': '210px' }"
              size="mini"
              >
            </el-date-picker>

            <el-input
              v-if="item.name === 'additional'"
              v-model="item.title"
            >
            </el-input>

          </div>
        <!-- ***** -->
        </div>

        <el-row justify="center" align="middle" style="font-size: 2.5em;">
          <span v-if="result" style="margin-left: 10px"> = </span>
          {{ result }}
        </el-row>

    </el-card>

    <el-card>
      <el-button
        v-for="item in tags"
        :key="item.title"
        :disabled="item.disable"
        type="primary"
        size="mini"
        style="margin: 5px;"
        @click="addElements(item)"
      >
      {{ `${item.title}` }}
      </el-button>

      <div style="flex: 4 0 auto; text-align: end; width: 100%">
        <el-button
          v-if="elements.length"
          type="warning"
          size="mini"
          @click="removeLastElement"
        >
          Удалить последний елемент
        </el-button>

        <el-button
          v-if="isCanShow"
          type="success"
          size="mini"
          @click="calc"
        >
          Расчитать
        </el-button>

        <el-button
          v-if="isCanShow"
          type="primary"
          size="mini"
          @click="reset"
        >
          Сбросить
        </el-button>
      </div>

    </el-card>

  </el-row>
</template>

<script>
  export default {
    data() {
    return {
      tagsDefault: [
        {
          title: "K factor",
          element: "el-input",
          value: null,
          width: '100px',
          type: 'element',
          disable: false,
        },
        {
          title: "Driver",
          element: "el-select",
          value: null,
          date: null,
          options: null,
          type: 'element',
          disable: false,
        },
        {
          title: "Exchange Rate",
          element: "el-select",
          value: null,
          date: null,
          options: null,
          type: 'element',
          disable: false,
        },
        {
          title: "Packaging cost",
          element: "el-input",
          value: null,
          type: 'element',
          disable: false,
        },
        {
          title: "Pallet cost",
          element: "el-input",
          value: null,
          type: 'element',
          disable: false,
        },
        {
          title: "Transformation cost",
          element: "el-input",
          value: null,
          type: 'element',
          disable: false,
        },
        {
          title: "Commercial cost",
          element: "el-input",
          value: null,
          type: 'element',
          disable: false,
        },
        {
          title: "Margin",
          element: "el-input",
          value: null,
          type: 'element',
          disable: false,
        },
        {
          title: "Energy cost",
          element: "el-input",
          value: null,
          type: 'element',
          disable: false,
        },
        {
          title: "Additional cost",
          element: "el-input",
          name: 'additional',
          value: null,
          type: 'element',
          disable: false,
        },
        {
          title: "+",
          element: "div",
          value: '+',
          type: 'action',
          disable: true,
        },
        {
          title: "*",
          element: "div",
          value: '*',
          type: 'action',
          disable: true,
        },
        {
          title: "/",
          element: "div",
          value: '/',
          type: 'action',
          disable: true,
        },
        {
          title: "(",
          element: "div",
          value: '(',
          type: 'bracket',
          disable: false,
        },
        {
          title: ")",
          element: "div",
          value: ')',
          type: 'bracket',
          disable: true,
        }
      ],

      tags: [],
      result: null,
      elements: [],
      oneOffElements: [
        'Packaging cost',
        'Pallet cost',
        'Transformation cost',
        'Commercial cost',
        'Margin',
        'Energy cost'
      ],

      driverValues: [
        { name: 'Driver 1', value: 1 },
        { name: 'Driver 2', value: 2  },
        { name: 'Driver 3', value: 3  },
        { name: 'Driver 4', value: 4  },
        { name: 'Driver 5', value: 5  }
      ],

      exRate: [
        {name: 'USD/RUB', value: 70},
        {name: 'RUB/USD', value: Number((1 / 70).toFixed(3))},
        {name: 'EUR/RUB', value: 80},
        {name: 'RUB/EUR', value: Number((1 / 80).toFixed(3))},
        {name: 'USD/EUR', value: Number((70 / 80).toFixed(3))},
        {name: 'EUR/USD', value: Number((80 / 70).toFixed(3))}
      ],
    };
  },

  watch: {
    'elements': {
      deep: true,
      handler(val) {
        if (!val.length) this.tags = JSON.parse(JSON.stringify(this.tagsDefault))
      }
    }
  },

  created() {
    this.elements.push({
      count: 1,
      date: null,
      disable: false,
      element: "el-select",
      id: 1,
      options: Array(6),
      title: "Exchange Rate",
      type: "element",
      value: "70",
    })

    const driverOptions = this.tagsDefault.find(item => item.title === 'Driver')
    const exchangeOptions = this.tagsDefault.find(item => item.title === 'Exchange Rate')
    driverOptions.options = [ ...this.driverValues ]
    exchangeOptions.options = [ ...this.exRate ]
    this.tags = JSON.parse(JSON.stringify(this.tagsDefault))

  },

  computed: {
    isCanShow() {
      return this.elements.length >= 3 && this.elements[this.elements.length - 1].type !== 'action'
    }
  },

  methods: {
    addElements(item) {
      this.elements.push({
        ...item,
        id: this.elements.length + 1,
        count: this.elements.filter(i => i.title === item.title).length + 1
      })
      this.checkElement()

      if (this.oneOffElements.includes(item.title)) {
        this.tags = this.tags.filter(i => i.title !== item.title)
      }
    },
    calc() {
      let res = ''
      this.elements.forEach(item => {
        res += item.value
      })

      this.result = Number(eval(res).toFixed(2));
      for (let i in this.tags) {
        this.tags[i].disable = true
      }

      console.log(this.elements);
    },

    reset() {
      this.elements = []
      this.tags = JSON.parse(JSON.stringify(this.tagsDefault))

      this.result = null
      
    },

    removeLastElement() {
      this.elements.splice(-1, 1)
      if (this.result) this.result = null
      this.checkElement()
    },

    getOptionName(value, options) {
      if (value && options) return options.find(option => option?.value === value)?.name
    },

    checkElement() {
      const lastElement = this.elements[this.elements.length - 1]

      if (['action', 'bracket'].includes(lastElement?.type)) {
        this.tags.forEach(item => {
          item.disable = item.type !== 'element'
        })
      }
      if (lastElement?.type === 'element') {
        this.tags.forEach(item => {
          item.disable = item.type === 'element' || item.value === '('
        })
      }
      if (lastElement?.type === 'bracket' && lastElement.value === '(') {
        this.tags.forEach(item => {
          item.disable = ['action', 'bracket'].includes(item.type)
        })
      }
      if (lastElement?.type === 'bracket' && lastElement.value === ')') {
        this.tags.forEach(item => {
          item.disable = !['action', 'bracket'].includes(item.type)
        })
      }
    }
  }

}
</script>

<style lang="scss" scoped>

.el-button--mini {
  font-size: 1.1em !important;
}

.el-input__prefix {
  left: 0 !important;
}

</style>