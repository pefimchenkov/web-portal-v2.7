<template>
  <div style="width: 90vw; height: 85vh" class="chart" />
</template>

<script>
import * as echarts from 'echarts'
import resize from '../mixins/resize'
import { getMonthName } from '@/utils'

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
      title: {
        text: 'По моделям'
      },
      tooltip: {
        trigger: 'axis',
        order: 'valueDesc',
        extraCssText: 'font-size: 0.9em; line-height: 20px',
        position: function(point, params, dom, rect, size) { // fixed at top
          return [point[1], '1%']
        },
        axisPointer: {
          type: 'shadow'
        },
        formatter: function(params) {
          const sorted = params.sort((a, b) => (b.value - a.value))
          let output = '<b>' + sorted[0].name + '</b><br/>'
          for (let i = 0; i < sorted.length; i++) {
            if (sorted[i].value) {
              output += `<div style="float: left; margin-right: 15px">${sorted[i].marker + sorted[i].seriesName}:</div><div style="float: right;"><b>${sorted[i].value}</b></div>`
              if (i !== sorted.length - 1) {
                output += '<br/>'
              }
            }
          }
          return output
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: this.getMonths(this.data)
      },
      yAxis: {
        type: 'value'
      },
      series: this.createSeries()
    }

    this.createSeries()
    this.chart = echarts.init(this.$el)
    this.chart.setOption(option)
  },

  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },

  methods: {

    getMonths(data) {
      const months = this.months = [...new Set(data.map(i => (JSON.stringify({ m: i.Mon, y: i.Yea }))))].map(i => (JSON.parse(i)))
      return months.map(i => getMonthName(i.m - 2) + ' ' + i.y)
    },

    allUniqLines() {
      return [...new Set(this.data.map(i => i.ArtF))]
    },

    createLine(art) {
      return {
        name: art,
        type: 'line',
        smooth: true,
        lineStyle: {
          type: 'lines'
        },
        tooltip: {
          textStyle: {
            fontStyle: 'italic'
          }
        },
        data: this.getDataByMonth(art)
      }
    },

    getDataByMonth(art) {
      let arr = []
      this.months.forEach(i => {
        const item = this.data.find(e => (e.Yea === i.y && e.Mon === i.m && e.ArtF === art))
        if (item) arr.push(item.q)
        else arr.push(0)
      })
      if (arr.every(i => i < 20)) {
        arr = []
      }
      return arr
    },

    createSeries() {
      return this.allUniqLines().map(art => {
        // console.log(this.createLine(art))
        const line = this.createLine(art)
        if (line.data.length !== 0) return line
      })
    }

  }
}
</script>
