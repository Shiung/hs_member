<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'member',
  data () {
    return {
      columns: ['edit', 'id', 'name', 'nickname', 'id_number', 'birthday', 'mobile', 'updated_at', 'is_employed', 'status'],
      tableData: [],
      options: {
        headings: {
          edit: '#',
          id: 'ID',
          name: '會員名稱',
          nickname: '暱稱',
          id_number: '身分證字號',
          birthday: '生日',
          status: '狀態',
          mobile: '電話',
          is_employed: '員工',
          updated_at: '最後登入時間'
        },
        columnsClasses: {
          edit: 'width-fix'
          // id: 'width-fix'
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
        sortable: ['name123', 'birthday123'],
        // filterable: ['name', 'album'],
        filterable: false,
        sortIcon: {
          base: 'sorticon',
          up: 'sort-up',
          down: 'sort-down',
          is: 'sort'
        },
        templates: {
          is_employed: function (h, row, index) {
            let s = row.is_employed === 1 ? '員工' : '非員工'
            let className = row.is_employed === 1 ? 'badge badge-info badge-pill text-capitalize' : 'badge badge-pill badge-secondary text-capitalize'
            return <span class={className}>{s}</span>
          },
          status: function (h, row, index) {
            let s = row.status === 2 ? '已認證' : '未認證'
            let className = row.status === 2 ? 'badge badge-pill badge-success text-capitalize' : 'badge badge-pill badge-secondary text-capitalize'
            return <span class={className}>{s}</span>
          }
        }
      },
      checkarray: [],
      checkbtn: false,
      searchStr: null,
      status: '',
      pageNumber: null,
      sortName: null,
      // 過濾 搜尋
      showDialog: false,
      filterNum: 0, // 0: 姓名 1: 信箱 2: 身分證 3:電話
      filterStr: '姓名',
      searchFields: 'name' // 0: name, 1: email,2: id_number ,3: mobile
    }
  },
  computed: {
    ...mapGetters('memTableMoudule', ['datatables', 'perPage', 'count', 'totalPages', 'totalCount', 'currentPage', 'paramsObj', 'paramsStatus']),
    selectLength () {
      return this.checkarray.length > 0 ? this.checkarray.length : 'All'
    },
    selectObject () {
      let selectIDsLength = this.selectLength
      let selectIDs = this.checkarray
      let totalData = this.datatables
      let outputArr = []
      if (selectIDsLength === 'All') return null
      else if (selectIDsLength === 1) {
        return totalData.filter((item) => {
          return item.id === selectIDs[0]
        })
      } else {
        outputArr = totalData.filter((item) => {
          for (let i = 0; i < selectIDsLength; i++) {
            if (item.id === selectIDs[i]) {
              return true
            }
          }
        })
        return outputArr
      }
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
    },
    searchStrPlaceholder () {
      return `搜尋${this.filterStr}`
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
    this.$refs.table.setLimit(this.perPage)
  },
  methods: {
    // 資料 vuex
    ...mapActions('memTableMoudule', ['getDatatable', 'getRequestParams', 'setParamsStatus']),
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
    filter (type) {
      switch (type) {
        case 0:
          this.filterNum = 0
          this.filterStr = '姓名'
          this.searchFields = 'name'
          break
        case 1:
          this.filterNum = 1
          this.filterStr = '信箱'
          this.searchFields = 'email'
          break
        case 2:
          this.filterNum = 2
          this.filterStr = '身分證'
          this.searchFields = 'id_number'
          break
        case 3:
          this.filterNum = 3
          this.filterStr = '電話'
          this.searchFields = 'mobile'
          break
        default:
          break
      }
    },
    searchAct () {
      let search = this.searchStr
      let searchFields = this.searchFields
      if (search) {
        const obj = {
          orderBy: null,
          sortedBy: null,
          page: null,
          search: search,
          searchFields: searchFields
        }
        this.refreshData(obj)
      } else {
        this.$swal({
          title: '請輸入搜尋條件!',
          icon: 'info'
        })
      }
    },
    disabledMem () {
      let id = this.checkarray.join()
      this.$swal({
        title: '停用帳號!',
        text: `你選擇了ID: ${id}停用帳號`,
        icon: 'warning',
        buttons: {
          cancel: '取消!',
          ok: {
            text: '確認!',
            value: true
          }
        }
      })
        .then((value) => {
          if (value) {
            this.$snotify.error(`會員 ${id} 已經停用`)
          }
        })
    },
    downloadCSV () {
      let id = this.checkarray.join()
      this.$swal({
        title: 'Good job!',
        text: `你選擇了ID: ${id} 下載CSV檔案`,
        icon: 'success'
      })
    },
    viewMemDetail (iduse) {
      let id = ''
      if (iduse) id = iduse
      else id = this.checkarray.join()
      // 開啟儲存狀態 toggle
      this.setParamsStatus(true)
      this.$router.push({ name: 'memberEdit', params: { id } })
    },
    refreshData (obj) {
      this.getRequestParams(obj)
      this.getDatatable()
      // check clear
      this.uncheckAll()
      // -----1. 全部刪除搜尋字串------
      // this.searchStr = ''
      // -----2. 檢查是否有搜尋字串----
      if (obj && obj.search) this.searchStr = obj.search
      else this.searchStr = ''
      // 更新vue-table-2 一樣顯示資料
      this.$refs.table.setLimit(this.perPage)
    },
    prevPage () {
      let current = this.currentPage
      let params = this.paramsObj
      const obj = {
        ...params,
        page: current - 1
      }
      if (current !== 1) {
        // // vuex
        // this.getRequestParams(obj)
        // this.getDatatable()
        // // check clear
        // this.uncheckAll()
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
        // // vuex
        // this.getRequestParams(obj)
        // this.getDatatable()
        // // check clear
        // this.uncheckAll()
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
        // // vuex
        // this.getRequestParams(obj)
        // this.getDatatable()
        // // check clear
        // this.uncheckAll()
        this.refreshData(obj)
      }
      // 關閉搜尋頁面光箱
      this.showDialog = false
      this.pageNumber = ''
    },
    sort (val) {
      let params = this.paramsObj
      let obj = {}
      let orderBy = {}
      switch (val) {
        case 'name':
          orderBy = {orderBy: 'name'}
          break
        case 'birthday':
          orderBy = {orderBy: 'birthday'}
          break
        case 'status':
          orderBy = {orderBy: 'status'}
          break
        case 'updated_at':
          orderBy = {orderBy: 'updated_at'}
          break
        case 'is_employed':
          orderBy = {orderBy: 'is_employed'}
          break
        default:
          break
      }
      if (params.sortedBy === '' || params.sortedBy === 'desc') {
        let sortedBy = {sortedBy: 'asc'}
        obj = Object.assign(orderBy, sortedBy, ...params)
      } else {
        let sortedBy = {sortedBy: 'desc'}
        obj = Object.assign(orderBy, sortedBy, ...params)
      }
      // // vuex
      // this.getRequestParams(obj)
      // this.getDatatable()
      // // check clear
      // this.uncheckAll()
      this.refreshData(obj)
    }
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
