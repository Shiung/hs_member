// vue chart point color
export default class PointColor {
  constructor (args) {
    let def = {
      colorArr: ['white', '#d65353', 'greend', 'blue']
    }

    Object.assign(def, args) // 覆蓋到def 裡
    Object.assign(this, def)
  }
}
