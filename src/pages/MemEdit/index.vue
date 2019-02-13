<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'memEdit',
  data () {
    return {
      memName: '',
      memNick: '',
      memIDnum: '',
      memBirthday: '',
      device: '',
      gender: '',
      memMail: '',
      memTel: '',
      memStatus: '',
      employedStatus: '',
      memBonusPoint: '',
      memAccumulate: '',
      memCouponUse: '',
      list: {}
    }
  },
  computed: {
    ...mapGetters('memInfoMoudule', ['memberInfo']),
    ...mapGetters(['tokenVal']),
    memberID () {
      return this.$route.params.id
    },
    genderType () {
      switch (this.gender) {
        case 0:
          return '女'
        case 1:
          return '男'
        default:
          return '不透露'
      }
    }
  },
  methods: {
    // 資料 vuex
    ...mapActions('memInfoMoudule', ['getInfo']),
    ...mapActions(['token_update', 'remove_cookie']),
    setInfoFromVUEX () {
      this.memName = this.memberInfo.name
      this.memNick = this.memberInfo.nickname
      this.memIDnum = this.memberInfo.id_number
      this.memBirthday = this.memberInfo.birthday
      this.memMail = this.memberInfo.email
      this.memTel = this.memberInfo.mobile
      this.memStatus = this.memberInfo.status
      this.employedStatus = this.memberInfo.is_employed
      this.memBonusPoint = this.memberInfo.bonus_point
      this.memAccumulate = this.memberInfo.accumulate
      this.memCouponUse = this.memberInfo.coupon
      this.device = this.memberInfo.device_type
      this.gender = this.memberInfo.gender
    },
    cancel () {
      this.$router.push({name: 'member'})
    },
    sendSMS () {
      // 提示文字
      let contentDIV = document.createElement('div')
      contentDIV.className = 'text-danger font-14'
      let contentText = document.createTextNode(`注意: 會員未認證狀態下開啟APP，會自動進入電話驗證流程，無需在此發送驗證碼。此功能僅給例外情況使用`)
      contentDIV.appendChild(contentText)
      // 提示文字 --end
      this.$swal({
        title: '發送簡訊認證碼!',
        text: `發送至此電話號碼[${this.memTel}]?`,
        content: contentDIV,
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
            this.sendSMSAxios()
          }
        })
    },
    statusSwitch () {
      this.$swal({
        title: '認證會員!',
        text: `是否要認證此會員[${this.memName}]?`,
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
            let data = {
              'status': 2
            }
            this.updateAxios(data)
          }
        })
    },
    phoneChange () {
      this.$swal({
        title: `修改此會員[${this.memName}]電話號碼!`,
        // text: `是否要修改此會員[${this.memName}]的電話?`,
        content: {
          element: 'input',
          attributes: {
            placeholder: '輸入電話號碼',
            type: 'text'
          }
        },
        icon: 'warning'
      })
        .then((value) => {
          if (value === null) return
          let input = value.trim()
          if (input) {
            this.$swal({
              title: '電話號碼變更',
              text: `${input}`,
              icon: 'warning',
              buttons: {
                cancel: '取消變更!',
                ok: {
                  text: '確認變更!',
                  value: true
                }
              }
            })
              .then((value) => {
                if (value) {
                  let data = {
                    'mobile': input
                  }
                  this.updateAxios(data)
                }
              })
          } else {
            this.$swal({
              title: '請輸入電話號碼!',
              icon: 'error'
            })
          }
        })
    },
    employedStatusSwitch () {
      let swaltitle = '設定為員工!'
      let swalText = `是否要設定此會員[${this.memName}]為員工?`
      if (this.employedStatus) {
        swaltitle = '設定為非員工!'
        swalText = `是否要設定此會員[${this.memName}]為非員工?`
      }
      this.$swal({
        title: swaltitle,
        text: swalText,
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
            let data = {
              'is_employed': this.employedStatus === 1 ? 0 : 1
            }
            this.updateAxios(data)
          }
        })
    },
    updateAxios (obj) {
      let ID = this.memberID
      let data = obj
      this.$store.commit('ISLOADING', true) // 更新loading
      // 更新
      let url = `${process.env.API_HOST}v1/admin/member/${ID}`
      this.axios.put(url, data, {
        headers: {
          'Authorization': this.tokenVal,
          'Accept': 'application/json'
        }
      }).then((res) => {
        if (res.headers.authorization) {
          this.token_update(res.headers.authorization)
        }

        // 成功
        this.$snotify.success(`修改會員資料成功`, {
          timeout: 10000
        })
        this.getInfo(ID)
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
      })
    },
    sendSMSAxios () {
      let ID = this.memberID
      let url = `${process.env.API_HOST}v1/admin/member/verification_code/sms/${ID}`
      this.axios.post(url, null, {
        headers: {
          'Authorization': this.tokenVal,
          'Accept': 'application/json'
        }
      }).then((res) => {
        if (res.headers.authorization) {
          this.token_update(res.headers.authorization)
        }

        // 成功
        this.$snotify.success(`簡訊已發送`, {
          timeout: 10000
        })
      }).catch((error) => {
        if (error.response.status === 401) {
          this.remove_cookie()
          this.$router.replace({name: 'login'})
        } else if (error.response.status === 429) {
          this.$swal({
            title: '請求太頻繁,請於兩分鐘後再試',
            icon: 'error'
          })
        } else console.log(error.response)
      }).then(() => {
      })
    },
    // 停用帳號 (軟刪除)
    memberTrash () {
      let acount = this.memIDnum
      this.$swal({
        title: '停用帳號',
        text: `是否要停用此帳號"${acount}"`,
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
            let id = this.memberID
            this.trashAxios(id, acount)
          }
        })
    },
    trashAxios (id, acount) {
      let url = `${process.env.API_HOST}v1/admin/member/${id}`
      this.axios.delete(url, {
        headers: {
          'Authorization': this.tokenVal,
          'Accept': 'application/json'
        }
      }).then((res) => {
        if (res.headers.authorization) {
          this.token_update(res.headers.authorization)
        }

        // 成功
        this.$snotify.error(`會員帳號${acount}已被停用`, {
          timeout: 10000
        })

        // 導會會員清單頁面
        this.$router.replace({name: 'member'})
      }).catch((error) => {
        if (error.response.status === 401) {
          this.remove_cookie()
          this.$router.replace({name: 'login'})
        } else if (error.response.status === 429) {
          this.$swal({
            title: '請求太頻繁,請於兩分鐘後再試',
            icon: 'error'
          })
        } else console.log(error.response)
      }).then(() => {
      })
    }
  },
  mounted () {
    let ID = this.memberID
    this.getInfo(ID)
  },
  watch: {
    memberInfo (val) {
      this.setInfoFromVUEX()
    }
  }
}
</script>

<template src="./template.html"></template>
<style lang="scss" src="./style.scss" scoped></style>
