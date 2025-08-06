<template>
  <view class="comparison-demo">
    <view class="tabs">
      <view
        class="tab"
        :class="{ active: currentTab === 'native' }"
        @click="currentTab = 'native'"
      >
        原生刷新
      </view>
      <view
        class="tab"
        :class="{ active: currentTab === 'custom' }"
        @click="currentTab = 'custom'"
      >
        自定义刷新
      </view>
    </view>

    <!-- 原生下拉刷新示例 -->
    <u-scroll-view
      v-if="currentTab === 'native'"
      ref="nativeScrollRef"
      :height="'calc(100vh - 60px)'"
      @refresh="handleNativeRefresh"
      @loadmore="handleLoadMore"
    >
      <view class="content">
        <view class="header native-header">
          <text class="title">原生下拉刷新</text>
          <text class="subtitle">使用 scroll-view 自带的刷新动画</text>
        </view>
        
        <view class="list">
          <view
            v-for="item in nativeList"
            :key="item.id"
            class="list-item"
          >
            <text class="item-title">{{ item.title }}</text>
            <text class="item-desc">{{ item.description }}</text>
          </view>
        </view>
      </view>
    </u-scroll-view>

    <!-- 自定义下拉刷新示例 -->
    <u-scroll-view
      v-if="currentTab === 'custom'"
      ref="customScrollRef"
      :height="'calc(100vh - 60px)'"
      @refresh="handleCustomRefresh"
      @loadmore="handleLoadMore"
    >
      <!-- 自定义下拉刷新动画 -->
      <template #refresh="{ status, distance }">
        <view class="custom-refresh">
          <view class="custom-refresh__content">
            <view
              v-if="status === 'pulling'"
              class="custom-refresh__icon"
              :style="{ 
                transform: `rotate(${Math.min(distance * 3, 360)}deg) scale(${Math.min(distance / 80, 1)})` 
              }"
            >
              ⭐
            </view>
            <view
              v-else-if="status === 'release'"
              class="custom-refresh__icon custom-refresh__icon--bounce"
            >
              🚀
            </view>
            <view
              v-else-if="status === 'loading'"
              class="custom-refresh__loading"
            >
              <view class="custom-refresh__loading-icon">⚡</view>
            </view>
            <text class="custom-refresh__text">{{ getRefreshText(status) }}</text>
          </view>
        </view>
      </template>

      <view class="content">
        <view class="header custom-header">
          <text class="title">自定义下拉刷新</text>
          <text class="subtitle">完全自定义的刷新动画效果</text>
        </view>
        
        <view class="list">
          <view
            v-for="item in customList"
            :key="item.id"
            class="list-item"
          >
            <text class="item-title">{{ item.title }}</text>
            <text class="item-desc">{{ item.description }}</text>
          </view>
        </view>
      </view>
    </u-scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface ListItem {
  id: number
  title: string
  description: string
}

const currentTab = ref<'native' | 'custom'>('native')
const nativeScrollRef = ref()
const customScrollRef = ref()
const nativeList = ref<ListItem[]>([])
const customList = ref<ListItem[]>([])

// 生成数据
const generateData = (prefix: string) => {
  const items: ListItem[] = []
  for (let i = 1; i <= 15; i++) {
    items.push({
      id: i,
      title: `${prefix} 标题 ${i}`,
      description: `这是 ${prefix} 第 ${i} 项的描述内容，展示不同的刷新效果`
    })
  }
  return items
}

// 初始化数据
const initData = () => {
  nativeList.value = generateData('原生')
  customList.value = generateData('自定义')
}

// 原生刷新处理
const handleNativeRefresh = async () => {
  await new Promise(resolve => setTimeout(resolve, 1500))
  nativeList.value = generateData('原生刷新')
  nativeScrollRef.value?.finishRefresh()
}

// 自定义刷新处理
const handleCustomRefresh = async () => {
  await new Promise(resolve => setTimeout(resolve, 2000))
  customList.value = generateData('自定义刷新')
  customScrollRef.value?.finishRefresh()
}

// 加载更多
const handleLoadMore = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const currentScrollRef = currentTab.value === 'native' ? nativeScrollRef : customScrollRef
  const currentList = currentTab.value === 'native' ? nativeList : customList
  
  // 模拟加载更多数据
  const newItems = generateData(`${currentTab.value === 'native' ? '原生' : '自定义'}加载`)
  currentList.value.push(...newItems.slice(0, 5))
  
  currentScrollRef.value?.finishLoadMore(true)
}

// 自定义刷新文本
const getRefreshText = (status: string) => {
  switch (status) {
    case 'pulling':
      return '继续下拉刷新数据'
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
.comparison-demo {
  width: 100%;
  height: 100vh;
}

.tabs {
  display: flex;
  height: 60px;
  background: white;
  border-bottom: 1px solid #eee;
}

.tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;

  &.active {
    color: #007aff;
    background: #f8f9fa;
    font-weight: 600;
  }

  &:active {
    opacity: 0.7;
  }
}

.content {
  padding: 0 16px;
}

.header {
  padding: 32px 0;
  text-align: center;
  margin: 0 -16px 20px;
  color: white;

  &.native-header {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }

  &.custom-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .title {
    display: block;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 8px;
  }

  .subtitle {
    font-size: 14px;
    opacity: 0.9;
  }
}

.list {
  padding-bottom: 20px;
}

.list-item {
  padding: 16px;
  margin-bottom: 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .item-title {
    display: block;
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
  }

  .item-desc {
    font-size: 14px;
    color: #666;
    line-height: 1.4;
  }
}

.custom-refresh {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
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
  }
}

@keyframes bounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(-10px); }
}

@keyframes flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
