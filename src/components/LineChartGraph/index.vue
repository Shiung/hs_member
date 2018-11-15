<script>
import Options from '../../assets/js/classModuleJs/graphOption.js'
import PointColor from '../../assets/js/classModuleJs/pointColor.js'

export default {
  name: 'lineChartGraph',
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
    LineChart: () => import('./linechart.js')
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
      let optionSettting = new Options({})
      return optionSettting
    },
    // vue chart point color
    pointColors () {
      let vm = this
      let pointcolorsSettting
      if (vm.dataPointColor) {
        pointcolorsSettting = new PointColor({
          'colorArr': vm.dataPointColor
        })
      } else {
        pointcolorsSettting = new PointColor({})
      }
      return pointcolorsSettting.colorArr
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
        let color = vm.pointColors[index]
        return {
          label: item.label,
          backgroundColor: color,
          pointBackgroundColor: color,
          borderWidth: 3,
          fill: false,
          borderColor: color,
          // pointBorderColor: '#249EBF',
          // Data to be represented on y-axis
          data: item.data
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
