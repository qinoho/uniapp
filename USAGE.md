# 组件使用文档

本文档详细介绍了项目中各个通用组件的使用方法、属性、事件及示例。

## 1. muni-scroll-view (滚动容器)

功能强大的滚动容器，支持下拉刷新、上拉加载更多、自定义头部等功能。

### 基础用法

```vue
<template>
  <muni-scroll-view
    :enable-refresh="true"
    :enable-load-more="true"
    @refresh="onRefresh"
    @loadmore="onLoadMore"
    ref="scrollView"
  >
    <view v-for="item in list" :key="item.id">{{ item.text }}</view>
  </muni-scroll-view>
</template>

<script setup>
import { ref } from 'vue'

const scrollView = ref(null)
const list = ref([])

const onRefresh = () => {
  // 模拟刷新
  setTimeout(() => {
    list.value = [
      /* 新数据 */
    ]
    scrollView.value.finishRefresh()
  }, 1000)
}

const onLoadMore = () => {
  // 模拟加载更多
  setTimeout(() => {
    list.value.push(/* 更多数据 */)
    scrollView.value.finishLoadMore(true) // true 表示还有更多数据
  }, 1000)
}
</script>
```

### 属性 (Props)

| 属性名            | 类型          | 默认值        | 说明                   |
| ----------------- | ------------- | ------------- | ---------------------- |
| height            | String/Number | '100%'        | 容器高度               |
| backgroundColor   | String        | 'transparent' | 背景颜色               |
| enableRefresh     | Boolean       | true          | 是否开启下拉刷新       |
| refreshThreshold  | Number        | 80            | 下拉刷新阈值           |
| enableLoadMore    | Boolean       | true          | 是否开启上拉加载       |
| loadMoreThreshold | Number        | 50            | 上拉加载阈值           |
| enableBackToTop   | Boolean       | true          | 点击顶部状态栏返回顶部 |
| contentPadding    | String        | '0'           | 内容区域内边距         |

### 事件 (Events)

| 事件名   | 说明           | 回调参数 |
| -------- | -------------- | -------- |
| refresh  | 触发下拉刷新时 | -        |
| loadmore | 触发上拉加载时 | -        |
| scroll   | 滚动时触发     | event    |

### 方法 (Expose)

| 方法名         | 说明         | 参数                                |
| -------------- | ------------ | ----------------------------------- |
| finishRefresh  | 结束刷新状态 | -                                   |
| finishLoadMore | 结束加载状态 | hasMore: boolean (是否还有更多数据) |
| resetLoadMore  | 重置加载状态 | -                                   |

---

## 2. uni-pages (页面容器)

页面级容器，集成了导航栏和滚动区域，自动处理安全区域。

### 基础用法

```vue
<template>
  <uni-pages title="首页" :enable-refresh="true" @refresh="onRefresh">
    <view>页面内容</view>
  </uni-pages>
</template>
```

### 属性 (Props)

| 属性名          | 类型          | 默认值    | 说明             |
| --------------- | ------------- | --------- | ---------------- |
| title           | String        | '标题'    | 导航栏标题       |
| showBack        | Boolean       | true      | 是否显示返回按钮 |
| backgroundColor | String        | '#ffffff' | 背景颜色         |
| navBarHeight    | String/Number | -         | 自定义导航栏高度 |
| showTitle       | Boolean       | true      | 是否显示导航栏   |
| enableRefresh   | Boolean       | false     | 是否开启下拉刷新 |
| enableLoadMore  | Boolean       | false     | 是否开启上拉加载 |

### 事件 (Events)

| 事件名   | 说明               | 回调参数 |
| -------- | ------------------ | -------- |
| back     | 点击返回按钮时触发 | -        |
| refresh  | 下拉刷新时触发     | -        |
| loadmore | 上拉加载时触发     | -        |
| scroll   | 滚动时触发         | event    |

### 插槽 (Slots)

| 插槽名   | 说明               | 参数                                 |
| -------- | ------------------ | ------------------------------------ |
| default  | 页面主要内容       | -                                    |
| refresh  | 自定义下拉刷新区域 | { status: string, distance: number } |
| loadmore | 自定义上拉加载区域 | { status: string }                   |

