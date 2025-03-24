<template>
  <div style="width: 87vw; height: 85vh" class="chart" />
</template>

<script>
import * as echarts from 'echarts'
import resize from '../mixins/resize'

export default {
  mixins: [resize],

  props: {
    data: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      chart: null,
      months: []
    }
  },

  mounted() {
    const option = {
      legend: {},
      tooltip: {
        trigger: 'axis',
        showContent: false
      },
      dataset: {
        source: [
          ['product', '2001', '2002', '2003', '2004', '2005', '2006'],
          ['Milk Tea', 56.5, 82.1, 88.7, 70.1, 53.4, 85.1],
          ['Matcha Latte', 51.1, 51.4, 55.1, 53.3, 73.8, 68.7],
          ['Cheese Cocoa', 40.1, 62.2, 69.5, 36.4, 45.2, 32.5],
          ['Walnut Brownie', 25.2, 37.1, 41.2, 18, 33.9, 49.1]
        ]
      },
      xAxis: { type: 'category' },
      yAxis: { gridIndex: 0 },
      grid: { top: '55%' },
      series: [
        {
          type: 'line',
          smooth: true,
          seriesLayoutBy: 'row',
          emphasis: { focus: 'series' }
        },
        {
          type: 'line',
          smooth: true,
          seriesLayoutBy: 'row',
          emphasis: { focus: 'series' }
        },
        {
          type: 'line',
          smooth: true,
          seriesLayoutBy: 'row',
          emphasis: { focus: 'series' }
        },
        {
          type: 'line',
          smooth: true,
          seriesLayoutBy: 'row',
          emphasis: { focus: 'series' }
        },
        {
          type: 'pie',
          id: 'pie',
          radius: '30%',
          center: ['50%', '25%'],
          emphasis: {
            focus: 'self'
          },
          label: {
            formatter: '{b}: {@2012} ({d}%)'
          },
          encode: {
            itemName: 'product',
            value: '2006',
            tooltip: '2006'
          }
        }
      ]
    }

    this.chart = echarts.init(this.$el)
    this.chart.setOption(option)

    this.$nextTick(() => {
      this.updateChart(this.chart)
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

    updateChart(chart) {
      chart.on('updateAxisPointer', function(event) {
        const xAxisInfo = event.axesInfo[0]
        if (xAxisInfo) {
          const dimension = xAxisInfo.value + 1
          chart.setOption({
            series: {
              id: 'pie',
              label: {
                formatter: '{b}: {@[' + dimension + ']} ({d}%)'
              },
              encode: {
                value: dimension,
                tooltip: dimension
              }
            }
          })
        }
      })
    },

    getMonths(data) {
      const months = new Set(data.map(i => i.Mon).sort((a, b) => (a - b)))
      console.log(months)
    }

  }
}
</script>
