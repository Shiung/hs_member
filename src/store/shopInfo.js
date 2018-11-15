import axios from 'axios'

/* eslint-disable */
export default {
  // ***state 屬於模組區域變數
  // ***actions , mutations , getters 屬於全域變數
  namespaced: true, // ***加入此設定 actions , mutations , getters 屬於區域變數
  state: {
    datas: []
  },
  actions: {
    getDatatable( context ){
      const url = `${process.env.APIPATH}/shopInfoDatatable`
      axios.get(url).then((res) => {
        context.commit('DATATABLE', res.data)
      })
    }
  },
  mutations: {
    DATATABLE ( state, payload ) {
      state.datas = payload
    }
  },
  // 運用getters 可以在其他頁面 用 mapGetters 方式 取代compute 抓取store 的方式
  getters: {
    datatables: state => state.datas
  }
}
