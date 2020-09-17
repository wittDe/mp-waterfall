# mp-waterfall

> 一个 小程序瀑布流组件

特点：

- 简单配置、使用方便
- 支持自定义列数
- 支持无限加载
- 可保持列表顺序
- 可支持入场动画
- 支持动态修改变节点数据

## Demo

PC 端可直接打开 [Demo 地址](https://developers.weixin.qq.com/s/ljX0somO70jT)

打开链接将会自动将 demo 代码导入微信开发者工具

或下载 demo 目录导入微信开发者工具运行查看

## 使用场景

瀑布流子元素中，有一张宽高不固定的图片和其他一些元素，后端同学又没有返回图片宽高的时候，可以尝试使用该组件 ^\_^
组件会自动判断元素高度，插入较短的列中

![截图](https://i.loli.net/2020/08/06/bu2kzQgHBXAqvF4.png)

# 如何使用

1. 下载项目，将瀑布流组件 `dist/mp-waterfall` 文件夹复制到自己的项目中
2. 自行新建瀑布流节点组件（可参考`demo/components/waterfall-item`），并在节点组件的`properties`中添加`itemData`（因为瀑布流组件会将 list 中的每一项以 itemData 传入子组件），例如：

```html
<view class="w-item">
  <!-- 组件会将图片的高度注入到 itemData 中，字段为imgHeight, 所以图片高度请设置为{{itemData.imgHeight}}px -->
  <image
    src="{{itemData.imgUrl}}"
    style="width:100%;height:{{itemData.imgHeight}}px"
    class="w-image"
  />
</view>
```

```js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    itemData: {
      type: Object,
    },
  },
});
```

3. 在页面 json 中引入组件`mp-waterfall`和`waterfall-item`，可参考`demo/pages/index/index.json`

```json
{
  "usingComponents": {
    "mp-waterfall": "../../components/mp-waterfall",
    "waterfall-item": "../../components/waterfall-item"
  }
}
```

4. 在页面 wxml 中添加瀑布流组件，参数说明请看 [参数](#参数-properties)

```html
<!-- generic:item 由于本组件使用了微信小程序抽象节点特性，需要你手动指定子组件，传入自行创建的瀑布流节点组件即可  -->
<mp-waterfall
  id="waterfall"
  generic:item="waterfall-item"
  list="{{list || []}}"
  idKey="id"
  imageKey="imgUrl"
></mp-waterfall>
```

5. 向`list`中添加数据，即可显示瀑布流内容，简单示例：
``` js
/**
 * 示例数据中的`id`、`imgUrl`并非强制要求，可根据实际情况使用自定义字段，只需要和传入组件的`idKey`,`imageKey`保持一致即可
 * 如：数据中的唯一标识的key为`content_id`,图片的key为`img`，传入中间的props为 <mp-waterfall idKey="content_id" imageKey="img" 其他参数... ></mp-waterfall>
 */
Page({
  data: {
    // 列表数据
    list: [
      {
        id: 1,
        imgUrl: 'https://iph.href.lu/300x200?fg=ffffff&bg=07c160'
      },
      {
        id: 2,
        imgUrl: 'https://iph.href.lu/300x300?fg=ffffff&bg=07c160'
      },
      {
        id: 3,
        imgUrl: 'https://iph.href.lu/300x400?fg=ffffff&bg=07c160'
      },
      {
        id: 4,
        imgUrl: 'https://iph.href.lu/300x500?fg=ffffff&bg=07c160'
      },
      {
        id: 5,
        imgUrl: 'https://iph.href.lu/300x600?fg=ffffff&bg=07c160'
      },
    ],
  },
})
```

6. 滑动加载，直接向list中追加数据即可

# 配置信息

## 参数 properties

| 参数     | 说明                                    | 是否必填 | 类型             | 默认值  |
| -------- | --------------------------------------- | -------- | ---------------- | ------- |
| list     | 瀑布流数据列表                          | 是       | Array            | \[\]    |
| idKey    | 数据项中唯一标识的 key                  | 是       | String           | 'id'    |
| imageKey | 数据项中图片的 key                      | 是       | String           | 'image' |
| colNum   | 瀑布流列数                              | 否       | Number           | 2       |
| gutter   | 瀑布流列的左右间隔，支持 rpx,px,%等单位 | 否       | Number \| String | '10rpx' |

## 事件 events

| 事件               | 说明                                                                                   | 回调参数                  |
| ------------------ | -------------------------------------------------------------------------------------- | ------------------------- |
| bind:loadingChange | 传入的 list 是否加载完毕，true:加载中、false：加载完毕 | event\.detail: true/false |

## 方法 methods

| 方法     | 说明                                                                                                     |
| -------- | -------------------------------------------------------------------------------------------------------- |
| reset\(\) | 若要重新加载瀑布流，需调用组件的 reset 方法，调用方法：this\.selectComponent\('\#waterfall'\)\.reset\(\) |
