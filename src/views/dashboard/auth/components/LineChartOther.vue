<template>
  <div :class="className" :style="{ height:height, width:width }" />
</template>

<script>
import * as echarts from 'echarts'
import resize from './mixins/resize'
import { getMonthName } from '@/utils'

export default {
  mixins: [resize],

  props: {

    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '350px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    chartData: {
      type: Object,
      required: true
    }

  },

  data() {
    return {

      chart: null

    }
  },

  watch: {

    chartData: {

      deep: true,
      handler(val) {
        this.setOptions(val)
      }

    }

  },

  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },

  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },

  methods: {

    initChart() {
      this.chart = echarts.init(this.$el)
      this.setOptions(this.chartData)
    },

    setOptions({ createdData, resolvedData, interval } = {}) {
      this.chart.setOption(
        {
          title : {
            text:"Ремонт остальные",
            x:'right'
          },
          xAxis: {
            data: getMonthName(interval),
            type: 'category',
            boundaryGap: false,
            axisTick: {
              show: false
            }
          },
          yAxis: {
            axisTick: {
              show: false
            }
          },
          grid: {
            left: 10,
            right: 10,
            bottom: 20,
            top: 30,
            containLabel: true
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross'
            },
            padding: [5, 10]
          },
          legend: {
            data: ['Созданные', 'Завершённые']
          },


          series: [
            {
              name: 'Созданные',
              itemStyle: {
                color: '#36a3f7',
                lineStyle: {
                  color: '#36a3f7',
                  width: 2
                }
              },
              smooth: true,
              type: 'line',
              data: createdData,
              animationDuration: 2800,
              animationEasing: 'cubicInOut'
            },
            {
              name: 'Завершённые',
              smooth: true,
              type: 'line',
              itemStyle: {
                color: '#34bfa3',
                lineStyle: {
                  color: '#34bfa3',
                  width: 2
                },
                areaStyle: {
                  color: '#f3f8ff'
                }
              },
              data: resolvedData,
              animationDuration: 2800,
              animationEasing: 'quadraticOut'
            }
          ]
        }
      )
    }
  }
}
</script>
