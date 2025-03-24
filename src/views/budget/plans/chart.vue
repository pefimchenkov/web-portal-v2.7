<template>
  <canvas ref="canvas" />
</template>

<script>
import { Bar } from 'vue-chartjs'

export default {
extends: Bar,
data() {
  return {
    monthsNames: ["Декабрь", "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
    payload: []
  }
},

props: ["sales", "payments", "jira", "manualBills"],

mounted() {

  setTimeout(() => {
    this.payload = this.setMonthsForChart();
    this.divideSumsByMonths();
    this.init();

    console.log('sales', this.sales)
    console.log('payments', this.payments)
    console.log('jira', this.jira)

  }, 500)
},

methods: {

  init() {
    this.renderChart({
      labels: this.setMonthsForChart().map(i => (i.name + ',' + i.year.slice(-2))),

      datasets: [
        {
          backgroundColor: 'rgba(255, 99, 132, 0.3)',
          fill: false,
          borderWidth: 3,
          label: 'Долг по планам',
          data: this.payload.map(i => i.data),
        },
        {
          backgroundColor: 'rgba(54, 162, 235, 0.3)',
          fill: false,
          borderWidth: 3,
          label: 'Оплаты',
          data: []
        }
      ]
    },
    {
      title: {
        display: true,
        text: 'Планируемые поступления'
      },
      tooltips: {
        callbacks: {
          label: function (tooltipItem) {
                return tooltipItem.yLabel.toLocaleString('ru');
            }
        }
      },
      legend: {
        display: true,
        position: 'top',
        labels: {
          fontSize: 15,
          padding: 20
        }
      },
      responsive: true,
      aspectRatio: 1,
      maintainAspectRatio: false,
      scales: {
        xAxes: [{
          stacked: false,
        }],
        yAxes: [{
          stacked: false,
          ticks: {
                  callback: function(label) {
                      return label.toLocaleString('ru');
                  }
              },
        }]
      }
      })

  },

  /* -------------------------------------------------- */

  getMonthsFromSales() {
    const data =  this.sales.map(sale => {
      const month = new Date(sale.date).getMonth() + 1;
      const year = new Date(sale.date).getFullYear();
      return JSON.stringify({ month, year })
    })
    const uniq = [...new Set(data)];
    return uniq.map(item => JSON.parse(item))
  },

  setMonthsForChart() {
    const currentMonthNum = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    let i = 1;
    let j = 12;
    const months = [];
    const years = [];

    months.push(currentMonthNum);
    years.push(currentYear);

    while (i < j) {
      if ((currentMonthNum + i) <= j) {
        months.push(currentMonthNum + i);
        years.push(currentYear);
      } else {
        months.push((currentMonthNum + i) - j)
        years.push(currentYear + 1);
      }
      
      i++;
    }

    const data = months.map((item, i) => {
      return { name: this.monthsNames[item], year: years[i].toString(), index: item === 0 ? 12 : item }
    })

    //console.log(data)
    return data
  },

  /* getRateFromHistory(data, day, x) {
    if (x === 5) return;
    const res = data
      .find(obj => obj.$.Date === new Date(new Date(day).setDate(new Date(day).getDate() - x))
      .toLocaleDateString('ru'))
    if (res) return res
    else return this.getRateFromHistory(data, day, x+1)
  }, */

  /* ---------------------------------------------------------------- */

  getSumPerMonth() {
    const timelineMonths = this.getMonthsFromSales();
    // console.log('Месяца из оплат', timelineMonths)

    return timelineMonths.map(item => {
      const salesByMonth = this.sales.filter(sale => (new Date(sale.date).getMonth() + 1) === item.month && (new Date(sale.date).getFullYear()) === item.year);

      salesByMonth.forEach(item => {
        item.payments = this.payments
          .filter(i => i.orderNum === item.invoiceNum)
          .map(i => i.paymentSum)
          .reduce((a, b) => (a + b), 0)

        /* Есть ли номер счёта в базе ручной правки Контроля поступлений */
        const isInManualBills = this.manualBills.find(i => i.bill_1c === item.invoiceNum)

        // console.log('isInManualBills', isInManualBills)

        if (isInManualBills) {
          item.payment_date = new Date(isInManualBills.pay_date).getTime();
        } else {
          item.payment_date = new Date(item.date).getTime() + (14 * 24 * 3600 * 1000);
        }
          
      })

      // console.log('salesByMonth', salesByMonth)

      return salesByMonth;
    })
  },

  divideSumsByMonths() {
    const salesAllMonth = this.getSumPerMonth().flat();
    const currentMonthNum = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    /* Получаем сумму всех месяцев, где оплаты меньше отгрузок */
    const sumAllSales = salesAllMonth
      .flat()
      .map(item => {
        return Math.sign((item.sum * item.currencyRate) - item.payments) !== -1
          ? (item.sum * item.currencyRate) - item.payments
          : 0
      })
      .reduce((a, b) => (a + b), 0)


    /* Раскидываем сумму по месяцам */
    this.payload.forEach(item => {
      const data = salesAllMonth?.filter(i => {
        const month = new Date(i.payment_date).getMonth() + 1;
        const year = new Date(i.payment_date).getFullYear();
        return month === item.index && year.toString() === item.year
      })

      if (!data) return;

      item.data = data
        .map(item => {
          return Math.sign((item.sum * item.currencyRate) - item.payments) !== -1
            ? (item.sum * item.currencyRate) - item.payments
            : 0
        })
        .reduce((a, b) => (a + b), 0)
        .toFixed(2)
    })


    console.log('Сумма общая', sumAllSales)
    console.log('Суммы для графика', this.payload)

    /* Вычисляем сумму долга предыдущего периода */
    const prevSums = sumAllSales - this.payload.map(item => item.data).reduce((a, b) => (+a + +b), 0)
    console.log('prevSums', prevSums)

    /* Добавляем сумму долга предыдущего периода к текущему месяцу */
    this.payload.forEach(item => {
      if (currentMonthNum === item.index && currentYear.toString() === item.year) {
        item.data = (Number(item.data) + prevSums).toFixed(2)
      }
    })
    
  }
}
}
</script>

<style lang="scss" scoped>
</style>
