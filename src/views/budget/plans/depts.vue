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

  props: ["sales", "payments", "invoices", "jira", "outgoingPayments", "manualBills", "crmData", "contractors", "debtOffsetDebit"],

  mounted() {

    setTimeout(() => {
      this.payload = this.setMonthsForChart();
      //this.divideSumsByMonths();

      /* console.log('sales', this.sales)
      console.log('payments', this.payments)
      console.log('jira', this.jira) */
      this.addDataToPayload();

      this.init();


      console.log('payload', this.payload )
      //console.log('sales', this.sales)
      
      

    }, 500)
  },

  methods: {

    init() {
      this.renderChart({
        labels: this.setMonthsForChart().map(i => (i.name + ',' + i.year.slice(-2))),

        datasets: [
          {
            backgroundColor: 'rgba(150, 240, 210, 0.5)',
            fill: false,
            borderWidth: 3,
            label: 'План. поступления',
            data: this.payload.map(i => i.salesSum),
          },
          {
            backgroundColor: 'rgba(70, 185, 130, 0.6)',
            fill: false,
            borderWidth: 3,
            label: 'Факт. поступления',
            data: this.payload.map(i => i.paymentsSum),
          },
          {
            backgroundColor: 'rgba(80, 175, 247, 0.4)',
            fill: false,
            borderWidth: 3,
            label: 'План. расходы',
            data: this.payload.map(i => i.jiraSum),
          },
          {
            backgroundColor: 'rgba(15, 110, 205, 0.6)',
            fill: false,
            borderWidth: 3,
            label: 'Факт. расходы',
            data: this.payload.map(i => i.outgoingPaymentsSum),
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
        },

        onClick: this.handle
      })

    },

    /* -------------------------------------------------- */

    addDataToPayload() {

      /* const FormattedCrmData = this.crmData.map(crm => {
        const requiredContractor = this.contractors.find(item => item.id === crm.contractor_id);
        return { ...crm, contractorName: requiredContractor?.contractor  }
      }) */


      let salesSum = null;
      const currentMonthIndex = new Date().getMonth() + 1;


      this.payload.forEach((item) => {

        /* *************************** */

        if (item.index < currentMonthIndex) {

          salesSum = this.invoices
            .filter(invoice => {
              const sales = this.sales.filter(sale => sale.invoiceNum.trim() === invoice.num.trim());
              if (!sales.length) return

              const otsrochka = this.crmData.find(crm => crm.contractor_id === invoice.contractorId)?.PAY_DELAY;
              const manualBill = this.manualBills.find(item => item.bill_1c === invoice.num);

              const pay_date = manualBill?.sale_date || this.addDays(sales[sales.length - 1]?.sfdate, (otsrochka || 14))
              invoice.pay_date = pay_date

              return ((new Date(invoice.pay_date).getMonth() + 1) === item.index && (new Date(invoice.pay_date).getFullYear()) === Number(item.year));

            })
            .reduce((acc, invoice) => {
              const sales = this.sales.filter(sale => sale.invoiceNum.trim() === invoice.num.trim());
              const payments = this.payments.filter(payment => payment.orderNum.trim() === invoice.num.trim());
              const manualBill = this.manualBills.find(item => item.bill_1c === invoice.num);

              const totalPayments = payments.reduce((acc, { paymentSum }) =>  (acc + paymentSum), 0);
              const totalSales = sales.reduce((acc, { sum, currencyRate }) => (acc + (sum * currencyRate)), 0);


              const factoringAndNetting = this.debtOffsetDebit.filter(debt => debt?.subjectNum === invoice.num);
              const factoringAndNetting_sum_arr = factoringAndNetting.map(debt => (debt.paymentSum * debt.currencyRate));
              const totalFactoringAndNetting = factoringAndNetting_sum_arr.reduce((a, b) => (a + b), 0);


              const paymentsWithDebtOffset = totalFactoringAndNetting > 0
                  ? totalFactoringAndNetting
                  : totalPayments


              const dolg = manualBill?.pay_sum
                ? totalSales - manualBill?.pay_sum
                : this.setDolg(totalSales, paymentsWithDebtOffset)

              return (acc + dolg)
            }, 0)
            .toFixed(2)

        } else {

          salesSum = this.sales
            .filter(sale => {
              const otsrochka = this.crmData.find(crm => crm.contractor_id === sale.contractorId)?.PAY_DELAY;
              const manualBill = this.manualBills.find(item => item.bill_1c === sale.invoiceNum.trim());

              const pay_date = manualBill?.pay_date || this.addDays(sale?.sfdate, (otsrochka || 14))

              sale.pay_date = pay_date

              return ((new Date(sale.pay_date).getMonth() + 1) === item.index && (new Date(sale.pay_date).getFullYear()) === Number(item.year));
            })
            .reduce((acc, sale) => {
              return (acc + (sale.sum * sale.currencyRate))
            }, 0)


        }

        //console.log(item.name)
        //console.log(salesSum)



        /* *************************** */

        const paymentsSum = this.payments
          .filter(payment => (new Date(payment.paymentDate).getMonth() + 1) === item.index && (new Date(payment.paymentDate).getFullYear()) === Number(item.year))
          .reduce((acc, payment) => {
            const manualBill = this.manualBills.find(item => item.bill_1c === payment.orderNum.trim());

            const dolg = manualBill?.pay_sum || payment.paymentSum

            return (acc + dolg) 
          }, 0)
          .toFixed(2);

      

        /* *************  Планируемые расходы  ************** */

        const jiraSum = this.jira
          .filter( jira => (new Date(jira.date_plan || jira.date_crit).getMonth() + 1) === item.index && (new Date(jira.date_plan || jira.date_crit).getFullYear()) === Number(item.year) )
          .reduce((acc, item) => { return (acc + item.total) }, 0)
          .toFixed(2);
        


        /* *************  Фактические расходы  ************** */

        const outgoingPaymentsSum = this.outgoingPayments
          .filter( payments => (new Date(payments.paymentDate).getMonth() + 1) === item.index && (new Date(payments.paymentDate).getFullYear()) === Number(item.year) )
          .reduce((acc, item) => { return (acc + (item.paymentSum)) }, 0)
          .toFixed(2);



        /* ************************* */

        item.salesSum = Number(salesSum);
        item.paymentsSum = Number(paymentsSum);
        item.jiraSum = Number(jiraSum);
        item.outgoingPaymentsSum = Number(outgoingPaymentsSum);

      });

    },


    setMonthsForChart() {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      let i = -2;
      let j = 12;
      const months = [];
      const years = [];

      //months.push(currentMonth + i);
      //years.push(currentYear);

      while (i < 3) {
        if ((currentMonth + i) <= j) {
          months.push(currentMonth + i);
          years.push(currentYear);
        } else {
          months.push((currentMonth + i) - j)
          years.push(currentYear + 1);
        }
        
        i++;
      }

      const result = months.map((month, i) => {
        return { name: this.monthsNames[month], year: years[i].toString(), index: month === 0 ? 12 : month }
      })

      return result
    },

    addMonths(date, months) {
      var d = date.getDate();
      date.setMonth(date.getMonth() + +months);
      if (date.getDate() !== d) {
        date.setDate(0);
      }
      return date;
    },


    addDays(date, days) {

      let new_date = new Date(date);
      let plusOneWeek = new Date();

      let utc = new_date.getTime() + (new_date.getTimezoneOffset() * 60000);

      return new Date(plusOneWeek.setTime( utc + (3600000 * (-3)) + (days * 24 * 3600 * 1000) ))
    },

    setDolg(sales, pays) {
      return Math.sign(sales - pays) === -1
        ? 0
        : sales - pays
    },


    handle(_, arr) {
      window.open(this.jqlRequest(arr, 'TEST'), '_blank')
    },

    jqlRequest(arr, label) {
      const firma = (!this.firm || this.firm === "все") ? '' : ` AND "Фирма исполнитель" ~"${this.firm}"`;
      const date = this.date ? ` AND "Дата оплаты план" <= "${this.date}"` : '';
      const url = `http://support.atlas-pro24.local/issues/?jql=project=BUH AND status="Оплата поставщику" AND "Получатель платежа" ${label ? '~"' + label + '"' : 'is EMPTY'}`;

      return url + firma + date;
    },



    /* ---------------------------------------------------------------- */

  }
}
</script>

<style lang="scss" scoped>
</style>
