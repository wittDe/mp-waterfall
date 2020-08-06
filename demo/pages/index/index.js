//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    // 列表数据
    list: [],
    // 数据列表加载中
    listDataLoading: false,
    // 瀑布流加载中
    waterfallLoading: false,
    // 数据加载完毕
    loaded: false,
    id: 1
  },
  onLoad() {
    this.update()
  },
  // 页面下拉刷新
  onPullDownRefresh() {
    this.update()
  },
  // 页面触底
  onReachBottom() {
    this.loadMore()
  },

  // 加载更多
  loadMore() {
    // console.log('loadMore')
    let { list } = this.data
    let more = this.getMockData()
    list = [...list, ...more]
    // console.log('loadMoreData:', list)
    this.setData({ list })
  },

  // 刷新新瀑布流
  update() {
    this.data.id = 1
    // 重置瀑布流组件
    this.setData({ loaded: false })
    this.selectComponent('#waterfall').reset()
    let list = this.getMockData()
    this.setData({ list })

  },

  onLoadingChange(e) {
    this.setData({
      waterfallLoading: e.detail
    })
  },

  /**
   * 获取模拟数据
   */
  getMockData() {
    let { id, listDataLoading, loaded } = this.data
    if (listDataLoading || loaded) return []
    this.setData({ listDataLoading: true })
    let list = []
    const imgWidth = 300
    for (let i = 0; i < 10; i++) {
      let mockText = this.getMockText()
      let imgHeight = parseInt(Math.random() * 5 + 1) * 100
      list.push({
        id,
        text: mockText,
        imgUrl: `https://iph.href.lu/${imgWidth}x${imgHeight}?fg=ffffff&bg=07c160&text=我是图片${id}(${imgWidth}x${imgHeight})`,
        // imgUrl: `http://placekitten.com/${imgWidth}/${imgHeight}`,
      })
      this.data.id = ++id
    }
    this.setData({ listDataLoading: false })
    if (id > 30) {
      this.setData({ loaded: true })
    }
    return list
  },

  // 模拟不同长度文字
  getMockText() {
    const a = parseInt(Math.random() * 5 + 1) * 10
    const b = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 "
    let c = "";
    for (let i = 0; a > i; i++) {
      let d = Math.random() * b.length
      d = Math.floor(d)
      c += b.charAt(d);
    }
    return c
  }
})
