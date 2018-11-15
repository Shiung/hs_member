<script>
import { Settings, DateTime } from 'luxon'
Settings.defaultLocale = 'local' // 時區
export default {
  name: 'forms',
  data () {
    return {
      // 測試
      // 表單
      movies: [],
      country: '',
      font: '',
      // switch button
      autogrow: '',
      boolean: false,
      array: [],
      string: null,
      novalue: null,
      disabled: true,
      // radio
      radio: false,
      // checkbox
      checkarray: [],
      checkboolean: false,
      checkstring: null,
      checknovalue: null,
      checkdisabled: true,
      checkobj: null,
      obj1: {name: 'obj1'},
      obj2: {name: 'obj2'},
      indeterminate: true,
      // vue datetime
      datetimeStart: '',
      datetimeEnd: '',
      minDatetimeEnd: '',
      maxDatetimeStart: '',
      maxDatetimeEnd: ''
    }
  },
  mounted () {
    // vue datetime 時間初始
    this.maxDatetimeStart = DateTime.local().toISO()
    this.maxDatetimeEnd = DateTime.local().toISO()
  },
  watch: {
    // vue datetime
    datetimeStart (val) {
      this.minDatetimeEnd = val
    },
    datetimeEnd (val) {
      this.maxDatetimeStart = val
    }
  }
}
</script>

<template src="./template.html"></template>
<style lang="scss" src="./style.scss" scoped></style>
