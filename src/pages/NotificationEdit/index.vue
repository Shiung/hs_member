<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'notificationEdit',
  data () {
    return {
      notificationTitle: '',
      notificationContent: '',
      notificationURL: '',
      notificationType: '',
      notificationToppingStatus: false,
      notificationStatus: false,
      // vue dropzone
      dropzoneOptions: {
        // url: 'https://httpbin.org/post', // server 位置
        url: `${process.env.API_HOST}v1/admin/content/upload_image/${this.$route.params.id}`,
        thumbnailWidth: 300,
        thumbnailHeight: 500,
        // thumbnailMethod: 'contain',
        addRemoveLinks: true,
        maxFiles: 3,
        dictMaxFilesExceeded: '超過上傳數量(最多3個檔案)',
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
    ...mapGetters('notificationInfoMoudule', ['notificationInfo']),
    ...mapGetters(['tokenVal']),
    notificationID () {
      return this.$route.params.id
    },
    pageTitle () {
      if (this.notificationID === 'new') return '新增最新消息'
      else return '編輯最新消息'
    }
  },
  methods: {
    // 資料 vuex
    ...mapActions('notificationInfoMoudule', ['getInfo']),
    ...mapActions(['token_update', 'remove_cookie']),
    setInfoFromVUEX () {
      this.notificationTitle = this.notificationInfo.title
      this.notificationContent = this.notificationInfo.content
      this.notificationURL = this.notificationInfo.share_url
      this.notificationType = this.notificationInfo.type
      let status = this.notificationInfo.status === 1
      this.notificationStatus = status
      this.notificationToppingStatus = this.notificationInfo.topping === 1

      // vue2 dropZone
      this.initImg(this.notificationInfo.images)
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
          if (this.notificationID === 'new') this.createNewNotification()
          else this.updateNotification()
        }
      })
    },
    cancel () {
      this.$router.push({name: 'notification'})
    },
    createNewNotification () {
      let data = {
        'title': this.notificationTitle,
        'content': this.notificationContent,
        'share_url': this.notificationURL,
        'type': this.notificationType
      }
      // 新增
      let url = `${process.env.API_HOST}v1/admin/content`
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
        this.$snotify.success(`新增一筆最新消息 : ${this.notificationTitle}`, {
          timeout: 10000
        })
        this.$router.replace({name: 'notification'})
      })
    },
    updateNotification () {
      let data = {
        'title': this.notificationTitle,
        'content': this.notificationContent,
        'share_url': this.notificationURL,
        'type': this.notificationType,
        'status': this.notificationStatus ? 1 : 0,
        'topping': this.notificationToppingStatus ? 1 : 0
      }
      // 更新
      let url = `${process.env.API_HOST}v1/admin/content/${this.notificationID}`
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
        this.$snotify.success(`修改最新消息 : ${this.notificationTitle}`, {
          timeout: 10000
        })
        this.$router.replace({name: 'notification'})
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
        let imageUrl = item.thumbnail // item.original
        this.$refs.notificationDZ.manuallyAddFile(imageFile, imageUrl)
      })
    },
    maxExceed () {
      this.$snotify.error('超過上傳數量(最多3個檔案)')
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
          this.$refs.notificationDZ.removeFile(file)
          return
        }
      }
      // 上傳錯誤
      if (file.status === 'error') {
        this.$refs.notificationDZ.removeFile(file)
        this.$swal({
          title: message,
          icon: 'error'
        })
      }
    },
    removeImg (file, error, xhr) {
      if (file.status === 'error') return
      let id = file.id ? file.id : JSON.parse(file.xhr.response).data.id
      let url = `${process.env.API_HOST}v1/admin/content/${this.notificationID}/images/${id}`
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
    let notificationID = this.notificationID
    if (notificationID !== 'new') {
      this.getInfo(notificationID)
    }
    // vue2 Dropzone init (tokne)
    this.dropzoneOptions.headers.Authorization = this.tokenVal
  },
  watch: {
    notificationInfo (val) {
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
