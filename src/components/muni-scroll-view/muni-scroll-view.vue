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
      <slot name="refresh" :status="refreshStatus" :distance="pullDistance"></slot>
    </view>

    <!-- 滚动容器 -->
    <scroll-view
      class="u-scroll-view__scroll"
      :style="scrollStyle"
      :scroll-y="scrollEnabled"
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
      @touchcancel="handleTouchEnd"
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
            <view v-if="loadMoreStatus === 'loading'" class="u-scroll-view__loading-spinner"></view>
            <text class="u-scroll-view__loadmore-text">{{ loadMoreText }}</text>
          </view>
        </slot>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, useSlots } from 'vue'
import { throttleScroll } from '@/utils/utils'

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
const emit = defineEmits(['refresh', 'loadmore', 'scroll', 'scrolltoupper', 'scrolltolower'])

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
  height: props.height
    ? typeof props.height === 'number'
      ? `${props.height}px`
      : props.height
    : 'auto',
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

// 计算阻尼显示高度
const dampedPullHeight = computed(() => {
  const threshold = props.refreshThreshold
  const actualDistance = pullDistance.value

  if (actualDistance <= 0) return 0

  // 使用平滑的阻尼函数计算显示高度
  if (actualDistance <= threshold) {
    // 阈值内：线性阻尼 0.6
    return actualDistance * 0.6
  } else {
    // 超过阈值：渐进阻尼，避免跳动
    const baseHeight = threshold * 0.6
    const extraDistance = actualDistance - threshold
    const extraHeight = extraDistance * 0.3

    return Math.min(baseHeight + extraHeight, threshold * 0.8)
  }
})

const refreshStyle = computed(() => {
  // 在加载状态时，确保刷新区域完全显示
  const displayHeight = dampedPullHeight.value

  return {
    transform: `translateY(calc(-100% + ${displayHeight}px))`,
    opacity: refreshStatus.value === 'none' ? 0 : 1,
    transition: getRefreshTransition(),
    zIndex: refreshStatus.value === 'loading' ? 20 : 10, // 加载时提高层级
  }
})

// 获取刷新区域的过渡动画
const getRefreshTransition = () => {
  // 下拉过程中不使用动画
  if (refreshStatus.value === 'pulling' || isPulling.value) {
    return 'none'
  }

  // 加载状态时使用较快的动画
  if (refreshStatus.value === 'loading') {
    return 'transform 0.2s ease-out, opacity 0.2s ease-out'
  }

  // 完成后使用较慢的动画，确保平滑隐藏
  return 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 1s ease-out'
}
// 控制滚动能力
const scrollEnabled = computed(() => {
  // 如果正在下拉刷新，禁用滚动
  if (hasCustomRefresh.value && isPulling.value && pullDistance.value > 0) {
    return false
  }
  return true
})

const scrollStyle = computed(() => {
  // 计算 scroll-view 的偏移距离
  const getScrollOffset = () => {
    if (!hasCustomRefresh.value || pullDistance.value <= 0) {
      return 0
    }

    // 在加载状态时，保持固定偏移
    if (refreshStatus.value === 'loading') {
      return props.refreshThreshold * 0.6 // 与刷新区域高度一致
    }

    return dampedPullHeight.value
  }

  console.log(scrollEnabled.value, '=================')
  return {
    height: '100%',
    transform: `translateY(${getScrollOffset()}px)`,
    transition: getScrollTransition(),
    overflowY: scrollEnabled.value ? 'auto' : 'hidden',
  }
})

// 获取滚动容器的过渡动画
const getScrollTransition = () => {
  // 下拉过程中不使用动画
  if (refreshStatus.value === 'pulling' || isPulling.value) {
    return 'none'
  }

  // 加载状态时使用与刷新区域同步的动画
  if (refreshStatus.value === 'loading') {
    return 'transform 0.2s ease-out'
  }

  // 完成后使用较慢的动画，与刷新区域同步
  return 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
}

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
  if (!props.enableRefresh || !hasCustomRefresh.value || isRefreshing.value) return

  startY.value = e.touches[0].clientY
  currentY.value = startY.value
  touchStartTime.value = Date.now()
  isPulling.value = false
}

