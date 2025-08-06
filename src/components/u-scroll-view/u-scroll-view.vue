<template>
  <view class="u-scroll-view" :style="containerStyle">
    <!-- 自定义下拉刷新区域 (仅在有自定义插槽时显示) -->

    <view
      v-if="hasCustomRefresh"
      class="u-scroll-view__refresh"
      :class="{
        'u-scroll-view__refresh--active': refreshStatus !== 'none',
        'u-scroll-view__refresh--loading': refreshStatus === 'loading',
        'u-scroll-view__refresh--pulling': refreshStatus === 'pulling',
      }"
      :style="refreshStyle"
    >
      <slot
        name="refresh"
        :status="refreshStatus"
        :distance="pullDistance"
      ></slot>
    </view>

    <!-- 滚动容器 -->
    <scroll-view
      class="u-scroll-view__scroll"
      :style="scrollStyle"
      scroll-y
      :scroll-top="scrollTop"
      :enable-back-to-top="enableBackToTop"
      :scroll-with-animation="scrollWithAnimation"
      :refresher-enabled="useNativeRefresh"
      :refresher-triggered="nativeRefreshTriggered"
      @scroll="handleScroll"
      @scrolltoupper="handleScrollToUpper"
      @scrolltolower="handleScrollToLower"
      @refresherrefresh="handleNativeRefresh"
      @refresherrestore="handleNativeRefreshRestore"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <!-- 内容区域 -->

      <view class="u-scroll-view__content" :style="contentStyle">
        <slot></slot>
      </view>

      <!-- 上拉加载更多区域 -->
      <view
        v-if="enableLoadMore"
        class="u-scroll-view__loadmore"
        :class="{
          'u-scroll-view__loadmore--loading': loadMoreStatus === 'loading',
          'u-scroll-view__loadmore--nomore': loadMoreStatus === 'nomore',
        }"
      >
        <slot name="loadmore" :status="loadMoreStatus">
          <view class="u-scroll-view__loadmore-default">
            <view
              v-if="loadMoreStatus === 'loading'"
              class="u-scroll-view__loading-spinner"
            ></view>
            <text class="u-scroll-view__loadmore-text">{{ loadMoreText }}</text>
          </view>
        </slot>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, useSlots } from 'vue'

// 定义类型
export type RefreshStatus = 'none' | 'pulling' | 'release' | 'loading'
export type LoadMoreStatus = 'more' | 'loading' | 'nomore'

interface Props {
  // 基础配置
  height?: string | number
  backgroundColor?: string

  // 下拉刷新配置
  enableRefresh?: boolean
  refreshThreshold?: number
  refreshText?: {
    pulling?: string
    release?: string
    loading?: string
  }

  // 上拉加载配置
  enableLoadMore?: boolean
  loadMoreThreshold?: number
  loadMoreText?: {
    more?: string
    loading?: string
    nomore?: string
  }

  // 滚动配置
  enableBackToTop?: boolean
  scrollWithAnimation?: boolean
  scrollTop?: number

  // 自定义样式
  contentPadding?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: '100%',
  backgroundColor: 'transparent',
  enableRefresh: true,
  refreshThreshold: 80,
  refreshText: () => ({
    pulling: '下拉刷新',
    release: '释放刷新',
    loading: '正在刷新...',
  }),
  enableLoadMore: true,
  loadMoreThreshold: 50,
  loadMoreText: () => ({
    more: '上拉加载更多',
    loading: '正在加载...',
    nomore: '没有更多数据了',
  }),
  enableBackToTop: true,
  scrollWithAnimation: true,
  scrollTop: 0,
  contentPadding: '0',
})

// 定义事件
const emit = defineEmits([
  'refresh',
  'loadmore',
  'scroll',
  'scrolltoupper',
  'scrolltolower',
])

// 获取插槽
const slots = useSlots()

