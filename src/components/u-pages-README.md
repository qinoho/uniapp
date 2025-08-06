# UPages 页面组件

一个完整的 UniApp 页面组件，使用 TypeScript + Vue 3 Composition API (setup 语法)，自动处理状态栏、导航栏和底部安全区域的兼容性问题。

## 功能特性

- ✅ 自动适配状态栏高度（支持刘海屏）
- ✅ 自动适配底部安全区域（支持全面屏手机）
- ✅ 多平台兼容（App、H5、各种小程序）
- ✅ 自定义导航栏样式
- ✅ 支持插槽自定义内容
- ✅ 支持下拉刷新
- ✅ 响应式设计
- ✅ 暗黑模式适配

## 基本使用

```vue
<template>
  <u-pages title="页面标题">
    <view>页面内容</view>
  </u-pages>
</template>

<script setup lang="ts">
import UPages from '@/components/u-pages.vue'
</script>
```

## Props 属性

| 属性名                | 类型          | 默认值         | 说明                 |
| --------------------- | ------------- | -------------- | -------------------- |
| title                 | String        | ''             | 页面标题             |
| showStatusBar         | Boolean       | true           | 是否显示状态栏占位   |
| showNavBar            | Boolean       | true           | 是否显示导航栏       |
| showBack              | Boolean       | true           | 是否显示返回按钮     |
| backText              | String        | ''             | 返回按钮文字         |
| showSafeAreaBottom    | Boolean       | true           | 是否显示底部安全区域 |
| backgroundColor       | String        | '#ffffff'      | 页面背景色           |
| navBarBackgroundColor | String        | '#ffffff'      | 导航栏背景色         |
| navBarTextColor       | String        | '#000000'      | 导航栏文字颜色       |
| statusBarStyle        | String        | 'dark-content' | 状态栏样式           |
| navBarHeight          | String/Number | ''             | 自定义导航栏高度     |
| enablePullRefresh     | Boolean       | false          | 是否启用下拉刷新     |

## 插槽 Slots

| 插槽名    | 说明                 |
| --------- | -------------------- |
| default   | 页面主要内容         |
| nav-bar   | 自定义整个导航栏     |
| nav-right | 自定义导航栏右侧内容 |

## 事件 Events

| 事件名  | 说明             | 参数 |
| ------- | ---------------- | ---- |
| back    | 返回按钮点击事件 | -    |
| refresh | 下拉刷新事件     | -    |

## 高级用法

### 自定义导航栏

```vue
<template>
  <u-pages
    title="自定义导航栏"
    nav-bar-background-color="#007aff"
    nav-bar-text-color="#ffffff"
  >
    <template #nav-right>
      <text @click="handleShare">分享</text>
    </template>

    <view>页面内容</view>
  </u-pages>
</template>

<script setup lang="ts">
const handleShare = () => {
  // 分享逻辑
}
</script>
```

### 启用下拉刷新

```vue
<template>
  <u-pages
    title="下拉刷新"
    :enable-pull-refresh="true"
    @refresh="handleRefresh"
  >
    <view>页面内容</view>
  </u-pages>
</template>

<script setup lang="ts">
const handleRefresh = () => {
  // 处理刷新逻辑
  setTimeout(() => {
    uni.stopPullDownRefresh()
  }, 2000)
}
</script>
```

### 隐藏导航栏

```vue
<template>
  <u-pages :show-nav-bar="false" :show-status-bar="true">
    <view>全屏内容</view>
  </u-pages>
</template>
```

## 平台兼容性

| 平台         | 状态栏适配 | 导航栏适配 | 安全区域适配 |
| ------------ | ---------- | ---------- | ------------ |
| App          | ✅         | ✅         | ✅           |
| H5           | ✅         | ✅         | ❌           |
| 微信小程序   | ✅         | ✅         | ✅           |
| 支付宝小程序 | ✅         | ✅         | ✅           |
| 其他小程序   | ✅         | ✅         | ✅           |

## TypeScript 支持

组件完全使用 TypeScript 编写，提供完整的类型支持：

```typescript
// Props 类型自动推导
const props = withDefaults(
  defineProps<{
    title?: string
    showStatusBar?: boolean
    // ... 其他属性
  }>(),
  {
    title: '',
    showStatusBar: true,
    // ... 默认值
  }
)

// 事件类型定义
const emit = defineEmits<{
  back: []
  refresh: []
}>()
```

## 注意事项

1. 组件会自动获取系统信息来计算安全区域，无需手动配置
2. 在 H5 端，底部安全区域默认为 0
3. 不同平台的导航栏高度会自动适配
4. 支持暗黑模式自动切换
5. 建议在页面根组件中使用，确保样式正确应用
6. 使用 TypeScript + Vue 3 Composition API (setup 语法)
7. 编译器宏（defineProps、defineEmits 等）已在全局声明，无需导入

## 样式自定义

组件使用 CSS 变量，可以通过覆盖变量来自定义样式：

```css
/* 自定义状态栏高度变量 */
.u-pages {
  --status-bar-height: 44px;
}
```