const handleTouchMove = (e: TouchEvent) => {
  if (!props.enableRefresh || !hasCustomRefresh.value || isRefreshing.value) return

  currentY.value = e.touches[0].clientY
  const deltaY = currentY.value - startY.value

  // 只有在顶部且向下拉时才处理
  if (scrollTopValue.value <= 0 && deltaY > 0) {
    isPulling.value = true

    // 强制阻止默认滚动行为和事件冒泡
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()

    // pullDistance 保持为实际下拉距离
    pullDistance.value = deltaY
    // 更新刷新状态
    if (pullDistance.value >= props.refreshThreshold) {
      refreshStatus.value = 'release'
    } else {
      refreshStatus.value = 'pulling'
    }
  } else if (isPulling.value && deltaY <= 0) {
    // 如果正在下拉但现在向上滑动，重置状态
    resetPullState()
  } else if (isPulling.value) {
    // 如果正在下拉过程中，继续阻止默认行为
    e.preventDefault()
    e.stopPropagation()
  }
}

const handleTouchEnd = () => {
  if (!props.enableRefresh || !hasCustomRefresh.value || isRefreshing.value) return

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

// 原始滚动事件处理函数
const handleScrollOriginal = (e: any) => {
  scrollTopValue.value = e.detail.scrollTop
  emit('scroll', e)
}

const handleScrollToUpperOriginal = (e: any) => {
  emit('scrolltoupper', e)
}

const handleScrollToLowerOriginal = (e: any) => {
  console.log(props.enableLoadMore, loadMoreStatus.value, isLoadingMore.value)
  if (props.enableLoadMore && loadMoreStatus.value === 'more' && !isLoadingMore.value) {
    triggerLoadMore()
  }
  emit('scrolltolower', e)
}

// 节流版本的滚动事件处理函数
const handleScroll = throttleScroll(handleScrollOriginal, 16) // 60fps
const handleScrollToUpper = throttleScroll(handleScrollToUpperOriginal, 100) // 上拉事件节流100ms
const handleScrollToLower = throttleScroll(handleScrollToLowerOriginal, 200) // 下拉加载节流200ms

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
  if (useNativeRefresh.value) {
    // 原生刷新完成
    isRefreshing.value = false
    nativeRefreshTriggered.value = false
  } else {
    // 自定义刷新完成
    isRefreshing.value = false

    // 先保持加载状态一小段时间，让用户看到完成状态
    setTimeout(() => {
      // 然后开始隐藏动画
      refreshStatus.value = 'none'

      // 等待动画完成后重置所有状态
      setTimeout(() => {
        resetPullState()
      }, 200) // 与动画时间同步
    }, 200) // 短暂显示完成状态
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
})
</script>

<style lang="scss" scoped>
.u-scroll-view {
  position: relative;
  width: 100%;
  overflow: hidden;
  max-height: 100%;
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

    &--active {
      opacity: 1;
    }

    &--pulling {
      transition: none;
    }

    &--loading {
      z-index: 20; // 加载时提高层级，确保不被覆盖
      transition: transform 0.2s ease-out, opacity 0.2s ease-out;
    }
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
      background-color: transparent;
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
  height: 100%;
  display: flex;
  flex-direction: column;
  &__refresh {
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  &__scroll {
    width: 100%;
    flex: 1;
    height: 0; // 关键：让 flex 子元素正确计算高度
  }
}
// #endif

// #ifdef H5
.u-scroll-view {
  max-height: 100% !important;
  height: auto !important;
  &__scroll {
    -webkit-overflow-scrolling: touch;
  }
}
// #endif
</style>

