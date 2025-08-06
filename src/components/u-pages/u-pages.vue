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

    <!-- 底部安全区域 -->
    <view
      v-if="props.showSafeAreaBottom"
      class="u-pages__safe-area-bottom"
      :style="safeAreaBottomStyle"
    ></view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
console.log('pppppppppppppppppppppppppppp')
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

// 响应式数据
const systemInfo = ref<UniApp.GetSystemInfoResult>(
  {} as UniApp.GetSystemInfoResult
)
const statusBarHeight = ref<number>(0)
const navBarHeightValue = ref<number>(44)
const safeAreaBottom = ref<number>(0)

// 计算属性
const pageStyle = computed(() => ({
  backgroundColor: props.backgroundColor,
  minHeight: '100vh',
}))

// const statusBarStyleComputed = computed(() => ({
//   height: statusBarHeight.value + 'px',
//   backgroundColor: props.navBarBackgroundColor,
// }))

const navBarStyle = computed(() => ({
  height: navBarHeightValue.value + statusBarHeight.value + 'px',
  backgroundColor: props.navBarBackgroundColor,
  color: props.navBarTextColor,
  borderBottom: '1px solid #e5e5e5',
  paddingTop: statusBarHeight.value + 'px',
}))

const contentStyle = computed(() => {
  const paddingTop =
    props.showStatusBar && props.showNavBar
      ? statusBarHeight.value + navBarHeightValue.value + 'px'
      : props.showNavBar
      ? navBarHeightValue.value + 'px'
      : props.showStatusBar
      ? statusBarHeight.value + 'px'
      : '0px'

  const paddingBottom = props.showSafeAreaBottom
    ? safeAreaBottom.value + 'px'
    : '0px'

  return {
    paddingTop,
    paddingBottom,
    minHeight: `calc(100vh - ${paddingTop} - ${paddingBottom})`,
  }
})

const safeAreaBottomStyle = computed(() => ({
  height: safeAreaBottom.value + 'px',
  backgroundColor: props.backgroundColor,
}))

// 方法
const getSystemInfo = () => {
  console.log('11111111111111111')
  uni.getSystemInfo({
    success: (res: UniApp.GetSystemInfoResult) => {
      console.log('rrrrrrrrrrrrrrrrr', res)
      systemInfo.value = res
      calculateSafeArea(res)
    },
  })
}

const calculateSafeArea = (sysInfo: UniApp.GetSystemInfoResult) => {
  // 状态栏高度
  console.log('sysInfosysInfosysInfo,', sysInfo)
  statusBarHeight.value = sysInfo.statusBarHeight || 0

  // 导航栏高度
  if (props.navBarHeight) {
    navBarHeightValue.value =
      typeof props.navBarHeight === 'string'
        ? parseInt(props.navBarHeight)
        : props.navBarHeight
  } else {
    // 根据平台设置默认导航栏高度
    // #ifdef APP-PLUS
    navBarHeightValue.value = 44
    // #endif
    // #ifdef H5
    navBarHeightValue.value = 44
    // #endif
    // #ifdef MP-WEIXIN
    navBarHeightValue.value = 32
    // #endif
    // #ifdef MP-ALIPAY
    navBarHeightValue.value = 40
    // #endif
  }

  // 底部安全区域高度
  // #ifdef APP-PLUS
  safeAreaBottom.value = sysInfo.safeAreaInsets
    ? sysInfo.safeAreaInsets.bottom
    : 0
  // #endif
  // #ifdef H5
  safeAreaBottom.value = 0
  // #endif
  // #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
  const safeArea = sysInfo.safeArea
  if (safeArea) {
    safeAreaBottom.value = sysInfo.screenHeight - safeArea.bottom
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

// 初始化
getSystemInfo()
</script>

<style lang="scss" scoped>
.u-pages {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  &__status-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 998;
  }

  &__nav-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 999;
    display: flex;
    align-items: center;
    padding: 0 16px;
    box-sizing: border-box;

    // 适配状态栏
    padding-top: var(--status-bar-height, 0);
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
    flex: 1;
    width: 100%;
    box-sizing: border-box;
  }

  &__safe-area-bottom {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1;
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
    border-bottom: 1px solid #e5e5e5;
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
