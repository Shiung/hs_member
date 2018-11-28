<script>
import { mapActions, mapGetters } from 'vuex'
import { Settings, DateTime } from 'luxon'
Settings.defaultLocale = 'local' // 時區
export default {
  name: 'couponEdit',
  data () {
    return {
      couponName: '',
      couponTitle: '',
      couponDescription: '',
      couponContent: '',
      couponPoint: '',
      couponValue: '',
      couponStatus: false,
      coverageAllStatus: false,
      // vue datetime
      datetimeExpire: '',
      datetimeStart: '',
      // vue dropzone
      dropzoneOptions: {
        // url: 'https://httpbin.org/post', // server 位置
        url: `${process.env.API_HOST}v1/admin/coupon/upload_image/${this.$route.params.id}`,
        thumbnailWidth: 300,
        // thumbnailHeight: 150,
        addRemoveLinks: true,
        maxFiles: 3,
        dictMaxFilesExceeded: '超過上傳數量(最多3個檔案)',
        dictInvalidFileType: '檔案格式不是圖片檔',
        dictRemoveFile: '刪除',
        autoProcessQueue: true,
        acceptedFiles: 'image/*',
        headers: {
          'Authorization': null
        }
      },
      destroy: false,
      // vue-table-2
      datatables: [],
      columns: ['id', 'name', 'action'],
      options: {
        headings: {
          id: 'ID',
          name: '名稱',
          action: '動作'
        },
        columnsClasses: {
          // edit: 'width-fix',
          action: 'width-fix'
        },
        perPage: 5,
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
        filterable: ['title'],
        // filterable: false,
        sortIcon: {
          base: 'sorticon',
          up: 'sort-up',
          down: 'sort-down',
          is: 'sort'
        }
      },
      // 新增聽別公司塞選
      coverageCompanyData: [],
      coverageCompanyMeta: [],
      coverageCompany: '',
      readMoreCompanyShow: true,
      loadingCompanyShow: false,
      selectOpenCompanyCount: 0,
      // 新增廳別
      showDialog: false,
      oneSelectTags: [],
      coverageSelect: [],
      coverageData: [],
      coverageMeta: [],
      loadingShow: false,
      readMoreShow: true,
      selectOpenCount: 0,
      selectNoneVale: false
    }
  },
  computed: {
    ...mapGetters('couponInfoMoudule', ['conponInfo']),
    ...mapGetters(['tokenVal']),
    couponID () {
      return this.$route.params.id
    },
    pageTitle () {
      if (this.couponID === 'new') return '新增優惠劵'
      else return '編輯優惠劵'
    }
  },
  methods: {
    // 資料 vuex
    ...mapActions('couponInfoMoudule', ['getInfo']),
    ...mapActions(['token_update', 'remove_cookie']),
    setInfoFromVUEX () {
      this.couponName = this.conponInfo.name
      this.couponTitle = this.conponInfo.title
      this.couponDescription = this.conponInfo.description
      this.couponContent = this.conponInfo.content
      this.couponPoint = this.conponInfo.point
      this.couponValue = this.conponInfo.value
      this.datetimeExpire = DateTime.fromSQL(this.conponInfo.expire_at).toISO()
      let status = this.conponInfo.status === 1
      this.couponStatus = status
      // vue-table-2
      if (this.conponInfo.coverage.data.length > 0) {
        let newcoverage = this.conponInfo.coverage.data.map((obj) => {
          return {
            id: obj.id,
            name: obj.full_name // obj.name
          }
        })
        this.datatables = newcoverage
      } else {
        this.coverageAllStatus = true
      }
      // vue2 dropZone
      this.initImg()
    },
    save () {
      this.$validator.validate().then(result => {
        if (!result) {
          // this.$snotify.error('欄位填寫不完整')
          this.$swal({
            title: '欄位填寫不完整',
            icon: 'error'
          })
        } else {
          // 判斷是否有選擇聽別
          if (!this.coverageAllStatus && this.datatables.length === 0) {
            this.$swal({
              title: '請選擇廳別!!!',
              icon: 'error'
            })
            return
          }
          if (this.couponID === 'new') this.createNewCoupon()
          else this.updateCoupon()
        }
      })
    },
    cancel () {
      this.$router.push({name: 'coupon'})
    },
    // 刪除聽別
    deleteCoverage (id) {
      let newDatatables = this.datatables.filter(function (item) {
        return item.id !== id
      })
      // 更新data資料
      this.datatables = newDatatables

      // 重置select
      // this.selectOpenCompanyCount = 0
      // this.selectOpenCount = 0
      this.addCoverageSelectCancel()
    },
    // 所有廳別取得
    openOptionCompany () {
      if (this.selectOpenCompanyCount < 1) {
        this.getCompany()
        this.selectOpenCompanyCount++
      } // else console.log('公司篩選已經init')
    },
    openOptionCoverage () {
      if (this.selectOpenCount < 1) {
        this.getData()
        this.selectOpenCount++
      } // else console.log('廳別有重複init')
    },
    // addCoverageSelect () {
    //   this.showDialog = true
    //   if (this.selectOpenCount < 1) {
    //     this.getData()
    //     this.selectOpenCount++
    //   } else console.log('有重複')
    // },
    coverageUsed () {
      // 已經綁定的項目
      return this.datatables.map((item) => {
        return item.id
      })
    },
    getCompany () {
      const token = this.tokenVal
      const url = `${process.env.API_HOST}v1/admin/business`
      let params = this.getCompanyParams()
      this.axios.get(url, {
        headers: {
          'Authorization': `${token}`
        },
        params
      }).then((res) => {
        // data path
        let dataPath = res.data
        if (this.coverageCompanyData.length === 0) {
          this.coverageCompanyData = dataPath.data
        } else {
          let newCoverageCompanyData = new Set() // 物件
          // 原有資料
          this.coverageCompanyData.forEach((item) => {
            newCoverageCompanyData.add(item)
          })
          // 更多資料
          dataPath.data.forEach((item) => {
            newCoverageCompanyData.add(item)
          })
          // 獲得資料
          this.coverageCompanyData = Array.from(newCoverageCompanyData)
        }
        this.coverageCompanyMeta = dataPath.meta
        if (dataPath.meta.pagination.total_pages === dataPath.meta.pagination.current_page) {
          this.readMoreCompanyShow = false
        }
        if (res.headers.authorization) {
          this.token_update(res.headers.authorization)
        }
      }).catch((error) => {
        if (error.response.status === 401) {
          this.remove_cookie()
          this.$router.replace({name: 'login'})
        } else if (error.response.status === 429) {
          this.$swal({
            title: '操作太多次',
            icon: 'error'
          })
        } else console.log(error.response)
      }).then(() => {
        this.loadingCompanyShow = false
      })
    },
    getData () {
      const token = this.tokenVal
      const url = `${process.env.API_HOST}v1/admin/businesscounter`
      let params = this.getParams()
      this.axios.get(url, {
        headers: {
          'Authorization': `${token}`
        },
        params
      }).then((res) => {
        // data path
        let dataPath = res.data
        // 已經綁定的項目
        let used = this.coverageUsed()
        // 判斷資料
        if (this.coverageData.length === 0) {
          // this.coverageData = dataPath.data
          let newobj = dataPath.data.filter((item) => {
            return used.every((i) => {
              return item.id !== i
            })
          })
          this.coverageData = newobj
          // console.log(newobj)
        } else {
          let newCoverageData = new Set() // 物件
          this.coverageData.forEach((item) => {
            newCoverageData.add(item)
          })
          let newobj = dataPath.data.filter((item) => {
            return used.every((i) => {
              return item.id !== i
            })
          })
          newobj.forEach((item) => {
            newCoverageData.add(item)
          })
          this.coverageData = Array.from(newCoverageData)
        }
        this.coverageMeta = dataPath.meta
        if (dataPath.meta.pagination.total_pages === dataPath.meta.pagination.current_page) {
          this.readMoreShow = false
        }
        if (res.headers.authorization) {
          this.token_update(res.headers.authorization)
        }
      }).catch((error) => {
        if (error.response.status === 401) {
          this.remove_cookie()
          this.$router.replace({name: 'login'})
        } else if (error.response.status === 429) {
          this.$swal({
            title: '操作太多次',
            icon: 'error'
          })
        } else console.log(error.response)
      }).then(() => {
        this.loadingShow = false
      })
    },
    getCompanyParams () {
      if (!this.coverageCompanyMeta.pagination) return null
      let current = this.coverageCompanyMeta.pagination.current_page
      return {
        page: current + 1
      }
    },
    getParams () {
      // 篩選公司
      let paramsFilter = this.coverageCompany ? {search: this.coverageCompany, searchFields: 'business_id'} : null

      if (!this.coverageMeta.pagination) return paramsFilter
      let current = this.coverageMeta.pagination.current_page
      return {
        ...paramsFilter,
        page: current + 1
      }
    },
    readCompanyMore () {
      let current = this.coverageCompanyMeta.pagination.current_page
      let total = this.coverageCompanyMeta.pagination.total_pages
      if (current === total - 1) {
        this.loadingCompanyShow = true
        this.getCompany()
        this.readMoreCompanyShow = false
      } else if (current < total) {
        this.loadingCompanyShow = true
        this.getCompany()
      } else {
        this.readMoreCompanyShow = false
      }
    },
    readMore () {
      let current = this.coverageMeta.pagination.current_page
      let total = this.coverageMeta.pagination.total_pages
      if (current === total - 1) {
        this.loadingShow = true
        this.getData()
        this.readMoreShow = false
      } else if (current < total) {
        this.loadingShow = true
        this.getData()
      } else {
        this.readMoreShow = false
      }
    },
    addCoverageSelectConfirm () {
      let select = this.coverageSelect
      let coverageObj = this.coverageData
      let coverageBind = this.datatables

      if (select.length === 0) {
        this.$swal({
          title: '請選擇廳別',
          icon: 'error'
        })
        return
      }
      // console.log('更新')
      let addObj = coverageObj.filter((item) => {
        return select.some((i) => {
          return item.id === i
        })
      })
      let newCoverageData = new Set() // 物件
      coverageBind.forEach((item) => {
        newCoverageData.add(item)
      })
      addObj.forEach((item) => {
        newCoverageData.add(item)
      })
      // console.log(newCoverageData)
      this.datatables = Array.from(newCoverageData)
      // 重置聽別選單
      // this.coverageSelect = []
      // this.coverageData = []
      // this.coverageMeta = []
      // this.selectOpenCount = 0
      // this.readMoreShow = true
      // this.showDialog = false
      this.addCoverageSelectCancel()
    },
    addCoverageSelectCancel () {
      // 重置公司篩選
      this.coverageCompanyData = []
      this.coverageCompanyMeta = []
      this.coverageCompany = ''
      this.readMoreCompanyShow = true
      this.loadingCompanyShow = false
      this.selectOpenCompanyCount = 0
      // 重置聽別選單
      this.coverageSelect = []
      this.coverageData = []
      this.coverageMeta = []
      this.selectOpenCount = 0
      this.readMoreShow = true
      this.showDialog = false
    },
    // vue2 dropzone
    initImg () {
      this.conponInfo.images.data.forEach((item) => {
        // console.log(item)
        let imageFile = {
          id: item.id,
          name: item.file_name,
          size: item.size,
          type: item.mime_type
        }
        let imageUrl = item.thumbnail // item.original
        this.$refs.couponDZ.manuallyAddFile(imageFile, imageUrl)
      })
    },
    maxExceed () {
      this.$snotify.error('超過上傳數量(最多3個檔案)')
    },
    uploadImgSuccess (file, response) {
      // console.log(file)
      // console.log('res', response)
      if (file.xhr.getResponseHeader('Authorization')) {
        this.token_update(file.xhr.getResponseHeader('Authorization'))
      }
    },
    uploadImgError (file, message, xhr) {
      // server feedback error
      if (xhr) {
        // token 更新延遲 過期
        if (message.error.message === 'Unauthenticated.') {
          this.$swal({
            title: '伺服器延遲，請再重試', // message,
            icon: 'error'
          })
          this.$refs.couponDZ.removeFile(file)
          return
        }
      }

      // 上傳錯誤
      if (file.status === 'error') {
        this.$refs.couponDZ.removeFile(file)
        this.$swal({
          title: message,
          icon: 'error'
        })
      }
    },
    removeImg (file, error, xhr) {
      if (file.status === 'error') return
      let id = file.id ? file.id : JSON.parse(file.xhr.response).data.id
      let url = `${process.env.API_HOST}v1/admin/coupon/${this.couponID}/images/${id}`
      this.$store.commit('ISLOADING', true)
      this.axios.delete(url, {
        headers: {
          'Authorization': this.tokenVal,
          'Accept': 'application/json'
        }
      }).then((res) => {
        if (res.headers.authorization) {
          this.token_update(res.headers.authorization)
        }
      }).catch((error) => {
        if (error.response.status === 401) {
          this.remove_cookie()
          this.$router.replace({name: 'login'})
        } else if (error.response.status === 429) {
          this.$swal({
            title: '操作太多次',
            icon: 'error'
          })
        } else console.log(error.response)
      }).then(() => {
        this.$store.commit('ISLOADING', false)
        // this.$snotify.success('已經刪除圖片')
      })
    },
    // update procecess
    createNewCoupon () {
      let coverage = this.coverageSelectFinal()
      let data = {
        'name': this.couponName,
        'title': this.couponTitle,
        'description': this.couponDescription,
        'content': this.couponContent,
        'value': this.couponValue,
        'point': this.couponPoint,
        'expire_at': DateTime.fromISO(this.datetimeExpire).toFormat('yyyy/MM/dd HH:mm:ss'),
        'coverage': coverage ? coverage.join(',') : null
      }
      // 新增
      let url = `${process.env.API_HOST}v1/admin/coupon`
      this.axios.post(url, data, {
        headers: {
          'Authorization': this.tokenVal,
          'Accept': 'application/json'
        }
      }).then((res) => {
        if (res.headers.authorization) {
          this.token_update(res.headers.authorization)
        }
      }).catch((error) => {
        if (error.response.status === 401) {
          this.remove_cookie()
          this.$router.replace({name: 'login'})
        } else if (error.response.status === 429) {
          this.$swal({
            title: '操作太多次',
            icon: 'error'
          })
        } else console.log(error.response)
      }).then(() => {
        this.$snotify.success(`新增一筆優惠劵 : ${this.couponName}`, {
          timeout: 10000
        })
        this.$router.replace({name: 'coupon'})
      })
    },
    updateCoupon () {
      let coverage = this.coverageSelectFinal()
      let data = {
        'name': this.couponName,
        'title': this.couponTitle,
        'description': this.couponDescription,
        'content': this.couponContent,
        'value': this.couponValue,
        'point': this.couponPoint,
        'status': this.couponStatus ? 1 : 0,
        'expire_at': DateTime.fromISO(this.datetimeExpire).toFormat('yyyy/MM/dd HH:mm:ss'),
        'coverage': coverage ? coverage.join(',') : null
      }
      // 更新
      let url = `${process.env.API_HOST}v1/admin/coupon/${this.couponID}`
      this.axios.put(url, data, {
        headers: {
          'Authorization': this.tokenVal,
          'Accept': 'application/json'
        }
      }).then((res) => {
        if (res.headers.authorization) {
          this.token_update(res.headers.authorization)
        }
      }).catch((error) => {
        if (error.response.status === 401) {
          this.remove_cookie()
          this.$router.replace({name: 'login'})
        } else if (error.response.status === 429) {
          this.$swal({
            title: '操作太多次',
            icon: 'error'
          })
        } else console.log(error.response)
      }).then(() => {
        this.$snotify.success(`修改優惠劵 : ${this.couponName}`, {
          timeout: 10000
        })
        this.$router.replace({name: 'coupon'})
      })
    },
    coverageSelectFinal () {
      if (this.coverageAllStatus) return null
      else {
        return this.datatables.map((item) => {
          return item.id
        })
      }
    }
  },
  mounted () {
    let couponID = this.couponID
    if (couponID !== 'new') {
      this.getInfo(couponID)
    }

    // vue datetime 時間初始
    this.datetimeStart = DateTime.local().toISO()

    // vue2 Dropzone init (tokne)
    this.dropzoneOptions.headers.Authorization = this.tokenVal
  },
  watch: {
    conponInfo (val) {
      this.setInfoFromVUEX()
    },
    tokenVal (val) {
      // vue2 Dropzone tokne更新
      this.dropzoneOptions.headers.Authorization = this.tokenVal
    },
    coverageCompany (val) {
      // 重置聽別選單
      this.coverageSelect = []
      this.coverageData = []
      this.coverageMeta = []
      this.selectOpenCount = 0
      this.readMoreShow = true
    },
    // 確認可以選擇加入的廳別是否有值
    coverageData (val) {
      this.selectNoneVale = false
      if (val.length === 0) this.selectNoneVale = true
    }
  }
}
</script>

<template src="./template.html"></template>
<style lang="scss" src="./style.scss" scoped></style>
