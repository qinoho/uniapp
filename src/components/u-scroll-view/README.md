# u-scroll-view 垂直滚动组件

一个功能完整的垂直滚动组件，支持下拉刷新、上拉触底加载和自定义下拉刷新动画。

## 功能特性

- ✅ 垂直滚动
- ✅ 下拉刷新（支持自定义动画）
- ✅ 上拉触底加载更多
- ✅ 自定义刷新和加载状态
- ✅ 多平台适配（App、H5、小程序）
- ✅ 暗黑模式支持
- ✅ TypeScript 支持
- ✅ 性能优化（滚动事件节流）

## 基础用法

### 使用原生下拉刷新（默认）

当没有提供自定义下拉刷新插槽时，组件会自动使用 scroll-view 的原生下拉刷新功能：

```vue
<template>
  <u-scroll-view
    ref="scrollViewRef"
    :height="'100vh'"
    @refresh="onRefresh"
    @loadmore="onLoadMore"
  >
    <view v-for="item in list" :key="item.id" class="item">
      {{ item.title }}
    </view>
  </u-scroll-view>
</template>

<script setup>
import { ref } from 'vue'

const list = ref([])
const scrollViewRef = ref()

const onRefresh = async () => {
  // 模拟刷新数据
  await new Promise(resolve => setTimeout(resolve, 2000))
  list.value = generateNewData()

  // 完成刷新
  scrollViewRef.value?.finishRefresh()
}

const onLoadMore = async () => {
  // 模拟加载更多数据
  await new Promise(resolve => setTimeout(resolve, 1500))
  const newData = generateMoreData()

  if (newData.length > 0) {
    list.value.push(...newData)
    scrollViewRef.value?.finishLoadMore(true) // 还有更多数据
  } else {
    scrollViewRef.value?.finishLoadMore(false) // 没有更多数据
  }
}
</script>
```

### 使用自定义下拉刷新动画

当提供了 `#refresh` 插槽时，组件会自动切换到自定义下拉刷新模式：

```vue
<template>
  <u-scroll-view @refresh="onRefresh">
    <template #refresh="{ status, distance }">
      <view class="custom-refresh">
        <view v-if="status === 'pulling'" class="custom-icon">
          <text :style="{ transform: `rotate(${distance * 2}deg)` }">🔄</text>
        </view>
        <view v-else-if="status === 'release'" class="custom-icon">
          <text>🚀</text>
        </view>
        <view v-else-if="status === 'loading'" class="custom-loading">
          <text>⚡</text>
        </view>
        <text class="custom-text">{{ getCustomText(status) }}</text>
      </view>
    </template>

    <!-- 内容 -->
    <view>Your content here</view>
  </u-scroll-view>
</template>
```

## 刷新模式说明

组件会根据是否提供自定义下拉刷新插槽自动选择刷新模式：

- **原生模式**：没有提供 `#refresh` 插槽时，使用 scroll-view 原生下拉刷新
- **自定义模式**：提供了 `#refresh` 插槽时，使用自定义下拉刷新动画

这样设计的好处：

1. **默认原生刷新**：性能更好，体验更流畅
2. **智能模式切换**：自动检测插槽，无需额外配置
3. **原生级体验**：自定义刷新时 scroll-view 跟随偏移，模拟真实原生效果
4. **优化的交互**：

   - **真实距离**：`pullDistance` 保持为实际下拉距离，便于业务逻辑判断
   - **阻尼显示**：显示高度使用阻尼计算，提供自然的物理感受
   - **一致偏移**：scroll-view 偏移使用阻尼高度，保持视觉一致性
   - **滚动控制**：下拉时自动禁用列表滚动，防止意外滚动干扰
   - **平滑过渡**：阈值内外使用不同阻尼系数，避免跳动
   - **回弹优化**：松手后刷新区域与滚动容器动画同步，无覆盖问题

5. **性能优化**：
   - **滚动节流**：滚动事件节流至 16ms (60fps)，保证流畅性
   - **事件优化**：上拉事件节流 100ms，下拉加载节流 200ms
   - **防抖节流**：提供完整的防抖节流工具函数
   - **CPU 优化**：显著降低滚动时的 CPU 占用

## Props 配置

| 属性                | 类型             | 默认值        | 说明                 |
| ------------------- | ---------------- | ------------- | -------------------- |
| height              | string \| number | '100%'        | 组件高度             |
| backgroundColor     | string           | 'transparent' | 背景颜色             |
| enableRefresh       | boolean          | true          | 是否启用下拉刷新     |
| refreshThreshold    | number           | 80            | 下拉刷新触发阈值(px) |
| refreshText         | object           | -             | 刷新文本配置         |
| enableLoadMore      | boolean          | true          | 是否启用上拉加载     |
| loadMoreThreshold   | number           | 50            | 上拉加载触发阈值(px) |
| loadMoreText        | object           | -             | 加载更多文本配置     |
| enableBackToTop     | boolean          | true          | 是否启用回到顶部     |
| scrollWithAnimation | boolean          | true          | 滚动时是否使用动画   |
| scrollTop           | number           | 0             | 设置滚动位置         |
| contentPadding      | string           | '0'           | 内容区域内边距       |

## Events 事件

| 事件名        | 说明           | 回调参数 |
| ------------- | -------------- | -------- |
| refresh       | 下拉刷新触发   | -        |
| loadmore      | 上拉加载触发   | -        |
| scroll        | 滚动时触发     | event    |
| scrolltoupper | 滚动到顶部触发 | event    |
| scrolltolower | 滚动到底部触发 | event    |

## Methods 方法

| 方法名         | 说明             | 参数             |
| -------------- | ---------------- | ---------------- |
| finishRefresh  | 完成刷新         | -                |
| finishLoadMore | 完成加载更多     | hasMore: boolean |
| resetLoadMore  | 重置加载更多状态 | -                |
| scrollToTop    | 滚动到顶部       | -                |

## Slots 插槽

| 插槽名   | 说明               | 作用域参数           |
| -------- | ------------------ | -------------------- |
| default  | 默认内容           | -                    |
| refresh  | 自定义下拉刷新内容 | { status, distance } |
| loadmore | 自定义上拉加载内容 | { status }           |

