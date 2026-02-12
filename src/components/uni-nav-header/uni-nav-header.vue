<template>
  <!-- 导航栏 -->
  <view class="u-nav" :style="navBarStyle" v-if="isShow">
    <slot name="navBar">
      <view class="u-nav-content" :style="contentStyle">
        <!-- 左侧返回按钮 -->
        <view class="u-nav-left" :style="sideStyle" v-if="props.showBack">
          <slot name="navLeft">
            <text @click="handleBack" class="u-nav-back-icon"> 返回 </text>
          </slot>
        </view>
        <view class="u-nav-left" :style="sideStyle" v-else></view>
        <!-- 标题（绝对定位居中） -->
        <view class="u-nav-title" :style="titleStyle">
          <slot name="navTitle">
            <text class="u-nav-title-text"> {{ props.title || '' }} </text>
          </slot>
        </view>
        <!-- 右侧操作区 -->
        <view class="u-nav-right" :style="sideStyle">
          <slot name="navRight"></slot>
        </view>
      </view>
    </slot>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue'
import { getSystemInfoFn } from '@/utils/utils'
import type { SystemInfoInterface } from '@/utils/utils'

// 定义 Props 类型
interface Props {
  title?: string
  showBack?: boolean
  backgroundColor?: string
  navBarHeight?: string | number
  isShow?: boolean
}

// 定义 Props 默认值
const props = withDefaults(defineProps<Props>(), {
  title: '',
  showBack: true,
  navBarHeight: '',
  backgroundColor: '#ffffff',
  isShow: true,
})

const statusBarHeight = ref<number>(0)
const contentHeight = ref<number>(44) // 导航栏内容区高度（不含状态栏）
const menuBtnRight = ref<number>(10) // 胶囊右侧边距（距屏幕右边缘）
const menuBtnWidth = ref<number>(0) // 胶囊宽度

// 定义 Emits
const emit = defineEmits<{
  back: []
}>()

// 系统信息
let systemInfo = {} as SystemInfoInterface
onBeforeMount(async () => {
  systemInfo = await getSystemInfoFn()
  calculateLayout()
})

// 导航栏整体样式：总高度 = 状态栏 + 内容区
const navBarStyle = computed(() => ({
  height: statusBarHeight.value + contentHeight.value + 'px',
  paddingTop: statusBarHeight.value + 'px',
  backgroundColor: props.backgroundColor,
}))

// 内容区样式（状态栏下方的实际导航内容）
const contentStyle = computed(() => ({
  height: contentHeight.value + 'px',
}))

// 左右两侧固定宽度（小程序端 = 胶囊占位宽度 + 边距，其他端固定值）
const sideStyle = computed(() => {
  // #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
  // 小程序端：右侧宽度 = 胶囊宽度 + 胶囊右边距 + 额外间距
  const sideWidth = menuBtnWidth.value + menuBtnRight.value + 10
  return { width: sideWidth + 'px', minWidth: sideWidth + 'px' }
  // #endif
  // #ifndef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
  return { width: '80px', minWidth: '80px' }
  // #endif
})

// 标题样式：绝对定位居中，左右留出侧边栏宽度避免遮挡
const titleStyle = computed(() => {
  // #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
  const sideWidth = menuBtnWidth.value + menuBtnRight.value + 10
  return {
    left: sideWidth + 'px',
    right: sideWidth + 'px',
  }
  // #endif
  // #ifndef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
  return {
    left: '80px',
    right: '80px',
  }
  // #endif
})

const calculateLayout = () => {
  // 状态栏高度
  statusBarHeight.value = systemInfo.statusBarHeight || 0

  // 导航栏内容区高度
  if (props.navBarHeight) {
    // 用户自定义高度（作为内容区高度）
    contentHeight.value =
      typeof props.navBarHeight === 'string' ? parseInt(props.navBarHeight) : props.navBarHeight
  } else {
    // 自动计算：总导航高度 - 状态栏高度 = 内容区高度
    contentHeight.value = (systemInfo.navBarHeight || 44) - statusBarHeight.value
    // 兜底：确保至少 32px
    if (contentHeight.value < 32) contentHeight.value = 44
  }

  // #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
  // 小程序端：获取胶囊按钮信息用于避让
  menuBtnRight.value = systemInfo.menuButtonRight || 10
  menuBtnWidth.value = systemInfo.menuButtonWidth || 87
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
</script>

<style lang="scss" scoped>
.u-nav {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  box-sizing: border-box;
  flex-shrink: 0;
  border-bottom: 2rpx solid #f8f8f8;

  &-content {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    box-sizing: border-box;
  }

  &-title {
    position: absolute;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    &-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 16px;
      font-weight: bold;
      text-align: center;
    }
  }

  &-left,
  &-right {
    display: flex;
    align-items: center;
    position: relative;
    z-index: 1;
    box-sizing: border-box;
  }

  &-left {
    justify-content: flex-start;
    padding-left: 16rpx;
  }

  &-right {
    justify-content: flex-end;
    padding-right: 16rpx;
  }
}
</style>
