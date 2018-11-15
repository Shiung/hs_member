<script>
import currencyFn from '@/filters/currency'
export default {
  name: 'reportTransDetail',
  data () {
    return {
      columns: ['date', 'memId', 'price', 'point', 'describe', 'act'],
      tableData: [],
      options: {
        headings: {
          date: '日期',
          memId: '會員編號',
          price: '消費金額',
          point: '產生點數',
          describe: '說明',
          act: '動作'
        },
        columnsClasses: {
          act: 'width-fix',
          status: 'width-fix'
        },
        perPage: 10,
        perPageValues: [10, 25, 100],
        pagination: { chunk: 5, nav: 'scroll', dropdown: false, edge: false },
        texts: {
          // count: 'Showing {from} to {to} of {count} records|{count} records|One record',
          // noResults: 'No matching records',
          count: '顯示 {from} 到 {to} 筆資料 ， 總共 {count} 筆資料 |{count} 筆資料|One 筆資料',
          noResults: '沒有資料符合',
          first: '|<',
          last: '>|'
        },
        preserveState: true,
        sortable: ['name', 'album'],
        filterable: ['name', 'album'],
        // filterable: false,
        sortIcon: {
          base: 'sorticon',
          up: 'sort-up',
          down: 'sort-down',
          is: 'sort'
        },
        templates: {
          price: function (h, row, index) {
            return `NT ${currencyFn(row.price)}`
          },
          act: function (h, row, index) {
            return <md-button class="md-icon-button md-dense md-raised md-primary">
              <md-icon>priority_high</md-icon>
              <md-tooltip md-direction="bottom">消費明細</md-tooltip>
            </md-button>
          }
        }
      }
    }
  },
  mounted () {
    // 資料
    let url = `${process.env.APIPATH}/transaction`
    this.axios.get(url).then(res => {
      this.tableData = res.data
    })
  }
}
</script>

<template src="./template.html"></template>
<style lang="scss" src="./style.scss" scoped></style>
