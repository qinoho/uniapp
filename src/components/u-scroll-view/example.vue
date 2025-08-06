<template>
  <view class="example">
    <!-- 基础用法 -->
    <u-scroll-view
      ref="scrollViewRef"
      :height="'100vh'"
      @refresh="handleRefresh"
      @loadmore="handleLoadMore"
    >
      <view class="content">
        <view class="header">
          <text class="title">基础滚动组件示例</text>
          <text class="subtitle">使用原生下拉刷新</text>
        </view>

        <view class="list">
          <view v-for="item in list" :key="item.id" class="list-item">
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

const scrollViewRef = ref()
const list = ref<ListItem[]>([])
const currentPage = ref(1)

// 初始化数据
const initData = () => {
  const items: ListItem[] = []
  for (let i = 1; i <= 15; i++) {
    items.push({
      id: i,
      title: `标题 ${i}`,
      description: `这是第 ${i} 项的描述内容`,
    })
  }
  list.value = items
}

// 下拉刷新
const handleRefresh = async () => {
  // 模拟网络请求
  await new Promise(resolve => setTimeout(resolve, 1500))

  // 重新加载数据
  currentPage.value = 1
  initData()

  // 完成刷新
  scrollViewRef.value?.finishRefresh()
  scrollViewRef.value?.resetLoadMore()
}

// 上拉加载更多
const handleLoadMore = async () => {
  // 模拟网络请求
  await new Promise(resolve => setTimeout(resolve, 1000))

  currentPage.value++
  const newItems: ListItem[] = []

  // 模拟最多加载3页
  if (currentPage.value <= 3) {
    const start = (currentPage.value - 1) * 10 + 16
    for (let i = start; i < start + 10; i++) {
      newItems.push({
        id: i,
        title: `标题 ${i}`,
        description: `这是第 ${i} 项的描述内容`,
      })
    }
    list.value.push(...newItems)
    scrollViewRef.value?.finishLoadMore(true)
  } else {
    // 没有更多数据
    scrollViewRef.value?.finishLoadMore(false)
  }
}

// 初始化
initData()
</script>

<style lang="scss" scoped>
.example {
  width: 100%;
  height: 100vh;
}

.content {
  padding: 0 16px;
}

.header {
  padding: 32px 0;
  text-align: center;
  background: #f8f9fa;
  margin: 0 -16px 20px;

  .title {
    display: block;
    font-size: 20px;
    font-weight: bold;
    color: #333;
    margin-bottom: 8px;
  }

  .subtitle {
    font-size: 14px;
    color: #666;
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
</style>

