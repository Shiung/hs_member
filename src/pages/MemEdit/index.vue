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
      memMail: '',
      memTel: '',
      memStatus: '',
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
      this.memBonusPoint = this.memberInfo.bonus_point
      this.memAccumulate = this.memberInfo.accumulate
      this.memCouponUse = this.memberInfo.coupon
    },
    cancel () {
      this.$router.push({name: 'member'})
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
