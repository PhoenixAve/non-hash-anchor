# non-hash-anchor

非hash模式的锚点功能实现，可以检测滚动过程中元素是否处于曝光状态，还可以通过点击锚点滚动到制定元素位置

该组件解决了使用 hash router 时无法使用 hash anchors 的问题

## 案例演示

[查看案例演示](https://codesandbox.io/s/nice-rhodes-y5c50?file=/src/index.js)

## 安装

```bash
yarn add non-hash-anchor
# 或者
npm install non-hash-anchor --save
```

## 用法

### html

需要在列表中设置`data-anchor`属性（唯一性），对应的值与菜单一一对应。

```html
<div class="tabs">
  <div class="tab-item anchor1">anchor1</div>
  <div class="tab-item anchor2">anchor2</div>
  <div class="tab-item anchor3">anchor3</div>
</div>
<div class="scroll-container">
  <h2 class="text-center">scroll-container</h2>
  <div class="top-content extra-content">
    top content
  </div>
  <div class="anchor-container">
    <h3 class="anchor-item" data-anchor="anchor1">anchor1</h3>
    <h3 class="anchor-item" data-anchor="anchor2">anchor2</h3>
    <h3 class="anchor-item" data-anchor="anchor3">anchor3</h3>
  </div>
  <div class="bottom-content extra-content">
    bottom content
  </div>
</div>
```

### javascript

```javascript
var anchor = new Anchor(document.querySelector('.anchor-container'), {
  scrollContainer: document.querySelector('.scroll-container'),
  onChange(anchor) {
    // TODO...eg: 设置tab的选中状态
    console.log(Date.now(), anchor)
  },
  onExposure(anchors) {
    // TODO...eg: 获取数据
    console.log(anchors)
  },
});
var tabs = document.querySelectorAll('.tab-item');
tabs.forEach(function (item) {
  item.addEventListener('click', function () {
    anchor.scrollTo(item.innerText)
  })
});
```

## API

| 名称 | 说明 | 类型 | 必传 | 默认值 |
| - | - | - | - | - |
| container | 列表容器 | HTMLElement | true | - |
| options | 其他参数 | HTMLElement | false | Object |

### Options

| 名称 | 说明 | 类型 | 必传 | 默认值 |
| - | - | - | - | - |
| scrollContainer | 滚动容器 | HTMLElement | false | document.documentElement |
| offsetTop | 滚动结束后距离滚动容器顶端的距离 | number | false | 0 |
| isDynamic | 列表是否会动态增删 | boolean | false | false |
| onChange | 当前选中项发生变化时的回调事件 | function (anchor:string) {} | false | - |
| onExposure | 当前选中项发生变化时的回调事件 |  function (anchors:string[]) {} | false | - |

## License

MIT
