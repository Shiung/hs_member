<script>
import { mapActions, mapGetters } from 'vuex'
// import { DateTime } from 'luxon'
// import currencyFn from '@/filters/currency'
export default {
  name: 'system',
  data () {
    return {
      // systemObj: [],
      systemReSendSMSID: '',
      systemReSendSMSTitle: '',
      systemReSendSMSValue: '',
      systemWaitSMSID: '',
      systemWaitSMSTitle: '',
      systemWaitSMSValue: '',
      systemPointRateID: '',
      systemPointRateTitle: '',
      systemPointRateValue: '',
      systemQRcodeExpireID: '',
      systemQRcodeExpireTitle: '',
      systemQRcodeExpireValue: '',
      systemSaleDisID: '',
      systemSaleDisTitle: '',
      systemSaleDisValue: '',
      systemRegistID: '',
      systemRegistTitle: '',
      systemRegistValue: '',
      systemAnniversaryID: '',
      systemAnniversaryTitle: '',
      systemAnniversaryValue: '',
      systemAnniversary2ID: '',
      systemAnniversary2Title: '',
      systemAnniversary2Value: '',
      systemAnniversary3ID: '',
      systemAnniversary3Title: '',
      systemAnniversary3Value: ''
    }
  },
  computed: {
    ...mapGetters('systemInfoMoudule', ['systemInfo']),
    ...mapGetters(['tokenVal'])
  },
  methods: {
    // 資料 vuex
    ...mapActions('systemInfoMoudule', ['getInfo']),
    ...mapActions(['token_update', 'remove_cookie']),
    setInfoFromVUEX () {
      // this.systemObj = this.systemInfo
      this.systemReSendSMSID = this.systemInfo[0].id
      this.systemReSendSMSTitle = this.systemInfo[0].name
      this.systemReSendSMSValue = this.systemInfo[0].value
      this.systemWaitSMSID = this.systemInfo[1].id
      this.systemWaitSMSTitle = this.systemInfo[1].name
      this.systemWaitSMSValue = this.systemInfo[1].value
      this.systemPointRateID = this.systemInfo[2].id
      this.systemPointRateTitle = this.systemInfo[2].name
      this.systemPointRateValue = this.systemInfo[2].value
      this.systemQRcodeExpireID = this.systemInfo[3].id
      this.systemQRcodeExpireTitle = this.systemInfo[3].name
      this.systemQRcodeExpireValue = this.systemInfo[3].value
      this.systemSaleDisID = this.systemInfo[4].id
      this.systemSaleDisTitle = this.systemInfo[4].name
      this.systemSaleDisValue = this.systemInfo[4].value
      this.systemRegistID = this.systemInfo[5].id
      this.systemRegistTitle = this.systemInfo[5].name
      this.systemRegistValue = this.systemInfo[5].value
      this.systemAnniversaryID = this.systemInfo[6].id
      this.systemAnniversaryTitle = this.systemInfo[6].name
      this.systemAnniversaryValue = this.systemInfo[6].value
      this.systemAnniversary2ID = this.systemInfo[7].id
      this.systemAnniversary2Title = this.systemInfo[7].name
      this.systemAnniversary2Value = this.systemInfo[7].value
      this.systemAnniversary3ID = this.systemInfo[8].id
      this.systemAnniversary3Title = this.systemInfo[8].name
      this.systemAnniversary3Value = this.systemInfo[8].value
    }
  },
  mounted () {
    this.getInfo()
  },
  watch: {
    systemInfo (val) {
      this.setInfoFromVUEX()
    }
  }
}
</script>

<template src="./template.html"></template>
<style lang="scss" src="./style.scss" scoped></style>
