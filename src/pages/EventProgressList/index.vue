<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'eventProgressList',
  data () {
    return {
      columns: ['id', 'targetable_id', 'name', 'point', 'updated_at'],
      options: {
        headings: {
          id: '排程ID',
          targetable_id: '序號',
          // id_number: '身分證字號',
          name: '名稱',
          point: '點數',
          updated_at: '建立請求時間'
        },
        columnsClasses: {
          // edit: 'width-fix',
          // status: 'width-fix'
        },
        perPage: 15,
        perPageValues: [15, 25, 100],
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
        sortable: ['name123', 'album'],
        // filterable: ['title'],
        filterable: false,
        sortIcon: {
          base: 'sorticon',
          up: 'sort-up',
          down: 'sort-down',
          is: 'sort'
        },
        templates: {
          name: function (h, row, index) {
            return row.member.data[0].name
          }
        }
      },
      showDialog: false,
      pageNumber: null
    }
  },
  computed: {
    ...mapGetters('eventProgressTableMoudule', ['datatables', 'perPage', 'count', 'totalPages', 'totalCount', 'currentPage', 'paramsObj', 'paramsStatus']),
    eventID () {
      return this.$route.params.id
    },
    dataInfo () {
      let currentPage = this.currentPage
      let perPage = this.perPage
      let count = this.count
      let totalPage = this.totalPages
      let totalCount = this.totalCount
      if (totalPage === 1) {
        return `${totalCount} 筆資料`
      } else {
        let from = (currentPage - 1) * perPage + 1
        let to = from + count - 1
        return `顯示 ${from} 到 ${to} 筆資料 ，  總共 ${totalCount} 筆資料`
      }
    }
  },
  methods: {
    ...mapActions('eventProgressTableMoudule', ['getDatatable', 'getRequestParams', 'setParamsStatus']),
    refreshData (obj) {
      this.getRequestParams(obj)
      this.getDatatable(this.eventID)
      // 更新vue-table-2 一樣顯示資料
      this.$refs.eventProgressTable.setLimit(this.perPage)
    },
    prevPage () {
      let current = this.currentPage
      let params = this.paramsObj
      const obj = {
        ...params,
        page: current - 1
      }
      if (current !== 1) {
        this.refreshData(obj)
      }
    },
    nextPage () {
      let current = this.currentPage
      let total = this.totalPages
      let params = this.paramsObj
      const obj = {
        ...params,
        page: current + 1
      }
      if (current !== total) {
        this.refreshData(obj)
      }
    },
    searchPage () {
      let page = this.pageNumber
      let params = this.paramsObj
      if (page !== '') {
        const obj = {
          ...params,
          page: page
        }
        this.refreshData(obj)
      }
      // 關閉搜尋頁面光箱
      this.showDialog = false
      this.pageNumber = ''
    }
  },
  mounted () {
    this.getRequestParams()
    this.getDatatable(this.eventID)
    // 更新vue-table-2 一樣顯示資料
    this.$refs.eventProgressTable.setLimit(this.perPage)
  },
  watch: {
    pageNumber (val) {
      if (val === '') return
      if (val > this.totalPages) {
        this.$swal({
          title: `最大頁數${this.totalPages}`,
          icon: 'warning'
        })
          .then(() => {
            this.pageNumber = this.totalPages
          })
      } else if (val < 1) {
        this.$swal({
          title: `最小頁數 1`,
          icon: 'warning'
        })
          .then(() => {
            this.pageNumber = 1
          })
      }
    }
  }
}
</script>

<template src="./template.html"></template>
<style lang="scss" src="./style.scss" scoped></style>
