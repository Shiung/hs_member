<script>
import $ from 'jquery'

export default {
  name: 'tablelist',
  data () {
    return {
      columns: ['edit', 'id', 'status', 'tag', 'name', 'album'],
      tableData: [],
      options: {
        headings: {
          edit: '#',
          id: 'ID',
          status: '狀態',
          name: 'Song Name',
          tag: '標籤',
          album: 'Album'
        },
        columnsClasses: {
          edit: 'width-fix',
          id: 'width-fix',
          status: 'width-fix'
        },
        perPage: 10,
        perPageValues: [10, 25, 100],
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
        sortable: ['name', 'album'],
        filterable: ['name', 'album'],
        // filterable: false,
        sortIcon: {
          base: 'sorticon',
          up: 'sort-up',
          down: 'sort-down',
          is: 'sort'
        },
        templates: {
          status: function (h, row, index) {
            let s = row.status === 1 ? 'on' : 'off'
            let className = s === 'on' ? 'badge badge-success text-capitalize' : 'badge badge-secondary text-capitalize'
            return <span class={className}>{s}</span>
          }
        }
      },
      checkarray: [],
      checkbtn: false,
      perPageOption: null,
      searchOption: null,
      showDialog: false,
      showTagDialog: false,
      status: '',
      oneSelectTags: []
    }
  },
  computed: {
    selectLength () {
      return this.checkarray.length > 0 ? this.checkarray.length : 'All'
    },
    selectObject () {
      let selectIDsLength = this.selectLength
      let selectIDs = this.checkarray
      let totalData = this.tableData
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
    }
  },
  mounted () {
    // 資料
    this.axios.get('http://localhost:3004/datatable').then(res => {
      this.tableData = res.data
    })
    // perpage
    this.perPageOption = this.$refs.table.$data.limit
  },
  methods: {
    checkAll () {
      let allDataId = []
      this.tableData.forEach(function (item, index, array) {
        allDataId.push(item.id)
      })
      this.checkarray = allDataId
    },
    uncheckAll () {
      this.checkarray = []
    },
    // option 功能
    addNew () {
      this.$swal({
        title: 'Good job!',
        text: `新增資料`,
        icon: 'warning'
      })
        .then(() => {
          this.$snotify.success('新增一筆資料')
        })
    },
    editChoose () {
      let id = this.checkarray.join()
      this.$swal({
        title: 'Good job!',
        text: `你選擇了ID: ${id}進行修改`,
        icon: 'success'
      })
        .then(() => {
          this.$snotify.warning(`產品${id}修改完成`)
        })
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
    searchCategory () {
      let modalBox = $('#selectCateOption')
      modalBox.modal('show')
    },
    refreshData () {
      this.$swal('refresh !', '重整', 'success')
    },
    deleteTag (val) {
      console.log(val)
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
    perPageOption (val) {
      this.$refs.table.setLimit(val)
    },
    searchOption (val) {
      this.$refs.table.setFilter(val)
    },
    selectLength (val) {
      this.oneSelectTags = []
      if (val === 1) {
        this.oneSelectTags = this.selectObject[0].tag
      }
    }
  }
}
</script>

<template src="./template.html"></template>
<style lang="scss" src="./style.scss"></style>
