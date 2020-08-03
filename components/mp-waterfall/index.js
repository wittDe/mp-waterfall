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
    // 每列高度
    colsHeight: [],
    // 列宽度
    colWidth: 0,
    _gutter: '',
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
      let { loading, waitList } = this.data
      // 已加载的，值发生变化，进行替换
      this.checkUpdate(list)

      // 过滤掉 等待加载、加载中、加载完毕的
      let _list = this.filterRepeat(list)
      if (loading) {
        // 有正在加载的,将未加载的图片加入等待队列
        this.setData({
          waitList: [...waitList, ..._list]
        })
      } else {
        let len = _list.length
        this.setData({
          loading: true,
          loadingList: _list,
          thisTimeloadedList: new Array(len).fill(null)
        })
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
      let colsHeight = new Array(colNum)
      for (let i = 0; i < colNum; i++) {
        cols[i] = []
        colsHeight[i] = 0
      }
      this.setData({
        cols,
        colsHeight,
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
      this.setData({
        thisTimeloadedList
      })
      this.checkThisTimeLoaded()
    },
    // 图片加载失败
    onImageError(e) {
      console.log(e)
      let { thisTimeloadedList } = this.data
      let index = e.currentTarget.dataset.index
      let { loadingList } = this.data
      let item = loadingList[index]
      // 高度设为1，不显示图片
      item.imgHeight = 1
      thisTimeloadedList[index] = item
      this.setData({
        thisTimeloadedList
      })
      this.checkThisTimeLoaded()
    },
    checkThisTimeLoaded() {
      let { loadingList, thisTimeloadedList, loadedList, waitList } = this.data
      if ((thisTimeloadedList.findIndex(item => item === null) === -1) && thisTimeloadedList.length === loadingList.length) {
        // 这一波元素加载完毕
        // 插入到页面中
        this.setWaterfall(
          thisTimeloadedList,
          function () {
            wx.nextTick(() => {
              this.setData({
                loadedList: [...loadedList, ...thisTimeloadedList],
                loading: false,
                thisTimeloadedList: [],
                loadingList: []
              })

              // 加载等待中的
              if (waitList.length > 0) {
                this.setData({
                  loadingList: waitList,
                  loading: true
                })
              }
            })
          }.bind(this)
        )
      }
    },
    // 设置瀑布流
    setWaterfall(list, callback) {
      console.log(list)
      let { cols, colsHeight } = this.data
      const query = wx.createSelectorQuery().in(this)
      this.colNodes = query.selectAll('.waterfall .col')
      // list.forEach(item => {
      //   let minHeightIndex = colsHeight.indexOf(Math.min.apply(Math, colsHeight));
      //   cols[minHeightIndex].push(item)
      //   colsHeight[minHeightIndex] += item.imgHeight
      // })
      this.setData({ cols, colsHeight })
      this._render(list, 0, callback)
    },
    _render(items, i, callback) {
      let { cols } = this.data
      if (items.length > i && !this.data.stopMasonry) {
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
            // console.log('isDiff1:', isDiff)
            // console.log('item:', item)
            if (isDiff) {
              // this.col[loadedIndex] = item
              col.splice(loadedIndex, 1, item)
              this.setData({ cols })
            }
            return
          }
        })

        /* loadedIndex = col2.findIndex(i => i[idKey] === item[idKey])
        if (loadedIndex !== -1) {
          loaded = col2[loadedIndex]
          item.imgHeight = loaded.imgHeight
          let isDiff = JSON.stringify(loaded) !== JSON.stringify(item)
          // console.log('isDiff2:', isDiff)
          // console.log('item:', item)
          if (isDiff) {
            // this.col2[loadedIndex] = item
            col2.splice(loadedIndex, 1, item)
            this.setData({ col2 })
          }
        } */
      })
    },
    reset() {
      this.initCols()
      this.setData({
        waitList: [],
        loadingList: [],
        thisTimeloadedList: [],
        loadedList: [],
        loading: false,
      })
    }
  }
})
