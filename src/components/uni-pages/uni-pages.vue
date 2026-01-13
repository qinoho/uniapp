<template>
  <view class="u-pages">
    <!-- 主要内容区域 -->
    <uni-nav-header v-bind="navBarObj"></uni-nav-header>
    <view class="u-pages__content" :style="contentStyle">
      <muni-scroll-view :enable-load-more="true" @loadmore="scrolltoupper">
        <slot></slot>
        <view class="safe_bottom_area" :style="safeBottomStyle"></view>
      </muni-scroll-view>
      <!-- <view style="flex: 1; height: 0; flex-basis: 0">
        <scroll-view
          scroll-y
          style="height: 100%"
          @scrolltolower="scrolltoupper"
        >
         
        </scroll-view>
      </view> -->
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue'
import { getSystemInfoFn } from '@/utils/utils'
const scrolltoupper = () => {
  console.log('1111111111111111aaaaaaaaaaa======================================')
}
interface Props {
  title?: string
  showBack?: boolean
  backgroundColor?: string
  navBarHeight?: string | number
  showTitle?: boolean
}

const safeAreaBottom = ref<number>(0)

const props = withDefaults(defineProps<Props>(), {
  title: '标题',
  showBack: true,
  backgroundColor: '#ffffff',
  navBarHeight: '',
  showTitle: true,
})

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
  console.log('systemInfo', systemInfo)
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
  }
}
</style>
