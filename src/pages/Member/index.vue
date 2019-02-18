<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'member',
  data () {
    return {
      columns: ['edit', 'id', 'name', 'id_number', 'birthday', 'mobile', 'updated_at', 'device_type', 'status'], // , 'tags', 'is_employed'
      tableData: [],
      options: {
        headings: {
          edit: '#',
          id: 'ID',
          name: '會員名稱',
          nickname: '暱稱',
          id_number: '帳號',
          birthday: '生日',
          status: '狀態',
          mobile: '電話',
          tags: '標籤群組',
          is_employed: '員工',
          device_type: '登入設備',
          updated_at: '最後登入時間'
        },
        columnsClasses: {
          edit: 'width-fix'
          // id: 'width-fix'
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
        sortable: ['name123', 'birthday123'],
        // filterable: ['name', 'album'],
        filterable: false,
        sortIcon: {
          base: 'sorticon',
          up: 'sort-up',
          down: 'sort-down',
          is: 'sort'
        },
        templates: {
          is_employed: function (h, row, index) {
            let s = row.is_employed === 1 ? '員工' : '非員工'
            let className = row.is_employed === 1 ? 'badge badge-info badge-pill text-capitalize' : 'badge badge-pill badge-secondary text-capitalize'
            return <span class={className}>{s}</span>
          },
          status: function (h, row, index) {
            let s = row.status === 2 ? '已認證' : '未認證'
            let className = row.status === 2 ? 'badge badge-pill badge-success text-capitalize' : 'badge badge-pill badge-secondary text-capitalize'
            return <span class={className}>{s}</span>
          }
        }
      },
      checkarray: [],
      checkbtn: false,
      searchStr: null,
      status: '',
      pageNumber: null,
      sortName: null,
      // 過濾 搜尋
      showDialog: false,
      filterNum: 3, // 0: 姓名 1: 信箱 2: 身分證 3:電話
      filterStr: '電話',
      searchFields: 'mobile', // 0: name, 1: email,2: id_number ,3: mobile
      // 標籤列表分類篩選
      tagLoadingOpacity: 0.8,
      tagFilterLoading: false,
      tagFilterList: [],
      // 標籤編輯
      showTagDialog: false,
      showTagMultiDeleteDialog: false,
      tagTable: [],
      tagLoading: false,
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
    ...mapGetters('memTableMoudule', ['datatables', 'perPage', 'count', 'totalPages', 'totalCount', 'currentPage', 'paramsObj', 'paramsStatus', 'trashStatus']),
    ...mapGetters('memInfoMoudule', ['memberInfo']),
    ...mapGetters(['tokenVal']),
    selectLength () {
      return this.checkarray.length > 0 ? this.checkarray.length : 'All'
    },
    selectObject () {
      let selectIDsLength = this.selectLength
      let selectIDs = this.checkarray
      let totalData = this.datatables
      let outputArr = []
      if (selectIDsLength === 'All') return null
      else if (selectIDsLength === 1) {
        return totalData.filter((item) => {
          return item.id === selectIDs[0]
        })
      } else {
        outputArr = totalData.filter((item) => {
          for (let i = 0; i < selectIDsLength; i++) {
            if (item.id === selectIDs[i]) {
              return true
            }
          }
        })
        return outputArr
      }
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
    searchStrPlaceholder () {
      return `搜尋${this.filterStr}`
    },
    // 單一選取 memID
    selectedMemID () {
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
    this.$refs.table.setLimit(this.perPage)
  },
  methods: {
    // 資料 vuex
    ...mapActions('memTableMoudule', ['getDatatable', 'getRequestParams', 'setParamsStatus', 'setTrashStatus']),
    ...mapActions('memInfoMoudule', ['getInfo']),
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
    filter (type) {
      switch (type) {
        case 0:
          this.filterNum = 0
          this.filterStr = '姓名'
          this.searchFields = 'name'
          break
        case 1:
          this.filterNum = 1
          this.filterStr = '信箱'
          this.searchFields = 'email'
          break
        case 2:
          this.filterNum = 2
          this.filterStr = '帳號'
          this.searchFields = 'id_number'
          break
        case 3:
          this.filterNum = 3
          this.filterStr = '電話'
          this.searchFields = 'mobile'
          break
        default:
          break
      }
    },
    searchAct () {
      let search = this.searchStr
      let searchFields = this.searchFields
      if (search) {
        const obj = {
          orderBy: null,
          sortedBy: null,
          page: null,
          search: search,
          searchFields: searchFields
        }
        this.refreshData(obj)
      } else {
        this.$swal({
          title: '請輸入搜尋條件!',
          icon: 'info'
        })
      }
    },
    disabledMem () {
      let id = this.checkarray.join()
      this.$swal({
        title: '停用帳號!',
        text: `你選擇了ID: ${id}停用帳號`,
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
            this.$snotify.error(`會員 ${id} 已經停用`)
          }
        })
    },
    downloadCSV () {
      let id = this.checkarray.join()
      this.$swal({
        title: 'Good job!',
        text: `你選擇了ID: ${id} 下載CSV檔案`,
        icon: 'success'
      })
    },
    viewMemDetail (iduse) {
      if (this.trashStatus) {
        this.$swal({
          title: '帳號已被停用',
          icon: 'error'
        })
        return
      }
      let id = ''
      if (iduse) id = iduse
      else id = this.checkarray.join()
      // 開啟儲存狀態 toggle
      this.setParamsStatus(true)
      this.$router.push({ name: 'memberEdit', params: { id } })
    },
    refreshData (obj) {
      this.getRequestParams(obj)
      this.getDatatable()
      // check clear
      this.uncheckAll()
      // -----1. 全部刪除搜尋字串------
      // this.searchStr = ''
      // -----2. 檢查是否有搜尋字串----
      if (obj && obj.search) this.searchStr = obj.search
      else this.searchStr = ''
      // 更新vue-table-2 一樣顯示資料
      this.$refs.table.setLimit(this.perPage)
    },
    prevPage () {
      let current = this.currentPage
      let params = this.paramsObj
      const obj = {
        ...params,
        page: current - 1
      }
      if (current !== 1) {
        // // vuex
        // this.getRequestParams(obj)
        // this.getDatatable()
        // // check clear
        // this.uncheckAll()
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
        // // vuex
        // this.getRequestParams(obj)
        // this.getDatatable()
        // // check clear
        // this.uncheckAll()
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
        // // vuex
        // this.getRequestParams(obj)
        // this.getDatatable()
        // // check clear
        // this.uncheckAll()
        this.refreshData(obj)
      }
      // 關閉搜尋頁面光箱
      this.showDialog = false
      this.pageNumber = ''
    },
    sort (val) {
      let params = this.paramsObj
      let obj = {}
      let orderBy = {}
      switch (val) {
        case 'name':
          orderBy = {orderBy: 'name'}
          break
        case 'birthday':
          orderBy = {orderBy: 'birthday'}
          break
        case 'status':
          orderBy = {orderBy: 'status'}
          break
        case 'updated_at':
          orderBy = {orderBy: 'updated_at'}
          break
        case 'is_employed':
          orderBy = {orderBy: 'is_employed'}
          break
        default:
          break
      }
      if (params.sortedBy === '' || params.sortedBy === 'desc') {
        let sortedBy = {sortedBy: 'asc'}
        obj = Object.assign(orderBy, sortedBy, ...params)
      } else {
        let sortedBy = {sortedBy: 'desc'}
        obj = Object.assign(orderBy, sortedBy, ...params)
      }
      // // vuex
      // this.getRequestParams(obj)
      // this.getDatatable()
      // // check clear
      // this.uncheckAll()
      this.refreshData(obj)
    },
    // 標籤
    filterOpen () {
      this.tagFilterLoading = true
      const token = this.tokenVal
      const url = `${process.env.API_HOST}v1/member/tag`
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
    addTagToMember () {
      let IDs = this.tagCheckarray.join(',')
      let memID = this.checkarray.join(',')
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
          this.addTagToMemberAxios(IDs, memID)
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
                    'type': 'Member'
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
    reloadMemberInfoById () {
      let memID = this.selectedMemID
      if (memID != null) this.getInfo(memID)
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
      const url = `${process.env.API_HOST}v1/member/tag`
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
    deleteTagFromMember (memID, tagID) {
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
          this.deleteTagFromMemberAxios(tagID, memID)
        }
      })
    },
    multiDeleteTagFromMember () {
      let tagID = this.tagMultiSelect.join(',')
      let memID = this.checkarray.join(',')
      this.deleteTagFromMemberAxios(tagID, memID)
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
        // 更新memberInfo 單一
        this.reloadMemberInfoById()
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
        // 更新memberInfo 單一
        this.reloadMemberInfoById()
      })
    },
    addTagToMemberAxios (IDs, memIDs) {
      let memID = this.selectedMemID
      let data = {
        'tag_id': IDs,
        'id': memIDs
      }
      let url = `${process.env.API_HOST}v1/admin/member/attach_tag`
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
        if (memID !== null) this.refreshTaglist()

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
        // 更新memberInfo 單一
        this.reloadMemberInfoById()

        // 批次處理直接跳出視窗
        if (memID === null) this.showTagDialog = false
      })
    },
    deleteTagFromMemberAxios (ID, memID) {
      let memIDselect = this.selectedMemID
      let params = {
        'tag_id': ID,
        'id': memID
      }
      let url = `${process.env.API_HOST}v1/admin/member/detach_tag`
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
        if (memIDselect !== null) this.refreshTaglist()
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
        // 更新memberInfo 單一
        this.reloadMemberInfoById()

        if (memIDselect === null) this.showTagMultiDeleteDialog = false
      })
    },
    // 黑名單回覆會員
    returnTrashMem () {
      let id = this.checkarray.join()
      this.returnTrashMemAxios(id)
    },
    returnTrashMemAxios (id) {
      let url = `${process.env.API_HOST}v1/admin/member/restore/${id}`
      this.axios.post(url, null, {
        headers: {
          'Authorization': this.tokenVal,
          'Accept': 'application/json'
        }
      }).then((res) => {
        if (res.headers.authorization) {
          this.token_update(res.headers.authorization)
        }

        // 更新mem list
        this.refreshData()

        // 成功
        this.$snotify.success(`已經回復會員 ID: ${id}`, {
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
      let memID = this.selectedMemID
      if (val) {
        if (memID != null) await this.getInfo(memID)

        this.getTagList()
      } else {
        // 2. 重置 member datatable
        this.uncheckAll()
        this.getDatatable()
        // 更新vue-table-2 一樣顯示資料
        this.$refs.table.setLimit(this.perPage)
      }
    },
    showTagMultiDeleteDialog (val) {
      if (!val) {
        // 重置選項
        this.tagMultiSelect = []
        // 重置 member datatable
        this.uncheckAll()
        this.getDatatable()
        // 更新vue-table-2 一樣顯示資料
        this.$refs.table.setLimit(this.perPage)
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
    },
    // vuex trashswitch 狀態
    trashStatus () {
      this.refreshData()
    }
  }
}
</script>

<template src="./template.html"></template>
<style lang="scss" src="./style.scss" scoped></style>
