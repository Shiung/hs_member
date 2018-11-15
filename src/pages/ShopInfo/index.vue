<script>
import { mapActions, mapGetters } from 'vuex'

import currencyFn from '@/filters/currency'

export default {
  name: 'shopInfo',
  data () {
    return {
      columns: ['date', 'info', 'price'],
      options: {
        headings: {
          date: '日期',
          info: '說明',
          price: '費用'
        },
        columnsClasses: {
          edit: 'width-fix',
          id: 'width-fix',
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
          }
        }
      },
      // shopID: 'A001',
      shopPsw: '12345678',
      shopStatus: true,
      expiry: 40,
      buffer: 0,
      isLoadingShop: false,
      isFullPage: false
    }
  },
  computed: {
    ...mapGetters('shopInfoMoudule', ['datatables']),
    shopStatusShow () {
      if (this.shopStatus) return 'on'
      else return 'off'
    },
    shopID () {
      return this.$route.params.id
    }
  },
  mounted () {
    // vuex 資料
    this.getDatatable()
  },
  methods: {
    // 資料 vuex
    ...mapActions('shopInfoMoudule', ['getDatatable'])
  }
}
</script>

<template src="./template.html"></template>
<style lang="scss" src="./style.scss" scoped></style>
