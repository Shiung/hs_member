// vue chart option setting
export default class Options {
  constructor (args) {
    let def = {
      layout: {
        padding: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0
        }
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true,
            fontColor: 'white'
          },
          gridLines: {
            display: false
          }
        }],
        xAxes: [{
          ticks: {
            beginAtZero: false,
            fontColor: 'white'
          },
          gridLines: {
            display: false
          }
        }]
      },
      legend: { // 上方顯示
        display: true,
        labels: {
          fontColor: '#ffffff'
        }
      },
      responsive: true,
      maintainAspectRatio: false
    }
    Object.assign(def, args) // 覆蓋到def 裡
    Object.assign(this, def)
  }
}
