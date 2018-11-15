<script>
import currencyFn from '@/filters/currency'
export default {
  name: 'reportCoupon',
  data () {
    return {
      columns: ['date', 'couponName', 'price', 'point', 'status'],
      tableData: [],
      options: {
        headings: {
          date: '日期',
          couponName: '折價卷名稱',
          price: '面額',
          point: '點數',
          status: '交易項目'
        },
        columnsClasses: {
          // act: 'width-fix',
          // status: 'width-fix'
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
          point: function (h, row, index) {
            return `${currencyFn(row.point)}`
          },
          status: function (h, row, index) {
            let s = row.status === 1 ? '核銷' : '兌換'
            let className = s === '核銷' ? 'badge badge-success text-capitalize' : 'badge badge-secondary text-capitalize'
            return <span class={className}>{s}</span>
          }
        }
      }
    }
  },
  mounted () {
    // 資料
    let url = `${process.env.APIPATH}/reportCoupon`
    this.axios.get(url).then(res => {
      this.tableData = res.data
    })
  }
}
</script>

<template src="./template.html"></template>
<style lang="scss" src="./style.scss" scoped></style>
