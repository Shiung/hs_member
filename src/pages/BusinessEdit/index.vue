<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'businessEdit',
  data () {
    return {
      businessCreateName: '',
      businessCreateAccountName: '',
      businessCreateVat: '',
      businessCreatePosId: '',
      businessCreatePhone: '',
      businessCreateEmail: '',
      businessCreateAddress: '',
      businessCreatePsw: ''
    }
  },
  computed: {
    ...mapGetters('businessInfoMoudule', ['businessInfo']),
    ...mapGetters('businessCounterInfoMoudule', ['businessCounterInfo']),
    ...mapGetters(['tokenVal']),
    shopID () {
      return this.$route.params.id
    },
    bsCounterID () {
      return this.$route.params.bsID
    },
    businessStatus () {
      if (this.shopID === 'new') return false
      else return true
    },
    businessCounterEditStatus () {
      if (this.bsCounterID) return false
      else return true
    },
    pageTitle () {
      if (this.shopID === 'new') return '新增商家資料'
      else if (this.bsCounterID === 'new') return `商家"${this.businessInfo.name}" | 廳別新增`
      else if (this.bsCounterID) return `商家"${this.businessInfo.name}" | 編輯廳別 "${this.businessCounterInfo.name}"`
      else return `編輯商家"${this.businessInfo.name}"`
    }
  },
  methods: {
    ...mapActions('businessInfoMoudule', ['getInfo']),
    ...mapActions(['token_update', 'remove_cookie']),
    cancel () {
      if (this.bsCounterID) this.$router.push({name: 'businessCounter'})
      else this.$router.push({name: 'business'})
    },
    save () {
      this.$validator.validate().then(result => {
        if (!result) {
          // this.$snotify.error('欄位填寫不完整')
          this.$swal({
            title: '欄位填寫不完整',
            icon: 'error'
          })
          this.firstStepError = '欄位填寫不完整'
        } else {
          this.createBusiness()
        }
      })
    },
    createBusiness () {
      let data = {
        'name': this.businessCreateName,
        'account_name': this.businessCreateEmail,
        // 'pos_id': this.businessCreatePosId,
        'vat': this.businessCreateVat,
        'password': this.businessCreatePsw,
        'phone': this.businessCreatePhone,
        'address': this.businessCreateAddress,
        'email': this.businessCreateEmail
      }
      let url = `${process.env.API_HOST}v1/admin/business`
      this.axios.post(url, data, {
        headers: {
          'Authorization': this.tokenVal,
          'Accept': 'application/json'
        }
      }).then((res) => {
        if (res.headers.authorization) {
          this.token_update(res.headers.authorization)
        }

        // 新增資訊
        this.$snotify.success(`新增一筆商家資料 : ${this.businessCreateName}`, {
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
        } else if (error.response.status === 400) {
          this.$swal({
            title: `${error.response.data.error.message}`,
            icon: 'error'
          })
        }
      })
    }
  },
  mounted () {
    if (this.businessStatus) {
      if (!this.businessInfo.name) this.$router.push({name: 'businessEdit'})
    }
  }
}
</script>

<template src="./template.html"></template>
<style lang="scss" src="./style.scss" scoped></style>
