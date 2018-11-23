<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'accountEdit',
  data () {
    return {
      adminIDnumber: '',
      adminName: '',
      adminEmail: '',
      adminPswCreate: '',
      adminLevel: '',
      adminStatus: false,
      // 重置密碼
      adminPswStatus: false,
      adiminPswReset: ''
    }
  },
  computed: {
    ...mapGetters('adminInfoMoudule', ['adminInfo']),
    ...mapGetters(['tokenVal', 'userInfo']),
    adminID () {
      return this.$route.params.id
    },
    pageTitle () {
      if (this.adminID === 'new') return '新增管理者'
      else return '編輯管理者'
    }
  },
  methods: {
    ...mapActions('adminInfoMoudule', ['getInfo']),
    ...mapActions(['token_update', 'remove_cookie']),
    setInfoFromVUEX () {
      this.adminIDnumber = this.adminInfo.id_number
      this.adminName = this.adminInfo.name
      this.adminEmail = this.adminInfo.email
      this.adminLevel = this.adminInfo.level
      let status = this.adminInfo.status === 1
      this.adminStatus = status
    },
    cancel () {
      this.$router.push({name: 'account'})
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
          if (this.adminID === 'new') this.createAdmin()
          else this.updateAdmin()
        }
      })
    },
    dataFrom () {
      let data = {
        'id_number': this.adminIDnumber,
        'name': this.adminName,
        'email': this.adminEmail,
        'level': this.adminLevel
      }
      if (this.adminID === 'new') {
        return {
          ...data,
          'status': 0,
          'password': this.adminPswCreate
        }
      } else {
        if (this.adminPswStatus) {
          return {
            ...data,
            'status': this.adminStatus ? 1 : 0,
            'password': this.adiminPswReset
          }
        } else {
          return {
            ...data,
            'status': this.adminStatus ? 1 : 0
          }
        }
      }
    },
    createAdmin () {
      // 取得data 資料
      let data = this.dataFrom()
      // 新增
      let url = `${process.env.API_HOST}v1/admin`
      this.axios.post(url, data, {
        headers: {
          'Authorization': this.tokenVal,
          'Accept': 'application/json'
        }
      }).then((res) => {
        if (res.headers.authorization) {
          this.token_update(res.headers.authorization)
        }
        this.$snotify.success(`新增一筆管理者 : ${res.data.data.name}`, {
          timeout: 10000
        })
        this.$router.replace({name: 'account'})
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
    updateAdmin () {
      // 取得data 資料
      let data = this.dataFrom()
      // 新增
      let url = `${process.env.API_HOST}v1/admin/${this.adminID}`
      this.axios.put(url, data, {
        headers: {
          'Authorization': this.tokenVal,
          'Accept': 'application/json'
        }
      }).then((res) => {
        if (res.headers.authorization) {
          this.token_update(res.headers.authorization)
        }
        this.$snotify.success(`修改一筆管理者 : ${res.data.data.name}`, {
          timeout: 10000
        })
        // admin 修改自己密碼
        if (this.adminID === this.userInfo.id && this.adminPswStatus === true) {
          console.log('修改自己密碼')
          this.remove_cookie()
          this.$router.replace({name: 'login'})
        } else {
          this.$router.replace({name: 'account'})
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
      })
    }
  },
  mounted () {
    if (this.adminID !== 'new') this.getInfo(this.adminID)
  },
  watch: {
    adminInfo (val) {
      this.setInfoFromVUEX()
    },
    adminPswStatus (val) {
      if (!val) {
        this.adiminPswReset = ''
      }
    }
  }
}
</script>

<template src="./template.html"></template>
<style lang="scss" src="./style.scss" scoped></style>
