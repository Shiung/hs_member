<script>
// import { DateTime } from 'luxon'
import Datepicker from 'vuejs-datepicker'
import {zh} from 'vuejs-datepicker/dist/locale'

export default {
  name: 'report',
  data () {
    return {
      zh: zh,
      fullMonth: true,
      format: 'yyyy MMM',
      monthSelect: null
    }
  },
  methods: {
    monthSearch () {
      let seachMonth = this.monthSelect
      // 取得選取月份的第一天
      console.log(getStartOfMonth(seachMonth))
      // 取得選取月份的最後一天
      this.monthSelect = getEndOfMonth(seachMonth)
    }
  },
  computed: {
  },
  mounted () {
    // 取得本月最後一天的最後時刻
    this.monthSelect = getEndOfMonth()
  },
  watch: {
  },
  components: {
    Datepicker
  }
}

function getStartOfMonth (date = null) {
  let dateStart = new Date()
  if (date !== null) {
    dateStart.setYear(date.getFullYear())
    dateStart.setMonth(date.getMonth())
  }
  // 設定為下個月份的第一天
  dateStart.setDate(1)
  // 設定最後一天的HR 00:00:01
  dateStart.setHours(0, 0, 1)
  return dateStart
}
function getEndOfMonth (date = null) {
  let dateEnd = new Date()
  if (date !== null) {
    dateEnd.setYear(date.getFullYear())
    dateEnd.setMonth(date.getMonth())
  }
  // 將月份移至下個月份
  dateEnd.setMonth(dateEnd.getMonth() + 1)
  // 設定為下個月份的第一天
  dateEnd.setDate(1)
  // 設定最後一天的HR 23:59:59
  dateEnd.setHours(23, 59, 59)
  // 將日期-1為當月的最後一天
  dateEnd.setDate(dateEnd.getDate() - 1)
  return dateEnd
}
</script>

<template src="./template.html"></template>
<style lang="scss" src="./style.scss" scoped></style>
