<script>
// import Options from '../../assets/js/classModuleJs/graphOption.js'

export default {
  name: 'pieChartGraph',
  props: {
    search: {
      type: String,
      default: null
    },
    dataPointColor: {
      type: Array,
      default: null
    },
    graphHeight: {
      type: Number,
      default: 180
    }
  },
  components: {
    PieChart: () => import('./piechart.js')
  },
  data () {
    return {
      datacollection: { labels: [], datasets: [] },
      test: []
    }
  },
  computed: {
    // vue chart option 設定
    options () {
      // let optionSettting = new Options({
      //   legend: { // 上方顯示
      //     display: true,
      //     labels: {
      //       fontColor: '#000'
      //     }
      //   }
      // })
      // return optionSettting
      return null
    }
  },
  mounted () {
    let vm = this
    let url = vm.search
    // this.fillData()
    this.axios.get(`http://localhost:3004/${url}`).then(res => {
      let dataArray = {}
      const dataObj = res.data.map(function (item, index, array) {
        // x軸
        dataArray.labels = item.labels
        // let color = vm.pointColors[index]
        return {
          label: item.label,
          // backgroundColor: color,
          // pointBackgroundColor: color,
          // borderWidth: 3,
          // fill: true,
          // borderColor: color,
          // pointBorderColor: '#249EBF',
          // Data to be represented on y-axis
          data: item.data,
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56'
          ],
          hoverBackgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56'
          ]
        }
      })
      // Y軸資料
      dataArray.datasets = [...dataObj]
      this.datacollection = dataArray
    })
  },
  methods: {
  }
}
</script>

<template src="./template.html"></template>
<style lang="scss" src="./style.scss" scoped></style>
