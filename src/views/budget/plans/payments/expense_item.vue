<template>
  <div>
  <el-row type="flex" justify="space-around" align="middle">
    <el-col :span="8">
      <label class="mr-3">Фильтр по фирме</label>
      <el-select
        v-model="firm"
        filterable
      >
        <el-option
          v-for="firm in firms"
          :key="firm"
          :value="firm"
          :label="firm"
        >

        </el-option>
      </el-select>
    </el-col>

    <el-col :span="8">
      <label class="mr-3">Фильтр по дате</label>
      <el-date-picker
        v-model="date"
        value-format="yyyy-MM-dd"
        format="dd.MM.yyyy"
        type="date"
        >
      </el-date-picker>
    </el-col>

  </el-row>

  <canvas ref="canvas" />
  </div>
</template>

<script>
import { Doughnut } from 'vue-chartjs'

import { getPaysChartExpense } from '@/api/budget'
import { getColorByCost } from './get-colors-by-firm'

export default {
  extends: Doughnut,

  props: {

    fontSize: {
      type: Number,
      default: 12
    }

  },

  data() {
    return {
      data: [],
      editedLabels: [],
      labels: [],
      sum: null,
      colors: [],
      firm: null,
      date: null,
      firms: [],
      payed: [],
      filteredData: []
    }
  },

  watch: {

    firm(val) {
      if (val) {
        this.setDataOperations(this.getDataByFirm(this.filteredData, val === 'нет фирмы' ? null : val))
        this.init()
      }
    },

    async date(val) {
      await this.getData({ date: val })
      this.init()
    },

    fontSize() {
      this.init()
    }

  },

  async mounted() {
    await this.getData({ date: this.date })
    this.init()
  },

  methods: {

    async getData(payload) {
      await getPaysChartExpense(payload)
        .then(res => {
          console.log(res)
          this.filteredData = [...res]
          this.firms = [...new Set(res.map(item => item.firm || 'нет фирмы'))]
          this.firms.unshift('все')

          this.firm = 'все'
          this.setDataOperations(this.getAllFirmsData(res))
        })
    },

    setDataOperations(data) {
      this.data = data.map(item => {
        if (!item.perc) item.perc = 0
        if (!item.perc2) item.perc2 = 0
        return (+item.sum - (+item.payed || 0))
      }).sort((a, b) => (a - b)).reverse()

      this.sum = this.data.reduce((acc, item) => (acc + +item))
      this.payed = data.map(item => +item.payed).reduce((acc, item) => (acc + +item))
      this.labels = data.sort((a, b) => ((b.sum - b.payed) - (a.sum - a.payed))).map(item => (item.name))
      this.editedLabels = data.sort((a, b) => ((a.sum - a.payed) - (b.sum - b.payed))).reverse().map(item => ((item.name || 'не назначено') + ': ' + Math.round(item.sum - item.payed).toLocaleString('ru') + ' (' + Math.round(item.perc) + '% | ' + Math.round(item.perc2) + '%)'))

      this.colors = data.map((item) => getColorByCost(item.name))
    },

    jqlRequest(arr, label) {
      const firma = (!this.firm || this.firm === "все") ? '' : ` AND "Фирма исполнитель" ~"${this.firm}"`;
      const date = this.date ? ` AND "Дата оплаты план" <= "${this.date}"` : '';
      const url = `http://support.atlas-pro24.local/issues/?jql=project=BUH AND status="Оплата поставщику" AND "Статья расходов" ${label ? '~"' + label + '"' : 'is EMPTY'}`;

      return url + firma + date;
    },

    handle(_, arr) {
      const label = this.labels[arr[0]?._index];
      if (label) {
        window.open(this.jqlRequest(arr, label), '_blank')
      }
    },

    getAllFirmsData(data) {
      const uniq_name = [...new Set(data.map(item => item.name))]

      return uniq_name.map(name => {
        const item_sum = data.filter(item => item.name === name).reduce((acc, item) => {
          return (acc + item.sum)
        }, 0)

        const item_payed = data.filter(item => item.name === name).reduce((acc, item) => {
          return (acc + (item.payed || 0))
        }, 0)

        const item_with_perc = data.find(item => item.name === name && item.perc)
        const item_with_perc2 = data.find(item => item.name === name && item.perc2)

        return { sum: item_sum, payed: item_payed, name, perc: item_with_perc ? item_with_perc.perc : 0, perc2: item_with_perc2 ? item_with_perc2.perc2 : 0 }
      })
    },

    getDataByFirm(data, firm) {
      if (firm === 'все') return this.getAllFirmsData(data)
      return data.filter(item => item.firm === firm)
    },

    init() {
      this.renderChart({
        labels: this.editedLabels,
        hoverBackgroundColor: 'red',
        hoverBorderWidth: 10,
        datasets: [
          {
            backgroundColor: this.colors,
            data: this.data
          }
        ]
      },
      {
        title: {
          display: true,
          position: 'top',
          text: `Задачи в оплате по Статьям расходов: | Оплатить: ${this.sum.toLocaleString()} | Оплачено: ${this.payed.toLocaleString()}`,
          fontSize: this.fontSize,
          fontColor: '#333',
          padding: 20
        },
        legend: {
          display: true,
          position: 'left',
          labels: {
            fontSize: this.fontSize,
            padding: 10,
            usePointStyle: true
          }
        },
        tooltips: {
          callbacks: {
            label: function(tooltipItem, data) {
              return data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].toLocaleString('ru')
            }
          }
        },
        responsive: true,
        aspectRatio: 3,
        maintainAspectRatio: true,
        onClick: this.handle
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
