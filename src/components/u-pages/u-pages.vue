<template>
  <view class="u-pages" :style="pageStyle">
    <!-- 状态栏占位 -->
    <!-- <view
      v-if="props.showStatusBar"
      class="u-pages__status-bar"
      :style="statusBarStyleComputed"
    ></view> -->

    <!-- 导航栏 -->
    <view v-if="props.showNavBar" class="u-pages__nav-bar" :style="navBarStyle">
      <slot name="nav-bar">
        <view class="u-pages__nav-content">
          <!-- 左侧返回按钮 -->
          <view
            v-if="props.showBack"
            class="u-pages__nav-left"
            @click="handleBack"
          >
            <text class="u-pages__back-icon">←</text>
            <text v-if="props.backText" class="u-pages__back-text">{{
              props.backText
            }}</text>
          </view>

          <!-- 标题 -->
          <view class="u-pages__nav-title">
            <text class="u-pages__title-text">{{ props.title }}</text>
          </view>

          <!-- 右侧操作区 -->
          <view class="u-pages__nav-right">
            <slot name="nav-right"></slot>
          </view>
        </view>
      </slot>
    </view>

    <!-- 主要内容区域 -->
    <view class="u-pages__content" :style="contentStyle">
      <slot></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue'
import { getSystemInfoFn } from '@/utils/utils'
import { onReachBottom } from '@dcloudio/uni-app'

// 定义 Props 类型
interface Props {
  title?: string
  showStatusBar?: boolean
  showNavBar?: boolean
  showBack?: boolean
  backText?: string
  showSafeAreaBottom?: boolean
  backgroundColor?: string
  navBarBackgroundColor?: string
  navBarTextColor?: string
  statusBarStyle?: 'light-content' | 'dark-content'
  navBarHeight?: string | number
  enablePullRefresh?: boolean
}

// 定义 Props 默认值
const props = withDefaults(defineProps<Props>(), {
  title: '',
  showStatusBar: true,
  showNavBar: true,
  showBack: true,
  backText: '',
  showSafeAreaBottom: true,
  backgroundColor: '#ffffff',
  navBarBackgroundColor: '#ffffff',
  navBarTextColor: '#000000',
  statusBarStyle: 'dark-content',
  navBarHeight: '',
  enablePullRefresh: false,
})

// 定义 Emits
const emit = defineEmits<{
  back: []
  refresh: []
}>()

// 系统信息
let systemInfo = {}
onBeforeMount(async () => {
  systemInfo = await getSystemInfoFn()
  calculateSafeArea()
})

const statusBarHeight = ref<number>(0)
const navBarHeightValue = ref<number>(44)
const safeAreaBottom = ref<number>(0)

// 计算属性
const pageStyle = computed(() => ({
  minHeight: '100vh',
  maxHeight: '100vh',
}))

const navBarStyle = computed(() => ({
  height: navBarHeightValue.value + 'px',
  backgroundColor: props.navBarBackgroundColor,
  color: props.navBarTextColor,
  paddingTop: statusBarHeight.value + 'px',
}))

const contentStyle = computed(() => {
  return {
    width: `100vw`,
    paddingBottom: safeAreaBottom.value + 'px',
  }
})

// const safeAreaBottomStyle = computed(() => ({
//   height: safeAreaBottom.value + 'px',
// }))

const calculateSafeArea = () => {
  // 状态栏高度
  statusBarHeight.value = systemInfo.statusBarHeight || 0

  // 导航栏高度
  if (props.navBarHeight) {
    navBarHeightValue.value =
      typeof props.navBarHeight === 'string'
        ? parseInt(props.navBarHeight)
        : props.navBarHeight
  } else {
    navBarHeightValue.value = systemInfo.navBarHeight
  }

  // 底部安全区域高度
  // #ifdef APP-PLUS
  safeAreaBottom.value = systemInfo.safeAreaInsets
    ? systemInfo.safeAreaInsets.bottom
    : 0
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
  // 默认返回行为
  if (getCurrentPages().length > 1) {
    uni.navigateBack()
  } else {
    uni.switchTab({
      url: '/pages/index/index',
    })
  }
}

const onPullDownRefresh = () => {
  if (props.enablePullRefresh) {
    emit('refresh')
  }
}
onReachBottom(() => {
  console.log('上拉触底')
})
</script>

<style lang="scss" scoped>
.u-pages {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: content-box;

  &__nav-bar {
    display: flex;
    align-items: center;
    padding: 0 16px;
    box-sizing: border-box;
  }

  &__nav-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 100%;
  }

  &__nav-left {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    cursor: pointer;
    padding: 8px 0;

    &:active {
      opacity: 0.6;
    }
  }

  &__back-icon {
    font-size: 20px;
    font-weight: bold;
    margin-right: 4px;
  }

  &__back-text {
    font-size: 16px;
  }

  &__nav-title {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 16px;
  }

  &__title-text {
    font-size: 17px;
    font-weight: 600;
    text-align: center;
    // 防止文字过长
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__nav-right {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  &__content {
    width: 100%;
    box-sizing: border-box;
    flex: 1;
    min-height: 0;
    overflow-y: scroll;
  }

  &__safe-area-bottom {
    width: 100%;
  }
}

// 适配不同平台的样式
// #ifdef APP-PLUS
.u-pages {
  &__nav-bar {
    // App端可能需要特殊处理
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
}
// #endif

// #ifdef H5
.u-pages {
  &__nav-bar {
    // H5端样式调整
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
  }
}
// #endif

// #ifdef MP-WEIXIN
.u-pages {
  &__nav-bar {
    // 微信小程序样式调整
    border: none;
  }

  &__back-icon {
    // 微信小程序返回图标调整
    font-size: 18px;
  }
}
// #endif

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  .u-pages {
    &__nav-bar {
      border-bottom-color: #333;
    }
  }
}

// 响应式适配
@media screen and (max-width: 750rpx) {
  .u-pages {
    &__nav-bar {
      padding: 0 12px;
    }

    &__title-text {
      font-size: 16px;
    }
  }
}
</style>
