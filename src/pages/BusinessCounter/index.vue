<script>
import { mapActions, mapGetters } from 'vuex'
import { DateTime } from 'luxon'
export default {
  name: 'businessCounter',
  data () {
    return {
      columns: ['edit', 'business_id', 'name', 'full_name', 'vat', 'pos_id', 'updated_at'],
      options: {
        headings: {
          edit: '',
          // id: 'ID',
          business_id: '商家ID',
          vat: '統編',
          pos_id: 'POS ID / 帳號',
          full_name: '廳別全名',
          // account_name: '帳號',
          name: '廳別名稱',
          updated_at: '更新時間'
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
          updated_at: function (h, row, index) {
            if (!row.updated_at) return null
            return DateTime.fromSQL(row.updated_at).setLocale('zh-TW').toFormat('yyyy/MM/dd HH:mm:ss')
          }
        }
      },
      showDialog: false,
      pageNumber: null,
      checkarray: [],
      checkbtn: false
    }
  },
  computed: {
    ...mapGetters('businessCounterTableMoudule', ['datatables', 'perPage', 'count', 'totalPages', 'totalCount', 'currentPage', 'paramsObj', 'paramsStatus']),
    ...mapGetters(['tokenVal']),
    shopID () {
      return this.$route.params.id
    },
    bsCounterID () {
      return this.$route.params.bsID
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
    ...mapActions('businessCounterTableMoudule', ['getDatatable', 'getRequestParams', 'setParamsStatus']),
    ...mapActions(['token_update', 'remove_cookie']),
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
    addNew () {
      this.$router.push({ name: 'businessCounterEdit', params: { bsID: 'new' } })
    },
    editChoose (iduse) {
      let bsID = ''
      if (iduse) bsID = iduse
      else bsID = this.checkarray.join()
      // this.setParamsStatus(true)
      this.$router.push({ name: 'businessCounterEdit', params: { bsID } })
    },
    initParamObj () {
      return {
        search: this.shopID,
        searchFields: 'business_id'
      }
    },
    refreshData (obj) {
      if (!obj) obj = this.initParamObj()
      this.getRequestParams(obj)
      this.getDatatable(this.memberID)
      // check clear
      this.uncheckAll()
      // 更新vue-table-2 一樣顯示資料
      this.$refs.businessCounterTable.setLimit(this.perPage)
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
      this.getRequestParams(this.initParamObj())
    }
    // 關閉儲存狀態 toggle
    this.setParamsStatus(false)
    // 初始 data
    this.getDatatable()
    // 更新vue-table-2 一樣顯示資料
    this.$refs.businessCounterTable.setLimit(this.perPage)
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
