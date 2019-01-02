<script>
import { mapActions, mapGetters } from 'vuex'
import { Settings, DateTime } from 'luxon'
Settings.defaultLocale = 'local' // 時區
export default {
  name: 'eventCsv',
  data () {
    return {
      columns: ['edit', 'id', 'id_number', 'name'],
      options: {
        headings: {
          edit: '',
          id: '序號',
          id_number: '身分證字號',
          name: '名稱'
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
        }
      },
      showDialog: false,
      pageNumber: null,
      // vue dropzone
      dropzoneOptions: {
        // url: 'https://httpbin.org/post', // server 位置
        url: `${process.env.API_HOST}v1/admin/event/upload_file/${this.$route.params.id}`,
        thumbnailWidth: 300,
        thumbnailHeight: 500,
        // thumbnailMethod: 'contain',
        addRemoveLinks: true,
        maxFiles: 1,
        maxFilesize: 10,
        dictFileTooBig: '檔案太大(超過10MB)',
        dictMaxFilesExceeded: '超過上傳數量(最多1個檔案)',
        dictInvalidFileType: '檔案格式不是CSV檔案',
        dictRemoveFile: '刪除',
        paramName: 'uploads',
        autoProcessQueue: true,
        acceptedFiles: 'text/csv',
        headers: {
          'Authorization': null
        }
      },
      destroy: false,
      csvListOpen: false,
      // select
      checkarray: [],
      checkbtn: false,
      // 重新上傳csv
      showReSendCSVDialog: false
    }
  },
  computed: {
    ...mapGetters('eventCsvListTableMoudule', ['datatables', 'perPage', 'count', 'totalPages', 'totalCount', 'currentPage', 'paramsObj', 'paramsStatus']),
    ...mapGetters('eventInfoMoudule', ['eventInfo']),
    ...mapGetters(['tokenVal']),
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
    },
    isfileExit () {
      if (this.eventInfo.file) return this.eventInfo.file.data.length
      else return 0
    },
    isDateOver () {
      if (DateTime.fromSQL(this.eventInfo.end_at).ts > DateTime.local().ts) {
        return true
      } else return false
    }
  },
  methods: {
    ...mapActions('eventCsvListTableMoudule', ['getDatatable', 'getRequestParams', 'setParamsStatus']),
    ...mapActions('eventInfoMoudule', ['getInfo']),
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
    reloadPage () {
      // let vm = this
      // setTimeout(function () {
      //   let id = vm.eventID
      //   vm.getInfo(id)
      //   vm.getRequestParams()
      //   // datatable csv
      //   vm.getDatatable(vm.eventID)
      //   // 更新vue-table-2 一樣顯示資料
      //   vm.$refs.eventCsvListTable.setLimit(vm.perPage)
      // }, 3000)
      let id = this.eventID
      this.getInfo(id)
      this.getRequestParams()
      // datatable csv
      this.getDatatable(id)
      // 更新vue-table-2 一樣顯示資料
      // this.$refs.eventCsvListTable.setLimit(this.perPage)

      // 關閉重新上傳csv 光箱
      this.showReSendCSVDialog = false
    },
    refreshData (obj) {
      this.getRequestParams(obj)
      this.getDatatable(this.eventID)
      // check clear
      this.uncheckAll()
      // 更新vue-table-2 一樣顯示資料
      // this.$refs.eventCsvListTable.setLimit(this.perPage)
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
    // vue2 dropzone
    maxExceed () {
      this.$snotify.error('超過上傳數量(最多1個檔案)')
    },
    sendingEvent (file, xhr, formData) {
      formData.append('search_field', 'id_number')
      this.$store.commit('ISLOADING', true) // 更新loading
    },
    uploadSuccess (file, response) {
      if (file.xhr.getResponseHeader('Authorization')) {
        this.token_update(file.xhr.getResponseHeader('Authorization'))
      }
    },
    uploadError (file, message, xhr) {
      // server feedback error
      if (xhr) {
        // token 更新延遲 過期
        if (message.error.message === 'Unauthenticated.') {
          this.$swal({
            title: '伺服器延遲，請再重試', // message,
            icon: 'error'
          })
          this.$refs.eventCsvDZ.removeFile(file)
          return
        }
        // sever feedback error
        if (message.error.status === 400) {
          let errorMessage = message.error.message
          this.$swal({
            title: errorMessage,
            icon: 'error'
          })
          this.$refs.eventCsvDZ.removeFile(file)
          return
        }
      }
      // 上傳錯誤
      if (file.status === 'error') {
        this.$refs.eventCsvDZ.removeFile(file)
        this.$swal({
          title: message,
          icon: 'error'
        })
      }
    },
    uploadComplete (file) {
      // if (file.status === 'success') this.reloadPage()
      let vm = this
      if (file.status === 'success') {
        setTimeout(function () {
          vm.reloadPage()
        }, 3000)
      }
    },
    // 送點
    sendPoint (val) {
      if (val !== 'all') {
        let id = this.checkarray.join()
        this.$swal({
          title: '發送點數!',
          text: `你選擇了ID: ${id} 發送點數`,
          icon: 'info',
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
              this.sendPointAxios(id)
            }
          })
      } else {
        this.$swal({
          title: '發送點數!',
          text: `清單內所有會員發送點數`,
          icon: 'info',
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
              this.sendPointAxios(val)
            }
          })
      }
    },
    deleteCSV () {
      this.$swal({
        title: '清除CSV!',
        text: `清除此活動的CSV清單?`,
        icon: 'info',
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
            this.deleteCSVAxios()
          }
        })
    },
    sendPointAxios (id) {
      let data = {
        'members': id
      }
      this.$store.commit('ISLOADING', true) // 更新loading
      // 移除 es6 primse reject 沒有 new error
      /* eslint-disable */
      this.$snotify.async('呼叫伺服器', '活動發送點數請求', () => {
        return new Promise((resolve, reject) => {
          let url = `${process.env.API_HOST}v1/admin/event/run/${this.eventID}`
          return this.axios.post(url, data,{
            headers: {
              'Authorization': this.tokenVal,
              'Accept': 'application/json'
            }
          }).then((res) => {
            if (res.headers.authorization) {
              this.token_update(res.headers.authorization)
            }
            // this.refreshData()
            let id = this.eventID
            this.getInfo(id)
            // this.$router.push({name: 'eventCsvHistory'})
            resolve({
              title: '活動發送點數請求成功',
              // body: `已經刪除 ID:"${id}" 的最新消息`,
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
    },
    deleteCSVAxios () {
      let fileID = this.eventInfo.file.data[0].id
      this.$store.commit('ISLOADING', true) // 更新loading
      // 移除 es6 primse reject 沒有 new error
      /* eslint-disable */
      this.$snotify.async('呼叫伺服器', '清除CSV列表請求', () => {
        return new Promise((resolve, reject) => {
          let url = `${process.env.API_HOST}v1/admin/event/${this.eventID}/images/${fileID}`
          return this.axios.delete(url, {
            headers: {
              'Authorization': this.tokenVal,
              'Accept': 'application/json'
            }
          }).then((res) => {
            if (res.headers.authorization) {
              this.token_update(res.headers.authorization)
            }
            // this.refreshData()
            let id = this.eventID
            this.getInfo(id)

            resolve({
              title: '成功清除CSV列表',
              // body: `已經刪除 ID:"${id}" 的最新消息`,
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
  },
  mounted () {
    this.getRequestParams()
    if (this.isfileExit !== 0) {
      this.getDatatable(this.eventID)
      // 更新vue-table-2 一樣顯示資料
      this.$refs.eventCsvListTable.setLimit(this.perPage)
    }
    // vue2 Dropzone init (tokne)
    this.dropzoneOptions.headers.Authorization = this.tokenVal
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
    },
    eventInfo (val) {
      // 活動資料有變動 reload csv list
      this.$nextTick(() => {
        if (val.file.length === 0) this.refreshData(null)
      })
    }
  }
}
</script>

<template src="./template.html"></template>
<style lang="scss" src="./style.scss" scoped></style>
