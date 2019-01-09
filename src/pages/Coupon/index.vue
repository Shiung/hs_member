<script>
import { mapActions, mapGetters } from 'vuex'
import { DateTime } from 'luxon'
import currencyFn from '@/filters/currency'

export default {
  name: 'coupon',
  data () {
    return {
      columns: ['edit', 'name', 'date', 'tags', 'point', 'value', 'status'],
      options: {
        headings: {
          edit: '#',
          name: '標題',
          date: '有效期限',
          tags: '標籤群組',
          point: '兌換點數',
          value: '折價價錢',
          status: '狀態'
        },
        columnsClasses: {
          // edit: 'width-fix',
          // status: 'width-fix'
        },
        perPage: 15,
        perPageValues: [15, 25, 100],
        pagination: { chunk: 5, nav: 'scroll', dropdown: false, edge: false },
        texts: {
          // count: 'Showing {from} to {to} of {count} records|{count} records|One record',
          // noResults: 'No matching records',
          count: '顯示 {from} 到 {to} 筆資料 ， 總共 {count} 筆資料 |{count} 筆資料|One 筆資料',
          noResults: '沒有資料符合',
          first: '|<',
          last: '>|'
        },
        preserveState: true,
        sortable: ['name123', 'album'],
        // filterable: ['title'],
        filterable: false,
        sortIcon: {
          base: 'sorticon',
          up: 'sort-up',
          down: 'sort-down',
          is: 'sort'
        },
        templates: {
          date: function (h, row, index) {
            let dateStart = ''
            let dateEnd = ''
            if (row.expire_at) {
              // dateStart = `${DateTime.fromSQL(row.updated_at).setLocale('zh-TW').toFormat('yyyy/LLL/dd')} -`
              // dateEnd = DateTime.fromSQL(row.expire_at).setLocale('zh-TW').toFormat('yyyy/LLL/dd')
              dateStart = `${DateTime.fromSQL(row.updated_at).toFormat('yyyy/MM/dd HH:mm:ss')} -`
              dateEnd = DateTime.fromSQL(row.expire_at).toFormat('yyyy/MM/dd HH:mm:ss')
            }
            return `${dateStart} ${dateEnd}`
          },
          point: function (h, row, index) {
            return `${currencyFn(row.point)}`
          },
          value: function (h, row, index) {
            return `NT ${currencyFn(row.value)}`
          },
          status: function (h, row, index) {
            let s = row.status === 1 ? 'on' : 'off'
            let className = s === 'on' ? 'badge badge-success text-capitalize' : 'badge badge-secondary text-capitalize'
            return <span class={className}>{s}</span>
          }
        }
      },
      checkarray: [],
      checkbtn: false,
      searchStr: null,
      showDialog: false,
      perPageOption: null,
      pageNumber: null,
      // 標籤列表分類篩選
      tagFilterLoading: false,
      tagFilterList: [],
      // 標籤編輯
      showTagDialog: false,
      showTagMultiDeleteDialog: false,
      tagTable: [],
      tagLoading: false,
      tagLoadingOpacity: 0.8,
      tagColumns: ['edit', 'name'],
      tagOptions: {
        headings: {
          edit: '',
          name: '標籤清單'
        },
        columnsClasses: {
          // edit: 'width-fix',
          // status: 'width-fix'
        },
        perPage: 50,
        perPageValues: [15, 25, 100],
        pagination: { chunk: 5, nav: 'scroll', dropdown: false, edge: false },
        texts: {
          // count: 'Showing {from} to {to} of {count} records|{count} records|One record',
          // noResults: 'No matching records',
          count: '顯示 {from} 到 {to} 筆資料 ， 總共 {count} 筆資料 |{count} 筆資料|One 筆資料',
          noResults: '沒有資料符合',
          first: '|<',
          last: '>|'
        },
        preserveState: true,
        sortable: ['name123', 'album'],
        // filterable: ['title'],
        filterable: false
      },
      tagCheckbtn: false,
      tagCheckarray: [],
      // 批次處理標籤
      tagMultiSelect: []
    }
  },
  computed: {
    ...mapGetters('couponTableMoudule', ['datatables', 'perPage', 'count', 'totalPages', 'totalCount', 'currentPage', 'paramsObj', 'paramsStatus']),
    ...mapGetters('couponInfoMoudule', ['conponInfo']),
    ...mapGetters(['tokenVal']),
    selectLength () {
      return this.checkarray.length > 0 ? this.checkarray.length : 'All'
    },
    selectObject () {
      let selectIDsLength = this.selectLength
      let selectIDs = this.checkarray
      let totalData = this.datatables
      const obj = new Set()
      if (selectIDsLength === 'All') return null
      else {
        totalData.forEach((item) => {
          selectIDs.forEach((ID) => {
            if (item.id === ID) {
              obj.add(item)
            }
          })
        })
      }
      return Array.from(obj)
    },
    dataInfo () {
      let currentPage = this.currentPage
      let perPage = this.perPage
      let count = this.count
      let totalPage = this.totalPages
      let totalCount = this.totalCount
      if (totalPage === 1) {
        return `${totalCount} 筆資料`
      } else {
        let from = (currentPage - 1) * perPage + 1
        let to = from + count - 1
        return `顯示 ${from} 到 ${to} 筆資料 ，  總共 ${totalCount} 筆資料`
      }
    },
    // 單一選取conponID
    selectedCoupnID () {
      if (this.selectLength === 1) return this.checkarray.join()
      else return null
    }
  },
  mounted () {
    if (!this.paramsStatus) { // 有存狀態
      // 初始 params
      this.getRequestParams()
    }
    // 關閉儲存狀態 toggle
    this.setParamsStatus(false)
    // 初始 data
    this.getDatatable()
    // 更新vue-table-2 一樣顯示資料
    this.$refs.couponTable.setLimit(this.perPage)
  },
  methods: {
    // 資料 vuex
    ...mapActions('couponTableMoudule', ['getDatatable', 'getRequestParams', 'setParamsStatus']),
    ...mapActions('couponInfoMoudule', ['getInfo']),
    ...mapActions(['token_update', 'remove_cookie']),
    checkAll () {
      let allDataId = []
      this.datatables.forEach(function (item, index, array) {
        allDataId.push(item.id)
      })
      this.checkarray = allDataId
    },
    uncheckAll () {
      this.checkarray = []
    },
    // option 功能
    searchAct () {
      let search = this.searchStr
      if (search) {
        const obj = {
          orderBy: null,
          sortedBy: null,
          page: null,
          search: search,
          searchFields: 'name:like'
        }
        this.refreshData(obj)
      }
    },
    addNew () {
      // 開啟儲存狀態 toggle
      // this.setParamsStatus(true)
      this.$router.push({ name: 'couponEdit', params: { id: 'new' } })
    },
    editChoose (iduse) {
      let id = ''
      if (iduse) id = iduse
      else id = this.checkarray.join()
      // 開啟儲存狀態 toggle
      this.setParamsStatus(true)
      this.$router.push({ name: 'couponEdit', params: { id } })
    },
    deleteChoose () {
      let ids = this.checkarray.join(' , ')
      this.$snotify.async(`你選擇了IDs: ${ids}進行刪除`, 'Delete !', () => new Promise((resolve, reject) => {
        setTimeout(() => resolve({
          title: 'Success!!!',
          body: `已經刪除產品${ids}`,
          config: {
            timeout: 5000,
            showProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true
          }
        }), 2000)
      }))
    },
    refreshData (obj) {
      this.getRequestParams(obj)
      this.getDatatable()
      // check clear
      this.uncheckAll()
      this.searchStr = ''
      // 更新vue-table-2 一樣顯示資料
      this.$refs.couponTable.setLimit(this.perPage)
    },
    prevPage () {
      let current = this.currentPage
      let params = this.paramsObj
      const obj = {
        ...params,
        page: current - 1
      }
      if (current !== 1) {
        this.refreshData(obj)
      }
    },
    nextPage () {
      let current = this.currentPage
      let total = this.totalPages
      let params = this.paramsObj
      const obj = {
        ...params,
        page: current + 1
      }
      if (current !== total) {
        this.refreshData(obj)
      }
    },
    searchPage () {
      let page = this.pageNumber
      let params = this.paramsObj
      if (page !== '') {
        const obj = {
          ...params,
          page: page
        }
        this.refreshData(obj)
      }
      // 關閉搜尋頁面光箱
      this.showDialog = false
      this.pageNumber = ''
    },
    // 標籤
    filterOpen () {
      this.tagFilterLoading = true
      const token = this.tokenVal
      const url = `${process.env.API_HOST}v1/coupon/tag`
      this.axios.get(url, {
        headers: {
          'Authorization': `${token}`
        }
      }).then((res) => {
        this.tagFilterList = res.data.data
        if (res.headers.authorization) {
          this.token_update(res.headers.authorization)
        }
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
        this.tagFilterLoading = false
      })
    },
    openOptionTagList () {
      this.filterOpen()
    },
    filterType (tagID) {
      const obj = {
        page: null,
        tag_id: tagID
      }
      this.refreshData(obj)
    },
    tagCheckAll () {
      let allDataId = []
      this.tagTable.forEach(function (item, index, array) {
        allDataId.push(item.id)
      })
      this.tagCheckarray = allDataId
    },
    tagUncheckAll () {
      this.tagCheckarray = []
    },
    addTagToCoupon () {
      let IDs = this.tagCheckarray.join(',')
      let couponID = this.checkarray.join(',')
      this.$swal({
        title: '加入已選擇的標籤群組!',
        icon: 'warning',
        buttons: {
          cancel: '取消!',
          ok: {
            text: '確認!',
            value: true
          }
        }
      }).then((value) => {
        if (value) {
          this.addTagToCouponAxios(IDs, couponID)
        }
      })
    },
    addTag () {
      this.$swal({
        title: '新增標籤!',
        content: {
          element: 'input',
          attributes: {
            placeholder: '輸入標籤名稱',
            type: 'text'
          }
        }
      })
        .then((value) => {
          if (value === null) return
          let input = value.trim()
          if (input) {
            this.$swal({
              title: '新增標籤',
              text: `${input}`,
              icon: 'warning',
              buttons: {
                cancel: '取消新增!',
                ok: {
                  text: '確認新增!',
                  value: true
                }
              }
            })
              .then((value) => {
                if (value) {
                  let data = {
                    'tag': `${input}`,
                    'type': 'Coupon'
                  }
                  this.createTagAxios(data)
                }
              })
          } else {
            this.$swal({
              title: '請輸入新標籤名稱!',
              icon: 'error'
            })
          }
        })
    },
    editTag () {
      let id = this.tagCheckarray.join()
      this.$swal({
        title: '修改標籤名稱!',
        content: {
          element: 'input',
          attributes: {
            placeholder: '輸入標籤名稱',
            type: 'text'
          }
        }
      })
        .then((value) => {
          if (value === null) return
          let input = value.trim()
          if (input) {
            this.$swal({
              title: '修改標籤',
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
                    'name': `${input}`
                  }
                  this.updateTagAxios(data, id)
                }
              })
          } else {
            this.$swal({
              title: '請輸入新標籤名稱!',
              icon: 'error'
            })
          }
        })
    },
    reloadCoponInfoById () {
      let couponID = this.selectedCoupnID
      if (couponID != null) this.getInfo(couponID)
    },
    refreshTaglist () {
      // 重置tag list
      this.tagLoading = true
      this.tagTable = []
      this.tagCheckarray = []
      // get data
      this.getTagList()
    },
    getTagList () {
      const token = this.tokenVal
      const url = `${process.env.API_HOST}v1/coupon/tag`
      this.axios.get(url, {
        headers: {
          'Authorization': `${token}`
        }
      }).then((res) => {
        let tagList = res.data.data
        this.tagTable = tagList
        this.tagLoading = false
        this.$refs.tagTable.setLimit(tagList.length)

        if (res.headers.authorization) {
          this.token_update(res.headers.authorization)
        }
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
    deleteTagFromCoupon (couponID, tagID) {
      // 單一刪除
      this.$swal({
        title: '移除標籤群組!',
        icon: 'warning',
        buttons: {
          cancel: '取消!',
          ok: {
            text: '確認!',
            value: true
          }
        }
      }).then((val) => {
        if (val) {
          this.deleteTagFromCouponAxios(tagID, couponID)
        }
      })
    },
    multiDeleteTagFromCoupon () {
      let tagID = this.tagMultiSelect.join(',')
      let couponID = this.checkarray.join(',')
      this.deleteTagFromCouponAxios(tagID, couponID)
    },
    deleteTag () {
      let IDs = this.tagCheckarray.join(',')
      this.$swal({
        title: '刪除已選擇標籤!',
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
            this.deleteTagAxios(IDs)
          }
        })
    },
    createTagAxios (obj) {
      let data = obj
      this.tagLoading = true
      // 新增
      let url = `${process.env.API_HOST}v1/admin/tag`
      this.axios.post(url, data, {
        headers: {
          'Authorization': this.tokenVal,
          'Accept': 'application/json'
        }
      }).then((res) => {
        if (res.headers.authorization) {
          this.token_update(res.headers.authorization)
        }

        // 更新tag list
        this.refreshTaglist()

        // 成功
        this.$snotify.success(`新增一筆標籤`, {
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
    updateTagAxios (obj, tagID) {
      let data = obj
      let ID = tagID
      this.tagLoading = true
      // 更新
      let url = `${process.env.API_HOST}v1/admin/tag/${ID}`
      this.axios.put(url, data, {
        headers: {
          'Authorization': this.tokenVal,
          'Accept': 'application/json'
        }
      }).then((res) => {
        if (res.headers.authorization) {
          this.token_update(res.headers.authorization)
        }

        // 更新tag list
        this.refreshTaglist()

        // 成功
        this.$snotify.success(`修改標籤資料成功`, {
          timeout: 10000
        })
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
        // 更新couponInfo 單一
        this.reloadCoponInfoById()
      })
    },
    deleteTagAxios (IDs) {
      let url = `${process.env.API_HOST}v1/admin/tag/${IDs}`
      this.axios.delete(url, {
        headers: {
          'Authorization': this.tokenVal,
          'Accept': 'application/json'
        }
      }).then((res) => {
        if (res.headers.authorization) {
          this.token_update(res.headers.authorization)
        }

        // 更新tag list
        this.refreshTaglist()

        // 成功
        this.$snotify.success(`標籤刪除成功`, {
          timeout: 10000
        })
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
        // 更新couponInfo 單一
        this.reloadCoponInfoById()
      })
    },
    addTagToCouponAxios (IDs, couponIDs) {
      let couponID = this.selectedCoupnID
      let data = {
        'tag_id': IDs,
        'id': couponIDs
      }
      let url = `${process.env.API_HOST}v1/admin/coupon/attach_tag`
      this.axios.post(url, data, {
        headers: {
          'Authorization': this.tokenVal,
          'Accept': 'application/json'
        }
      }).then((res) => {
        if (res.headers.authorization) {
          this.token_update(res.headers.authorization)
        }

        // 更新tag list
        if (couponID !== null) this.refreshTaglist()

        // 成功
        this.$snotify.success(`標籤設定完成`, {
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
        // 更新couponInfo 單一
        this.reloadCoponInfoById()

        // 批次處理直接跳出視窗
        if (couponID === null) this.showTagDialog = false
      })
    },
    deleteTagFromCouponAxios (ID, couponID) {
      let couponIDselected = this.selectedCoupnID
      let params = {
        'tag_id': ID,
        'id': couponID
      }
      let url = `${process.env.API_HOST}v1/admin/coupon/detach_tag`
      this.axios.delete(url, {
        headers: {
          'Authorization': this.tokenVal,
          'Accept': 'application/json'
        },
        params
      }).then((res) => {
        if (res.headers.authorization) {
          this.token_update(res.headers.authorization)
        }
        // 更新tag list
        if (couponIDselected !== null) this.refreshTaglist()
        // 成功
        this.$snotify.success(`標籤已移除成功`, {
          timeout: 10000
        })
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
        // 更新couponInfo 單一
        this.reloadCoponInfoById()

        if (couponIDselected === null) this.showTagMultiDeleteDialog = false
      })
    }
  },
  watch: {
    checkarray (val) {
      if (val.length === 0) {
        this.checkbtn = false
      } else {
        this.checkbtn = true
      }
    },
    checkbtn (val, oldval) {
      if (!oldval) {
        if (this.checkarray.length === 0) {
          this.checkAll()
        }
      } else {
        if (this.checkarray.length !== 0) {
          this.uncheckAll()
        }
      }
    },
    pageNumber (val) {
      if (val === '') return
      if (val > this.totalPages) {
        this.$swal({
          title: `最大頁數${this.totalPages}`,
          icon: 'warning'
        })
          .then(() => {
            this.pageNumber = this.totalPages
          })
      } else if (val < 1) {
        this.$swal({
          title: `最小頁數 1`,
          icon: 'warning'
        })
          .then(() => {
            this.pageNumber = 1
          })
      }
    },
    // tag 新增視窗
    async showTagDialog (val) {
      // 初始
      this.tagLoading = true
      this.tagTable = []
      this.tagCheckarray = []
      // get data
      let couponID = this.selectedCoupnID
      if (val) {
        if (couponID != null) await this.getInfo(couponID)

        this.getTagList()
      } else {
        // 2. 重置 coupon datatable
        this.uncheckAll()
        this.getDatatable()
        // 更新vue-table-2 一樣顯示資料
        this.$refs.couponTable.setLimit(this.perPage)
      }
    },
    showTagMultiDeleteDialog (val) {
      if (!val) {
        // 重置選項
        this.tagMultiSelect = []
        // 重置 coupon datatable
        this.uncheckAll()
        this.getDatatable()
        // 更新vue-table-2 一樣顯示資料
        this.$refs.couponTable.setLimit(this.perPage)
      }
    },
    tagCheckarray (val) {
      if (val.length === 0) {
        this.tagCheckbtn = false
      } else {
        this.tagCheckbtn = true
      }
    },
    tagCheckbtn (val, oldval) {
      if (!oldval) {
        if (this.tagCheckarray.length === 0) {
          this.tagCheckAll()
        }
      } else {
        if (this.tagCheckarray.length !== 0) {
          this.tagUncheckAll()
        }
      }
    }
  }
}
</script>

<template src="./template.html"></template>
<style lang="scss" src="./style.scss" scoped></style>
