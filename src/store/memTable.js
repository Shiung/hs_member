import axios from 'axios'
import ParamsObj from '../assets/js/reguestParamsObj/params.js'
import router from '../router'
import swal from 'sweetalert'
/* eslint-disable */
export default {
  // ***state 屬於模組區域變數
  // ***actions , mutations , getters 屬於全域變數
  namespaced: true, // ***加入此設定 actions , mutations , getters 屬於區域變數
  state: {
    datas: [],
    paramsObj: {},
    perPage: 50, // 單頁50筆
    totalPages: null,
    count: null,
    currentPage: null,
    totalCount: null,
    paramsStatus: false, // 記憶舊的paramsObj 狀態 下次reload 不更新
    trashStatus: false // 黑名單資料切換
  },
  actions: {
    getDatatable( context ){
      let trashUrl = ''
      if (context.state.trashStatus) trashUrl = '/trash'
      let cookieToken = getCookie()
      const url = `${process.env.API_HOST}v1/admin/member${trashUrl}`
      context.commit('ISLOADING', true, {root: true})
      let params = context.state.paramsObj
      axios.get(url, {
        headers: {
          'Authorization': `${cookieToken}`
        },
        params
      }).then((res) => {
        context.commit('DATATABLE', res.data.data)
        context.commit('PERPAGE', res.data.meta.pagination.per_page)
        context.commit('CURRENTPAGES', res.data.meta.pagination.current_page)
        context.commit('COUNT', res.data.meta.pagination.count)
        context.commit('TOTALCOUNT', res.data.meta.pagination.total)
        context.commit('TOTALPAGES', res.data.meta.pagination.total_pages)
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
        } else console.log(error.response)
      }).then(() => {
        context.commit('ISLOADING', false, {root: true})
      })
    },
    getRequestParams (context, newParams) {
      let paramsObj = ''
      if (newParams) {
        paramsObj = new ParamsObj({
          ...newParams,
          limit: 50 // 單頁50筆資料
        })
      } else {
        paramsObj = new ParamsObj({
          limit: 50 // 單頁50筆資料
        })
      }
      context.commit('SETPARAMSOBJ', paramsObj)
    },
    setParamsStatus (context, status) {
      context.commit('PARAMSSTATUS', status)
    },
    setTrashStatus (context, status) {
      context.commit('TRASHSTATUS', status)
    }
  },
  mutations: {
    DATATABLE ( state, payload ) {
      state.datas = payload
    },
    PERPAGE ( state, payload ) {
      state.perPage = payload
    },
    COUNT ( state, payload ) {
      state.count = payload
    },
    TOTALPAGES ( state, payload ) {
      state.totalPages = payload
    },
    CURRENTPAGES ( state, payload ) {
      state.currentPage = payload
    },
    TOTALCOUNT ( state, payload ) {
      state.totalCount = payload
    },
    SETPARAMSOBJ ( state, payload ) {
      state.paramsObj = payload
    },
    PARAMSSTATUS ( state, payload ) {
      state.paramsStatus = payload
    },
    TRASHSTATUS ( state, payload ) {
      state.trashStatus = payload
    }
  },
  // 運用getters 可以在其他頁面 用 mapGetters 方式 取代compute 抓取store 的方式
  getters: {
    datatables: state => state.datas,
    perPage: state => state.perPage,
    count: state => state.count,
    totalCount: state => state.totalCount,
    currentPage: state => state.currentPage,
    totalPages: state => state.totalPages,
    paramsObj: state => state.paramsObj,
    paramsStatus: state => state.paramsStatus,
    trashStatus: state => state.trashStatus
  }
}


function getCookie () {
  let key = 'hs_token'
  return localStorage[key] ? localStorage[key] : null
}