// 响应式数据
const refreshStatus = ref<RefreshStatus>('none')
const loadMoreStatus = ref<LoadMoreStatus>('more')
const pullDistance = ref(0)
const startY = ref(0)
const currentY = ref(0)
const isRefreshing = ref(false)
const isLoadingMore = ref(false)
const scrollTopValue = ref(0)
const nativeRefreshTriggered = ref(false)
const isPulling = ref(false)
const touchStartTime = ref(0)

// 计算属性
const containerStyle = computed(() => ({
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  backgroundColor: props.backgroundColor,
}))

// 检测是否有自定义下拉刷新插槽
const hasCustomRefresh = computed(() => {
  return !!slots.refresh
})

// 是否使用原生下拉刷新
const useNativeRefresh = computed(() => {
  return props.enableRefresh && !hasCustomRefresh.value
})

const refreshStyle = computed(() => ({
  transform: `translateY(-calc(50%+${Math.max(
    0,
    props.refreshThreshold - pullDistance.value
  )}px))`,
  opacity: refreshStatus.value === 'none' ? 0 : 1,
}))
// `translateY(calc(-100% - 10px));`
const scrollStyle = computed(() => ({
  height: '100%',
  transform:
    hasCustomRefresh.value && pullDistance.value > 0
      ? `translateY(${Math.min(pullDistance.value, props.refreshThreshold)}px)`
      : 'translateY(0)',
  transition:
    refreshStatus.value === 'none' && !isPulling.value
      ? 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      : 'none',
}))

const contentStyle = computed(() => ({
  padding: props.contentPadding,
  minHeight: '100%',
}))

const refreshText = computed(() => {
  switch (refreshStatus.value) {
    case 'pulling':
      return props.refreshText.pulling
    case 'release':
      return props.refreshText.release
    case 'loading':
      return props.refreshText.loading
    default:
      return ''
  }
})

const loadMoreText = computed(() => {
  switch (loadMoreStatus.value) {
    case 'more':
      return props.loadMoreText.more
    case 'loading':
      return props.loadMoreText.loading
    case 'nomore':
      return props.loadMoreText.nomore
    default:
      return ''
  }
})

// 原生下拉刷新事件处理
const handleNativeRefresh = () => {
  if (!useNativeRefresh.value || isRefreshing.value) return

  nativeRefreshTriggered.value = true
  isRefreshing.value = true
  emit('refresh')
}

const handleNativeRefreshRestore = () => {
  nativeRefreshTriggered.value = false
}

// 触摸事件处理（仅在自定义刷新时使用）
const handleTouchStart = (e: TouchEvent) => {
  if (!props.enableRefresh || !hasCustomRefresh.value || isRefreshing.value)
    return

  startY.value = e.touches[0].clientY
  currentY.value = startY.value
  touchStartTime.value = Date.now()
  isPulling.value = false
}

const handleTouchMove = (e: TouchEvent) => {
  if (!props.enableRefresh || !hasCustomRefresh.value || isRefreshing.value)
    return

  currentY.value = e.touches[0].clientY
  const deltaY = currentY.value - startY.value

  // 只有在顶部且向下拉时才处理
  if (scrollTopValue.value <= 0 && deltaY > 0) {
    isPulling.value = true

    // 阻止默认滚动行为
    e.preventDefault()

    // 计算下拉距离，使用平滑的阻尼函数避免跳动
    const threshold = props.refreshThreshold

    // 使用连续的阻尼函数，避免在阈值处产生跳动
    // 采用指数衰减函数实现平滑过渡
    const dampingFactor = 0.6
    const maxDistance = threshold * 1.5

    // 使用 tanh 函数实现平滑阻尼，避免突变
    const normalizedDelta = deltaY / threshold
    const dampedRatio = Math.tanh(normalizedDelta * 0.8) * dampingFactor
    const calculatedDistance = threshold * dampedRatio

    pullDistance.value = Math.min(calculatedDistance, maxDistance)
    // 更新刷新状态
    if (pullDistance.value >= props.refreshThreshold) {
      refreshStatus.value = 'release'
    } else {
      refreshStatus.value = 'pulling'
    }
  } else if (isPulling.value && deltaY <= 0) {
    // 如果正在下拉但现在向上滑动，重置状态
    resetPullState()
  }
}

