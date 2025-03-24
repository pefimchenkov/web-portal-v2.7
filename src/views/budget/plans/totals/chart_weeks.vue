<template>
  <div
    :class="className"
    :style="{ height, width }"
  />
</template>

<script>
import * as echarts from 'echarts'
import resize from '@/views/dashboard/auth/components/mixins/resize.js'

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
      default: '50dvh'
    },
    chartData: {
      type: Object,
      required: true
    }

  },

  data() {
    return {
      chart: null,
      payload: []
    }
  },

  watch: {

    /* payload: {
      deep: true,
      handler(val) {
        this.setOptions(val)
      }
    } */

  },

  created() {
    const startDate = new Date(new Date().getFullYear(), 0, 1);
    const endDate = new Date(new Date().getFullYear(), 11, 31);
    this.getDatesArray(startDate, endDate);
  },

  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },

  beforeDestroy() {
    if (!this.chart) return;

    this.chart.dispose()
    this.chart = null
  },

  methods: {

    initChart() {
      this.chart = echarts.init(this.$el)
      this.setOptions(this.payload)
    },



    getDatesArray(startDate, endDate) {
      const weeks = [];
      const { planOutcomeDays, planIncomeDays, factIncomeDays, factOutcomeDays } = this.chartData;

      for (let date = startDate; date <= endDate; date.setUTCDate(date.getUTCDate() + 1)) {
          const tzoffset = (new Date()).getTimezoneOffset() * 60000;

          let dateWithOffset = new Date(date).getTime() - tzoffset;
          const dateString = new Date(dateWithOffset).toISOString().split('T')[0];

          const monthName = new Date(dateString).toLocaleString('ru-RU', { month: 'long' });

          weeks.push(
              { 
                  monthName,
                  weekId: this.weekNumber(dateString),
                  otgruzki: planIncomeDays.find(item => item.date === dateString)?.total,
                  buhs: planOutcomeDays.find(item => item.date === dateString)?.total,
                  incomes: factIncomeDays.find(item => item.date === dateString)?.total,
                  outcomes: factOutcomeDays.find(item => item.date === dateString)?.total,
              }
          );
      }


      const groupedWeeks = this.groupBy(weeks, 'weekId');

      this.payload= groupedWeeks.map(item => {
          return {
              weekId: item.key,
              monthName: item.values[item.values.length - 1].monthName,
              buhs: item.values.reduce((acc, { buhs }) => { return (acc + buhs) }, 0),
              otgruzki: item.values.reduce((acc, { otgruzki }) => { return (acc + otgruzki) }, 0),
              incomes: item.values.reduce((acc, { incomes }) => { return (acc + incomes) }, 0),
              outcomes: item.values.reduce((acc, { outcomes }) => { return (acc + outcomes) }, 0)
          }
      })
    },


    weekNumber(date) {
      const d = new Date(date)
      var onejan = new Date(d.getFullYear(),0,0);
      var dayOfYear = ((d - onejan + 86400000)/86400000);
      return Math.ceil(dayOfYear/7)
    },


    groupBy(arr, prop) {
        return arr.reduce((objs, obj) => {
            const key = obj[prop];
            if (key) {
                let fi = objs.findIndex(x => x.key == key);
                if (fi>=0) {
                    objs[fi].values = [...objs[fi].values, obj];
                } else {
                    objs.push({
                        key: key,
                        values: [obj]
                    })
                }
            }
            return objs;
        }, []);
    },



    setOptions(payload) { // { createdData, resolvedData, interval } = {}
      console.log('payload', payload);

      this.chart.setOption(
        {
          responsive: true,
          maintainAspectRatio: false,
          title : {
            text:"По неделям в году",
            x:'right'
          },
          xAxis: {
            data: payload.map(i => { return (i.monthName + ' / ' + i.weekId) }),
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
            data: ['Планируемые доходы', 'Планируемые расходы', 'Фактические доходы', 'Фактические расходы']
          },
          series: [
            {
              name: 'Планируемые доходы',
              itemStyle: {
                color: '#00BFFF',
                lineStyle: {
                  color: '#00BFFF',
                },
              },
              smooth: true,
              type: 'line',
              lineThickness: 5,
              data: payload.map(i => i.otgruzki),
              animationDuration: 2800,
              animationEasing: 'cubicInOut'
            },
            {
              name: 'Планируемые расходы',
              itemStyle: {
                color: '#FF8C00',
                lineStyle: {
                  color: '#FF8C00',
                }
              },
              smooth: true,
              type: 'line',
              data: payload.map(i => i.buhs),
              animationDuration: 2800,
              animationEasing: 'cubicInOut'
            },
            {
              name: 'Фактические доходы',
              itemStyle: {
                color: '#32CD32',
                lineStyle: {
                  color: '#32CD32',
                }
              },
              smooth: true,
              type: 'line',
              data: payload.map(i => i.incomes),
              animationDuration: 2800,
              animationEasing: 'cubicInOut'
            },
            {
              name: 'Фактические расходы',
              smooth: true,
              type: 'line',
              itemStyle: {
                color: '#FF0000',
                lineStyle: {
                  color: '#FF0000',
                },
                areaStyle: {
                  color: '#f3f8ff'
                }
              },
              data: payload.map(i => i.outcomes),
              animationDuration: 2800,
              animationEasing: 'quadraticOut'
            }]
        }
      )
    }
  }
}
</script>
