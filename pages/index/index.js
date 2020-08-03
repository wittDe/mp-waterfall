//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    // 列表数据
    list: [],

    listLoading: false,
    waterfallLoading: false,
    id: 1
  },
  onLoad() {
    this.update()
  },
  onPullDownRefresh() {
    this.update()
  },
  onReachBottom() {
    this.loadMore()
  },

  loadMore() {
    console.log('loadMore')
    let { list } = this.data
    let more = this.getMockData()
    list = [...list, ...more]
    this.setData({list})
  },

  update() {
    this.data.id = 1
    // 重置瀑布流组件
    this.selectComponent('#waterfall').reset()

    let list = this.getMockData()
    this.setData({ list })
  },

  onLoadingChange(e) {
    // console.log(e)
  },

  /**
   * 获取模拟数据
   */
  getMockData() {
    let { id } = this.data
    let list = []
    const imgWidth = 300
    for (let i = 0; i < 10; i++) {
      let imgHeight = parseInt(Math.random()*5+1)*100
      list.push({
        id: id,
        imgUrl: `https://iph.href.lu/${imgWidth}x${imgHeight}?fg=ffffff&bg=07c160&text=${id}(${imgWidth}x${imgHeight})`
      })
      this.data.id = ++id
    }
    return list
  }
})
