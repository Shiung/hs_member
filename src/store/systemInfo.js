import axios from 'axios'
import router from '../router'
import swal from 'sweetalert'

/* eslint-disable */
export default {
  // ***state 屬於模組區域變數
  // ***actions , mutations , getters 屬於全域變數
  namespaced: true, // ***加入此設定 actions , mutations , getters 屬於區域變數
  state: {
    datas: {}
  },
  actions: {
    getInfo( context ){
      let cookieToken = getCookie()
      const url = `${process.env.API_HOST}v1/admin/system`
      axios.get(url, {
        headers: {
          'Authorization': `${cookieToken}`
        },
      }).then((res) => {
        context.commit('SYSTEMINFO', res.data.data)
        if (res.headers.authorization) {
          context.dispatch('token_update', res.headers.authorization, {root: true})
        } 
      }).catch((error) => {
        if (error.response.status === 401) {
          context.dispatch('remove_cookie', {root: true})
          router.replace({name: 'login'})
        } else if (error.response.status === 429) {
          swal({
            title: '操作太多次',
            icon: 'error'
          })
        }  else console.log(error.response)
      }).then(() => {
        context.commit('ISLOADING', false, {root: true})
      })
    }
  },
  mutations: {
    SYSTEMINFO ( state, payload ) {
      state.datas = payload
    }
  },
  // 運用getters 可以在其他頁面 用 mapGetters 方式 取代compute 抓取store 的方式
  getters: {
    systemInfo: state => state.datas
  }
}

function getCookie () {
  let key = 'hs_token'
  return localStorage[key] ? localStorage[key] : null
}
