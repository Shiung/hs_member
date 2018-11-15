<script>
export default {
  name: 'dashboard',
  components: {
    // lineChartGraph: () => import('@/components/LineChartGraph'),
    // barChartGraph: () => import('@/components/BarChartGraph'),
    // pieChartGraph: () => import('@/components/PieChartGraph')
  },
  data () {
    return {
      color: ['blue', 'green']
    }
  }
}
</script>

<template src="./template.html"></template>
<style lang="scss" src="./style.scss" scoped></style>
