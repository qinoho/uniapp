<template>
  <view class="u-pages">
    <!-- 导航栏区域 -->
    <slot name="navbar">
      <uni-nav-header
        :title="title"
        :show-back="showBack"
        :background-color="backgroundColor"
        :nav-bar-height="navBarHeight"
        :is-show="showTitle"
        @back="handleBack"
      >
        <!-- #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ -->
        <!-- 小程序端：UniApp 编译器自动处理 slot 透传，view 包裹不影响 -->
        <view v-if="$slots.navLeft">
          <template #navLeft>
            <slot name="navLeft"></slot>
          </template>
        </view>
        <view v-if="$slots.navTitle">
          <template #navTitle>
            <slot name="navTitle"></slot>
          </template>
        </view>
        <view v-if="$slots.navRight">
          <template #navRight>
            <slot name="navRight"></slot>
          </template>
        </view>
        <!-- #endif -->
        <!-- #ifdef H5 || APP-PLUS -->
        <!-- H5/App 端：template #slot 必须是组件直接子元素，否则 slot 透传失效 -->
        <template v-if="$slots.navLeft" #navLeft>
          <slot name="navLeft"></slot>
        </template>
        <template v-if="$slots.navTitle" #navTitle>
          <slot name="navTitle"></slot>
        </template>
        <template v-if="$slots.navRight" #navRight>
          <slot name="navRight"></slot>
        </template>
        <!-- #endif -->
      </uni-nav-header>
    </slot>
    <view class="u-pages__content" :style="contentStyle">
      <view class="u-pages__scroll-wrapper">
        <muni-scroll-view
          ref="scrollViewRef"
          :enable-refresh="enableRefresh"
          :refresh-threshold="refreshThreshold"
          :enable-load-more="enableLoadMore"
          :load-more-threshold="loadMoreThreshold"
          :default-load-more-status="defaultLoadMoreStatus"
          :enable-back-to-top="enableBackToTop"
          :scroll-with-animation="scrollWithAnimation"
          :scroll-top="scrollTop"
          :background-color="backgroundColor"
          @refresh="onRefresh"
          @loadmore="onLoadMore"
          @scroll="onScroll"
          @scrolltoupper="onScrollToUpper"
          @scrolltolower="onScrollToLower"
        >
          <!-- #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ -->
          <view v-if="$slots.refresh">
            <template #refresh="slotProps">
              <slot name="refresh" :status="slotProps.status" :distance="slotProps.distance"></slot>
            </template>
          </view>
          <!-- #endif -->
          <!-- #ifdef H5 || APP-PLUS -->
          <template v-if="$slots.refresh" #refresh="slotProps">
            <slot name="refresh" :status="slotProps.status" :distance="slotProps.distance"></slot>
          </template>
          <!-- #endif -->

          <slot></slot>

          <!-- #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ -->
          <view v-if="$slots.loadmore">
            <template #loadmore="slotProps">
              <slot name="loadmore" :status="slotProps.status"></slot>
            </template>
          </view>
          <!-- #endif -->
          <!-- #ifdef H5 || APP-PLUS -->
          <template v-if="$slots.loadmore" #loadmore="slotProps">
            <slot name="loadmore" :status="slotProps.status"></slot>
          </template>
          <!-- #endif -->

          <view class="safe_bottom_area" :style="safeBottomStyle"></view>
        </muni-scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue'
import { getSystemInfoFn } from '@/utils/utils'

interface Props {
  title?: string
  showBack?: boolean
  backgroundColor?: string
  navBarHeight?: string | number
  showTitle?: boolean
  // Scroll View Props
  enableRefresh?: boolean
  refreshThreshold?: number
  enableLoadMore?: boolean
  loadMoreThreshold?: number
  defaultLoadMoreStatus?: 'more' | 'loading' | 'nomore'
  enableBackToTop?: boolean
  scrollWithAnimation?: boolean
  scrollTop?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '标题',
  showBack: true,
  backgroundColor: '#ffffff',
  navBarHeight: '',
  showTitle: true,
  enableRefresh: false,
  refreshThreshold: 80,
  enableLoadMore: false,
  loadMoreThreshold: 50,
  defaultLoadMoreStatus: 'more',
  enableBackToTop: true,
  scrollWithAnimation: true,
  scrollTop: 0,
})

const emit = defineEmits([
  'back',
  'refresh',
  'loadmore',
  'scroll',
  'scrolltoupper',
  'scrolltolower',
])

const scrollViewRef = ref()
const safeAreaBottom = ref<number>(0)

const navBarObj = computed(() => ({
  title: props.title,
  showBack: props.showBack,
  backgroundColor: props.backgroundColor,
  navBarHeight: props.navBarHeight,
  isShow: props.showTitle,
}))

const contentStyle = computed(() => {
  return {
    // #ifdef H5
    width: '100%', // H5 端使用 100% 避免滚动条导致的溢出
    // #endif
    // #ifndef H5
    width: '100vw',
    // #endif
    backgroundColor: props.backgroundColor,
  }
})

const safeBottomStyle = computed(() => {
  return {
    height: safeAreaBottom.value + 'px',
  }
})

onBeforeMount(async () => {
  await calculateSafeArea()
})

const calculateSafeArea = async () => {
  const systemInfo = await getSystemInfoFn()
  // 底部安全区域高度
  // #ifdef APP-PLUS
  safeAreaBottom.value = systemInfo.safeAreaInsets ? systemInfo.safeAreaInsets.bottom : 0
  // #endif
  // #ifdef H5
  safeAreaBottom.value = 0
  // #endif
  // #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
  const safeArea = systemInfo.safeArea
  if (safeArea) {
    safeAreaBottom.value = systemInfo.screenHeight - safeArea.bottom
  }
  // #endif
}

const handleBack = () => {
  emit('back')
}

const onRefresh = () => {
  emit('refresh')
}

const onLoadMore = () => {
  emit('loadmore')
}

const onScroll = (e: any) => {
  emit('scroll', e)
}

const onScrollToUpper = (e: any) => {
  emit('scrolltoupper', e)
}

const onScrollToLower = (e: any) => {
  emit('scrolltolower', e)
}

// Expose scroll view methods
const finishRefresh = () => {
  scrollViewRef.value?.finishRefresh()
}

const finishLoadMore = (hasMore: boolean = true) => {
  scrollViewRef.value?.finishLoadMore(hasMore)
}

const resetLoadMore = () => {
  scrollViewRef.value?.resetLoadMore()
}

defineExpose({
  finishRefresh,
  finishLoadMore,
  resetLoadMore,
})
</script>

<style lang="scss" scoped>
.u-pages {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  max-height: 100vh;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  &__content {
    flex: 1;
    position: relative;
    width: 100%;
    overflow: hidden;
  }
  &__scroll-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}

/* H5 端底部安全区域 CSS 兜底 */
/* #ifdef H5 */
.safe_bottom_area {
  padding-bottom: constant(safe-area-inset-bottom); /* iOS < 11.2 */
  padding-bottom: env(safe-area-inset-bottom); /* iOS >= 11.2 */
}
/* #endif */
</style>