### 自定义刷新/加载示例

```vue
<uni-pages :enable-refresh="true" :enable-load-more="true">
  <!-- 自定义下拉刷新 -->
  <template #refresh="{ status }">
    <view class="custom-refresh">
      {{ status === 'pulling' ? '下拉' : status === 'loading' ? '加载中' : '释放' }}
    </view>
  </template>

  <view>列表内容...</view>

  <!-- 自定义上拉加载 -->
  <template #loadmore="{ status }">
    <view class="custom-loadmore">
      {{ status === 'loading' ? '加载中...' : '没有更多了' }}
    </view>
  </template>
</uni-pages>
```

---

## 3. uni-nav-header (导航栏)

自定义导航栏，支持自定义左右内容。

### 基础用法

```vue
<uni-nav-header title="详情页" @back="goBack">
  <template #navRight>
    <text>更多</text>
  </template>
</uni-nav-header>
```

### 属性 (Props)

| 属性名          | 类型          | 默认值    | 说明             |
| --------------- | ------------- | --------- | ---------------- |
| title           | String        | ''        | 标题             |
| showBack        | Boolean       | true      | 是否显示返回按钮 |
| backgroundColor | String        | '#ffffff' | 背景颜色         |
| navBarHeight    | String/Number | -         | 高度             |

### 插槽 (Slots)

| 插槽名   | 说明                        |
| -------- | --------------------------- |
| navLeft  | 左侧内容 (默认显示返回按钮) |
| navTitle | 中间标题内容                |
| navRight | 右侧内容                    |

---

## 4. uni-popup (弹出层)

通用弹出层组件。

### 基础用法

```vue
<template>
  <button @click="show = true">打开弹窗</button>
  <uni-popup v-model:show="show" type="center">
    <view class="popup-content">内容</view>
  </uni-popup>
</template>

<script setup>
import { ref } from 'vue'
const show = ref(false)
</script>
```

### 属性 (Props)

| 属性名          | 类型          | 默认值    | 说明                                       |
| --------------- | ------------- | --------- | ------------------------------------------ |
| show            | Boolean       | false     | 是否显示 (支持 v-model)                    |
| type            | String        | 'center'  | 弹出位置: center, top, bottom, left, right |
| mask            | Boolean       | true      | 是否显示遮罩                               |
| backgroundColor | String        | '#ffffff' | 内容背景色                                 |
| radius          | Number/String | 0         | 圆角大小                                   |

---

## 5. uni-toast (轻提示)

轻量级提示组件。

### 基础用法

```vue
<template>
  <uni-toast ref="toastRef" />
</template>

<script setup>
import { ref } from 'vue'
const toastRef = ref(null)

const showToast = () => {
  toastRef.value.show({
    title: '操作成功',
    icon: 'success',
    duration: 2000,
  })
}
</script>
```

### 方法 (Expose)

| 方法名 | 说明     | 参数                                     |
| ------ | -------- | ---------------------------------------- |
| show   | 显示提示 | options: { title, icon, duration, mask } |
| hide   | 隐藏提示 | -                                        |

**Options 参数:**

- `title`: 提示文本
- `icon`: 图标 ('success' | 'error' | 'loading' | 'none')
- `duration`: 持续时间 (ms), 默认 1500
- `mask`: 是否显示透明遮罩防止穿透

---

## 6. uni-movable (拖拽组件)

可拖拽的悬浮球或元素。

### 基础用法

```vue
<uni-movable :x="300" :y="500">
  <view class="float-ball">悬浮</view>
</uni-movable>
```

### 属性 (Props)

| 属性名       | 类型          | 默认值 | 说明                                      |
| ------------ | ------------- | ------ | ----------------------------------------- |
| x            | Number        | 0      | 初始 X 坐标                               |
| y            | Number        | 0      | 初始 Y 坐标                               |
| width        | String/Number | '60px' | 元素宽度                                  |
| height       | String/Number | '60px' | 元素高度                                  |
| direction    | String        | 'all'  | 移动方向: all, vertical, horizontal, none |
| snapToBorder | Boolean       | true   | 是否自动吸附边界                          |
