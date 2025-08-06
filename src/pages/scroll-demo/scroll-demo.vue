<template>
  <view class="scroll-demo">
    <u-scroll-view
      ref="scrollViewRef"
      :height="'100vh'"
      :enable-refresh="true"
      :enable-load-more="true"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
      @scroll="onScroll"
    >
      <!-- 自定义下拉刷新动画 -->
      <template #refresh="{ status, distance }">
        <view class="custom-refresh">
          <view class="custom-refresh__content">
            <!-- 下拉指示器 -->
            --{{ distance }}--
            <view
              v-if="status === 'pulling'"
              class="custom-refresh__icon"
              :style="{
                transform: `rotate(${Math.min(
                  distance * 4,
                  180
                )}deg) scale(${Math.min(distance / 60, 1.2)})`,
                opacity: Math.min(distance / 40, 1),
              }"
            >
              ⬇️
            </view>
            <!-- 释放指示器 -->
            <view
              v-else-if="status === 'release'"
              class="custom-refresh__icon custom-refresh__icon--release"
            >
              🚀
            </view>
            <!-- 加载指示器 -->
            <view
              v-else-if="status === 'loading'"
              class="custom-refresh__loading"
            >
              <view class="custom-refresh__loading-icon">⚡</view>
            </view>
            <text class="custom-refresh__text">{{
              getRefreshText(status)
            }}</text>

            <!-- 进度指示器 -->
            <view
              v-if="status === 'pulling' || status === 'release'"
              class="custom-refresh__progress"
            >
              <view
                class="custom-refresh__progress-bar"
                :style="{ width: `${Math.min((distance / 80) * 100, 100)}%` }"
              ></view>
            </view>
          </view>
        </view>
      </template>

      <!-- 列表内容 -->
      <view class="content">
        <view class="header">
          <text class="title">滚动组件演示</text>
          <text class="subtitle">下拉刷新 · 上拉加载</text>
        </view>

        <view class="list">
          <view
            v-for="item in dataList"
            :key="item.id"
            class="list-item"
            :class="{ 'list-item--new': item.isNew }"
          >
            <view class="list-item__avatar">
              <text class="list-item__avatar-text">{{ item.avatar }}</text>
            </view>
            <view class="list-item__content">
              <text class="list-item__title">{{ item.title }}</text>
              <text class="list-item__desc">{{ item.description }}</text>
              <text class="list-item__time">{{ item.time }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 自定义加载更多 -->
      <template #loadmore="{ status }">
        <view class="custom-loadmore">
          <view v-if="status === 'loading'" class="custom-loadmore__loading">
            <view class="custom-loadmore__spinner"></view>
            <text>正在加载精彩内容...</text>
          </view>
          <view v-else-if="status === 'nomore'" class="custom-loadmore__nomore">
            <text>🎉 已经到底啦</text>
          </view>
          <view v-else class="custom-loadmore__more">
            <text>👆 上拉加载更多</text>
          </view>
        </view>
      </template>
    </u-scroll-view>

    <!-- 回到顶部按钮 -->
    <view v-if="showBackToTop" class="back-to-top" @click="scrollToTop">
      <text class="back-to-top__icon">↑</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 数据类型定义
interface ListItem {
  id: number
  title: string
  description: string
  time: string
  avatar: string
  isNew?: boolean
}

// 响应式数据
const scrollViewRef = ref()
const dataList = ref<ListItem[]>([])
const currentPage = ref(1)
const showBackToTop = ref(false)
const scrollTop = ref(0)

// 初始化数据
const initData = () => {
  const items: ListItem[] = []
  for (let i = 1; i <= 20; i++) {
    items.push({
      id: i,
      title: `列表项 ${i}`,
      description: `这是第 ${i} 个列表项的描述信息，用于演示滚动组件的功能。`,
      time: `2024-01-${String(i).padStart(2, '0')} 12:00`,
      avatar: String.fromCodePoint(0x1f600 + (i % 20)), // 随机emoji
    })
  }
  dataList.value = items
}

// 生成更多数据
const generateMoreData = (page: number): ListItem[] => {
  const items: ListItem[] = []
  const start = (page - 1) * 10 + 21

  // 模拟没有更多数据的情况
  if (page > 5) return []

  for (let i = start; i < start + 10; i++) {
    items.push({
      id: i,
      title: `列表项 ${i}`,
      description: `这是第 ${i} 个列表项的描述信息，通过上拉加载获取。`,
      time: `2024-01-${String((i % 30) + 1).padStart(2, '0')} 12:00`,
      avatar: String.fromCodePoint(0x1f600 + (i % 20)),
    })
  }
  return items
}

// 事件处理
const onRefresh = async () => {
  console.log('开始刷新')

  // 模拟网络请求
  await new Promise(resolve => setTimeout(resolve, 2000))

  // 重置数据
  currentPage.value = 1
  initData()

  // 标记新数据
  dataList.value.slice(0, 5).forEach(item => {
    item.isNew = true
  })

  // 移除新标记
  setTimeout(() => {
    dataList.value.forEach(item => {
      item.isNew = false
    })
  }, 3000)

  // 完成刷新
  scrollViewRef.value?.finishRefresh()
  scrollViewRef.value?.resetLoadMore()

  console.log('刷新完成')
}

const onLoadMore = async () => {
  console.log('开始加载更多')

  // 模拟网络请求
  await new Promise(resolve => setTimeout(resolve, 1500))

  currentPage.value++
  const newData = generateMoreData(currentPage.value)

  if (newData.length > 0) {
    dataList.value.push(...newData)
    scrollViewRef.value?.finishLoadMore(true)
  } else {
    scrollViewRef.value?.finishLoadMore(false)
  }

  console.log('加载更多完成')
}

const onScroll = (e: any) => {
  scrollTop.value = e.detail.scrollTop
  showBackToTop.value = scrollTop.value > 500
}

const scrollToTop = () => {
  scrollViewRef.value?.scrollToTop()
}

const getRefreshText = (status: string) => {
  switch (status) {
    case 'pulling':
      return '继续下拉刷新'
    case 'release':
      return '释放立即刷新'
    case 'loading':
      return '正在刷新数据...'
    default:
      return ''
  }
}

// 初始化
initData()
</script>

<style lang="scss" scoped>
.scroll-demo {
  position: relative;
  width: 100%;
  height: 100vh;
}

.custom-refresh {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 160rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: white;
  }

  &__icon {
    font-size: 24px;
    margin-bottom: 8px;
    transition: transform 0.3s ease;

    &--bounce {
      animation: bounce 0.6s ease-in-out infinite alternate;
    }
  }

  &__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__loading-icon {
    font-size: 24px;
    animation: flash 1s ease-in-out infinite;
    margin-bottom: 8px;
  }

  &__text {
    font-size: 14px;
    color: white;
    opacity: 0.9;
    margin-bottom: 8px;
  }

  &__progress {
    width: 60px;
    height: 3px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    overflow: hidden;
  }

  &__progress-bar {
    height: 100%;
    background: white;
    border-radius: 2px;
    transition: width 0.1s ease;
  }

  &__icon--release {
    animation: bounce 0.6s ease-in-out infinite alternate;
  }
}

.content {
  padding: 0 16px;
}

.header {
  padding: 32px 0;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    opacity: 0.8;
  }
}

.list {
  padding-bottom: 20px;
}

.list-item {
  display: flex;
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

  &__avatar {
    width: 48px;
    height: 48px;
    border-radius: 24px;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    flex-shrink: 0;
  }

  &__avatar-text {
    font-size: 20px;
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
  }

  &__desc {
    font-size: 14px;
    color: #666;
    line-height: 1.4;
    margin-bottom: 8px;
  }

  &__time {
    font-size: 12px;
    color: #999;
  }
}

.custom-loadmore {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  color: #666;

  &__loading {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #e5e5e5;
    border-top: 2px solid #007aff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  &__nomore {
    color: #999;
  }

  &__more {
    color: #007aff;
  }
}

.back-to-top {
  position: fixed;
  right: 20px;
  bottom: 80px;
  width: 48px;
  height: 48px;
  background: #007aff;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
  z-index: 100;

  &__icon {
    color: white;
    font-size: 20px;
    font-weight: bold;
  }

  &:active {
    transform: scale(0.95);
  }
}

@keyframes bounce {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-10px);
  }
}

@keyframes flash {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

