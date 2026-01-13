<template>
  <view class="u-pages">
    <!-- 主要内容区域 -->
    <uni-nav-header v-bind="navBarObj" @back="handleBack"></uni-nav-header>
    <view class="u-pages__content" :style="contentStyle">
      <muni-scroll-view
        ref="scrollViewRef"
        :enable-refresh="enableRefresh"
        :enable-load-more="enableLoadMore"
        :background-color="backgroundColor"
        @refresh="onRefresh"
        @loadmore="onLoadMore"
        @scroll="onScroll"
      >
        <template #refresh="slotProps" v-if="$slots.refresh">
          <slot name="refresh" v-bind="slotProps"></slot>
        </template>
        <slot></slot>
        <template #loadmore="slotProps" v-if="$slots.loadmore">
          <slot name="loadmore" v-bind="slotProps"></slot>
        </template>
        <view class="safe_bottom_area" :style="safeBottomStyle"></view>
      </muni-scroll-view>
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
  enableLoadMore?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '标题',
  showBack: true,
  backgroundColor: '#ffffff',
  navBarHeight: '',
  showTitle: true,
  enableRefresh: false,
  enableLoadMore: false,
})

const emit = defineEmits(['back', 'refresh', 'loadmore', 'scroll'])

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
    width: '100vw',
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
    min-height: 0;
    height: 0;
    display: flex;
    flex-basis: 0;
    flex-direction: column;
  }
}
</style>
