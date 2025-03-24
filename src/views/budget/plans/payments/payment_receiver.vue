<template>
  <div>
  <el-row type="flex" justify="space-around" align="middle" class="mb-3">
    <el-col :span="8">
      <label class="mr-3">Фильтр по фирме:</label>
      <el-select
        v-model="firm"
        filterable
        size="mini"
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
      <label class="mr-3">Фильтр по дате:</label>
      <el-date-picker
        v-model="date"
        value-format="yyyy-MM-dd"
        format="dd.MM.yyyy"
        type="date"
        size="mini"
        >
      </el-date-picker>
    </el-col>

    <el-col :span="8">
      <label class="mr-3">Без даты:</label>
      <el-checkbox
        v-model="isEmptyDate"
        size="mini"
        >
      </el-checkbox>
    </el-col>

  </el-row>

  <canvas ref="canvas" />
  </div>
</template>

<script>
import { Doughnut } from 'vue-chartjs'
import { getPaysChartPayment } from '@/api/budget'
import { getColorByRecipient } from './get-colors-by-firm'

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
      firms: [],
      firm: null,
      date: null,
      isEmptyDate: false,

      data: [],
      labels: [],
      colors: [],
      sum: null,
      payed: [],
      filteredData: []
    }
  },

  watch: {

    firm(val) {
      if (val) {
        this.setDataOperations(this.getDataByFirm(this.filteredData, val === 'нет фирмы' ? null : val))
        this.$emit("changeFirm", { firm: val });
        this.init()
      }
    },

    async date(val) {
      await this.getData({ date: val });
      this.$emit("changeData", { date: val, firm: this.firm });
      if (this.firm) this.setDataOperations(this.getDataByFirm(this.filteredData, this.firm === 'нет фирмы' ? null : this.firm))
      this.init();
    },

    async isEmptyDate(val) {
      this.date = null;
      await this.getData({ date: val });
      this.$emit("changeData", { date: val, firm: this.firm });
      if (this.firm) this.setDataOperations(this.getDataByFirm(this.filteredData, this.firm === 'нет фирмы' ? null : this.firm))

      this.init()
    },

    fontSize() {
      this.init();
    }

  },

  async mounted() {
    await this.getData({ date: this.date });
    this.init();
    this.firm = 'АТЛАС-ПРО';
    this.date = new Date().toJSON().slice(0,10);
  },

  methods: {

    async getData(payload) {
      await getPaysChartPayment(payload)
        .then(res => {
          this.filteredData = [...res]
          this.firms = [...new Set(res.map(item => item.firm || 'нет фирмы'))]
          this.firms.unshift('все')

          this.setDataOperations(this.getAllFirmsData(res))
        })
    },

    setDataOperations(data) {
      this.data = data.map(item => {
        if (!item.perc) item.perc = 0
        if (!item.perc2) item.perc2 = 0
        return (+item.sum - (+item.payed || 0))
      }).sort((a, b) => (b - a))


      this.sum = this.data
        .reduce((acc, sum) => { return (acc + sum) }, 0);

      this.payed = data
        .map(item => Number(item.payed))
        .reduce((acc, sum) => { return (acc + sum) }, 0);

      this.labels = data.sort((a, b) => ((b.sum - b.payed) - (a.sum - a.payed))).map(item => (item.name));
      this.editedLabels = data.sort((a, b) => ((a.sum - a.payed) - (b.sum - b.payed))).reverse().map(item => ((item.name || 'не назначено') + ': ' + Math.round(item.sum - item.payed).toLocaleString('ru') + ' (' + Math.round(item.perc) + '% | ' + Math.round(item.perc2) + '%)'))

      this.colors = data.map((item) => getColorByRecipient(item.name));
    },

    jqlRequest(arr, label) {
      const firma = (!this.firm || this.firm === "все") ? '' : ` AND "Фирма исполнитель" ~"${this.firm}"`;
      const date = this.date ? ` AND "Дата оплаты план" <= "${this.date}"` : '';
      const url = `http://support.atlas-pro24.local/issues/?jql=project=BUH AND status="Оплата поставщику" AND "Получатель платежа" ${label ? '~"' + label + '"' : 'is EMPTY'}`;

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
          text: `Задачи в оплате по Получателю платежа: | Оплатить: ${this.sum?.toLocaleString() || 0} | Оплачено: ${this.payed?.toLocaleString() || 0}`,
          fontSize: this.fontSize,
          position: 'top',
          fontColor: '#333',
          padding: 5
        },
        legend: {
          display: true,
          position: 'left',
          fullSize: false,
          align: 'left',
          labels: {
            fontSize: this.fontSize,
            padding: 7,
            usePointStyle: true,
            useBorderRadius: true,
            borderRadius: 3
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