const handleTouchEnd = () => {
  if (!props.enableRefresh || !hasCustomRefresh.value || isRefreshing.value)
    return

  const touchDuration = Date.now() - touchStartTime.value

  // 如果下拉距离足够且触摸时间合理，触发刷新
  if (refreshStatus.value === 'release' && touchDuration > 100) {
    triggerRefresh()
  } else {
    resetPullState()
  }

  isPulling.value = false
}

// 重置下拉状态
const resetPullState = () => {
  refreshStatus.value = 'none'
  pullDistance.value = 0
  isPulling.value = false
}

// 滚动事件处理
const handleScroll = (e: any) => {
  scrollTopValue.value = e.detail.scrollTop
  emit('scroll', e)
}

const handleScrollToUpper = (e: any) => {
  emit('scrolltoupper', e)
}

const handleScrollToLower = (e: any) => {
  if (
    props.enableLoadMore &&
    loadMoreStatus.value === 'more' &&
    !isLoadingMore.value
  ) {
    triggerLoadMore()
  }
  emit('scrolltolower', e)
}

// 刷新相关方法
const triggerRefresh = async () => {
  if (isRefreshing.value) return

  isRefreshing.value = true
  refreshStatus.value = 'loading'

  // 保持下拉位置在加载状态
  pullDistance.value = props.refreshThreshold

  emit('refresh')
}

const finishRefresh = () => {
  isRefreshing.value = false

  if (useNativeRefresh.value) {
    // 原生刷新完成
    nativeRefreshTriggered.value = false
  } else {
    // 自定义刷新完成，添加延迟让用户看到完成状态
    setTimeout(() => {
      resetPullState()
    }, 300)
  }
}

// 加载更多相关方法
const triggerLoadMore = async () => {
  if (isLoadingMore.value || loadMoreStatus.value !== 'more') return

  isLoadingMore.value = true
  loadMoreStatus.value = 'loading'

  emit('loadmore')
}

const finishLoadMore = (hasMore: boolean = true) => {
  isLoadingMore.value = false
  loadMoreStatus.value = hasMore ? 'more' : 'nomore'
}

const resetLoadMore = () => {
  isLoadingMore.value = false
  loadMoreStatus.value = 'more'
}

// 暴露方法给父组件
defineExpose({
  finishRefresh,
  finishLoadMore,
  resetLoadMore,
  scrollToTop: () => {
    scrollTopValue.value = 0
  },
})
</script>

<style lang="scss" scoped>
.u-scroll-view {
  position: relative;
  width: 100%;
  overflow: hidden;

  &__refresh {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f8f9fa;
    transform: translateY(-100%);
    transition: opacity 0.2s ease;
  }

  &__scroll {
    width: 100%;
    height: 100%;
  }

  &__content {
    width: 100%;
    box-sizing: border-box;
  }

  &__loadmore {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    background-color: transparent;

    &--loading {
      background-color: #f8f9fa;
    }

    &--nomore {
      opacity: 0.6;
    }
  }

  &__loadmore-default {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__loadmore-text {
    font-size: 14px;
    color: #666;
    margin-left: 8px;
  }

  &__loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #e5e5e5;
    border-top: 2px solid #007aff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
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

// 平台适配
// #ifdef APP-PLUS
.u-scroll-view {
  &__refresh {
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
}
// #endif

// #ifdef H5
.u-scroll-view {
  &__scroll {
    -webkit-overflow-scrolling: touch;
  }
}
// #endif

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  .u-scroll-view {
    &__refresh {
      background-color: #1c1c1e;
    }

    &__refresh-text,
    &__loadmore-text {
      color: #ffffff;
    }

    &__refresh-icon {
      color: #ffffff;
    }

    &__loading-spinner {
      border-color: #3a3a3c;
      border-top-color: #007aff;
    }
  }
}
</style>

