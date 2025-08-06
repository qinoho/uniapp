<template>
  <view class="pull-refresh-test">
    <u-scroll-view
      ref="scrollViewRef"
      :height="'100vh'"
      @refresh="handleRefresh"
      @loadmore="handleLoadMore"
    >
      <!-- 自定义下拉刷新 -->
      <template #refresh="{ status, distance }">
        <view class="custom-refresh">
          <view class="refresh-content">
            <!-- 状态指示器 -->
            <view class="status-indicator">
              <view
                v-if="status === 'pulling'"
                class="pull-icon"
                :style="{
                  transform: `translateY(${Math.min(
                    distance / 4,
                    10
                  )}px) rotate(${distance * 2}deg)`,
                  opacity: Math.min(distance / 50, 1),
                }"
              >
                ↓
              </view>
              <view v-else-if="status === 'release'" class="release-icon">
                ↑
              </view>
              <view v-else-if="status === 'loading'" class="loading-icon">
                <view class="spinner"></view>
              </view>
            </view>

            <!-- 状态文本 -->
            <text class="status-text">{{ getStatusText(status) }}</text>

            <!-- 距离显示 -->
            <text class="distance-text"
              >距离: {{ Math.round(distance) }}px / 阈值: 80px</text
            >

            <!-- 进度条 -->
            <view class="progress-bar">
              <view
                class="progress-fill"
                :style="{ width: `${Math.min((distance / 80) * 100, 100)}%` }"
              ></view>
            </view>
          </view>
        </view>
      </template>

      <!-- 内容区域 -->
      <view class="content">
        <view class="header">
          <text class="title">下拉刷新测试</text>
          <text class="subtitle">体验优化后的下拉效果</text>
        </view>

        <view class="info-card">
          <text class="info-title">优化特性：</text>
          <text class="info-item">• scroll-view 跟随下拉偏移</text>
          <text class="info-item">• 阻尼效果和弹性动画</text>
          <text class="info-item">• 平滑的状态转换</text>
          <text class="info-item">• 触摸时间检测</text>
        </view>

        <view class="test-list">
          <view
            v-for="item in testList"
            :key="item.id"
            class="test-item"
            :class="{ 'test-item--new': item.isNew }"
          >
            <view class="item-icon">{{ item.icon }}</view>
            <view class="item-content">
              <text class="item-title">{{ item.title }}</text>
              <text class="item-desc">{{ item.description }}</text>
              <text class="item-time">{{ item.time }}</text>
            </view>
          </view>
        </view>
      </view>
    </u-scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface TestItem {
  id: number
  title: string
  description: string
  time: string
  icon: string
  isNew?: boolean
}

const scrollViewRef = ref()
const testList = ref<TestItem[]>([])

// 生成测试数据
const generateTestData = (prefix = '') => {
  const icons = ['🎯', '🚀', '⭐', '🎨', '🔥', '💎', '🌟', '⚡', '🎪', '🎭']
  const items: TestItem[] = []

  for (let i = 1; i <= 15; i++) {
    items.push({
      id: Date.now() + i,
      title: `${prefix}测试项目 ${i}`,
      description: `这是第 ${i} 个测试项目，用于验证下拉刷新的优化效果`,
      time: new Date().toLocaleTimeString(),
      icon: icons[i % icons.length],
    })
  }

  return items
}

// 初始化数据
const initData = () => {
  testList.value = generateTestData()
}

// 下拉刷新处理
const handleRefresh = async () => {
  console.log('开始刷新')

  // 模拟网络请求
  await new Promise(resolve => setTimeout(resolve, 2000))

  // 生成新数据
  const newData = generateTestData('刷新-')
  testList.value = newData

  // 标记新数据
  testList.value.slice(0, 3).forEach(item => {
    item.isNew = true
  })

  // 移除新标记
  setTimeout(() => {
    testList.value.forEach(item => {
      item.isNew = false
    })
  }, 2000)

  // 完成刷新
  scrollViewRef.value?.finishRefresh()

  console.log('刷新完成')
}

// 加载更多处理
const handleLoadMore = async () => {
  console.log('开始加载更多')

  await new Promise(resolve => setTimeout(resolve, 1000))

  const moreData = generateTestData('加载-')
  testList.value.push(...moreData.slice(0, 5))

  scrollViewRef.value?.finishLoadMore(true)

  console.log('加载更多完成')
}

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'pulling':
      return '继续下拉...'
    case 'release':
      return '释放刷新'
    case 'loading':
      return '正在刷新'
    default:
      return ''
  }
}

// 初始化
initData()
</script>

<style lang="scss" scoped>
.pull-refresh-test {
  width: 100%;
  height: 100vh;
}

.custom-refresh {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.refresh-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
}

.status-indicator {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.pull-icon {
  font-size: 24px;
  transition: all 0.1s ease;
}

.release-icon {
  font-size: 24px;
  animation: bounce 0.6s ease-in-out infinite alternate;
}

.loading-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.status-text {
  font-size: 14px;
  color: white;
  margin-bottom: 4px;
}

.distance-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
}

.progress-bar {
  width: 120px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: white;
  border-radius: 2px;
  transition: width 0.1s ease;
}

.content {
  padding: 0 16px;
}

.header {
  padding: 32px 0;
  text-align: center;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  margin: 0 -16px 20px;
  color: white;

  .title {
    display: block;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 8px;
  }

  .subtitle {
    font-size: 14px;
    opacity: 0.9;
  }
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .info-title {
    display: block;
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
  }

  .info-item {
    display: block;
    font-size: 14px;
    color: #666;
    line-height: 1.6;
    margin-bottom: 4px;
  }
}

.test-list {
  padding-bottom: 20px;
}

.test-item {
  display: flex;
  align-items: center;
  padding: 16px;
  margin-bottom: 12px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &--new {
    background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
    animation: newItem 0.5s ease-out;
  }

  .item-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    background: #f0f0f0;
    border-radius: 24px;
    margin-right: 12px;
  }

  .item-content {
    flex: 1;
  }

  .item-title {
    display: block;
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
  }

  .item-desc {
    display: block;
    font-size: 14px;
    color: #666;
    line-height: 1.4;
    margin-bottom: 8px;
  }

  .item-time {
    font-size: 12px;
    color: #999;
  }
}

@keyframes bounce {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-8px);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes newItem {
  0% {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>

