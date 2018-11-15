<script>
import { mapActions, mapGetters } from 'vuex'
import { DateTime } from 'luxon'
export default {
  name: 'notification',
  data () {
    return {
      columns: ['title', 'content', 'created_at', 'type', 'status', 'act'],
      options: {
        headings: {
          created_at: '建立時間',
          title: '標題',
          content: '內容',
          type: '類別',
          status: '狀態',
          act: '發送推播'
        },
        columnsClasses: {
          // act: 'width-fix',
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
        sortable: ['name123'],
        // filterable: ['name', 'album'],
        filterable: false,
        sortIcon: {
          base: 'sorticon',
          up: 'sort-up',
          down: 'sort-down',
          is: 'sort'
        },
        templates: {
          created_at: function (h, row, index) {
            return DateTime.fromSQL(row.created_at).setLocale('zh-TW').toFormat('yyyy/MM/dd')
          },
          content: function (h, row, index) {
            let str = row.content
            if (str.length > 30) return `${str.slice(0, 20)} ...`
            else return str
          },
          type: function (h, row, index) {
            let s = ''
            let className = ''
            let str = 'badge badge-pill text-capitalize '
            switch (row.type) {
              case 1:
                s = '系統公告'
                className = str.concat('badge-dark')
                break
              case 2:
                s = '優惠'
                className = str.concat('badge-danger')
                break
              case 3:
                s = '推播訊息'
                className = str.concat('badge-warning text-light')
                break
              default:
                break
            }
            return <span class={className}>{s}</span>
          },
          status: function (h, row, index) {
            let s = ''
            let className = ''
            let str = 'badge badge-pill text-capitalize '
            switch (row.status) {
              case 0:
                s = '下架'
                className = str.concat('badge-secondary')
                break
              case 1:
                s = '上架'
                // className = str.concat('badge-info')
                className = str.concat('badge-success')
                break
              // case 2:
              //   s = '已發送'
              //   className = str.concat('badge-success')
              //   break
              default:
                break
            }
            return <span class={className}>{s}</span>
          }
        }
      },
      showDialog: false,
      pageNumber: null
    }
  },
  computed: {
    ...mapGetters('notificationTableMoudule', ['datatables', 'perPage', 'count', 'totalPages', 'totalCount', 'currentPage', 'paramsObj', 'paramsStatus']),
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
  mounted () {
    if (!this.paramsStatus) { // 有存狀態
      // 初始 params
      this.getRequestParams()
    }
    // 關閉儲存狀態 toggle
    this.setParamsStatus(false)
    // 初始 data
    this.getDatatable()
    // 更新vue-table-2 一樣顯示資料
    this.$refs.notificationTable.setLimit(this.perPage)
  },
  methods: {
    // 資料 vuex
    ...mapActions('notificationTableMoudule', ['getDatatable', 'getRequestParams', 'setParamsStatus']),
    // option 功能
    notifiSend (id, status) {
      console.log('id', id)
      console.log('status', status)
      this.$swal({
        title: '系統施工中!!!',
        icon: 'error'
      })
    },
    filterType (type) {
      const obj = {
        page: null,
        search: `type:${type}`
      }
      this.refreshData(obj)
    },
    addNew () {
      this.$router.push({ name: 'notificationEdit', params: { id: 'new' } })
    },
    editChoose (iduse) {
      let id = ''
      if (iduse) id = iduse
      this.setParamsStatus(true)
      this.$router.push({ name: 'notificationEdit', params: { id } })
    },
    refreshData (obj) {
      this.getRequestParams(obj)
      this.getDatatable()
      // check clear
      this.searchStr = ''
      // 更新vue-table-2 一樣顯示資料
      this.$refs.notificationTable.setLimit(this.perPage)
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
