<template>
    <el-table
      :data="filteredTableData"
      :summary-method="getSummaries"
      show-summary
      border
      stripe
      fit
      row-key="date"
      size="mini"
      :header-cell-style="{
        background: '#f3f3f3',
        color: '#6e6e6e'
      }"
      :max-height="WindowHeight"
      style="width: 100%; height: 100%"
    >
      <el-table-column
        v-for="(column) in selectedHeaders"
        :key="column.id"
        :prop="column.value"
        :label="column.text"
        :width="column.width"
        :fixed="column.fixed"
        resizable
        show-overflow-tooltip
        :formatter="column.formatter ? null : formatterData"
      >
        <!-- слот для кастомного форматирования данных строки -->
        <template v-if="column.formatter" #default="{ row }">
          <component
            :is="column.formatter"
            v-if="column.formatter"
            :row="row"
            :column="column.value"
            @update="editItem"
            @remove="removeItem"
          />
          <div v-else>
            {{ row[column.value] }}
          </div>
        </template>

        <!-- Заголовок таблицы -->
        <template slot="header" slot-scope="scope">
          <div style="word-break: keep-all;">{{ column.text }}</div>
          <TableFilters
            v-if="tableData.length"
            :reference="reference"
            :data="tableData"
            :options="filterOptions"
            :filters="filters"
            :types="{
              Input: ['otgruzki', 'buhs', 'incomes', 'outcomes'],
              Select: ['weekId', 'weekDay'],
              MultiSelect: ['monthName'],
              Date: [],
              Clear: ['date']
            }"
            :formatters="formatters"
            :property="scope.column.property"
            @updateData="updateData"
            @updateFilters="updateFilters"
            @resetFilters="resetFilters"
          />
        </template>

      </el-table-column>
    </el-table>
</template>

<script>

import { templateHeaders, reference  } from './data_days.js'
import { createHeaders, headersToObject, getSummariesRow, createSelectOptionsFromTableData } from '@/components/DataTable/utils.js'



export default {

    components: {
        TableColumns: () => import('@/components/DataTable/columns.vue'),
        TableFilters: () => import('@/components/TableFilters/index.vue'),
    },

    props: ["totals"],

    data() {
        return {

            /* Local data */
            tableData: [],
            filteredTableData: [],
            tableHeaders: [],
            formatters: [],
            filterOptions: {},
            filters: {},

            loading: false,
            WindowHeight: null,

            /* From ext source */
            templateHeaders,
            headersToObject,
            reference,
        }
    },


    computed: {
        selectedHeaders() { return this.tableHeaders },
    },

    beforeMount() {
        this.WindowHeight = window.innerHeight - 200
    },

    mounted() {
        window.addEventListener('resize', this.getWindowHeight);
    },

    async created() {
        this.tableHeaders = createHeaders(this.templateHeaders);
        
        
        const startDay = new Date(new Date().getFullYear(), 0, 1);
        const endDay = new Date(new Date().getFullYear(), 11, 31);
        this.getDatesArray(startDay, endDay);

        this.filteredTableData = this.tableData;


        this.formatters = [
            { name: 'date' },
            { name: 'monthName' },
            { name: 'weekId' },
            { name: 'weekDay' },
        ];
        
        this.filterOptions = createSelectOptionsFromTableData({ data: this.tableData, columns: this.formatters });

    },

    methods: {

        getDatesArray(startDate, endDate) {

            const { planOutcomeDays, planIncomeDays, factIncomeDays, factOutcomeDays } = this.totals
            
            for (let date = startDate; date <= endDate; date.setUTCDate(date.getUTCDate() + 1)) {
                const tzoffset = (new Date()).getTimezoneOffset() * 60000;

                let dateWithOffset = new Date(date).getTime() - tzoffset;
                const dateString = new Date(dateWithOffset).toISOString().split('T')[0];

                const monthName = new Date(dateString).toLocaleString('ru-RU', { month: 'long' });
                const weekDay = new Date(dateString).toLocaleString('ru-RU', { weekday: 'long' });


                this.tableData.push(
                    { 
                        date: dateString,
                        monthId: new Date(dateString).getMonth() + 1,
                        monthName,
                        weekDay,
                        weekId: this.weekNumber(dateString),
                        otgruzki: planIncomeDays.find(item => item.date === dateString)?.total,
                        buhs: planOutcomeDays.find(item => item.date === dateString)?.total,
                        incomes: factIncomeDays.find(item => item.date === dateString)?.total,
                        outcomes: factOutcomeDays.find(item => item.date === dateString)?.total,
                    }
                );
            }

            console.log("totals", this.totals)

        },


        updateData(data) {
            this.filteredTableData = data || this.tableData
        },

        updateFilters(val) {
            if (val) this.filters = { ...val }
        },

        resetFilters() {
            this.filters = {}
            this.updateData()
        },

        formatterData(row, column, cellValue) {
            if (column.property === 'date') {
                return cellValue ? new Date(cellValue).toLocaleDateString('ru') : null
            }

            if (column.property === 'otgruzki' || column.property === 'buhs' || column.property === 'incomes' || column.property === 'outcomes') {
                return cellValue?.toLocaleString('ru');
            }

            return cellValue
        },

        getWindowHeight(event) {
            this.WindowHeight = event.target.innerHeight - 200
        },

        getSummaries(params) {
            const { columns } = params
            const props = [
                { name: 'otgruzki' },
                { name: 'buhs' },
                { name: 'incomes' },
                { name: 'outcomes' },
            ]
            return getSummariesRow(columns, this.filteredTableData, props)
        },

        weekNumber(date) {
            const d = new Date(date)
            var onejan = new Date(d.getFullYear(),0,0);
            var dayOfYear = ((d - onejan + 86400000)/86400000);
            return Math.ceil(dayOfYear/7)
        },

        addDays(date, days) {

            let new_date = new Date(date);
            let plusOneWeek = new Date();

            let utc = new_date.getTime() + (new_date.getTimezoneOffset() * 60000);

            return new Date(plusOneWeek.setTime( utc + (3600000 * (-3)) + (days * 24 * 3600 * 1000) ))
        },



    }

}

</script>