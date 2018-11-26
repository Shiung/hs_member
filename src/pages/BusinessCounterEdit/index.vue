<script>
import { mapActions, mapGetters } from 'vuex'
import { Chrome } from 'vue-color'
export default {
  name: 'businessCounterEdit',
  components: {
    // 'photoshop-picker': Photoshop,
    'chrome-picker': Chrome
  },
  data () {
    return {
      businessCounterName: '',
      businessCounterFullName: '',
      businessCounterAccountName: '',
      businessCounterVat: '',
      businessCounterPhone: '',
      businessCounterPostId: '',
      businessCounterAddress: '',
      businessCounterPsw: '',
      businessCounterStatus: false,
      // color picker
      showDialogFullSreen: false,
      showDialog: false,
      // colors: '',
      colors: {
        hex: ''
      },
      // 密碼重置
      businessCounterPswStatus: false,
      businessCounterPswReset: '',
      // vue dropzone
      dropzoneOptions: {
        // url: 'https://httpbin.org/post', // server 位置
        url: `${process.env.API_HOST}v1/admin/businesscounter/${this.$route.params.bsID}/upload_image`,
        thumbnailWidth: 300,
        // thumbnailHeight: 500,
        // thumbnailMethod: 'contain',
        addRemoveLinks: true,
        paramName: 'uploads',
        maxFiles: 1,
        dictMaxFilesExceeded: '超過上傳數量(最多1個檔案)',
        dictInvalidFileType: '檔案格式不是圖片檔',
        dictRemoveFile: '刪除',
        // paramName: 'test',
        autoProcessQueue: true,
        acceptedFiles: 'image/*',
        headers: {
          'Authorization': null
        }
      },
      destroy: false
    }
  },
  computed: {
    ...mapGetters('businessCounterInfoMoudule', ['businessCounterInfo']),
    ...mapGetters(['tokenVal']),
    shopID () {
      return this.$route.params.id
    },
    bsCounterID () {
      return this.$route.params.bsID
    },
    colorPick () {
      if (this.colors.hex) {
        return this.colors.hex
      } else {
        return '沒有選擇背景顏色'
      }
    }
  },
  methods: {
    ...mapActions('businessCounterInfoMoudule', ['getInfo']),
    ...mapActions(['token_update', 'remove_cookie']),
    setInfoFromVUEX () {
      this.businessCounterName = this.businessCounterInfo.name
      this.businessCounterFullName = this.businessCounterInfo.full_name
      this.businessCounterAccountName = this.businessCounterInfo.account_name
      this.businessCounterVat = this.businessCounterInfo.vat
      this.businessCounterPhone = this.businessCounterInfo.phone
      this.businessCounterPostId = this.businessCounterInfo.pos_id
      this.businessCounterAddress = this.businessCounterInfo.address
      let status = this.businessCounterInfo.status === 1
      this.businessCounterStatus = status
      this.colors.hex = this.businessCounterInfo.color

      // vue2 dropZone
      this.initImg(this.businessCounterInfo.images)
    },
    cancel () {
      this.$router.push({name: 'businessCounter'})
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
          if (this.bsCounterID === 'new') this.createBScounter()
          else this.updateBScounter()
        }
      })
    },
    dataFrom () {
      let data = {
        'business_id': this.shopID,
        'name': this.businessCounterName,
        'full_name': this.businessCounterFullName,
        'account_name': this.businessCounterPostId, // this.businessCounterAccountName,
        'pos_id': this.businessCounterPostId,
        'vat': this.businessCounterVat,
        'phone': this.businessCounterPhone,
        'address': this.businessCounterAddress
        // 'status': this.businessCounterStatus ? 1 : 0
      }
      if (this.bsCounterID === 'new') {
        return {
          ...data,
          'password': this.businessCounterPsw
        }
      } else {
        if (this.businessCounterPswStatus) {
          return {
            ...data,
            'color': this.colors.hex,
            'status': this.businessCounterStatus ? 1 : 0,
            'password': this.businessCounterPswReset
          }
        } else {
          return {
            ...data,
            'color': this.colors.hex,
            'status': this.businessCounterStatus ? 1 : 0
          }
        }
      }
    },
    createBScounter () {
      // 取得data 資料
      let data = this.dataFrom()
      // 新增
      let url = `${process.env.API_HOST}v1/admin/businesscounter`
      this.axios.post(url, data, {
        headers: {
          'Authorization': this.tokenVal,
          'Accept': 'application/json'
        }
      }).then((res) => {
        if (res.headers.authorization) {
          this.token_update(res.headers.authorization)
        }
        this.$snotify.success(`新增一筆廳別 : ${res.data.data.name}`, {
          timeout: 10000
        })
        this.$router.replace({name: 'businessCounter'})
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
      })
    },
    updateBScounter () {
      // 取得data 資料
      let data = this.dataFrom()
      // 新增
      let url = `${process.env.API_HOST}v1/admin/businesscounter/${this.bsCounterID}`
      this.axios.put(url, data, {
        headers: {
          'Authorization': this.tokenVal,
          'Accept': 'application/json'
        }
      }).then((res) => {
        if (res.headers.authorization) {
          this.token_update(res.headers.authorization)
        }
        this.$snotify.success(`修改一筆廳別 : ${res.data.data.name}`, {
          timeout: 10000
        })
        this.$router.replace({name: 'businessCounter'})
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
      })
    },
    // vue2 dropzone
    initImg (obj) {
      obj.data.forEach((item) => {
        // console.log(item)
        let imageFile = {
          id: item.id,
          name: item.file_name,
          size: item.size,
          type: item.mime_type
        }
        let imageUrl = item.original // item.thumbnail
        this.$refs.bsCounterDZ.manuallyAddFile(imageFile, imageUrl)
      })
    },
    maxExceed () {
      this.$snotify.error('超過上傳數量(最多1個檔案)')
    },
    uploadImgSuccess (file, response) {
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
          this.$refs.bsCounterDZ.removeFile(file)
          return
        }
      }
      // 上傳錯誤
      if (file.status === 'error') {
        this.$refs.bsCounterDZ.removeFile(file)
        this.$swal({
          title: message,
          icon: 'error'
        })
      }
    },
    removeImg (file, error, xhr) {
      if (file.status === 'error') return
      let id = file.id ? file.id : JSON.parse(file.xhr.response).data.id
      let url = `${process.env.API_HOST}v1/admin/businesscounter/${this.bsCounterID}/images/${id}`
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
    }
  },
  mounted () {
    if (this.bsCounterID !== 'new') this.getInfo(this.bsCounterID)
    // vue2 Dropzone init (tokne)
    this.dropzoneOptions.headers.Authorization = this.tokenVal
  },
  watch: {
    businessCounterInfo (val) {
      this.setInfoFromVUEX()
    },
    tokenVal (val) {
      // vue2 Dropzone tokne更新
      this.dropzoneOptions.headers.Authorization = this.tokenVal
    }
  }
}
</script>

<template src="./template.html"></template>
<style lang="scss" src="./style.scss" scoped></style>
