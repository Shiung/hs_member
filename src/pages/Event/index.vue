<script>
import { mapActions, mapGetters } from 'vuex'
import { DateTime } from 'luxon'
import currencyFn from '@/filters/currency'

export default {
  name: 'event',
  data () {
    return {
      columns: ['edit', 'id', 'title', 'start_at', 'end_at', 'point', 'type', 'status'],
      options: {
        headings: {
          edit: '#',
          id: '活動ID',
          title: '活動標題',
          start_at: '開始時間',
          end_at: '結束時間',
          point: '點數',
          type: '類別',
          status: '狀態'
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
          start_at: function (h, row, index) {
            if (row.start_at) return DateTime.fromSQL(row.start_at).toFormat('yyyy/MM/dd')
            else return '沒有設定'
          },
          end_at: function (h, row, index) {
            if (row.end_at) return DateTime.fromSQL(row.end_at).toFormat('yyyy/MM/dd')
            else return '沒有設定'
          },
          point: function (h, row, index) {
            return `${currencyFn(row.point)}`
          },
          type: function (h, row, index) {
            let s = ''
            let className = ''
            let str = 'badge badge-pill text-capitalize '
            switch (row.type) {
              case 0:
                s = '手動'
                className = str.concat('badge-primary')
                break
              case 1:
                s = '自動'
                className = str.concat('badge-info')
                break
              default:
                s = '錯頻'
                className = str.concat('badge-secondary')
                break
            }
            return <span class={className}>{s}</span>
          },
          status: function (h, row, index) {
            let s = row.status === 1 ? '啟用' : '未啟用'
            let className = row.status === 1 ? 'badge badge-pill badge-success text-capitalize' : 'badge badge-pill badge-secondary text-capitalize'
            return <span class={className}>{s}</span>
          }
        }
      },
      checkarray: [],
      checkbtn: false,
      searchStr: null,
      showDialog: false,
      perPageOption: null,
      pageNumber: null
    }
  },
  computed: {
    ...mapGetters('eventTableMoudule', ['datatables', 'perPage', 'count', 'totalPages', 'totalCount', 'currentPage', 'paramsObj', 'paramsStatus']),
    selectLength () {
      return this.checkarray.length > 0 ? this.checkarray.length : 'All'
    },
    selectObject () {
      let selectIDsLength = this.selectLength
      let selectIDs = this.checkarray
      let totalData = this.datatables
      const obj = new Set()
      if (selectIDsLength === 'All') return null
      else {
        totalData.forEach((item) => {
          selectIDs.forEach((ID) => {
            if (item.id === ID) {
              obj.add(item)
            }
          })
        })
      }
      return Array.from(obj)
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
    // 資料 vuex
    ...mapActions('eventTableMoudule', ['getDatatable', 'getRequestParams', 'setParamsStatus']),
    filterType (search, type) {
      const obj = {
        page: null,
        search: `${search}:${type}`
      }
      this.refreshData(obj)
    },
    checkAll () {
      let allDataId = []
      this.datatables.forEach(function (item, index, array) {
        allDataId.push(item.id)
      })
      this.checkarray = allDataId
    },
    uncheckAll () {
      this.checkarray = []
    },
    // option 功能
    searchAct () {
      let search = this.searchStr
      if (search) {
        const obj = {
          orderBy: null,
          sortedBy: null,
          page: null,
          search: search,
          searchFields: 'name:like'
        }
        this.refreshData(obj)
      }
    },
    addNew () {
      // 開啟儲存狀態 toggle
      // this.setParamsStatus(true)
      this.$router.push({ name: 'eventEdit', params: { id: 'new' } })
    },
    editChoose (iduse) {
      let id = ''
      if (iduse) id = iduse
      else id = this.checkarray.join()
      // 開啟儲存狀態 toggle
      this.setParamsStatus(true)
      this.$router.push({ name: 'eventEdit', params: { id } })
    },
    deleteChoose () {
      let ids = this.checkarray.join(' , ')
      this.$snotify.async(`你選擇了IDs: ${ids}進行刪除`, 'Delete !', () => new Promise((resolve, reject) => {
        setTimeout(() => resolve({
          title: 'Success!!!',
          body: `已經刪除產品${ids}`,
          config: {
            timeout: 5000,
            showProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true
          }
        }), 2000)
      }))
    },
    refreshData (obj) {
      this.getRequestParams(obj)
      this.getDatatable()
      // check clear
      this.uncheckAll()
      this.searchStr = ''
      // 更新vue-table-2 一樣顯示資料
      this.$refs.eventTable.setLimit(this.perPage)
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
    if (!this.paramsStatus) { // 有存狀態
      // 初始 params
      this.getRequestParams()
    }
    // 關閉儲存狀態 toggle
    this.setParamsStatus(false)
    // 初始 data
    this.getDatatable()
    // 更新vue-table-2 一樣顯示資料
    this.$refs.eventTable.setLimit(this.perPage)
  },
  watch: {
    checkarray (val) {
      if (val.length === 0) {
        this.checkbtn = false
      } else {
        this.checkbtn = true
      }
    },
    checkbtn (val, oldval) {
      if (!oldval) {
        if (this.checkarray.length === 0) {
          this.checkAll()
        }
      } else {
        if (this.checkarray.length !== 0) {
          this.uncheckAll()
        }
      }
    },
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
