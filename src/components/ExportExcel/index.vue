<template>
  <el-row>
    <el-col>
      <div
        v-if="type === 'plain'"
        v-loading="loading"
        size="mini"
        @click="handleDownload()">
        Экспорт в Excel
      </div>
      <el-button
        v-if="type === 'button'"
        v-loading="loading"
        size="mini"
        @click="handleDownload()">
        Экспорт в Excel
      </el-button>
    </el-col>
  </el-row>
</template>

<script>
  import { isDate } from '@/utils'
  import { ruDate } from '@/filters'
  export default {

    props: {
      list: {
        type: Array,
        default: () => []
      },
      tableName: {
        type: String,
        default: 'excel-list'
      },
      ruHeader: {
        type: Array,
        default: () => []
      },
      header: {
        type: Array,
        default: () => []
      },
      type: {
        type: String,
        default: () => 'button'
      }
    },


    data() {
      return {
        loading: false
      }
    },


    methods: {
      handleDownload() {
        this.loading = true;

        import('@/vendor/Export2Excel')
          .then(excel => {
            const data = this.formatJson(this.header, this.list);

            //console.log('Export2Excel', this.list)

            excel.export_json_to_excel({
              header: this.ruHeader,
              data,
              filename: this.tableName,
              autoWidth: true,
              bookType: 'xlsx'
            });

            this.loading = false;
          });
      },


      formatJson(header, jsonData) {
        return jsonData.map(v => header.map(j => {

          if (typeof v[j] === 'object') {
            return v[j]?.data || v[j]?.value
          }

          return isDate(v[j])
            ? ruDate(v[j])
            : v[j]
        }))
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
