<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'banner',
  data () {
    return {
      columns: ['edit', 'id', 'title', 'images', 'share_url', 'updated_at', 'status'],
      tableData: [],
      options: {
        headings: {
          edit: '#',
          id: 'ID',
          title: '標題',
          images: '圖片',
          share_url: '連結',
          status: '狀態',
          updated_at: '最後登入時間'
        },
        columnsClasses: {
          // edit: 'width-fix'
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
          status: function (h, row, index) {
            let s = row.status === 1 ? '啟用' : '關閉'
            let className = row.status === 1 ? 'badge badge-success text-capitalize' : 'badge badge-secondary text-capitalize'
            return <span class={className}>{s}</span>
          },
          images: function (h, row, index) {
            if (!row.images.data[0]) return null
            return <div style='width:150px;'><img class='img-fluid' src={row.images.data[0].thumbnail} alt='Thumbnail image'></img></div>
          },
          share_url: function (h, row, index) {
            return <md-icon>link</md-icon>
          }
        }
      },
      checkarray: [],
      checkbtn: false,
      // searchStr: null,
      showDialog: false,
      status: '',
      pageNumber: null
      // sortName: null
    }
  },
  computed: {
    ...mapGetters('bannerTableMoudule', ['datatables', 'perPage', 'count', 'totalPages', 'totalCount', 'currentPage', 'paramsObj', 'paramsStatus']),
    ...mapGetters(['tokenVal']),
    selectLength () {
      return this.checkarray.length > 0 ? this.checkarray.length : 'All'
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
    this.$refs.bannerTable.setLimit(this.perPage)
  },
  methods: {
    // 資料 vuex
    ...mapActions('bannerTableMoudule', ['getDatatable', 'getRequestParams', 'setParamsStatus']),
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
    link (url) {
      window.open(url)
    },
    addNew () {
      this.$router.push({ name: 'bannerEdit', params: { id: 'new' } })
    },
    editChoose (iduse) {
      let id = ''
      if (iduse) id = iduse
      else id = this.checkarray.join()
      // 開啟儲存狀態 toggle
      // this.setParamsStatus(true)
      this.$router.push({ name: 'bannerEdit', params: { id } })
    },
    refreshData (obj) {
      this.getRequestParams(obj)
      this.getDatatable()
      // check clear
      this.uncheckAll()
      this.searchStr = ''
      // 更新vue-table-2 一樣顯示資料
      this.$refs.bannerTable.setLimit(this.perPage)
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
    deleteBanner () {
      let id = this.checkarray.join()
      this.$swal({
        title: '刪除Banner!',
        text: `你選擇了ID: ${id}`,
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
            // 移除 es6 primse reject 沒有 new error
            /* eslint-disable */
            this.$snotify.async('呼叫伺服器', '刪除Banner', () => {
              return new Promise((resolve, reject) => {
                let url = `${process.env.API_HOST}v1/admin/banner/${id}`
                return this.axios.delete(url, {
                  headers: {
                    'Authorization': this.tokenVal,
                    'Accept': 'application/json'
                  }
                }).then((res) => {
                  if (res.headers.authorization) {
                    this.token_update(res.headers.authorization)
                  }
                  this.refreshData()
                  resolve({
                    title: 'banner刪除成功',
                    body: `已經刪除 ID:"${id}" 的banner`,
                    config: {
                      timeout: 5000
                      // closeOnClick: true
                    }
                  })
                }).catch((error) => {
                  console.log(error)
                  this.refreshData()
                  reject({
                    title: '傳送失敗',
                    body: '伺服器異常',
                    config: {
                      timeout: 5000
                      // closeOnClick: true
                    }
                  })
                })
              })
            })
          }
        })
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
