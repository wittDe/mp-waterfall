// components/mp-waterfall/index.js
Component({
  properties: {
    // 列数
    colNum: {
      type: Number,
      value: 2
    },
    // 左右间隔,支持带css单位
    gutter: {
      type: String,
      optionalTypes: [Number],
      value: 10
    },
    // 数据列表
    list: {
      type: Array,
      value: []
    },
    // 唯一标识的key
    idKey: {
      type: String,
      value: 'id'
    },
    // 图片的key
    imageKey: {
      type: String,
      value: 'image'
    }
  },
  data: {
    // 等待加载的
    waitList: [],
    // 加载中的
    loadingList: [],
    // 单次加载完毕的列表
    thisTimeloadedList: [],
    // 加载完毕的
    loadedList: [],
    // 是否正在加载
    loading: false,
    // 每列数据
    cols: [],
    // 列宽度
    colWidth: 0,
    // 左右列间距
    _gutter: '',
    // 单次加载个数
    onceMaxNum: 4,
  },

  lifetimes: {
    created() {
    },
    attached() {
      // 在组件实例进入页面节点树时执行
      let { gutter } = this.data

      this.initCols()

      // 设置间距
      if (Number.isNaN(Number(gutter))) {
        this.setData({ _gutter: gutter })
      } else {
        this.setData({ _gutter: gutter + 'rpx' })
      }

      // 获取列宽
      let query = wx.createSelectorQuery().in(this)
      query.select('.waterfall .col').boundingClientRect(rect => {
        let cw = rect.width
        // console.log('cw', cw)
        this.setData({
          colWidth: cw
        })

      }).exec()
    },
    detached() {
    }
  },

  observers: {
    list(list) {
      if (!Array.isArray(list) || list.length <= 0) {
        return
      }
      // console.log('list update:', list)
      let { loading, waitList, onceMaxNum } = this.data
      // 已加载的，值发生变化，进行替换
      this.checkUpdate(list)

      // 过滤掉 等待加载、加载中、加载完毕的
      let _list = this.filterRepeat(list)
      if (loading) {
        // 有正在加载的,将未加载的图片加入等待队列
        this.data.waitList = [...waitList, ..._list]
      } else {
        let len = _list.length
        if (len > onceMaxNum) {
          this.data.waitList = _list.slice(onceMaxNum, len)
          _list = _list.slice(0, onceMaxNum)
          len = onceMaxNum
        }
        this.data.thisTimeloadedList = new Array(len).fill(null)
        this.setData({
          loading: true,
          loadingList: _list,
        })
        // console.log('loadingList', this.data.loadingList)
      }
    },
    loading(loading) {
      // console.log('loadingChange', loading)
      this.triggerEvent('loadingChange', loading)
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    initCols() {
      let { colNum } = this.data
      let cols = new Array(colNum)
      for (let i = 0; i < colNum; i++) {
        cols[i] = []
      }
      this.setData({
        cols,
      })
    },
    onImageLoad(e) {
      // console.log(e)
      let { colWidth, loadingList, thisTimeloadedList } = this.data
      let index = e.currentTarget.dataset.index
      let item = loadingList[index]
      let oImgW = e.detail.width // 图片原始宽度
      let oImgH = e.detail.height // 图片原始高度
      let scale = colWidth / oImgW // 比例计算
      let imgHeight = oImgH * scale // 自适应高度

      item.imgHeight = imgHeight
      thisTimeloadedList[index] = item
      this.data.thisTimeloadedList = thisTimeloadedList
      this.checkThisTimeLoaded()
    },
    // 图片加载失败
    onImageError(e) {
      // console.log(e)
      let { thisTimeloadedList, loadingList } = this.data
      let index = e.currentTarget.dataset.index
      let item = loadingList[index]
      // 高度设为1，不显示图片
      item.imgHeight = .01
      thisTimeloadedList[index] = item
      this.data.thisTimeloadedList = thisTimeloadedList
      this.checkThisTimeLoaded()
    },
    checkThisTimeLoaded() {
      let { loadingList, thisTimeloadedList, loadedList, onceMaxNum } = this.data
      // console.log((thisTimeloadedList.findIndex(item => item === null) === -1))
      // console.log(thisTimeloadedList.length, loadingList.length)
      if ((thisTimeloadedList.findIndex(item => item === null) === -1) && thisTimeloadedList.length === loadingList.length) {
        // 这一波元素加载完毕
        // 插入到页面中
        this.appendToWaterfall(
          thisTimeloadedList,
          () => {
            let { waitList } = this.data
            this.data.loadedList = [...loadedList, ...thisTimeloadedList]
            // this.data.thisTimeloadedList = []
            // console.log(waitList.length)
            if (waitList.length > 0) {
              let _list = this.simpleClone(waitList)
              let len = _list.length
              if (len > onceMaxNum) {
                this.data.waitList = _list.slice(onceMaxNum, len)
                _list = _list.slice(0, onceMaxNum)
                len = onceMaxNum
              } else {
                this.data.waitList = []
              }
              this.setData({
                loading: true
              })
              this.data.thisTimeloadedList = new Array(len).fill(null)
              this.setData({
                loadingList: _list,
              })
            } else {
              // console.log('append end')
              this.setData({
                loading: false
              })
            }
          }
        )
      }
    },
    // 插入瀑布流
    appendToWaterfall(list, callback) {
      // console.log('appendToWaterfall:', list)
      const query = wx.createSelectorQuery().in(this)
      this.colNodes = query.selectAll('.waterfall .col')
      this._render(list, 0, callback)
    },
    _render(items, i, callback) {
      let { cols } = this.data
      if (items.length > i) {
        this.colNodes.boundingClientRect().exec(arr => {
          const item = items[i]
          const rects = arr[0]
          let colsHeight = rects.map(item => item.height)
          let minHeightIndex = colsHeight.indexOf(Math.min.apply(Math, colsHeight));
          cols[minHeightIndex].push(item)
          this.setData({
            cols
          }, () => {
            this._render(items, ++i, callback)
          })
        })
      } else {
        typeof (callback) === 'function' && callback()
      }
    },
    filterRepeat(list) {
      let res = []
      let { waitList, idKey, loadingList, loadedList } = this.data
      list.forEach(item => {
        if (!waitList.find(i => i[idKey] === item[idKey]) && !loadingList.find(i => i[idKey] === item[idKey]) && !loadedList.find(i => i[idKey] === item[idKey])
        ) {
          res.push(item)
        }
      })
      return res
    },
    checkUpdate(list) {
      let { cols, idKey } = this.data
      list.forEach(item => {
        let loadedIndex = -1
        let loaded = null
        cols.forEach(col => {
          loadedIndex = col.findIndex(i => i[idKey] === item[idKey])
          if (loadedIndex !== -1) {
            loaded = col[loadedIndex]
            item.imgHeight = loaded.imgHeight
            let isDiff = JSON.stringify(loaded) !== JSON.stringify(item)
            if (isDiff) {
              col.splice(loadedIndex, 1, item)
              this.setData({ cols })
            }
            return
          }
        })
      })
    },
    reset() {
      this.initCols()
      this.data.waitList = []
      this.data.thisTimeloadedList = []
      this.data.loadedList = []
      this.setData({
        loading: false,
        loadingList: []
      })
    },
    simpleClone(obj) {
      return JSON.parse(JSON.stringify(obj))
    }
  }
})
