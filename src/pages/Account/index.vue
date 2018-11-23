<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'account',
  data () {
    return {
      columns: ['edit', 'id', 'id_number', 'name', 'level', 'updated_at', 'status'],
      options: {
        headings: {
          edit: '#',
          id: 'ID',
          id_number: '帳號',
          level: '權限',
          psw: '密碼',
          name: '名稱',
          authLevel: '權限',
          status: '狀態',
          updated_at: '最後登入時間'
        },
        columnsClasses: {
          edit: 'width-fix'
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
        sortable: ['name123'],
        // filterable: ['name'],
        filterable: false,
        sortIcon: {
          base: 'sorticon',
          up: 'sort-up',
          down: 'sort-down',
          is: 'sort'
        },
        templates: {
          // psw: function (h, row, index) {
          //   let strLen = row.psw.length
          //   let pswStr = ''
          //   for (let i = 0; i < strLen; i++) {
          //     pswStr += '*'
          //   }
          //   return pswStr
          // },
          level: function (h, row, index) {
            let str = 'badge badge-pill text-capitalize '
            let s = ''
            let className = ''
            switch (row.level) {
              case 0:
                s = '最高權限'
                className = str.concat('badge-primary')
                break
              case 1:
                s = '管理者'
                // className = str.concat('badge-info')
                className = str.concat('badge-secondary')
                break
              default:
                break
            }
            return <span class={className}>{s}</span>
          },
          status: function (h, row, index) {
            let s = row.status === 1 ? 'on' : 'off'
            let className = s === 'on' ? 'badge badge-success badge-pill text-capitalize' : 'badge badge-secondary badge-pill text-capitalize'
            return <span class={className}>{s}</span>
          }
        }
      },
      checkarray: [],
      checkbtn: false,
      perPageOption: null,
      searchOption: ''
    }
  },
  computed: {
    ...mapGetters('adminTableMoudule', ['datatables', 'perPage', 'count', 'totalPages', 'totalCount', 'currentPage', 'paramsObj']),
    ...mapGetters(['tokenVal', 'userInfo']),
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
    ...mapActions('adminTableMoudule', ['getDatatable', 'getRequestParams']),
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
    refreshData (obj) {
      this.getRequestParams(obj)
      this.getDatatable()
      // check clear
      this.uncheckAll()
      this.searchStr = ''
      // 更新vue-table-2 一樣顯示資料
      this.$refs.adminTable.setLimit(this.perPage)
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
    },
    // option 功能
    searchAct () {
      let search = this.searchOption
      console.log(search)
    },
    levelCheck () {
      if (this.userInfo.level !== 0) {
        this.$swal({
          title: '帳號權限不夠!',
          icon: 'error'
        })
        return false
      } else return true
    },
    editChoose (iduse) {
      if (!this.levelCheck()) return
      let id = ''
      if (iduse) id = iduse
      else id = this.checkarray.join()
      // 開啟儲存狀態 toggle
      // this.setParamsStatus(true)
      this.$router.push({ name: 'accountEdit', params: { id } })
    },
    addNew () {
      if (!this.levelCheck()) return
      this.$router.push({ name: 'accountEdit', params: { id: 'new' } })
    },
    disabledAdmin () {
      if (!this.levelCheck()) return
      let id = this.checkarray.join()
      this.$swal({
        title: '系統施工中!',
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
            this.$snotify.error(`管理者 ${id} 已經停用`)
          }
        })
    },
    downloadCSV () {
      if (!this.levelCheck()) return
      let id = this.checkarray.join()
      this.$swal({
        title: 'Good job!',
        text: `你選擇了ID: ${id} 下載CSV檔案`,
        icon: 'success'
      })
    }
  },
  mounted () {
    // 初始 params
    this.getRequestParams()
    // 初始 data
    this.getDatatable()
    // 更新vue-table-2 一樣顯示資料
    this.$refs.adminTable.setLimit(this.perPage)
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
