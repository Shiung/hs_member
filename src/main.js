// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import 'bootstrap'
import { MdField, MdSwitch, MdCard, MdRipple, MdButton, MdMenu, MdList, MdCheckbox, MdRadio, MdTable, MdTooltip, MdBadge, MdDialog, MdChips, MdProgress, MdContent, MdAutocomplete } from 'vue-material/dist/components'
import 'vue-material/dist/vue-material.min.css'
import { ClientTable, ServerTable } from 'vue-tables-2'
import VueSwal from 'vue-swal'
import Snotify, { SnotifyPosition } from 'vue-snotify'
import Datetime from 'vue-datetime'
import axios from 'axios'
import VueAxios from 'vue-axios'
// vee 驗證
import VeeValidate from 'vee-validate'
import zhTwValidate from 'vee-validate/dist/locale/zh_TW'
// loading
import Loading from 'vue-loading-overlay'
// vue2-dropzone
import vue2Dropzone from 'vue2-dropzone'

import App from './App'
import router from './router'

// vuex
import store from './store'

// filters
import currencyFilter from './filters/currency'

Vue.config.productionTip = false
Vue.use(Vuex)
Vue.use(VueAxios, axios)

// axios.defaults.withCredentials = true // "跨域"
// axios.defaults.baseURL = 'https://hs_api.neplus.com.tw'
axios.defaults.headers.common['Accept'] = 'application/json'
// axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
// axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*'
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

// vue material
Vue.use(MdField)
Vue.use(MdSwitch)
Vue.use(MdCard)
Vue.use(MdRipple)
Vue.use(MdButton)
Vue.use(MdMenu)
Vue.use(MdList)
Vue.use(MdCheckbox)
Vue.use(MdRadio)
Vue.use(MdTable)
Vue.use(MdTooltip)
Vue.use(MdBadge)
Vue.use(MdDialog)
Vue.use(MdChips)
Vue.use(MdProgress)
Vue.use(MdContent)
Vue.use(MdAutocomplete)
// datatable
Vue.use(ClientTable, {skin: 'table table-hover'}, false, 'bootstrap4')
Vue.use(ServerTable, {skin: 'table table-hover'}, false, 'bootstrap4')
// sweetAlert
Vue.use(VueSwal)
// vue snotify
const options = {
  toast: {
    position: SnotifyPosition.rightBottom,
    timeout: 5000,
    showProgressBar: false, // true,
    closeOnClick: false,
    pauseOnHover: true // false
  }
}
Vue.use(Snotify, options)
// vue datetime
Vue.use(Datetime)

// vee use
VeeValidate.Validator.localize('zh_TW', zhTwValidate) // 轉為中文字
Vue.use(VeeValidate)

// loading
Vue.component('loading', Loading) // 全域使用

// vue2-dropzone
Vue.component('vueDropzone', vue2Dropzone) // 全域使用

Vue.filter('currency', currencyFilter) // 全域使用

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})

// 導航守衛 ==> 要在router 變動下才會觸發
router.beforeEach((to, from, next) => {
  let tokenStatus = store.state.token
  if (to.meta.requiresAuth) {
    if (tokenStatus) {
      next()
    } else {
      next({name: 'login'})
    }
  } else {
    next()
  }
})
