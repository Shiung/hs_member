<script>
import { mapActions, mapGetters } from 'vuex'
import { DateTime } from 'luxon'
export default {
  name: 'notification',
  data () {
    return {
      columns: ['edit', 'title', 'content', 'created_at', 'type', 'tags', 'topping', 'status', 'act'],
      options: {
        headings: {
          edit: '',
          created_at: '建立時間',
          title: '標題',
          content: '內容',
          type: '類別',
          tags: '標籤',
          topping: '顯示',
          status: '狀態',
          act: '發送推播'
        },
        columnsClasses: {
          // act: 'width-fix',
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
        sortable: ['name123'],
        // filterable: ['name', 'album'],
        filterable: false,
        sortIcon: {
          base: 'sorticon',
          up: 'sort-up',
          down: 'sort-down',
          is: 'sort'
        },
        templates: {
          created_at: function (h, row, index) {
            return DateTime.fromSQL(row.created_at).setLocale('zh-TW').toFormat('yyyy/MM/dd')
          },
          content: function (h, row, index) {
            let str = row.content
            if (str.length > 30) return `${str.slice(0, 20)} ...`
            else return str
          },
          type: function (h, row, index) {
            let s = ''
            let className = ''
            let str = 'badge badge-pill text-capitalize '
            switch (row.type) {
              case 1:
                s = '系統公告'
                className = str.concat('badge-dark')
                break
              case 2:
                s = '最新消息'
                className = str.concat('badge-danger')
                break
              case 3:
                s = '推播訊息'
                className = str.concat('badge-warning text-light')
                break
              default:
                break
            }
            return <span class={className}>{s}</span>
          },
          status: function (h, row, index) {
            let s = ''
            let className = ''
            let str = 'badge badge-pill text-capitalize '
            switch (row.status) {
              case 0:
                s = '下架'
                className = str.concat('badge-secondary')
                break
              case 1:
                s = '上架'
                // className = str.concat('badge-info')
                className = str.concat('badge-success')
                break
              // case 2:
              //   s = '已發送'
              //   className = str.concat('badge-success')
              //   break
              default:
                break
            }
            return <span class={className}>{s}</span>
          },
          topping: function (h, row, index) {
            if (row.topping === 1) {
              let s = '置頂'
              let className = 'badge badge-warning text-white text-capitalize'
              return <span class={className}>{s}</span>
            } else return null
          }
        }
      },
      checkarray: [],
      checkbtn: false,
      showDialog: false,
      pageNumber: null,
      // 標籤設定 ----------- start
      showTagMultiDeleteDialog: false,
      showTagDialog: false,
      // loading
      tagLoadingOpacity: 0.8,
      tagLoading: false,
      tagFilterLoading: false,
      // 標籤列表分類篩選
      tagFilterList: [],
      // 標籤選單
      tagCheckbtn: false,
      tagCheckarray: [],
      tagTable: [],
      tagColumns: ['edit', 'name', 'action'],
      tagOptions: {
        headings: {
          edit: '',
          name: '',
          action: ''
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
      // 批次處理標籤
      tagMultiSelect: []
      // 標籤設定 ----------- end
    }
  },
  computed: {
    ...mapGetters('notificationTableMoudule', ['datatables', 'perPage', 'count', 'totalPages', 'totalCount', 'currentPage', 'paramsObj', 'paramsStatus']),
    ...mapGetters('notificationInfoMoudule', ['notificationInfo']),
    ...mapGetters(['tokenVal']),
    selectLength () {
      return this.checkarray.length > 0 ? this.checkarray.length : 'All'
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
    // 單一選取notifiID
    selectedNotifiID () {
      if (this.selectLength === 1) return this.checkarray.join()
      else return null
    },
    // 過濾器
    typeFilterState () {
      switch (this.paramsObj.search) {
        case 'type:1':
          return `系統公告`
        case 'type:2':
          return `最新消息`
        case 'type:3':
          return `推播訊息`
        default:
          return '依分類篩選'
      }
    },
    tagFilterState () {
      if (this.paramsObj.tag_id) {
        if (this.tagFilterList.length > 0) {
          let currentParamTagId = this.paramsObj.tag_id
          let selected = this.tagFilterList.filter(function (tag) {
            return tag.id === currentParamTagId
          })
          return selected[0].name
        }
        return '依標籤篩選'
      } else return '依標籤篩選'
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
    this.$refs.notificationTable.setLimit(this.perPage)
    // 初始標籤列表
    this.filterOpen()
  },
  methods: {
    // 資料 vuex
    ...mapActions('notificationTableMoudule', ['getDatatable', 'getRequestParams', 'setParamsStatus']),
    ...mapActions('notificationInfoMoudule', ['getInfo']),
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
    filterType (type) {
      const obj = {
        page: null,
        search: `type:${type}`
      }
      this.refreshData(obj)
    },
    addNew () {
      this.$router.push({ name: 'notificationEdit', params: { id: 'new' } })
    },
    editChoose (iduse) {
      let id = ''
      if (iduse) id = iduse
      else id = this.checkarray.join()
      this.setParamsStatus(true)
      this.$router.push({ name: 'notificationEdit', params: { id } })
    },
    refreshData (obj) {
      this.getRequestParams(obj)
      this.getDatatable()
      // check clear
      this.uncheckAll()
      this.searchStr = ''
      // 更新vue-table-2 一樣顯示資料
      this.$refs.notificationTable.setLimit(this.perPage)
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
    // tag function  ----- start
    filterOpen () {
      this.tagFilterLoading = true
      const token = this.tokenVal
      const url = `${process.env.API_HOST}v1/content/tag`
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
    filterTag (tagID) {
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
    addTagToNotifi () {
      let IDs = this.tagCheckarray.join(',')
      let notifiID = this.checkarray.join(',')
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
          this.addTagToNotifiAxios(IDs, notifiID)
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
                    'type': 'content'
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
    editTag (id) {
      // let id = this.tagCheckarray.join()
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
    reloadNotifiInfoById () {
      let notifiID = this.selectedNotifiID
      if (notifiID != null) this.getInfo(notifiID)
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
      const url = `${process.env.API_HOST}v1/content/tag`
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
    deleteTagFromNotifi (notifiID, tagID) {
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
          this.deleteTagFromNotifiAxios(tagID, notifiID)
        }
      })
    },
    multiDeleteTagFromNotifi () {
      let tagID = this.tagMultiSelect.join(',')
      let notifiID = this.checkarray.join(',')
      this.deleteTagFromNotifiAxios(tagID, notifiID)
    },
    deleteTag (IDs) {
      // let IDs = this.tagCheckarray.join(',')
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
        // 更新notifiInfo 單一
        this.reloadNotifiInfoById()
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
        // 更新notifiInfo 單一
        this.reloadNotifiInfoById()
      })
    },
    addTagToNotifiAxios (IDs, notifiIDs) {
      let notifiID = this.selectedNotifiID
      let data = {
        'tag_id': IDs,
        'id': notifiIDs
      }
      let url = `${process.env.API_HOST}v1/admin/content/attach_tag`
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
        if (notifiID !== null) this.refreshTaglist()

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
        // 更新notifiInfo 單一
        this.reloadNotifiInfoById()

        // 批次處理直接跳出視窗
        if (notifiID === null) this.showTagDialog = false
      })
    },
    deleteTagFromNotifiAxios (ID, notifiID) {
      let notifiIDselected = this.selectedNotifiID
      let params = {
        'tag_id': ID,
        'id': notifiID
      }
      let url = `${process.env.API_HOST}v1/admin/content/detach_tag`
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
        if (notifiIDselected !== null) this.refreshTaglist()
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
        // 更新notifiInfo 單一
        this.reloadNotifiInfoById()

        if (notifiIDselected === null) this.showTagMultiDeleteDialog = false
      })
    },
    // tag function  ----- end
    // option 功能
    deleteNote () {
      let id = this.checkarray.join()
      this.$swal({
        title: '刪除最新消息!',
        text: `你選擇了ID: ${id}`,
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
            // 移除 es6 primse reject 沒有 new error
            /* eslint-disable */
            this.$snotify.async('呼叫伺服器', '刪除最新消息', () => {
              return new Promise((resolve, reject) => {
                let url = `${process.env.API_HOST}v1/admin/content/${id}`
                return this.axios.delete(url, {
                  headers: {
                    'Authorization': this.tokenVal,
                    'Accept': 'application/json'
                  }
                }).then((res) => {
                  if (res.headers.authorization) {
                    this.token_update(res.headers.authorization)
                  }
                  this.refreshData()
                  resolve({
                    title: '最新消息刪除成功',
                    body: `已經刪除 ID:"${id}" 的最新消息`,
                    config: {
                      timeout: 5000
                      // closeOnClick: true
                    }
                  })
                }).catch((error) => {
                  console.log(error)
                  this.refreshData()
                  reject({
                    title: '傳送失敗',
                    body: '伺服器異常',
                    config: {
                      timeout: 5000
                      // closeOnClick: true
                    }
                  })
                })
              })
            })
          }
        })
    },
    notifiSend (id, status, title) {
      if (status === 0) return null
      this.$swal({
        title: '發送推播!',
        text: `"${title}"發送推播`,
        icon: 'info',
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
            // 移除 es6 primse reject 沒有 new error
            /* eslint-disable */
            this.$snotify.async('呼叫伺服器', '發送推播', () => {
              return new Promise((resolve, reject) => {
                let data = {
                  content_id: id
                }
                let url = `${process.env.API_HOST}v1/admin/content/content_notification`
                return this.axios.post(url, data, {
                  headers: {
                    'Authorization': this.tokenVal,
                    'Accept': 'application/json'
                  }
                }).then((res) => {
                  if (res.headers.authorization) {
                    this.token_update(res.headers.authorization)
                  }
                  resolve({
                    title: '發送推播成功',
                    body: `已經發送推播"${title}"`,
                    config: {
                      timeout: 5000
                      // closeOnClick: true
                    }
                  })
                }).catch((error) => {
                  console.log(error)
                  reject({
                    title: '傳送失敗',
                    body: '伺服器異常',
                    config: {
                      timeout: 5000
                      // closeOnClick: true
                    }
                  })
                })
              })
            })
          }
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
      let notifiID = this.selectedNotifiID
      if (val) {
        if (notifiID != null) await this.getInfo(notifiID)

        this.getTagList()
      } else {
        // 2. 重置 coupon datatable
        this.uncheckAll()
        this.getDatatable()
        // 更新vue-table-2 一樣顯示資料
        this.$refs.notificationTable.setLimit(this.perPage)
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
        this.$refs.notificationTable.setLimit(this.perPage)
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
