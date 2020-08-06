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

[Demo 地址](https://developers.weixin.qq.com/s/ljX0somO70jT)

打开链接将会自动将 demo 代码导入微信开发者工具

## 使用场景

瀑布流节点中，有只有一张高度不固定的图片，其他图片高度固定，可以尝试使用改组件 ^_^

![截图](https://i.loli.net/2020/08/06/bu2kzQgHBXAqvF4.png)

# 如何使用

1. 下载项目，将瀑布流组件 `dist/mp-waterfall/` 文件夹复制到自己的项目中
2. 须自行新建瀑布流节点组件（可参考`demo/components/waterfall-item`），并在`properties`中添加`itemData`，如下：

```js
properties: {
  itemData: {
      type: Object
  }
},
```

3. 在页面中引入组件`mp-waterfall`和`waterfall-item`，参考`demo/pages/index/index.json`

```json
"usingComponents": {
  "mp-waterfall": "../../components/mp-waterfall",
  "waterfall-item": "../../components/waterfall-item"
}
```

4. 页面中添加瀑布流组件，参数说明请看 [参数](#参数)

```html
<mp-waterfall
  id="waterfall"
  generic:item="waterfall-item"
  list="{{list || []}}"
  idKey="id"
  imageKey="imgUrl"
></mp-waterfall>
```

5. 向`list`中添加数据，显示瀑布流内容，list 数据格式需要遵循：

```js
/**
 * 示例，数据中的`id`、`imgUrl`并非强制要求，可根据实际情况自定义，只需要和传入组件的`idKey`,`imageKey`保持一致即可
 * 如：数据中的唯一标识的key为`content_id`,图片的key为`img`，传入中间的props为 <mp-waterfall idKey="content_id" imageKey="img" 其他参数... ></mp-waterfall>
 */
[
  {
    id: 1, //
    imgUrl: "http://xxxxx.xxx/xxxx.jpg",
    // ...  其他数据
  },
  // 更多数据
];
```

# 配置

## 参数 properties

| 参数     | 说明                                    | 是否必填 | 类型             | 默认值  |
| -------- | --------------------------------------- | -------- | ---------------- | ------- |
| list     | 瀑布流数据列表                          | 是       | Array            | \[\]    |
| idKey    | 数据项唯一标识的 key                    | 是       | String           | 'id'    |
| imageKey | 数据项图片的 key                        | 是       | String           | 'image' |
| colNum   | 瀑布流列数                              | 否       | Number           | 2       |
| gutter   | 瀑布流列的左右间隔，支持 rpx,px,%等单位 | 否       | Number \| String | '10rpx' |

## 事件 events

| 事件               | 说明                                                                           | 回调参数                  |
| ------------------ | ------------------------------------------------------------------------------ | ------------------------- |
| bind:loadingChange | 瀑布流加载 list 中的状态，true:list 未加载完毕还在加载中、false：list 加载完毕 | event\.detail: true/false |

## 方法 methods

| 方法     | 说明                                                                                                           |
| -------- | -------------------------------------------------------------------------------------------------------------- |
| rest\(\) | 若要重新加载瀑布流，需调用组件的 reset 方法，如何调用，例如：this\.selectComponent\('\#waterfall'\)\.reset\(\) |
