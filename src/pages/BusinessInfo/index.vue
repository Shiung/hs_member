<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'businessInfo',
  data () {
    return {
      businessInfoName: '',
      businessInfoAccountName: '',
      businessInfoPosId: '',
      businessInfoVat: '',
      businessInfoPhone: '',
      businessInfoEmail: '',
      businessInfoAddress: '',
      businessInfoStatus: false,
      businessInfoPswStatus: false,
      businessInfoPswEdit: ''
      // // vue dropzone
      // dropzoneOptions: {
      //   url: 'https://httpbin.org/post', // server 位置
      //   // url: `${process.env.API_HOST}v1/admin/content/upload_image/${this.$route.params.id}`,
      //   // thumbnailWidth: 200,
      //   // thumbnailHeight: 500,
      //   // thumbnailMethod: 'contain',
      //   addRemoveLinks: true,
      //   maxFiles: 1,
      //   dictMaxFilesExceeded: '超過上傳數量(最多1個檔案)',
      //   dictInvalidFileType: '檔案格式不是圖片檔',
      //   dictRemoveFile: '刪除',
      //   // paramName: 'test',
      //   autoProcessQueue: true,
      //   acceptedFiles: 'image/*',
      //   headers: {
      //     'Authorization': null
      //   }
      // },
      // destroy: false
    }
  },
  computed: {
    ...mapGetters('businessInfoMoudule', ['businessInfo']),
    ...mapGetters(['tokenVal']),
    shopID () {
      return this.$route.params.id
    }
  },
  methods: {
    // 資料 vuex
    ...mapActions('businessInfoMoudule', ['getInfo']),
    ...mapActions(['token_update', 'remove_cookie']),
    setInfoFromVUEX () {
      this.businessInfoName = this.businessInfo.name
      this.businessInfoAccountName = this.businessInfo.account_name
      this.businessInfoPosId = this.businessInfo.pos_id
      this.businessInfoVat = this.businessInfo.vat
      this.businessInfoPhone = this.businessInfo.phone
      this.businessInfoEmail = this.businessInfo.email
      this.businessInfoAddress = this.businessInfo.address
      let status = this.businessInfo.status === 1
      this.businessInfoStatus = status
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
          this.updateBusiness()
        }
      })
    },
    cancel () {
      this.$router.push({name: 'business'})
    },
    updateBusiness () {
      let dataInfo = {
        'name': this.businessInfoName,
        'account_name': this.businessInfoEmail, // this.businessInfoAccountName,
        // 'pos_id': this.businessInfoPosId,
        'vat': this.businessInfoVat,
        'phone': this.businessInfoPhone,
        'address': this.businessInfoAddress,
        'email': this.businessInfoEmail,
        'status': this.businessInfoStatus ? 1 : 0
      }
      let data = {}
      if (this.businessInfoPswStatus) {
        data = {
          ...dataInfo,
          'password': this.businessInfoPswEdit
        }
      } else {
        data = {
          ...dataInfo
        }
      }
      let url = `${process.env.API_HOST}v1/admin/business/${this.shopID}`
      this.axios.put(url, data, {
        headers: {
          'Authorization': this.tokenVal,
          'Accept': 'application/json'
        }
      }).then((res) => {
        if (res.headers.authorization) {
          this.token_update(res.headers.authorization)
        }

        // 新增資訊
        this.$snotify.success(`修改商家資料 : ${res.data.data.name}`, {
          timeout: 10000
        })
        this.$router.replace({name: 'business'})
      }).catch((error) => {
        if (error.response.status === 401) {
          this.remove_cookie()
          this.$router.replace({name: 'login'})
        } else if (error.response.status === 429) {
          this.$swal({
            title: '操作太多次',
            icon: 'error'
          })
        } else if (error.response.status === 400 || error.response.status === 500) {
          this.$swal({
            title: `${error.response.data.error.message}`,
            icon: 'error'
          })
        }
      })
    }
    // // vue2 dropzone
    // initImg (obj) {
    //   obj.data.forEach((item) => {
    //     // console.log(item)
    //     let imageFile = {
    //       id: item.id,
    //       name: item.file_name,
    //       size: item.size,
    //       type: item.mime_type
    //     }
    //     let imageUrl = item.thumbnail // item.original
    //     this.$refs.notificationDZ.manuallyAddFile(imageFile, imageUrl)
    //   })
    // },
    // maxExceed () {
    //   this.$snotify.error('超過上傳數量(最多1個檔案)')
    // },
    // uploadImgSuccess (file, response) {
    //   // if (file.xhr.getResponseHeader('Authorization')) {
    //   //   this.token_update(file.xhr.getResponseHeader('Authorization'))
    //   // }
    // },
    // uploadImgError (file, message, xhr) {
    //   // server feedback error
    //   if (xhr) {
    //     // token 更新延遲 過期
    //     if (message.error.message === 'Unauthenticated.') {
    //       this.$swal({
    //         title: '伺服器延遲，請再重試', // message,
    //         icon: 'error'
    //       })
    //       this.$refs.notificationDZ.removeFile(file)
    //       return
    //     }
    //   }
    //   // 上傳錯誤
    //   if (file.status === 'error') {
    //     this.$refs.notificationDZ.removeFile(file)
    //     this.$swal({
    //       title: message,
    //       icon: 'error'
    //     })
    //   }
    // },
    // removeImg (file, error, xhr) {
    //   if (file.status === 'error') return null
    //   // let id = file.id ? file.id : JSON.parse(file.xhr.response).data.id
    //   // let url = `${process.env.API_HOST}v1/admin/content/${this.notificationID}/images/${id}`
    //   // this.$store.commit('ISLOADING', true)
    //   // this.axios.delete(url, {
    //   //   headers: {
    //   //     'Authorization': this.tokenVal,
    //   //     'Accept': 'application/json'
    //   //   }
    //   // }).then((res) => {
    //   //   if (res.headers.authorization) {
    //   //     this.token_update(res.headers.authorization)
    //   //   }
    //   // }).catch((error) => {
    //   //   if (error.response.status === 401) {
    //   //     this.remove_cookie()
    //   //     this.$router.replace({name: 'login'})
    //   //   } else if (error.response.status === 429) {
    //   //     this.$swal({
    //   //       title: '操作太多次',
    //   //       icon: 'error'
    //   //     })
    //   //   } else console.log(error.response)
    //   // }).then(() => {
    //   //   this.$store.commit('ISLOADING', false)
    //   //   // this.$snotify.success('已經刪除圖片')
    //   // })
    // }
  },
  mounted () {
    this.getInfo(this.shopID)
  },
  watch: {
    businessInfo (val) {
      this.setInfoFromVUEX()
    },
    businessInfoPswStatus (val) {
      if (!val) {
        this.businessInfoPswEdit = ''
      }
    }
  }
}
</script>

<template src="./template.html"></template>
<style lang="scss" src="./style.scss" scoped></style>
