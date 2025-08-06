<template>
  <u-pages
    title="TypeScript Setup 测试"
    :show-back="true"
    :showNavBar="true"
    :show-status-bar="true"
    :enable-pull-refresh="true"
    :show-safe-area-bottom="true"
    :navBarBackgroundColor="'blue'"
    back-text="返回"
    background-color="orange"
    nav-bar-text-color="#333333"
    @back="handleBack"
    @refresh="handleRefresh"
  >
    <!-- 自定义导航栏右侧 -->
    <template #nav-right>
      <text class="nav-action" @click="handleAction">测试</text>
    </template>

    <!-- 页面内容 -->
    <view class="test-content">
      <view class="info-card">
        <text class="card-title">组件信息</text>
        <text class="card-item">✅ TypeScript 支持</text>
        <text class="card-item">✅ Vue 3 Composition API</text>
        <text class="card-item">✅ Setup 语法</text>
        <text class="card-item">✅ 编译器宏支持</text>
      </view>

      <view class="info-card">
        <text class="card-title">功能测试</text>
        <button class="test-btn" @click="testSystemInfo">获取系统信息</button>
        <button class="test-btn" @click="testEmit">测试事件发射</button>
        <button class="test-btn" @click="testProps">测试 Props</button>
      </view>

      <view class="info-card" v-if="systemInfoText">
        <text class="card-title">系统信息</text>
        <text class="system-info">{{ systemInfoText }}</text>
      </view>
    </view>
  </u-pages>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// 响应式数据
const systemInfoText = ref<string>('')

// 事件处理函数
const handleBack = () => {
  console.log('返回按钮被点击 - TypeScript Setup 版本')
  uni.showToast({
    title: '返回事件触发',
    icon: 'success',
  })
}

const handleRefresh = () => {
  console.log('下拉刷新 - TypeScript Setup 版本')
  uni.showToast({
    title: '刷新事件触发',
    icon: 'success',
  })
  setTimeout(() => {
    uni.stopPullDownRefresh()
  }, 1000)
}

const handleAction = () => {
  console.log('导航栏操作按钮被点击')
  uni.showToast({
    title: 'TypeScript 测试成功',
    icon: 'success',
  })
}

// 测试函数
const testSystemInfo = () => {
  uni.getSystemInfo({
    success: res => {
      systemInfoText.value = `平台: ${res.platform}, 版本: ${res.version}, 屏幕: ${res.screenWidth}x${res.screenHeight}`
      console.log('系统信息:', res)
    },
  })
}

const testEmit = () => {
  console.log('测试事件发射')
  uni.showModal({
    title: '事件测试',
    content: '这是一个 TypeScript + Setup 语法的测试',
    success: res => {
      if (res.confirm) {
        console.log('用户点击确定')
      }
    },
  })
}

const testProps = () => {
  console.log('测试 Props 类型推导')
  uni.showToast({
    title: 'Props 类型正常',
    icon: 'success',
  })
}
</script>

<style lang="scss" scoped>
.nav-action {
  color: #007aff;
  font-size: 16px;
  padding: 8px 12px;
  border-radius: 4px;

  &:active {
    opacity: 0.6;
  }
}

.test-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8px;
}

.card-item {
  font-size: 14px;
  color: #666666;
  line-height: 1.5;
}

.test-btn {
  background-color: #007aff;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  margin-bottom: 8px;

  &:active {
    background-color: #0056cc;
  }
}

.system-info {
  font-size: 12px;
  color: #888888;
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  line-height: 1.4;
}
</style>
