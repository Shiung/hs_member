<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'shopCompany',
  data () {
    return {
      columns: ['edit', 'id', 'comp', 'uni', 'address', 'contact', 'tel'],
      tableData: [],
      options: {
        headings: {
          edit: '#',
          id: 'ID',
          comp: '公司抬頭',
          uni: '統編',
          address: '地址',
          contact: '聯絡人',
          tel: '電話'
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
        sortable: ['null'],
        filterable: ['comp', 'uni', 'address', 'contact'],
        // filterable: false,
        sortIcon: {
          base: 'sorticon',
          up: 'sort-up',
          down: 'sort-down',
          is: 'sort'
        },
        templates: {
        }
      },
      checkarray: [],
      checkbtn: false,
      perPageOption: null,
      status: ''
    }
  },
  computed: {
    // vuex getdata
    ...mapGetters('shopCompMoudule', ['datatables']),
    selectLength () {
      return this.checkarray.length > 0 ? this.checkarray.length : 'All'
    },
    selectObject () {
      let selectIDsLength = this.selectLength
      let selectIDs = this.checkarray
      let totalData = this.tableData
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
    }
  },
  mounted () {
    // vuex 資料
    this.getDatatable()
    // 資料
    // let url = `${process.env.APIPATH}/shopInfoDatatable`
    // console.log(url)
    this.axios.get('http://localhost:3004/datatable').then(res => {
      this.tableData = res.data
    })
    // perpage
    this.perPageOption = this.$refs.shopCompTable.$data.limit
  },
  methods: {
    // 資料 vuex
    ...mapActions('shopCompMoudule', ['getDatatable']),
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
    refreshData () {
      this.$swal('refresh !', '重整', 'success')
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
      this.$refs.shopCompTable.setLimit(val)
    }
  }
}
</script>

<template src="./template.html"></template>
<style lang="scss" src="./style.scss" scoped></style>
