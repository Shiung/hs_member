<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'bannerEdit',
  data () {
    return {
      bannerTitle: '',
      bannerUrl: '',
      bannerStatus: false,
      bannerToppingStatus: false,
      // vue dropzone
      dropzoneOptions: {
        // url: 'https://httpbin.org/post', // server 位置
        url: `${process.env.API_HOST}v1/admin/banner/upload_image/${this.$route.params.id}`,
        thumbnailWidth: 300,
        // thumbnailHeight: 100,
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
    ...mapGetters('bannerInfoMoudule', ['bannerInfo']),
    ...mapGetters(['tokenVal']),
    bannerID () {
      return this.$route.params.id
    },
    pageTitle () {
      if (this.bannerID === 'new') return '新增Banner'
      else return '編輯Banner'
    }
  },
  methods: {
    ...mapActions('bannerInfoMoudule', ['getInfo']),
    ...mapActions(['token_update', 'remove_cookie']),
    setInfoFromVUEX () {
      this.bannerTitle = this.bannerInfo.title
      this.bannerUrl = this.bannerInfo.share_url
      let status = this.bannerInfo.status === 1
      this.bannerStatus = status
      this.bannerToppingStatus = this.bannerInfo.topping === 1

      // // vue2 dropZone
      this.initImg(this.bannerInfo.images)
    },
    cancel () {
      this.$router.push({name: 'banner'})
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
          if (this.bannerID === 'new') this.createBanner()
          else this.updateBanner()
        }
      })
    },
    dataFrom () {
      let data = {
        'title': this.bannerTitle,
        'share_url': this.bannerUrl
      }
      if (this.bannerID === 'new') {
        return data
      } else {
        return {
          ...data,
          'status': this.bannerStatus,
          'topping': this.bannerToppingStatus ? 1 : 0
        }
      }
    },
    createBanner () {
      // 取得data 資料
      let data = this.dataFrom()
      console.log('新增')
      // 新增
      let url = `${process.env.API_HOST}v1/admin/banner`
      this.axios.post(url, data, {
        headers: {
          'Authorization': this.tokenVal,
          'Accept': 'application/json'
        }
      }).then((res) => {
        if (res.headers.authorization) {
          this.token_update(res.headers.authorization)
        }
        this.$snotify.success(`新增一筆Banner : ${res.data.data.title}`, {
          timeout: 10000
        })
        this.$router.replace({name: 'banner'})
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
    updateBanner () {
      // 取得data 資料
      let data = this.dataFrom()
      // 新增
      let url = `${process.env.API_HOST}v1/admin/banner/${this.bannerID}`
      this.axios.put(url, data, {
        headers: {
          'Authorization': this.tokenVal,
          'Accept': 'application/json'
        }
      }).then((res) => {
        if (res.headers.authorization) {
          this.token_update(res.headers.authorization)
        }
        this.$snotify.success(`修改一筆Banner : ${res.data.data.title}`, {
          timeout: 10000
        })
        this.$router.replace({name: 'banner'})
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
        this.$refs.bannerDZ.manuallyAddFile(imageFile, imageUrl)
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
          this.$refs.bannerDZ.removeFile(file)
          return
        }
      }
      // 上傳錯誤
      if (file.status === 'error') {
        this.$refs.bannerDZ.removeFile(file)
        this.$swal({
          title: message,
          icon: 'error'
        })
      }
    },
    removeImg (file, error, xhr) {
      if (file.status === 'error') return
      let id = file.id ? file.id : JSON.parse(file.xhr.response).data.id
      let url = `${process.env.API_HOST}v1/admin/banner/${this.bannerID}/images/${id}`
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
    if (this.bannerID !== 'new') this.getInfo(this.bannerID)
    // vue2 Dropzone init (tokne)
    this.dropzoneOptions.headers.Authorization = this.tokenVal
  },
  watch: {
    bannerInfo (val) {
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
