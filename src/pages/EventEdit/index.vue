<script>
import { mapActions, mapGetters } from 'vuex'
import { Settings, DateTime } from 'luxon'
Settings.defaultLocale = 'local' // 時區
export default {
  name: 'eventEdit',
  data () {
    return {
      eventTitle: '',
      eventDescribe: '',
      point: '',
      eventPointlimit: '',
      eventlimit: '',
      timesLimitStatus: false,
      eventStatus: false,
      // vue datetime
      datetimeExpire: '',
      datetimeStart: '',
      // 開啟下方csv 清單
      csvOpen: false
    }
  },
  computed: {
    ...mapGetters('eventInfoMoudule', ['eventInfo']),
    ...mapGetters(['tokenVal']),
    eventID () {
      return this.$route.params.id
    },
    pageTitle () {
      if (this.eventID === 'new') return '新增活動'
      else return '編輯活動'
    }
  },
  methods: {
    ...mapActions('eventInfoMoudule', ['getInfo']),
    ...mapActions(['token_update', 'remove_cookie']),
    setInfoFromVUEX () {
      this.eventTitle = this.eventInfo.title
      this.eventDescribe = this.eventInfo.description
      this.point = this.eventInfo.point
      this.eventPointlimit = this.eventInfo.point_limit === 0 ? null : this.eventInfo.point_limit
      this.eventlimit = this.eventInfo.event_limit === 0 ? null : this.eventInfo.event_limit
      this.datetimeStart = DateTime.fromSQL(this.eventInfo.start_at).toISO()
      this.datetimeExpire = DateTime.fromSQL(this.eventInfo.end_at).toISO()
      let eStatus = this.eventInfo.status === 1
      let tlStatus = this.eventInfo.times_limit !== 1
      this.eventStatus = eStatus
      this.timesLimitStatus = tlStatus
    },
    cancel () {
      this.$router.push({name: 'event'})
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
          if (this.eventID === 'new') this.create()
          else this.update()
        }
      })
    },
    dataForm () {
      let data = {
        'title': this.eventTitle,
        'point': this.point,
        'type': 0, // 手動(default)
        'start_at': DateTime.fromISO(this.datetimeStart, {zone: 'utc'}).toFormat('yyyy/MM/dd HH:mm:ss'),
        'end_at': DateTime.fromISO(this.datetimeExpire, {zone: 'utc'}).plus({ days: 1 }).minus({ seconds: 1 }).toFormat('yyyy/MM/dd HH:mm:ss'),
        'times_limit': this.timesLimitStatus ? 0 : 1,
        'status': this.eventStatus ? 1 : 0,
        // 可存null
        'description': this.eventDescribe,
        'point_limit': this.eventPointlimit ? this.eventPointlimit : 0,
        'event_limit': this.eventlimit ? this.eventlimit : 0
      }
      // if (this.eventDescribe) data['description'] = this.eventDescribe
      // if (this.eventPointlimit) data['point_limit'] = this.eventPointlimit
      // if (this.eventlimit) data['event_limit'] = this.eventlimit
      return data
    },
    create () {
      let data = this.dataForm()
      // 新增
      let url = `${process.env.API_HOST}v1/admin/event`
      this.axios.post(url, data, {
        headers: {
          'Authorization': this.tokenVal,
          'Accept': 'application/json'
        }
      }).then((res) => {
        if (res.headers.authorization) {
          this.token_update(res.headers.authorization)
        }

        // 成功
        this.$snotify.success(`新增一筆活動 : ${this.eventTitle}`, {
          timeout: 10000
        })
        this.$router.replace({name: 'event'})
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
    update () {
      let data = this.dataForm()
      this.$store.commit('ISLOADING', true) // 更新loading
      // 更新
      let url = `${process.env.API_HOST}v1/admin/event/${this.eventID}`
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
        this.$snotify.success(`修改活動 : ${this.eventTitle}`, {
          timeout: 10000
        })
        // this.$router.replace({name: 'event'})
        this.getInfo(this.eventID)
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
    }
  },
  mounted () {
    if (this.eventID !== 'new') this.getInfo(this.eventID)
  },
  watch: {
    eventInfo (val) {
      this.setInfoFromVUEX()
      this.csvOpen = true
    }
  }
}
</script>

<template src="./template.html"></template>
<style lang="scss" src="./style.scss" scoped></style>
